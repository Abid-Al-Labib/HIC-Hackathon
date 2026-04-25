import type { Database, EmotionTag, LifePeriod, MemoryStatus, MemoryType, UserRole } from "./database.types";

type PatientRow = Database["public"]["Tables"]["patients"]["Row"];
type MemoryRow = Database["public"]["Tables"]["memories"]["Row"];

export type DemoInvite = {
  id: string;
  patient_id: string;
  invited_by: string;
  invite_email: string;
  role: UserRole;
  token: string;
  status: "pending" | "accepted" | "expired";
  created_at: string;
  expires_at: string;
  accepted_by?: string;
};

export type DemoMemoryInput = {
  title: string;
  description: string;
  type: MemoryType;
  lifePeriod: LifePeriod;
  emotionTags: EmotionTag[];
};

const PATIENTS_KEY = "mb_demo_patients";
const MEMORIES_KEY = "mb_demo_memories";
const INVITES_KEY = "mb_demo_invites";

const DEMO_PATIENT: PatientRow = {
  id: "demo-patient-profile",
  user_id: "demo-patient",
  first_name: "Eleanor",
  last_name: "Johnson",
  preferred_name: "Ellie",
  date_of_birth: "1942-05-12",
  diagnosis_date: "2022-11-20",
  dementia_type: "alzheimers",
  stage: "moderate",
  primary_caregiver_id: "demo-caregiver",
  doctor_id: "demo-doctor",
  facility_id: null,
  program_week: 4,
  program_status: "in_progress",
  program_started_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_MEMORIES: MemoryRow[] = [
  makeMemory({
    id: "demo-memory-apple-pie",
    contributorId: "demo-caregiver",
    title: "Thanksgiving Apple Pie",
    description: "Ellie made apple pie every Thanksgiving at 42 Maple Street. Cinnamon, coffee, and family voices filled the kitchen.",
    type: "story",
    lifePeriod: "middle_age",
    emotionTags: ["joyful", "loving"],
    status: "approved",
  }),
  makeMemory({
    id: "demo-memory-wedding",
    contributorId: "demo-family",
    title: "Wedding Day at St. Mary's",
    description: "A warm June afternoon outside St. Mary's Church, with Robert holding Ellie's hand and everyone laughing on the steps.",
    type: "photo",
    lifePeriod: "young_adult",
    emotionTags: ["joyful", "peaceful"],
    status: "submitted",
  }),
];

export function getDemoPatientsForUser(userId: string, role: UserRole): PatientRow[] {
  const patients = readPatients();
  if (role === "primary_caregiver") return patients.filter((patient) => patient.primary_caregiver_id === userId);
  if (role === "doctor") return patients.filter((patient) => patient.doctor_id === userId);
  if (role === "patient") return patients.filter((patient) => patient.user_id === userId);
  const invites = readInvites();
  const acceptedPatientIds = invites
    .filter((invite) => invite.accepted_by === userId && invite.status === "accepted")
    .map((invite) => invite.patient_id);
  if (userId === "demo-family") acceptedPatientIds.push(DEMO_PATIENT.id);
  return patients.filter((patient) => acceptedPatientIds.includes(patient.id));
}

export function getDemoMemories(patientId: string, userId: string, role: UserRole): MemoryRow[] {
  const memories = readMemories().filter((memory) => memory.patient_id === patientId);
  if (role === "primary_caregiver" || role === "doctor" || role === "facility_staff") return memories;
  return memories.filter((memory) => memory.status === "approved" || memory.contributor_id === userId);
}

export function createDemoMemory(patientId: string, contributorId: string, role: UserRole, input: DemoMemoryInput) {
  const memory = makeMemory({
    id: crypto.randomUUID(),
    contributorId,
    title: input.title,
    description: input.description,
    type: input.type,
    lifePeriod: input.lifePeriod,
    emotionTags: input.emotionTags,
    status: role === "primary_caregiver" ? "approved" : "submitted",
  });
  memory.patient_id = patientId;
  writeMemories([memory, ...readMemories()]);
  return memory;
}

export function updateDemoMemory(memoryId: string, role: UserRole, input: DemoMemoryInput) {
  let updated: MemoryRow | null = null;
  writeMemories(
    readMemories().map((memory) => {
      if (memory.id !== memoryId) return memory;
      updated = {
        ...memory,
        title: input.title,
        description: input.description,
        type: input.type,
        life_period: input.lifePeriod,
        emotion_tags: input.emotionTags,
        status: role === "primary_caregiver" ? memory.status : "submitted",
        updated_at: new Date().toISOString(),
      };
      return updated;
    }),
  );
  return updated;
}

export function setDemoMemoryStatus(memoryId: string, status: MemoryStatus) {
  writeMemories(
    readMemories().map((memory) =>
      memory.id === memoryId ? { ...memory, status, updated_at: new Date().toISOString() } : memory,
    ),
  );
}

export function createDemoInvite(patientId: string, invitedBy: string, email: string): DemoInvite {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 7);
  const invite: DemoInvite = {
    id: crypto.randomUUID(),
    patient_id: patientId,
    invited_by: invitedBy,
    invite_email: email,
    role: "family_contributor",
    token: crypto.randomUUID(),
    status: "pending",
    created_at: now.toISOString(),
    expires_at: expires.toISOString(),
  };
  writeInvites([invite, ...readInvites()]);
  return invite;
}

export function getDemoInvites(patientId: string) {
  return readInvites().filter((invite) => invite.patient_id === patientId);
}

export function getDemoInviteByToken(token: string) {
  return readInvites().find((invite) => invite.token === token) ?? null;
}

export function acceptDemoInvite(token: string, userId: string) {
  const invite = getDemoInviteByToken(token);
  if (!invite || invite.status !== "pending" || new Date(invite.expires_at) < new Date()) return null;
  const accepted = { ...invite, status: "accepted" as const, accepted_by: userId };
  writeInvites(readInvites().map((item) => (item.id === invite.id ? accepted : item)));
  return accepted;
}

function readPatients(): PatientRow[] {
  return readJson(PATIENTS_KEY, [DEMO_PATIENT]);
}

function readMemories(): MemoryRow[] {
  return readJson(MEMORIES_KEY, DEMO_MEMORIES);
}

function writeMemories(memories: MemoryRow[]) {
  localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
}

function readInvites(): DemoInvite[] {
  return readJson(INVITES_KEY, []);
}

function writeInvites(invites: DemoInvite[]) {
  localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function makeMemory({
  id,
  contributorId,
  title,
  description,
  type,
  lifePeriod,
  emotionTags,
  status,
}: {
  id: string;
  contributorId: string;
  title: string;
  description: string;
  type: MemoryType;
  lifePeriod: LifePeriod;
  emotionTags: EmotionTag[];
  status: MemoryStatus;
}): MemoryRow {
  const now = new Date().toISOString();
  return {
    id,
    patient_id: DEMO_PATIENT.id,
    contributor_id: contributorId,
    title,
    description,
    type,
    life_period: lifePeriod,
    emotion_tags: emotionTags,
    people_tagged: [],
    location_name: null,
    location_lat: null,
    location_lng: null,
    sensory_cues: { smells: [], sounds: [], textures: [], tastes: [] },
    therapeutic_score: status === "approved" ? 5 : null,
    status,
    ai_conversation_log: null,
    program_week: 4,
    created_at: now,
    updated_at: now,
  };
}
