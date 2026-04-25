import { supabase } from "../supabase";
import type { Database, GeneratedContentType, GeneratedContentStatus } from "../database.types";

type ContentInsert = Database["public"]["Tables"]["generated_content"]["Insert"];

export async function getGeneratedContent(
  patientId: string,
  type?: GeneratedContentType,
  status?: GeneratedContentStatus
) {
  let query = supabase
    .from("generated_content")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createGeneratedContent(content: ContentInsert) {
  const { data, error } = await supabase
    .from("generated_content")
    .insert(content)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateContentStatus(contentId: string, status: GeneratedContentStatus) {
  const { data, error } = await supabase
    .from("generated_content")
    .update({ status })
    .eq("id", contentId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function approveContent(contentId: string) {
  return updateContentStatus(contentId, "approved");
}

export async function getApprovedNarratives(patientId: string, week?: number) {
  let query = supabase
    .from("generated_content")
    .select("*")
    .eq("patient_id", patientId)
    .eq("type", "narrative")
    .eq("status", "approved");

  if (week !== undefined) query = query.eq("program_week", week);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
