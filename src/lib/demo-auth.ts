import type { UserRole } from "./database.types";

export interface DemoAccount {
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
  id: string;
  email?: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: "demo-caregiver", username: "caregiver", password: "demo123", role: "primary_caregiver", displayName: "Sarah Johnson" },
  { id: "demo-family",    username: "family",    password: "demo123", role: "family_contributor", displayName: "Thomas Johnson" },
  { id: "demo-doctor",    username: "doctor",    password: "demo123", role: "doctor",             displayName: "Dr. Patricia Lee" },
  { id: "demo-facility",  username: "facility",  password: "demo123", role: "facility_staff",     displayName: "Nurse Maria Santos" },
  { id: "demo-patient",   username: "patient",   password: "demo123", role: "patient",            displayName: "Eleanor Johnson" },
];

const STORAGE_KEY = "mb_demo_user";
const INVITED_ACCOUNTS_KEY = "mb_demo_invited_accounts";

export function demoSignIn(username: string, password: string): DemoAccount | null {
  const account = [...DEMO_ACCOUNTS, ...getInvitedDemoAccounts()].find(
    (a) => a.username === username.toLowerCase().trim() && a.password === password
  );
  if (!account) return null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  return account;
}

export function demoSignOut() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getDemoSession(): DemoAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function createInvitedDemoAccount(email: string, token: string): DemoAccount {
  const username = email.toLowerCase().trim();
  const displayName = username
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Invited Contributor";
  const account: DemoAccount = {
    id: `demo-invite-${token}`,
    username,
    password: "demo123",
    role: "family_contributor",
    displayName,
    email: username,
  };
  const existing = getInvitedDemoAccounts().filter((item) => item.id !== account.id && item.username !== account.username);
  localStorage.setItem(INVITED_ACCOUNTS_KEY, JSON.stringify([account, ...existing]));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  return account;
}

export function getInvitedDemoAccounts(): DemoAccount[] {
  try {
    const raw = localStorage.getItem(INVITED_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
