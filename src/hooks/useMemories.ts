import { useEffect, useState, useCallback } from "react";
import { getMemories, approveMemory, flagMemory } from "../lib/api/memories";
import type { Database, MemoryStatus } from "../lib/database.types";

type Memory = Database["public"]["Tables"]["memories"]["Row"] & {
  memory_assets: Database["public"]["Tables"]["memory_assets"]["Row"][];
  profiles: { id: string; full_name: string; profile_photo_url: string | null } | null;
};

export function useMemories(patientId: string | null, status?: MemoryStatus) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const data = await getMemories(patientId, status);
      setMemories(data as Memory[]);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [patientId, status]);

  useEffect(() => { load(); }, [load]);

  async function approve(memoryId: string) {
    await approveMemory(memoryId);
    setMemories((prev) => prev.map((m) => m.id === memoryId ? { ...m, status: "approved" as MemoryStatus } : m));
  }

  async function flag(memoryId: string) {
    await flagMemory(memoryId);
    setMemories((prev) => prev.map((m) => m.id === memoryId ? { ...m, status: "flagged" as MemoryStatus } : m));
  }

  return { memories, loading, error, reload: load, approve, flag };
}
