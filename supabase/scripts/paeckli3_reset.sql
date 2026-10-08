-- KidsWörtli: Klassenwortschatz Päckli 3 (Französisch)
--
-- ACHTUNG: Dieses Skript LÖSCHT ALLE bestehenden Lernmedien und Karteikarten
-- aller Profile (inkl. Lernrunden, Resultate und Fehlerrunden) und legt danach
-- für jedes Profil das Lernmedium "Klassenwortschatz Französisch" mit
-- Päckli 3A (KW 37) und Päckli 3B (KW 38) neu an.
--
-- Ausführen: Supabase -> SQL Editor -> New Query -> Inhalt einfügen -> Run.
-- Bewusst KEINE Migration, damit es nicht versehentlich erneut läuft.
-- Läuft in einer Transaktion: bei einem Fehler wird nichts gelöscht.

BEGIN;

-- 1) Alles Bisherige löschen.
--    ON DELETE CASCADE entfernt dabei cards, learning_sessions,
--    card_results und error_rounds automatisch mit.
DELETE FROM public.learning_media;

-- 2) Für jedes Profil das neue Lernmedium anlegen und die Karten einfügen.
--    page = Kalenderwoche, chapter = Päckli.
--    Tippfehler vom Blatt sind korrigiert:
--      "beaucoup des cheveaux" -> "beaucoup de chevaux"
--      "impresionnant"         -> "impressionnant"
--      "Vorsrtellung"          -> "Vorstellung"
WITH media AS (
  INSERT INTO public.learning_media (user_id, title, language)
  SELECT id, 'Klassenwortschatz Französisch', 'fr'
  FROM public.users
  RETURNING id
)
INSERT INTO public.cards (medium_id, page, chapter, german, foreign_text, language)
SELECT media.id, v.page, v.chapter, v.german, v.foreign_text, 'fr'
FROM media
CROSS JOIN (
  VALUES
    (37, 'Päckli 3A', 'Es dauert…',                         'Ça dure…'),
    (37, 'Päckli 3A', 'Es hat…',                            'Il y a…'),
    (37, 'Päckli 3A', 'Es dauert einige Minuten/Sekunden.', 'Ça dure quelques minutes/secondes.'),
    (37, 'Päckli 3A', 'Es hat viele Pferde.',               'Il y a beaucoup de chevaux.'),
    (37, 'Päckli 3A', 'Jungen',                             'des garçons'),
    (37, 'Päckli 3A', 'Mädchen',                            'des filles'),
    (37, 'Päckli 3A', 'Kinder',                             'des enfants'),
    (37, 'Päckli 3A', 'viele Leute',                        'beaucoup de personnes'),
    (38, 'Päckli 3B', 'Man kann…',                          'On peut…'),
    (38, 'Päckli 3B', 'Ich finde das…',                     'Je trouve ça…'),
    (38, 'Päckli 3B', 'Man kann eine Vorstellung sehen.',   'On peut voir un spectacle.'),
    (38, 'Päckli 3B', 'Ich finde das wunderschön.',         'Je trouve ça magnifique.'),
    (38, 'Päckli 3B', 'aussergewöhnlich',                   'extraordinaire'),
    (38, 'Päckli 3B', 'beeindruckend',                      'impressionnant')
) AS v(page, chapter, german, foreign_text);

COMMIT;

-- Kontrolle: pro Profil sollten 14 Karten erscheinen.
SELECT u.username, COUNT(c.id) AS karten
FROM public.users u
LEFT JOIN public.learning_media m ON m.user_id = u.id
LEFT JOIN public.cards c ON c.medium_id = m.id
GROUP BY u.username
ORDER BY u.username;
