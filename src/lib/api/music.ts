import { supabase } from "../supabase";
import type { Database } from "../database.types";

type MusicInsert = Database["public"]["Tables"]["music_entries"]["Insert"];
type MusicUpdate = Database["public"]["Tables"]["music_entries"]["Update"];

export async function getMusicEntries(patientId: string) {
  const { data, error } = await supabase
    .from("music_entries")
    .select("*")
    .eq("patient_id", patientId)
    .order("life_period", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addMusicEntry(entry: MusicInsert) {
  const { data, error } = await supabase
    .from("music_entries")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMusicEntry(entryId: string, updates: MusicUpdate) {
  const { data, error } = await supabase
    .from("music_entries")
    .update(updates)
    .eq("id", entryId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMusicEntry(entryId: string) {
  const { error } = await supabase.from("music_entries").delete().eq("id", entryId);
  if (error) throw error;
}
