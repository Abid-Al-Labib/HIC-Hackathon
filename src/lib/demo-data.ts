import type { Database, EmotionTag, LifePeriod, MemoryStatus, MemoryType, UserRole } from "./database.types";
import { MOCK_MEMORIES } from "../constants";

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
  context?: string;
};

export type DemoMemoryInput = {
  title: string;
  description: string;
  type: MemoryType;
  lifePeriod: LifePeriod;
  emotionTags: EmotionTag[];
};

const PATIENTS_KEY = "mb_demo_v2_patients";
const MEMORIES_KEY = "mb_demo_v2_memories";
const INVITES_KEY = "mb_demo_v2_invites";
export const SEEDED_DEMO_INVITE_TOKEN = "demo-invite-relationships";

const DEMO_PATIENT: PatientRow = {
  id: "demo-patient-profile",
  user_id: "demo-patient",
  first_name: "Robert",
  last_name: "Ellis",
  preferred_name: "Robert",
  date_of_birth: "1948-03-18",
  diagnosis_date: "2024-01-12",
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

const DEMO_MEMORIES: MemoryRow[] = MOCK_MEMORIES.map((memory, index) =>
  makeMemory({
    id: memory.id,
    contributorId: memory.contributorId,
    title: memory.title,
    description: memory.description,
    type: memory.type,
    lifePeriod: memory.lifePeriod,
    emotionTags: memory.emotionTags as EmotionTag[],
    status: index === 2 ? "submitted" : "approved",
    sensoryCues: memory.sensoryCues,
    patientDisplay: memory.patientDisplay,
  }),
);

const DEMO_INVITES: DemoInvite[] = [
  {
    id: "demo-seeded-invite-relationships",
    patient_id: DEMO_PATIENT.id,
    invited_by: "demo-caregiver",
    invite_email: "michael.ellis@example.com",
    role: "family_contributor",
    token: SEEDED_DEMO_INVITE_TOKEN,
    status: "pending",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    context: "Week 2: Loved Ones and Relationships",
  },
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
  const saved = readJson(INVITES_KEY, [] as DemoInvite[]);
  const savedTokens = new Set(saved.map((invite) => invite.token));
  return [...DEMO_INVITES.filter((invite) => !savedTokens.has(invite.token)), ...saved];
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
  sensoryCues,
  patientDisplay,
}: {
  id: string;
  contributorId: string;
  title: string;
  description: string;
  type: MemoryType;
  lifePeriod: LifePeriod;
  emotionTags: EmotionTag[];
  status: MemoryStatus;
  sensoryCues?: string[];
  patientDisplay?: string;
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
    sensory_cues: { cues: sensoryCues ?? [] },
    therapeutic_score: status === "approved" ? 5 : null,
    status,
    ai_conversation_log: patientDisplay ? { patientDisplay } : null,
    program_week: 4,
    created_at: now,
    updated_at: now,
  };
}
