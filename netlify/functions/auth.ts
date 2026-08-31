import * as bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  profile?: { id: number; username: string; vorname: string; is_admin: boolean };
  error?: string;
  token?: string;
}

export default async (req: any) => {
  if (req.method !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const path = new URL(req.url).pathname;

  if (path.includes("/login")) {
    return handleLogin(req);
  } else if (path.includes("/register")) {
    return handleRegister(req);
  }

  return { statusCode: 404, body: "Not Found" };
};

async function handleLogin(req: any): Promise<any> {
  try {
    const { username, password } = JSON.parse(req.body) as LoginRequest;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid username or password" }),
      };
    }

    const isPasswordValid = await bcrypt.compare(password, data.password_hash);

    if (!isPasswordValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid username or password" }),
      };
    }

    const token = Buffer.from(`${data.id}:${Date.now()}`).toString("base64");

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        profile: {
          id: data.id,
          username: data.username,
          vorname: data.vorname,
          is_admin: data.is_admin,
        },
        token,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

async function handleRegister(req: any): Promise<any> {
  try {
    const { username, vorname, password, isAdmin } = JSON.parse(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          username,
          vorname,
          password_hash: hashedPassword,
          is_admin: isAdmin || false,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        profile: {
          id: data.id,
          username: data.username,
          vorname: data.vorname,
          is_admin: data.is_admin,
        },
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
