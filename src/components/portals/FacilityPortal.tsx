import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  Coffee,
  Download,
  FileStack,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Music,
  Phone,
  Search,
  Share2,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { BRIDGE_SUMMARY, MOCK_MEMORIES, MOCK_PATIENT } from "../../constants";
import { cn } from "../../lib/utils";

const incomingPatients = [
  { id: "robert", name: "Robert Ellis", status: "Bridge ready", score: 96, date: "Today", type: "Memory Care" },
  { id: "arthur", name: "Arthur Blank", status: "In review", score: 45, date: "Nov 02", type: "Assisted Living" },
  { id: "maria", name: "Maria Garcia", status: "Waiting on family", score: 58, date: "Nov 04", type: "High Support" },
];

export default function FacilityPortal() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const selected = incomingPatients.find((patient) => patient.id === selectedPatient);
  const isRobert = selectedPatient === "robert";

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex overflow-hidden">
      <aside className="w-20 bg-indigo-950 flex flex-col items-center py-8 gap-8 border-r border-indigo-900 z-20">
        <div className="w-12 h-12 rounded-2xl bg-posthog-cta flex items-center justify-center text-white shadow-xl shadow-indigo-900/40">
          <Building2 size={24} />
        </div>
        <nav className="flex flex-col gap-4">
          {[Users, FileStack, Heart].map((Icon, index) => (
            <button
              key={index}
              className={cn(
                "p-4 rounded-2xl transition-all",
                index === 0 ? "bg-indigo-800 text-white shadow-inner" : "text-indigo-400 hover:bg-indigo-900 hover:text-white",
              )}
            >
              <Icon size={24} />
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 bg-posthog-sage dark:bg-slate-900 border-r border-posthog-border dark:border-slate-700 flex flex-col h-screen shrink-0">
          <div className="p-8 border-b border-posthog-border/50 dark:border-slate-800">
            <h1 className="text-2xl font-black text-indigo-950 dark:text-slate-100 mb-2">Facility Dashboard</h1>
            <p className="text-posthog-ink/70 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">Oakwood Memory Care</p>
          </div>

          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-posthog-ink/60 dark:text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Find incoming patient..."
                className="w-full pl-10 pr-4 py-2.5 bg-posthog-parchment dark:bg-[#111827] rounded-xl text-sm font-bold outline-none"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-posthog-ink/60 dark:text-slate-500 uppercase tracking-widest mb-2 px-2">
                Incoming Transitions
              </h3>
              {incomingPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient.id)}
                  className={cn(
                    "w-full p-4 rounded-3xl transition-all flex items-center gap-4 group text-left",
                    selectedPatient === patient.id
                      ? "bg-posthog-cta text-white shadow-lg shadow-indigo-100"
                      : "bg-posthog-sage dark:bg-slate-900 border border-posthog-border/50 dark:border-slate-800 hover:border-indigo-200 hover:shadow-md",
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border",
                      selectedPatient === patient.id
                        ? "bg-white/20 border-white/20"
                        : "bg-posthog-parchment dark:bg-[#111827] border-posthog-border/50 dark:border-slate-800 text-posthog-ink/60 dark:text-slate-500",
                    )}
                  >
                    {patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold truncate text-sm">{patient.name}</p>
                    <p className={cn("text-[10px] font-bold uppercase tracking-tight opacity-70", selectedPatient === patient.id ? "text-indigo-100" : "text-posthog-ink/70 dark:text-slate-500")}>
                      {patient.status} | {patient.type}
                    </p>
                  </div>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-posthog-parchment dark:bg-[#111827]/50 relative">
          <AnimatePresence mode="wait">
            {isRobert ? (
              <RobertFacilityProfile key="robert-profile" />
            ) : selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-posthog-sage dark:bg-slate-900 flex items-center justify-center text-posthog-orange mb-6 border border-posthog-border dark:border-slate-700">
                  <FileStack size={44} />
                </div>
                <h2 className="text-3xl font-black text-posthog-deep-ink dark:text-slate-100 mb-3">{selected.name}</h2>
                <p className="max-w-md text-posthog-ink/70 dark:text-slate-400 font-bold">
                  This demo patient does not have a completed Bridge Summary yet. Robert Ellis shows the completed facility handoff.
                </p>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-32 h-32 rounded-[2.5rem] bg-posthog-sage dark:bg-slate-900 flex items-center justify-center text-slate-100 mb-8 border border-posthog-border dark:border-slate-700/50 shadow-inner">
                  <Users size={64} />
                </div>
                <h2 className="text-3xl font-black text-posthog-deep-ink dark:text-slate-100 mb-4 tracking-tight">Open A Bridge Profile</h2>
                <p className="text-posthog-ink/70 dark:text-slate-500 max-w-sm font-bold text-lg leading-relaxed">
                  Click Robert Ellis to view the AI-generated summary, care cues, therapy content, and family handoff.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function RobertFacilityProfile() {
  const therapyPreview = MOCK_MEMORIES.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-10 max-w-6xl mx-auto space-y-8 pb-28"
    >
      <header className="bg-posthog-sage dark:bg-slate-900 rounded-[2rem] p-8 border border-posthog-border dark:border-slate-700 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-[2rem] bg-posthog-light-sage dark:bg-slate-800 flex items-center justify-center text-posthog-orange text-3xl font-black">
              RE
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-4xl font-black text-indigo-950 dark:text-slate-100">
                  {MOCK_PATIENT.firstName} {MOCK_PATIENT.lastName}
                </h2>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-full">
                  Bridge Summary Ready
                </span>
              </div>
              <p className="mt-2 text-lg font-bold text-posthog-ink/70 dark:text-slate-400">
                Moderate Alzheimer's | Preferred name: Robert | Primary contact: Elaine Ellis
              </p>
              <p className="mt-4 max-w-3xl text-posthog-ink dark:text-slate-200 leading-relaxed">{BRIDGE_SUMMARY.whoIAm}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="p-4 bg-posthog-parchment dark:bg-[#111827] border border-posthog-border dark:border-slate-700 rounded-2xl text-posthog-orange hover:shadow-lg transition-all">
              <Download size={22} />
            </button>
            <button className="p-4 bg-posthog-parchment dark:bg-[#111827] border border-posthog-border dark:border-slate-700 rounded-2xl text-posthog-orange hover:shadow-lg transition-all">
              <Share2 size={22} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SummaryCard title="What Comforts Me" icon={Heart} items={BRIDGE_SUMMARY.comforts} />
        <SummaryCard title="PT / Care Team Notes" icon={Activity} items={BRIDGE_SUMMARY.ptCareTeamNotes} />
        <SummaryCard title="Facility Instructions" icon={Building2} items={BRIDGE_SUMMARY.facilityNotes} />
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-posthog-sage dark:bg-slate-900 rounded-[2rem] p-8 border border-posthog-border dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-posthog-orange" />
            <h3 className="text-2xl font-black text-indigo-950 dark:text-slate-100">Staff Quick Start</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickTip label="Opening prompt" value="Mr. Ellis, I heard you made history feel like stories. What was your favorite class to teach?" />
            <QuickTip label="Mealtime prompt" value="Robert, Thanksgiving was your tradition. Did you carve the turkey at the head of the table?" />
            <QuickTip label="Calming routine" value="Use Elaine's morning coffee story, lower room noise, and offer a warm mug if appropriate." />
            <QuickTip label="Mobility cue" value="Use boardwalk/living-room dance language for gentle movement instead of abstract exercise instructions." />
          </div>
        </div>

        <div className="bg-indigo-950 text-white rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="text-emerald-300" />
            <h3 className="text-xl font-black">Contact Directory</h3>
          </div>
          <div className="space-y-4">
            <Contact name="Elaine Ellis" role="Wife / primary caregiver" detail="Best for morning routine and music cues" />
            <Contact name="Michael Ellis" role="Son" detail="Best for fishing and fatherhood memories" />
            <Contact name="PT / care team" role="Shared handoff" detail="Use movement cues from music memories" />
          </div>
        </div>
      </section>

      <section className="bg-posthog-sage dark:bg-slate-900 rounded-[2rem] p-8 border border-posthog-border dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-indigo-950 dark:text-slate-100 flex items-center gap-3">
            <FileStack className="text-posthog-orange" />
            Therapy Content Library
          </h3>
          <span className="text-xs font-black uppercase tracking-widest text-posthog-orange">6 of 10 shown</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {therapyPreview.map((memory) => (
            <div key={memory.id} className="rounded-2xl border border-posthog-border bg-posthog-parchment overflow-hidden dark:border-slate-700 dark:bg-slate-800">
              <img src={memory.assetUrl} alt="" className="h-32 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center gap-2 text-posthog-orange mb-2">
                  {memory.type === "music" ? <Music size={16} /> : memory.type === "photo" ? <ImageIcon size={16} /> : <MessageSquare size={16} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{memory.memoryTypeLabel}</span>
                </div>
                <h4 className="font-black text-posthog-deep-ink dark:text-slate-100">{memory.title}</h4>
                <p className="mt-2 text-sm text-posthog-ink/70 dark:text-slate-400 line-clamp-3">{memory.patientDisplay}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function SummaryCard({ title, icon: Icon, items }: { title: string; icon: typeof Heart; items: string[] }) {
  return (
    <section className="bg-posthog-sage dark:bg-slate-900 rounded-[2rem] p-6 border border-posthog-border dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-posthog-light-sage dark:bg-slate-800 flex items-center justify-center text-posthog-orange">
          <Icon size={22} />
        </div>
        <h3 className="font-black text-posthog-deep-ink dark:text-slate-100">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-xl bg-posthog-parchment p-3 text-sm font-bold text-posthog-ink/80 dark:bg-slate-800 dark:text-slate-300">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickTip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-posthog-parchment p-4 border border-posthog-border/60 dark:bg-slate-800 dark:border-slate-700">
      <p className="text-[10px] font-black uppercase tracking-widest text-posthog-orange">{label}</p>
      <p className="mt-2 text-sm font-bold leading-relaxed text-posthog-ink dark:text-slate-200">{value}</p>
    </div>
  );
}

function Contact({ name, role, detail }: { name: string; role: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="font-black">{name}</p>
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">{role}</p>
      <p className="mt-2 text-sm text-indigo-100">{detail}</p>
    </div>
  );
}
