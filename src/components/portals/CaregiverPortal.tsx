import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  Activity,
  Brain,
  Building2,
  Calendar,
  Check,
  Copy,
  Edit3,
  FileText,
  Heart,
  History,
  LayoutDashboard,
  MailPlus,
  Plus,
  Send,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import type { Database, EmotionTag, LifePeriod, MemoryType, UserRole } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { AI_PROGRAM_WEEKS, BRIDGE_SUMMARY } from "../../constants";
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

type MemoryRow = Database["public"]["Tables"]["memories"]["Row"];

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
  const [activeTab, setActiveTab] = useState<"dashboard" | "vault" | "program" | "summary" | "family">("dashboard");
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
    refreshDemoData();
  }, [selectedPatient?.id, user?.id, user?.role, isPrimaryCaregiver]);

  function refreshDemoData() {
    if (!selectedPatient || !user) return;
    setMemories(getDemoMemories(selectedPatient.id, user.id, user.role));
    setInvites(isPrimaryCaregiver ? getDemoInvites(selectedPatient.id) : []);
  }

  function buildInviteLink(token: string) {
    return `${window.location.origin}/invite/${token}`;
  }

  async function handleSendInvite(event: FormEvent) {
    event.preventDefault();
    if (!selectedPatient || !user || !inviteEmail.trim()) return;
    setSavingInvite(true);
    setNotice(null);
    try {
      const invite = createDemoInvite(selectedPatient.id, user.id, inviteEmail.trim());
      const link = buildInviteLink(invite.token);
      setLastInviteLink(link);
      setInviteEmail("");
      refreshDemoData();
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

  async function handleSaveMemory(event: FormEvent) {
    event.preventDefault();
    if (!selectedPatient || !user || !form.title.trim()) return;
    setSavingMemory(true);
    setNotice(null);
    try {
      const input = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        lifePeriod: form.lifePeriod,
        emotionTags: form.emotionTags,
      };
      if (editingMemory) {
        updateDemoMemory(editingMemory.id, user.role, input);
        setNotice("Memory updated.");
      } else {
        createDemoMemory(selectedPatient.id, user.id, user.role, input);
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

  function changeMemoryStatus(memoryId: string, status: "approved" | "flagged") {
    setDemoMemoryStatus(memoryId, status);
    refreshDemoData();
    setNotice(status === "approved" ? "Memory approved for therapy." : "Memory flagged for follow-up.");
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
              { id: "program", label: "AI Program", icon: Calendar },
              { id: "summary", label: "Bridge Summary", icon: FileText },
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
          <button
            onClick={() => setActiveTab("vault")}
            className="flex items-center gap-2 px-4 py-2 bg-posthog-cta text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            <Plus size={18} />
            Add Memory
          </button>
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
              <StatsGrid
                memoryCount={memories.length}
                submittedCount={submittedCount}
                approvedCount={approvedCount}
                inviteCount={invites.filter((invite) => invite.status === "pending").length}
                week={selectedPatient.program_week}
                programStatus={selectedPatient.program_status}
              />

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <section className="xl:col-span-2 bg-posthog-sage dark:bg-slate-900 rounded-[1.5rem] p-8 border border-posthog-border/50 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-posthog-deep-ink dark:text-slate-100">AI-Assembled Care Plan</h3>
                    <button onClick={() => setActiveTab("program")} className="text-posthog-orange font-bold text-sm hover:underline">
                      View 12 weeks
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {AI_PROGRAM_WEEKS.slice(1, 4).map((week) => (
                      <div key={week.week} className="rounded-2xl border border-posthog-border bg-posthog-parchment p-4 dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-xs font-black uppercase tracking-widest text-posthog-orange">Week {week.week}</p>
                        <h4 className="mt-2 font-bold text-posthog-deep-ink dark:text-slate-100">{week.theme}</h4>
                        <p className="mt-2 text-sm text-posthog-ink/70 dark:text-slate-400">{week.therapySession}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {isPrimaryCaregiver && (
                  <InvitePanel
                    inviteEmail={inviteEmail}
                    lastInviteLink={lastInviteLink}
                    savingInvite={savingInvite}
                    onEmailChange={setInviteEmail}
                    onSubmit={handleSendInvite}
                  />
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
                  currentUserId={user?.id}
                  isPrimaryCaregiver={isPrimaryCaregiver}
                  onEdit={startEdit}
                  onStatusChange={changeMemoryStatus}
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
                            {invite.role.replace("_", " ")} | {invite.status}
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
                  <InviteForm
                    inviteEmail={inviteEmail}
                    savingInvite={savingInvite}
                    onEmailChange={setInviteEmail}
                    onSubmit={handleSendInvite}
                  />
                  {lastInviteLink && <CopyableInviteLink link={lastInviteLink} />}
                </section>
              )}
            </motion.div>
          )}

          {selectedPatient && activeTab === "program" && (
            <AIProgramView onInviteClick={() => setActiveTab("family")} onSummaryClick={() => setActiveTab("summary")} />
          )}

          {selectedPatient && activeTab === "summary" && (
            <BridgeSummaryView
              onShare={(target) => setNotice(`Demo sent: ${BRIDGE_SUMMARY.title} shared with ${target}.`)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function AIProgramView({
  onInviteClick,
  onSummaryClick,
}: {
  onInviteClick: () => void;
  onSummaryClick: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <section className="bg-indigo-950 text-white rounded-[1.5rem] p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-black uppercase tracking-widest mb-3">
              <Sparkles size={16} />
              AI generated from Robert's memories
            </div>
            <h3 className="text-3xl font-black">12-week reminiscence therapy program</h3>
            <p className="mt-3 max-w-3xl text-indigo-100 leading-relaxed">
              The demo AI clusters Robert's memories by theme, emotion, sensory cues, and care value. It turns family contributions into weekly patient sessions, caregiver prompts, and a final Bridge Summary.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onInviteClick} className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-indigo-950 hover:bg-emerald-300">
              Invite collaborators
            </button>
            <button onClick={onSummaryClick} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20">
              Generate Bridge Summary
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {AI_PROGRAM_WEEKS.map((week) => (
          <section key={week.week} className="bg-posthog-sage dark:bg-slate-900 rounded-[1.5rem] p-6 border border-posthog-border/50 dark:border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-posthog-orange">Week {week.week}</p>
                <h4 className="mt-1 text-xl font-bold text-posthog-deep-ink dark:text-slate-100">{week.theme}</h4>
              </div>
              <span className="rounded-full bg-posthog-light-sage px-3 py-1 text-xs font-bold text-posthog-orange dark:bg-slate-800">
                AI planned
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <InfoLine label="Memories" value={week.sourceMemories.join(", ")} />
              <InfoLine label="Patient session" value={week.therapySession} />
              <InfoLine label="Collaborator prompt" value={week.collaboratorPrompt} />
              <InfoLine label="Why AI chose this" value={week.aiReason} />
            </div>
          </section>
        ))}
      </div>
    </motion.div>
  );
}

function BridgeSummaryView({ onShare }: { onShare: (target: string) => void }) {
  const targetIcons = [Users, Building2, Activity];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <section className="bg-posthog-sage dark:bg-slate-900 rounded-[1.5rem] p-8 border border-posthog-border/50 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-posthog-orange text-xs font-black uppercase tracking-widest mb-3">
              <FileText size={16} />
              {BRIDGE_SUMMARY.status}
            </div>
            <h3 className="text-3xl font-black text-posthog-deep-ink dark:text-slate-100">{BRIDGE_SUMMARY.title}</h3>
            <p className="mt-2 text-sm font-bold text-posthog-ink/60 dark:text-slate-500">{BRIDGE_SUMMARY.generatedFrom}</p>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-posthog-ink dark:text-slate-200">{BRIDGE_SUMMARY.whoIAm}</p>
          </div>
          <div className="grid gap-2 min-w-64">
            {BRIDGE_SUMMARY.shareTargets.map((target, index) => {
              const Icon = targetIcons[index] ?? Share2;
              return (
                <button
                  key={target}
                  onClick={() => onShare(target)}
                  className="flex items-center gap-3 rounded-xl bg-posthog-cta px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  <Icon size={18} />
                  Send to {target}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SummaryCard title="What comforts Robert" items={BRIDGE_SUMMARY.comforts} icon={Heart} />
        <SummaryCard title="PT / care team handoff" items={BRIDGE_SUMMARY.ptCareTeamNotes} icon={Activity} />
        <SummaryCard title="Facility instructions" items={BRIDGE_SUMMARY.facilityNotes} icon={Building2} />
      </div>
    </motion.div>
  );
}

function SummaryCard({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: typeof Heart;
}) {
  return (
    <section className="bg-posthog-sage dark:bg-slate-900 rounded-[1.5rem] p-6 border border-posthog-border/50 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-posthog-light-sage dark:bg-slate-800 flex items-center justify-center text-posthog-orange">
          <Icon size={20} />
        </div>
        <h4 className="font-bold text-posthog-deep-ink dark:text-slate-100">{title}</h4>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-xl bg-posthog-parchment p-3 text-sm font-medium text-posthog-ink/80 dark:bg-slate-800 dark:text-slate-300">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-posthog-parchment p-3 dark:bg-slate-800">
      <p className="text-[10px] font-black uppercase tracking-widest text-posthog-ink/50 dark:text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-posthog-ink dark:text-slate-200">{value}</p>
    </div>
  );
}

function StatsGrid({
  memoryCount,
  submittedCount,
  approvedCount,
  inviteCount,
  week,
  programStatus,
}: {
  memoryCount: number;
  submittedCount: number;
  approvedCount: number;
  inviteCount: number;
  week: number;
  programStatus: string;
}) {
  const stats = [
    { label: "Total Memories", value: memoryCount, sub: `${submittedCount} awaiting review`, icon: Heart },
    { label: "Approved", value: approvedCount, sub: "Ready for therapy", icon: Check },
    { label: "Current Week", value: `${week} / 12`, sub: programStatus.replace("_", " "), icon: Calendar },
    { label: "Open Invites", value: inviteCount, sub: "Pending contributors", icon: MailPlus },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
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
  );
}

function InvitePanel({
  inviteEmail,
  lastInviteLink,
  savingInvite,
  onEmailChange,
  onSubmit,
}: {
  inviteEmail: string;
  lastInviteLink: string;
  savingInvite: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <section className="bg-indigo-900 text-white rounded-[1.5rem] p-8 shadow-xl shadow-posthog-orange/20">
      <div className="flex items-center gap-2 mb-4">
        <MailPlus size={20} className="text-indigo-300" />
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Invite family</span>
      </div>
      <InviteForm inviteEmail={inviteEmail} savingInvite={savingInvite} onEmailChange={onEmailChange} onSubmit={onSubmit} dark />
      {lastInviteLink && <CopyableInviteLink link={lastInviteLink} />}
    </section>
  );
}

function InviteForm({
  inviteEmail,
  savingInvite,
  onEmailChange,
  onSubmit,
  dark = false,
}: {
  inviteEmail: string;
  savingInvite: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (event: FormEvent) => void;
  dark?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="email"
        required
        value={inviteEmail}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="family@example.com"
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300",
          dark
            ? "border-indigo-700 bg-indigo-950/60 text-white placeholder:text-indigo-300"
            : "border-posthog-border bg-white dark:border-slate-700 dark:bg-slate-800",
        )}
      />
      <button
        type="submit"
        disabled={savingInvite}
        className={cn(
          "w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2",
          dark ? "bg-emerald-400 text-indigo-950 hover:bg-emerald-300" : "bg-posthog-cta text-white hover:bg-indigo-700",
        )}
      >
        <Send size={16} />
        {savingInvite ? "Creating invite..." : "Create Invite Link"}
      </button>
    </form>
  );
}

function MemoryList({
  memories,
  currentUserId,
  isPrimaryCaregiver,
  onEdit,
  onStatusChange,
}: {
  memories: MemoryRow[];
  currentUserId?: string;
  isPrimaryCaregiver: boolean;
  onEdit: (memory: MemoryRow) => void;
  onStatusChange: (memoryId: string, status: "approved" | "flagged") => void;
}) {
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
                {memory.type} | {(memory.life_period ?? "unspecified").replace("_", " ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isPrimaryCaregiver && memory.status === "submitted" && (
                <>
                  <button
                    onClick={() => onStatusChange(memory.id, "approved")}
                    className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onStatusChange(memory.id, "flagged")}
                    className="rounded-xl border border-posthog-border px-3 py-2 text-sm font-bold text-posthog-orange hover:bg-white dark:border-slate-700 dark:hover:bg-slate-900"
                  >
                    Flag
                  </button>
                </>
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
  onSubmit: (event: FormEvent) => void;
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
