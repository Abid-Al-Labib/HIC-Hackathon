import { supabase } from "../supabase";
import type { Database } from "../database.types";

type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"];

export async function createPatient(patient: PatientInsert) {
  const { data, error } = await supabase
    .from("patients")
    .insert(patient)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPatient(patientId: string) {
  const { data, error } = await supabase
    .from("patients")
    .select(`
      *,
      profiles!patients_primary_caregiver_id_fkey(id, full_name, profile_photo_url),
      facilities(id, name, type)
    `)
    .eq("id", patientId)
    .single();
  if (error) throw error;
  return data;
}

export async function getMyPatients(userId: string) {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("primary_caregiver_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCollaboratedPatients(userId: string) {
  const { data, error } = await supabase
    .from("patient_collaborators")
    .select(`
      role,
      accepted_at,
      patients(*)
    `)
    .eq("profile_id", userId)
    .not("accepted_at", "is", null);
  if (error) throw error;
  return data;
}

export async function updatePatient(patientId: string, updates: PatientUpdate) {
  const { data, error } = await supabase
    .from("patients")
    .update(updates)
    .eq("id", patientId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function advanceProgramWeek(patientId: string, currentWeek: number) {
  const nextWeek = Math.min(currentWeek + 1, 12);
  const updates: PatientUpdate = { program_week: nextWeek };
  if (nextWeek === 12) updates.program_status = "completed";
  return updatePatient(patientId, updates);
}

export async function getCollaborators(patientId: string) {
  const { data, error } = await supabase
    .from("patient_collaborators")
    .select(`
      *,
      profiles(id, full_name, role, profile_photo_url)
    `)
    .eq("patient_id", patientId)
    .order("invited_at", { ascending: false });
  if (error) throw error;
  return data;
}
