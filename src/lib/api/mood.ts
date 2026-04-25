import { supabase } from "../supabase";
import type { MoodType } from "../database.types";

export async function logMood(patientId: string, mood: MoodType, loggedBy?: string, notes?: string) {
  const { data, error } = await supabase
    .from("mood_logs")
    .insert({ patient_id: patientId, mood, logged_by: loggedBy ?? null, notes: notes ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMoodLogs(patientId: string, limit = 30) {
  const { data, error } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("patient_id", patientId)
    .order("logged_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getRecentMoodTrend(patientId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("mood_logs")
    .select("mood, logged_at")
    .eq("patient_id", patientId)
    .gte("logged_at", since.toISOString())
    .order("logged_at", { ascending: true });
  if (error) throw error;
  return data;
}
