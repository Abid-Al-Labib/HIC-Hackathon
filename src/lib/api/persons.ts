import { supabase } from "../supabase";
import type { Database } from "../database.types";

type PersonInsert = Database["public"]["Tables"]["person_profiles"]["Insert"];
type PersonUpdate = Database["public"]["Tables"]["person_profiles"]["Update"];

export async function getPersonProfiles(patientId: string) {
  const { data, error } = await supabase
    .from("person_profiles")
    .select("*")
    .eq("patient_id", patientId)
    .order("name");
  if (error) throw error;
  return data;
}

export async function createPersonProfile(person: PersonInsert) {
  const { data, error } = await supabase
    .from("person_profiles")
    .insert(person)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePersonProfile(personId: string, updates: PersonUpdate) {
  const { data, error } = await supabase
    .from("person_profiles")
    .update(updates)
    .eq("id", personId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePersonProfile(personId: string) {
  const { error } = await supabase.from("person_profiles").delete().eq("id", personId);
  if (error) throw error;
}

export async function uploadPersonPhoto(personId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `persons/${personId}.${ext}`;

  const { error } = await supabase.storage
    .from("memory-assets")
    .upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from("memory-assets").getPublicUrl(path);
  await updatePersonProfile(personId, { photo_url: data.publicUrl });
  return data.publicUrl;
}
