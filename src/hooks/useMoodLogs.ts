import { useEffect, useState } from "react";
import { getMoodLogs, logMood } from "../lib/api/mood";
import type { Database, MoodType } from "../lib/database.types";
import { useAuth } from "../context/AuthContext";

type MoodLog = Database["public"]["Tables"]["mood_logs"]["Row"];

export function useMoodLogs(patientId: string | null) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    getMoodLogs(patientId)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [patientId]);

  async function log(mood: MoodType, notes?: string) {
    if (!patientId) return;
    const entry = await logMood(patientId, mood, user?.id, notes);
    setLogs((prev) => [entry, ...prev]);
  }

  const latest = logs[0]?.mood ?? null;

  return { logs, latest, loading, log };
}
