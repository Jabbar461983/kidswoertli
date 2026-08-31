import Anthropic from "@anthropic-ai/sdk";

interface OCRRequest {
  imageBase64: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  languagePair: string;
}

interface VocabularyPair {
  de: string;
  fr?: string;
  en?: string;
  confidence: number;
}

interface OCRResponse {
  pairs: VocabularyPair[];
  total: number;
  confidence: "high" | "medium" | "low";
}

const PROMPTS: Record<string, string> = {
  "de-fr": `Extrahiere alle Vokabel-Paare aus dieser Deutsch-Französisch Seite.

Sei nachsichtig mit:
- Leerzeichen-Unterschieden
- Kleineren Formatierungsvariationen
- Ähnlichen Schreibvarianten

JSON OUTPUT (ONLY):
{
  "pairs": [
    {"de": "...", "fr": "..."},
    ...
  ],
  "total": <number>,
  "notes": "Alle erkannten Paare"
}`,

  "de-en": `Extrahiere alle Vokabel-Paare aus dieser Deutsch-Englisch Seite.

Antworte NUR mit gültigem JSON:
{
  "pairs": [
    {"de": "...", "en": "..."},
    ...
  ],
  "total": <number>
}`,
};

export default async (req: any) => {
  if (req.method !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { imageBase64, mediaType, languagePair } = JSON.parse(
      req.body
    ) as OCRRequest;

    if (!imageBase64 || !mediaType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing imageBase64 or mediaType" }),
      };
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = PROMPTS[languagePair] || PROMPTS["de-fr"];

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const pairs = parsed.pairs || [];

      const result: OCRResponse = {
        pairs: pairs.map((p: any) => ({
          de: p.de || "",
          fr: p.fr,
          en: p.en,
          confidence: 0.95,
        })),
        total: pairs.length,
        confidence: pairs.length > 10 ? "high" : "medium",
      };

      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    } catch (parseError) {
      console.error("Parse error:", parseError);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Failed to parse OCR response",
          raw: responseText.substring(0, 500),
        }),
      };
    }
  } catch (error: any) {
    console.error("OCR Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
