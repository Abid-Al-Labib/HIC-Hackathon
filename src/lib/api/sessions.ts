import { supabase } from "../supabase";
import type { Database, MoodType } from "../database.types";

type SessionInsert = Database["public"]["Tables"]["therapy_sessions"]["Insert"];
type SessionUpdate = Database["public"]["Tables"]["therapy_sessions"]["Update"];

export async function getTherapySessions(patientId: string) {
  const { data, error } = await supabase
    .from("therapy_sessions")
    .select("*")
    .eq("patient_id", patientId)
    .order("program_week");
  if (error) throw error;
  return data;
}

export async function getSessionsByWeek(patientId: string, week: number) {
  const { data, error } = await supabase
    .from("therapy_sessions")
    .select("*")
    .eq("patient_id", patientId)
    .eq("program_week", week);
  if (error) throw error;
  return data;
}

export async function createSession(session: SessionInsert) {
  const { data, error } = await supabase
    .from("therapy_sessions")
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completeSession(
  sessionId: string,
  moodBefore: MoodType,
  moodAfter: MoodType,
  notes?: string
) {
  const updates: SessionUpdate = {
    completed: true,
    patient_mood_before: moodBefore,
    patient_mood_after: moodAfter,
    caregiver_notes: notes ?? null,
  };
  const { data, error } = await supabase
    .from("therapy_sessions")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
