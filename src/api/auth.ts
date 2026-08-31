import type { Profile } from "../types";

export async function login(
  username: string,
  password: string
): Promise<{ profile: Profile; token: string }> {
  const res = await fetch("/.netlify/functions/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function register(
  username: string,
  vorname: string,
  password: string
): Promise<{ profile: Profile; token: string }> {
  const res = await fetch("/.netlify/functions/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, vorname, password, isAdmin: false }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function createAdminProfile(
  username: string,
  vorname: string,
  password: string
): Promise<{ profile: Profile }> {
  const res = await fetch("/.netlify/functions/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, vorname, password, isAdmin: true }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}
