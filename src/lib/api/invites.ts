import { supabase } from "../supabase";
import type { UserRole } from "../database.types";

export async function sendInvite(
  patientId: string,
  invitedBy: string,
  email: string,
  role: UserRole = "family_contributor"
) {
  const { data, error } = await supabase
    .from("invites")
    .insert({ patient_id: patientId, invited_by: invitedBy, invite_email: email, role })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getInvites(patientId: string) {
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function acceptInvite(token: string, profileId: string) {
  const { data: invite, error: fetchError } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (fetchError || !invite) throw new Error("Invalid or expired invite");

  if (new Date(invite.expires_at) < new Date()) {
    await supabase.from("invites").update({ status: "expired" }).eq("id", invite.id);
    throw new Error("Invite has expired");
  }

  const { error: collabError } = await supabase.from("patient_collaborators").insert({
    patient_id: invite.patient_id,
    profile_id: profileId,
    role: invite.role,
    accepted_at: new Date().toISOString(),
  });
  if (collabError) throw collabError;

  await supabase.from("invites").update({ status: "accepted" }).eq("id", invite.id);
  return invite;
}

export async function revokeInvite(inviteId: string) {
  const { error } = await supabase
    .from("invites")
    .update({ status: "expired" })
    .eq("id", inviteId);
  if (error) throw error;
}
