import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Brain,
  Calendar,
  Check,
  Copy,
  Edit3,
  Heart,
  History,
  LayoutDashboard,
  MailPlus,
  Plus,
  Send,
  Users,
} from "lucide-react";
import type { Database, EmotionTag, LifePeriod, MemoryType, UserRole } from "../../types";
import { useAuth } from "../../context/AuthContext";
import {
  createDemoInvite,
  createDemoMemory,
  getDemoInvites,
  getDemoMemories,
  getDemoPatientsForUser,
  setDemoMemoryStatus,
  updateDemoMemory,
  type DemoInvite,
} from "../../lib/demo-data";
import { cn } from "../../lib/utils";

interface CaregiverPortalProps {
  role: UserRole;
}

type MemoryRow = Database["public"]["Tables"]["memories"]["Row"] & {
  profiles?: { id: string; full_name: string; profile_photo_url: string | null } | null;
};

const MEMORY_TYPES: MemoryType[] = ["story", "photo", "audio", "music", "sensory", "life_event"];
const LIFE_PERIODS: LifePeriod[] = ["childhood", "young_adult", "middle_age", "recent"];
const EMOTIONS: EmotionTag[] = ["joyful", "peaceful", "proud", "loving", "funny", "bittersweet"];

const emptyMemoryForm = {
  title: "",
  description: "",
  type: "story" as MemoryType,
  lifePeriod: "middle_age" as LifePeriod,
  emotionTags: ["joyful"] as EmotionTag[],
};

export default function CaregiverPortal({ role }: CaregiverPortalProps) {
  const { user, signOut } = useAuth();
  const patients = useMemo(() => (user ? getDemoPatientsForUser(user.id, user.role) : []), [user]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "vault" | "program" | "family">("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invites, setInvites] = useState<DemoInvite[]>([]);
  const [memories, setMemories] = useState<MemoryRow[]>([]);
  const [lastInviteLink, setLastInviteLink] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState(emptyMemoryForm);
  const [editingMemory, setEditingMemory] = useState<MemoryRow | null>(null);
  const [savingInvite, setSavingInvite] = useState(false);
  const [savingMemory, setSavingMemory] = useState(false);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? patients[0] ?? null,
    [patients, selectedPatientId],
  );
  const isPrimaryCaregiver = role === "primary_caregiver" || user?.role === "primary_caregiver";

  useEffect(() => {
    if (!selectedPatientId && patients[0]) setSelectedPatientId(patients[0].id);
  }, [patients, selectedPatientId]);

  useEffect(() => {
    if (!selectedPatient?.id || !user) return;
    setMemories(getDemoMemories(selectedPatient.id, user.id, user.role));
    setInvites(isPrimaryCaregiver ? getDemoInvites(selectedPatient.id) : []);
  }, [isPrimaryCaregiver, selectedPatient?.id, user]);

  function refreshDemoData() {
    if (!selectedPatient || !user) return;
    setMemories(getDemoMemories(selectedPatient.id, user.id, user.role));
    setInvites(isPrimaryCaregiver ? getDemoInvites(selectedPatient.id) : []);
  }

  function buildInviteLink(token: string) {
    return `${window.location.origin}/invite/${token}`;
  }

  async function handleSendInvite(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedPatient || !user || !inviteEmail.trim()) return;
    setSavingInvite(true);
    setNotice(null);
    try {
      const invite = createDemoInvite(selectedPatient.id, user.id, inviteEmail.trim());
      const link = buildInviteLink(invite.token);
      setLastInviteLink(link);
      setInvites((current) => [invite, ...current]);
      setInviteEmail("");
      await navigator.clipboard?.writeText(link);
      setNotice("Invite created and copied. Share the link with the contributor.");
    } catch (error: unknown) {
      setNotice((error as Error).message);
    } finally {
      setSavingInvite(false);
    }
  }

  function startEdit(memory: MemoryRow) {
    setEditingMemory(memory);
    setForm({
      title: memory.title,
      description: memory.description ?? "",
      type: memory.type,
      lifePeriod: memory.life_period ?? "middle_age",
      emotionTags: memory.emotion_tags.length ? memory.emotion_tags : ["joyful"],
    });
    setActiveTab("vault");
  }

  function resetMemoryForm() {
    setEditingMemory(null);
    setForm(emptyMemoryForm);
  }

  async function handleSaveMemory(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedPatient || !user || !form.title.trim()) return;
    setSavingMemory(true);
    setNotice(null);
    try {
      if (editingMemory) {
        updateDemoMemory(editingMemory.id, user.role, {
          title: form.title.trim(),
          description: form.description.trim(),
          type: form.type,
          lifePeriod: form.lifePeriod,
          emotionTags: form.emotionTags,
        });
        setNotice("Memory updated.");
      } else {
        createDemoMemory(selectedPatient.id, user.id, user.role, {
          title: form.title.trim(),
          description: form.description.trim(),
          type: form.type,
          lifePeriod: form.lifePeriod,
          emotionTags: form.emotionTags,
        });
        setNotice(isPrimaryCaregiver ? "Memory added to the vault." : "Memory submitted for caregiver review.");
      }
      resetMemoryForm();
      refreshDemoData();
    } catch (error: unknown) {
      setNotice((error as Error).message);
    } finally {
      setSavingMemory(false);
    }
  }

  function toggleEmotion(tag: EmotionTag) {
    setForm((current) => ({
      ...current,
      emotionTags: current.emotionTags.includes(tag)
        ? current.emotionTags.filter((item) => item !== tag)
        : [...current.emotionTags, tag],
    }));
  }

  const submittedCount = memories.filter((memory) => memory.status === "submitted").length;
  const approvedCount = memories.filter((memory) => memory.status === "approved").length;

  return (
    <div className="min-h-screen bg-posthog-parchment dark:bg-[#111827] flex">
      <aside className="w-64 bg-posthog-sage dark:bg-slate-900 border-r border-posthog-border dark:border-slate-700 flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3 text-posthog-orange mb-8">
            <div className="w-10 h-10 rounded-xl bg-posthog-cta flex items-center justify-center text-white">
              <Brain size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">MemoryBridge</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "vault", label: "Memory Vault", icon: History },
              { id: "program", label: "12-Week Program", icon: Calendar },
              { id: "family", label: "Family & Invites", icon: Users },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === item.id
                    ? "bg-posthog-light-sage/50 dark:bg-slate-800/50 text-indigo-700"
                    : "text-posthog-ink/70 dark:text-slate-400 hover:bg-posthog-parchment dark:hover:bg-slate-800 hover:text-posthog-deep-ink dark:hover:text-slate-100",
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-posthog-border/50 dark:border-slate-800">
          <div className="p-3 bg-posthog-parchment dark:bg-[#111827] rounded-2xl">
            <p className="text-sm font-bold text-posthog-deep-ink dark:text-slate-100 truncate">
              {user?.displayName ?? "MemoryBridge user"}
            </p>
            <p className="text-xs text-posthog-ink/70 dark:text-slate-500 capitalize truncate">
              {(user?.role ?? role).replace(/_/g, " ")}
            </p>
            <button onClick={signOut} className="mt-3 text-xs font-bold text-posthog-orange hover:underline">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="min-h-20 bg-posthog-sage dark:bg-slate-900 border-b border-posthog-border dark:border-slate-700 px-8 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-posthog-deep-ink dark:text-slate-100">
              {selectedPatient ? `Care for ${selectedPatient.preferred_name}` : "Care workspace"}
            </h2>
            <p className="text-sm text-posthog-ink/70 dark:text-slate-400">
              {isPrimaryCaregiver ? "Invite family and approve their memory submissions." : "Share memories for caregiver review."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {patients.length > 1 && (
              <select
                value={selectedPatient?.id ?? ""}
                onChange={(event) => setSelectedPatientId(event.target.value)}
                className="rounded-xl border border-posthog-border bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.preferred_name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setActiveTab("vault")}
              className="flex items-center gap-2 px-4 py-2 bg-posthog-cta text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
            >
              <Plus size={18} />
              Add Memory
            </button>
          </div>
        </header>

        <main className="p-8 space-y-8">
          {notice && (
            <div className="rounded-2xl border border-posthog-border bg-posthog-sage px-4 py-3 text-sm font-medium text-posthog-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {notice}
            </div>
          )}

          {!selectedPatient && (
            <div className="rounded-3xl border border-dashed border-posthog-border bg-posthog-sage p-8 text-posthog-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              No patient profile is connected to this account yet. Use a caregiver account or accept an invite link first.
            </div>
          )}

          {selectedPatient && activeTab === "dashboard" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Memories", value: memories.length, sub: `${submittedCount} awaiting review`, icon: Heart },
                  { label: "Approved", value: approvedCount, sub: "Ready for therapy", icon: Check },
                  { label: "Current Week", value: `${selectedPatient.program_week} / 12`, sub: selectedPatient.program_status.replace("_", " "), icon: Calendar },
                  { label: "Open Invites", value: invites.filter((invite) => invite.status === "pending").length, sub: "Pending contributors", icon: MailPlus },
                ].map((stat) => (
                  <div key={stat.label} className="bg-posthog-sage dark:bg-slate-900 p-6 rounded-[1.5rem] border border-posthog-border/50 dark:border-slate-800 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-posthog-light-sage/50 dark:bg-slate-800/50 text-posthog-orange">
                      <stat.icon size={24} />
                    </div>
                    <div className="text-2xl font-bold text-posthog-deep-ink dark:text-slate-100">{stat.value}</div>
                    <div className="text-sm font-medium text-posthog-ink/70 dark:text-slate-400 mt-1">{stat.label}</div>
                    <div className="text-xs text-posthog-ink/60 dark:text-slate-500 mt-0.5 capitalize">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <section className="xl:col-span-2 bg-posthog-sage dark:bg-slate-900 rounded-[1.5rem] p-8 border border-posthog-border/50 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-posthog-deep-ink dark:text-slate-100">Recent Memory Submissions</h3>
                    <button onClick={() => setActiveTab("vault")} className="text-posthog-orange font-bold text-sm hover:underline">
                      View vault
                    </button>
                  </div>
                  <MemoryList
                    memories={memories.slice(0, 5)}
                    loading={false}
                    currentUserId={user?.id}
                    isPrimaryCaregiver={isPrimaryCaregiver}
                    onEdit={startEdit}
                    onStatusChange={refreshDemoData}
                  />
                </section>

                {isPrimaryCaregiver && (
                  <section className="bg-indigo-900 text-white rounded-[1.5rem] p-8 shadow-xl shadow-posthog-orange/20">
                    <div className="flex items-center gap-2 mb-4">
                      <MailPlus size={20} className="text-indigo-300" />
                      <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Invite family</span>
                    </div>
                    <form onSubmit={handleSendInvite} className="space-y-3">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(event) => setInviteEmail(event.target.value)}
                        placeholder="family@example.com"
                        className="w-full rounded-xl border border-indigo-700 bg-indigo-950/60 px-4 py-3 text-sm text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                      <button
                        type="submit"
                        disabled={savingInvite}
                        className="w-full py-3 bg-emerald-400 text-indigo-950 font-bold rounded-xl text-sm hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <Send size={16} />
                        {savingInvite ? "Creating invite..." : "Create Invite Link"}
                      </button>
                    </form>
                    {lastInviteLink && <CopyableInviteLink link={lastInviteLink} />}
                  </section>
                )}
              </div>
            </motion.div>
          )}

          {selectedPatient && activeTab === "vault" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <section className="xl:col-span-2 bg-posthog-sage dark:bg-slate-900 rounded-[1.5rem] p-8 border border-posthog-border/50 dark:border-slate-800">
                <h3 className="text-xl font-bold text-posthog-deep-ink dark:text-slate-100 mb-6">Memory Vault</h3>
                <MemoryList
                  memories={memories}
                  loading={false}
                  currentUserId={user?.id}
                  isPrimaryCaregiver={isPrimaryCaregiver}
                  onEdit={startEdit}
                  onStatusChange={refreshDemoData}
                />
              </section>
              <MemoryForm
                form={form}
                editingTitle={editingMemory?.title}
                saving={savingMemory}
                isPrimaryCaregiver={isPrimaryCaregiver}
                onCancel={resetMemoryForm}
                onSubmit={handleSaveMemory}
                onChange={setForm}
                onToggleEmotion={toggleEmotion}
              />
            </motion.div>
          )}

          {selectedPatient && activeTab === "family" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <section className="xl:col-span-2 bg-posthog-sage dark:bg-slate-900 rounded-[1.5rem] p-8 border border-posthog-border/50 dark:border-slate-800">
                <h3 className="text-xl font-bold text-posthog-deep-ink dark:text-slate-100 mb-6">Invite Manager</h3>
                {isPrimaryCaregiver ? (
                  <div className="space-y-4">
                    {invites.length === 0 && <p className="text-sm text-posthog-ink/70 dark:text-slate-400">No invites sent yet.</p>}
                    {invites.map((invite) => (
                      <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-posthog-border bg-posthog-parchment p-4 dark:border-slate-700 dark:bg-slate-800">
                        <div>
                          <p className="font-bold text-posthog-deep-ink dark:text-slate-100">{invite.invite_email}</p>
                          <p className="text-xs text-posthog-ink/60 dark:text-slate-400 capitalize">
                            {invite.role.replace("_", " ")} · {invite.status}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const link = buildInviteLink(invite.token);
                            setLastInviteLink(link);
                            navigator.clipboard?.writeText(link);
                            setNotice("Invite link copied.");
                          }}
                          className="flex items-center gap-2 rounded-xl border border-posthog-border px-3 py-2 text-sm font-bold text-posthog-orange hover:bg-white dark:border-slate-700 dark:hover:bg-slate-900"
                        >
                          <Copy size={16} />
                          Copy Link
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-posthog-ink/70 dark:text-slate-400">
                    You can contribute memories for {selectedPatient.preferred_name}. Invite management is available to the primary caregiver.
                  </p>
                )}
              </section>

              {isPrimaryCaregiver && (
                <section className="bg-posthog-sage dark:bg-slate-900 rounded-[1.5rem] p-8 border border-posthog-border/50 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-posthog-deep-ink dark:text-slate-100 mb-4">Send New Invite</h3>
                  <form onSubmit={handleSendInvite} className="space-y-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      placeholder="family@example.com"
                      className="w-full rounded-xl border border-posthog-border bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                    />
                    <button
                      type="submit"
                      disabled={savingInvite}
                      className="w-full py-3 bg-posthog-cta text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-60"
                    >
                      {savingInvite ? "Creating invite..." : "Create Invite Link"}
                    </button>
                  </form>
                  {lastInviteLink && <CopyableInviteLink link={lastInviteLink} />}
                </section>
              )}
            </motion.div>
          )}

          {selectedPatient && activeTab === "program" && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-posthog-sage dark:bg-slate-900 rounded-[1.5rem] p-8 border border-posthog-border/50 dark:border-slate-800">
              <h3 className="text-xl font-bold text-posthog-deep-ink dark:text-slate-100 mb-3">12-Week Program</h3>
              <p className="text-posthog-ink/70 dark:text-slate-400">
                Week {selectedPatient.program_week} is active. Invite contributors and collect memories to enrich this chapter.
              </p>
            </motion.section>
          )}
        </main>
      </div>
    </div>
  );
}

function MemoryList({
  memories,
  loading,
  currentUserId,
  isPrimaryCaregiver,
  onEdit,
  onStatusChange,
}: {
  memories: MemoryRow[];
  loading: boolean;
  currentUserId?: string;
  isPrimaryCaregiver: boolean;
  onEdit: (memory: MemoryRow) => void;
  onStatusChange: () => void;
}) {
  if (loading) return <p className="text-sm text-posthog-ink/70 dark:text-slate-400">Loading memories...</p>;
  if (!memories.length) return <p className="text-sm text-posthog-ink/70 dark:text-slate-400">No memories yet.</p>;

  return (
    <div className="space-y-4">
      {memories.map((memory) => {
        const canEdit = isPrimaryCaregiver || memory.contributor_id === currentUserId;
        return (
          <div key={memory.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-posthog-border/60 bg-posthog-parchment p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-posthog-deep-ink dark:text-slate-100">{memory.title}</h4>
                <span className="rounded-full bg-posthog-light-sage px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-posthog-orange dark:bg-slate-700">
                  {memory.status}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-posthog-ink/70 dark:text-slate-400">{memory.description}</p>
              <p className="mt-2 text-xs text-posthog-ink/60 dark:text-slate-500 capitalize">
                {memory.type} · {(memory.life_period ?? "unspecified").replace("_", " ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isPrimaryCaregiver && memory.status === "submitted" && (
                <button
                  onClick={() => {
                    setDemoMemoryStatus(memory.id, "approved");
                    onStatusChange();
                  }}
                  className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-600"
                >
                  Approve
                </button>
              )}
              {isPrimaryCaregiver && memory.status === "submitted" && (
                <button
                  onClick={() => {
                    setDemoMemoryStatus(memory.id, "flagged");
                    onStatusChange();
                  }}
                  className="rounded-xl border border-posthog-border px-3 py-2 text-sm font-bold text-posthog-orange hover:bg-white dark:border-slate-700 dark:hover:bg-slate-900"
                >
                  Flag
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => onEdit(memory)}
                  className="flex items-center gap-2 rounded-xl border border-posthog-border px-3 py-2 text-sm font-bold text-posthog-orange hover:bg-white dark:border-slate-700 dark:hover:bg-slate-900"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MemoryForm({
  form,
  editingTitle,
  saving,
  isPrimaryCaregiver,
  onCancel,
  onSubmit,
  onChange,
  onToggleEmotion,
}: {
  form: typeof emptyMemoryForm;
  editingTitle?: string;
  saving: boolean;
  isPrimaryCaregiver: boolean;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (form: typeof emptyMemoryForm) => void;
  onToggleEmotion: (tag: EmotionTag) => void;
}) {
  return (
    <section className="bg-posthog-sage dark:bg-slate-900 rounded-[1.5rem] p-8 border border-posthog-border/50 dark:border-slate-800">
      <h3 className="text-lg font-bold text-posthog-deep-ink dark:text-slate-100 mb-4">
        {editingTitle ? `Edit ${editingTitle}` : "Add Memory"}
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          required
          value={form.title}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          placeholder="Memory title"
          className="w-full rounded-xl border border-posthog-border bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <textarea
          rows={5}
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
          placeholder="What happened? Who was there? What sights, sounds, or feelings should be remembered?"
          className="w-full rounded-xl border border-posthog-border bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={form.type}
            onChange={(event) => onChange({ ...form, type: event.target.value as MemoryType })}
            className="rounded-xl border border-posthog-border bg-white px-4 py-3 text-sm capitalize dark:border-slate-700 dark:bg-slate-800"
          >
            {MEMORY_TYPES.map((type) => (
              <option key={type} value={type}>{type.replace("_", " ")}</option>
            ))}
          </select>
          <select
            value={form.lifePeriod}
            onChange={(event) => onChange({ ...form, lifePeriod: event.target.value as LifePeriod })}
            className="rounded-xl border border-posthog-border bg-white px-4 py-3 text-sm capitalize dark:border-slate-700 dark:bg-slate-800"
          >
            {LIFE_PERIODS.map((period) => (
              <option key={period} value={period}>{period.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleEmotion(tag)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold capitalize transition-colors",
                form.emotionTags.includes(tag)
                  ? "bg-posthog-cta text-white"
                  : "bg-posthog-parchment text-posthog-ink/70 hover:bg-white dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          {editingTitle && (
            <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-posthog-border py-3 text-sm font-bold dark:border-slate-700">
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-posthog-cta py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : isPrimaryCaregiver ? "Save Memory" : "Submit for Review"}
          </button>
        </div>
      </form>
    </section>
  );
}

function CopyableInviteLink({ link }: { link: string }) {
  return (
    <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs text-indigo-50 dark:bg-slate-800">
      <p className="mb-2 font-bold">Invite link</p>
      <button
        onClick={() => navigator.clipboard?.writeText(link)}
        className="flex w-full items-center gap-2 rounded-lg bg-black/10 px-3 py-2 text-left font-mono text-[11px] hover:bg-black/20"
      >
        <Copy size={14} className="shrink-0" />
        <span className="truncate">{link}</span>
      </button>
    </div>
  );
}
