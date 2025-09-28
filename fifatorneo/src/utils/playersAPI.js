import { supabase } from "./supabaseClient";

/** Get all players (latest first) */
export async function fetchPlayers() {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Get one player by numeric id (your table shows int8 id) */
export async function fetchPlayerById(id) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Insert a new player row */
export async function createPlayer({
  name,
  surname,
  email,
  phone_number,
  a1,
  a2,
  a3,
}) {
  const payload = {
    name: (name ?? "").trim(),
    surname: (surname ?? "").trim(),
    email: (email ?? "").trim().toLowerCase(),
  };
  if (phone_number != null) payload.phone_number = String(phone_number).trim();
  if (phone_number == null) payload.phone_number = "4335213";
  if (a1 != null) payload.a1 = String(a1).trim();
  if (a2 != null) payload.a2 = String(a2).trim();
  if (a3 != null) payload.a3 = String(a3).trim();

  const { data, error } = await supabase
    .from("players")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    // 23505 = unique violation (useful if you add a unique index on lower(email))
    if (error.code === "23505") throw new Error("Email già registrata.");
    throw error;
  }
  return data;
}

/** Idempotent upsert by email (requires unique index on lower(email)) */
export async function upsertPlayerByEmail({
  name,
  surname,
  email,
  phone_number,
  a1,
  a2,
  a3,
}) {
  const payload = {
    name: (name ?? "").trim(),
    surname: (surname ?? "").trim(),
    email: (email ?? "").trim().toLowerCase(),
    phone_number: phone_number ?? 'asgasgas',
    a1: a1 ?? null,
    a2: a2 ?? null,
    a3: a3 ?? null,
  };

  const { data, error } = await supabase
    .from("players")
    .upsert(payload, { onConflict: "email" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
