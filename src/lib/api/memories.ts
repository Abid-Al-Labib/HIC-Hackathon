import { supabase } from "../supabase";
import type { Database, MemoryStatus } from "../database.types";

type MemoryInsert = Database["public"]["Tables"]["memories"]["Insert"];
type MemoryUpdate = Database["public"]["Tables"]["memories"]["Update"];
type AssetInsert = Database["public"]["Tables"]["memory_assets"]["Insert"];

export async function getMemories(patientId: string, status?: MemoryStatus) {
  let query = supabase
    .from("memories")
    .select(`
      *,
      memory_assets(*),
      profiles!memories_contributor_id_fkey(id, full_name, profile_photo_url)
    `)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getMemory(memoryId: string) {
  const { data, error } = await supabase
    .from("memories")
    .select(`
      *,
      memory_assets(*),
      profiles!memories_contributor_id_fkey(id, full_name, profile_photo_url)
    `)
    .eq("id", memoryId)
    .single();
  if (error) throw error;
  return data;
}

export async function createMemory(memory: MemoryInsert) {
  const { data, error } = await supabase
    .from("memories")
    .insert(memory)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMemory(memoryId: string, updates: MemoryUpdate) {
  const { data, error } = await supabase
    .from("memories")
    .update(updates)
    .eq("id", memoryId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function approveMemory(memoryId: string) {
  return updateMemory(memoryId, { status: "approved" });
}

export async function flagMemory(memoryId: string) {
  return updateMemory(memoryId, { status: "flagged" });
}

export async function uploadMemoryAsset(
  memoryId: string,
  file: File,
  assetType: Database["public"]["Tables"]["memory_assets"]["Insert"]["type"]
) {
  const ext = file.name.split(".").pop();
  const path = `${memoryId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("memory-assets")
    .upload(path, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("memory-assets").getPublicUrl(path);

  const asset: AssetInsert = {
    memory_id: memoryId,
    type: assetType,
    file_url: urlData.publicUrl,
    file_size: file.size,
  };

  const { data, error } = await supabase
    .from("memory_assets")
    .insert(asset)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMemoryAsset(assetId: string, filePath: string) {
  await supabase.storage.from("memory-assets").remove([filePath]);
  const { error } = await supabase.from("memory_assets").delete().eq("id", assetId);
  if (error) throw error;
}

export async function getMemoriesByWeek(patientId: string, week: number) {
  const { data, error } = await supabase
    .from("memories")
    .select("*, memory_assets(*)")
    .eq("patient_id", patientId)
    .eq("program_week", week)
    .eq("status", "approved");
  if (error) throw error;
  return data;
}
