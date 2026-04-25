import { useEffect, useState } from "react";
import { getMyPatients, getCollaboratedPatients } from "../lib/api/patients";
import type { Database } from "../lib/database.types";
import { useAuth } from "../context/AuthContext";

type Patient = Database["public"]["Tables"]["patients"]["Row"];

export function useMyPatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([getMyPatients(user.id), getCollaboratedPatients(user.id)])
      .then(([owned, collab]) => {
        const collabPatients = collab
          .map((c) => c.patients as unknown as Patient)
          .filter(Boolean);
        const all = [...owned, ...collabPatients];
        const unique = all.filter((p, i) => all.findIndex((x) => x.id === p.id) === i);
        setPatients(unique);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  return { patients, loading, error };
}
