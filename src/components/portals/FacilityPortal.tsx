import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Building2,
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
  Users,
} from "lucide-react";
import { BRIDGE_SUMMARY, MOCK_MEMORIES, MOCK_PATIENT } from "../../constants";
import { cn } from "../../lib/utils";

const incomingPatients = [
  { id: "robert", name: "Robert Ellis", status: "Bridge ready", score: 96, date: "Today", type: "Memory Care" },
  { id: "arthur", name: "Arthur Blank", status: "Bridge ready", score: 92, date: "Nov 02", type: "Assisted Living" },
  { id: "maria", name: "Maria Garcia", status: "Bridge ready", score: 89, date: "Nov 04", type: "High Support" },
];

type TherapyEntryType = "music" | "photo" | "story";

interface TherapyEntry {
  id: string;
  title: string;
  type: TherapyEntryType;
  label: string;
  body: string;
  image: string;
}

interface QuickTipEntry {
  label: string;
  value: string;
}

interface ContactEntry {
  name: string;
  role: string;
  detail: string;
}

interface FacilityProfile {
  id: string;
  fullName: string;
  initials: string;
  diagnosisLine: string;
  whoIAm: string;
  comforts: string[];
  ptCareTeamNotes: string[];
  facilityNotes: string[];
  quickTips: QuickTipEntry[];
  contacts: ContactEntry[];
  therapy: TherapyEntry[];
}

const ROBERT_PROFILE: FacilityProfile = {
  id: "robert",
  fullName: `${MOCK_PATIENT.firstName} ${MOCK_PATIENT.lastName}`,
  initials: "RE",
  diagnosisLine: "Moderate Alzheimer's | Preferred name: Robert | Primary contact: Elaine Ellis",
  whoIAm: BRIDGE_SUMMARY.whoIAm,
  comforts: BRIDGE_SUMMARY.comforts,
  ptCareTeamNotes: BRIDGE_SUMMARY.ptCareTeamNotes,
  facilityNotes: BRIDGE_SUMMARY.facilityNotes,
  quickTips: [
    { label: "Opening prompt", value: "Mr. Ellis, I heard you made history feel like stories. What was your favorite class to teach?" },
    { label: "Mealtime prompt", value: "Robert, Thanksgiving was your tradition. Did you carve the turkey at the head of the table?" },
    { label: "Calming routine", value: "Use Elaine's morning coffee story, lower room noise, and offer a warm mug if appropriate." },
    { label: "Mobility cue", value: "Use boardwalk/living-room dance language for gentle movement instead of abstract exercise instructions." },
  ],
  contacts: [
    { name: "Elaine Ellis", role: "Wife / primary caregiver", detail: "Best for morning routine and music cues" },
    { name: "Michael Ellis", role: "Son", detail: "Best for fishing and fatherhood memories" },
    { name: "PT / care team", role: "Shared handoff", detail: "Use movement cues from music memories" },
  ],
  therapy: MOCK_MEMORIES.slice(0, 6).map((memory) => ({
    id: memory.id,
    title: memory.title,
    type: memory.type as TherapyEntryType,
    label: memory.memoryTypeLabel,
    body: memory.patientDisplay,
    image: memory.assetUrl,
  })),
};

const ARTHUR_PROFILE: FacilityProfile = {
  id: "arthur",
  fullName: "Arthur Blank",
  initials: "AB",
  diagnosisLine: "Moderate vascular dementia | Preferred name: Art | Primary contact: David Blank",
  whoIAm:
    "Arthur 'Art' Blank spent forty-one years as a railroad mechanic in the Altoona, Pennsylvania rail yard, led Eagle Scout troop campouts on weekends, and ran Saturday-night bluegrass jams in his garage. He responds to 'Art' for everyday conversation and 'Mr. Blank' when describing the rail yard or scout work. His wife Doris passed in 2019; references to her are tender, never avoided.",
  comforts: [
    "Talk of the Pennsylvania Railroad and specific engine numbers, especially Engine #4501",
    "Acoustic bluegrass — Doc Watson's 'Wildwood Flower' and Earl Scruggs banjo",
    "The smell of pine sawdust and his old leather work gloves",
    "A weighted lap quilt his wife Doris stitched, kept folded on the chair",
  ],
  ptCareTeamNotes: [
    "Frame seated exercises as 'tightening bolts' or 'tuning a guitar' — concrete tools work better than reps or counts.",
    "Right-hand grip is noticeably stronger than left after his 2021 stroke; offer fine-motor tasks on the right side first.",
    "Left visual field is reduced — place the walker, water cup, and call button on his right.",
    "If he stalls during transfers, hum a few bars of 'Wildwood Flower'; he often resumes movement to the rhythm.",
  ],
  facilityNotes: [
    "Hang a framed shop apron and a printed photo of Engine #4501 above his bed.",
    "Schedule cardio checks before 11am — vascular fatigue rises sharply in the afternoon.",
    "Avoid loud overhead pages and door slams; he startles easily since the stroke.",
    "If agitated, hand him the leather work gloves and ask which engine he'd want to fix today.",
  ],
  quickTips: [
    { label: "Opening prompt", value: "Mr. Blank, I heard you could fix any locomotive in the Altoona yard. What was your favorite engine to work on?" },
    { label: "Mealtime prompt", value: "Art, Doris always made you breakfast before the early shift. Did you take your coffee black or with cream?" },
    { label: "Calming routine", value: "Play Doc Watson's 'Wildwood Flower' at low volume and place the lap quilt across his knees." },
    { label: "Mobility cue", value: "Use 'help me tighten this bolt' or 'tune this string' — task framing keeps his hands moving." },
  ],
  contacts: [
    { name: "David Blank", role: "Son / power of attorney", detail: "Best for engine stories, scout campouts, and medical decisions" },
    { name: "Linda Cho", role: "Niece", detail: "Manages medication shipments; calls every Sunday at 2pm" },
    { name: "Pastor Reyes", role: "First Baptist of Altoona", detail: "Visits monthly with hymn recordings; brings printed lyrics" },
  ],
  therapy: [
    {
      id: "art-therapy-engine",
      title: "Engine #4501 in the Altoona Yard",
      type: "photo",
      label: "Photo + voice memoir",
      body: "Art rebuilt the air brakes on Engine #4501 three times in his career. The yard smelled like coal, oil, and wet steel after a rain.",
      image: "https://picsum.photos/seed/altoona-engine/800/500",
    },
    {
      id: "art-therapy-bluegrass",
      title: "Saturday Bluegrass Jam",
      type: "music",
      label: "Music + audio memory",
      body: "Every Saturday, neighbors brought guitars and banjos to Art's garage. The first song was always 'Wildwood Flower' so newcomers could follow along.",
      image: "https://picsum.photos/seed/bluegrass-guitar/800/500",
    },
    {
      id: "art-therapy-campfire",
      title: "Eagle Scout Campfire",
      type: "story",
      label: "Story + sensory cue",
      body: "Art led Troop 47 for nineteen years. He taught the boys to start a fire with one match and to tell stories without raising their voices.",
      image: "https://picsum.photos/seed/scout-campfire/800/500",
    },
    {
      id: "art-therapy-quilt",
      title: "Doris's Lap Quilt",
      type: "photo",
      label: "Photo + sensory anchor",
      body: "Doris stitched this quilt the year they married. Art folds it the same way she did and keeps it on the chair beside his bed.",
      image: "https://picsum.photos/seed/handmade-quilt/800/500",
    },
    {
      id: "art-therapy-roundhouse",
      title: "The Roundhouse at Sunset",
      type: "photo",
      label: "Photo + spatial memory",
      body: "End of shift, the roundhouse turned gold. Art used to walk home down Twelfth Street with his lunchbox under his arm.",
      image: "https://picsum.photos/seed/roundhouse-sunset/800/500",
    },
    {
      id: "art-therapy-workshop",
      title: "Pine Workshop on Saturday",
      type: "story",
      label: "Story + scent cue",
      body: "After the rail yard, Art built birdhouses from white pine in the back shed. The smell of fresh sawdust still calms him within a minute.",
      image: "https://picsum.photos/seed/pine-workshop/800/500",
    },
  ],
};

const MARIA_PROFILE: FacilityProfile = {
  id: "maria",
  fullName: "Maria Garcia",
  initials: "MG",
  diagnosisLine: "Early Lewy Body dementia | Preferred name: Mari / Señora Garcia | Primary contact: Lucía Reyes",
  whoIAm:
    "Maria 'Mari' Garcia ran 'La Aguja de Calle Ocho,' a tailoring shop in Miami's Little Havana, for thirty-two years. She raised four children with her late husband Tomás, danced salsa every Sunday at El Tropical, and prefers to be addressed as 'Señora Garcia' by staff and 'Mari' by family. She speaks both Spanish and English and visibly relaxes when greeted in Spanish first.",
  comforts: [
    "Spanish-language voices, especially her daughter Lucía calling her 'Mami'",
    "Celia Cruz — 'La Vida Es un Carnaval' — and Buena Vista Social Club at low volume",
    "A small cafecito with steamed milk and a slice of guava pastry on the side",
    "Holding a folded square of soft cotton or linen fabric in her lap",
  ],
  ptCareTeamNotes: [
    "Lewy Body fluctuations: she is most lucid in the morning and disoriented after lunch — schedule key conversations before noon.",
    "REM sleep behavior disorder: keep her nightstand clear of fragile items; she has acted out dreams twice this year.",
    "Visual hallucinations are common — name them calmly ('I don't see the cat, Mari, but I'm right here with you') without arguing or correcting.",
    "She freezes mid-step when walking — use a Spanish rhythm cue ('un, dos, tres, vamos') to restart her gait.",
  ],
  facilityNotes: [
    "Decorate her room with one of her own tailored garments, a Calle Ocho photo, and a small framed photo of Tomás on the dresser.",
    "Every staff member who can should greet her with 'Buenos días, señora Garcia.' One Spanish phrase calms her within seconds.",
    "Avoid harsh fluorescent overhead lighting after 4pm; it intensifies her visual hallucinations.",
    "Schedule bathing in the morning — she resists evening showers due to dream-related anxiety.",
  ],
  quickTips: [
    { label: "Opening prompt", value: "Señora Garcia, me dicen que sus vestidos eran los más bonitos de Calle Ocho. ¿Qué tela prefería trabajar?" },
    { label: "Mealtime prompt", value: "Mari, ¿cafecito con leche o solito hoy? Tengo guava pastry también." },
    { label: "Calming routine", value: "Hand her a folded square of soft cotton, play Buena Vista Social Club at low volume, and dim overhead lights." },
    { label: "Mobility cue", value: "Count 'un, dos, tres, vamos' in rhythm to help her start walking when she freezes." },
  ],
  contacts: [
    { name: "Lucía Reyes", role: "Daughter / primary caregiver", detail: "Visits Tuesdays and Saturdays; bilingual Spanish/English" },
    { name: "Carlos Garcia", role: "Son / pharmacist in Tampa", detail: "Manages Lewy Body medication adjustments — call first for dose changes" },
    { name: "Father Mendoza", role: "Iglesia Sagrado Corazón", detail: "Brings Spanish-language Mass recordings every other Friday" },
  ],
  therapy: [
    {
      id: "mari-therapy-shop",
      title: "La Aguja de Calle Ocho",
      type: "photo",
      label: "Photo + voice memoir",
      body: "Mari ran her tailoring shop on Calle Ocho for thirty-two years. The bell over the door chimed every time a quinceañera dress was picked up.",
      image: "https://picsum.photos/seed/calle-ocho-shop/800/500",
    },
    {
      id: "mari-therapy-salsa",
      title: "Sunday Salsa at El Tropical",
      type: "music",
      label: "Music + movement cue",
      body: "Every Sunday after church, Mari and Tomás danced salsa at El Tropical. She still moves her shoulders when Celia Cruz starts playing.",
      image: "https://picsum.photos/seed/havana-salsa/800/500",
    },
    {
      id: "mari-therapy-cafecito",
      title: "Cafecito and Guava Mornings",
      type: "story",
      label: "Story + sensory cue",
      body: "Mari opened the shop at 7am with a cafecito and a slice of guava pastry from the bakery next door. The smell of espresso always brings her back.",
      image: "https://picsum.photos/seed/cuban-cafecito/800/500",
    },
    {
      id: "mari-therapy-tomas",
      title: "Tomás's Wedding Photo",
      type: "photo",
      label: "Photo + family anchor",
      body: "Mari and Tomás married at Iglesia Sagrado Corazón in 1968. She made her own dress in three weeks from white organza her aunt sent from Havana.",
      image: "https://picsum.photos/seed/havana-wedding/800/500",
    },
    {
      id: "mari-therapy-sewing-machine",
      title: "Sewing Machine Lullaby",
      type: "music",
      label: "Audio memory + sensory cue",
      body: "The hum of her old Singer is one of the most regulating sounds for Mari. A short audio recording of the machine soothes her during sundowning.",
      image: "https://picsum.photos/seed/singer-sewing/800/500",
    },
    {
      id: "mari-therapy-festival",
      title: "Calle Ocho Festival, 1988",
      type: "photo",
      label: "Photo + community story",
      body: "Mari sewed the dance troupe's costumes for the 1988 Calle Ocho Festival. She still recognizes the orange ruffles in the photo.",
      image: "https://picsum.photos/seed/calle-ocho-festival/800/500",
    },
  ],
};

const PROFILES_BY_ID: Record<string, FacilityProfile> = {
  robert: ROBERT_PROFILE,
  arthur: ARTHUR_PROFILE,
  maria: MARIA_PROFILE,
};

export default function FacilityPortal() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const selected = incomingPatients.find((patient) => patient.id === selectedPatient);
  const profile = selectedPatient ? PROFILES_BY_ID[selectedPatient] : null;

  return (
    <div className="min-h-screen bg-[#111827] text-slate-100 flex overflow-hidden">
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
        <div className="w-96 bg-slate-900 border-r border-slate-700 flex flex-col h-screen shrink-0">
          <div className="p-8 border-b border-slate-800">
            <h1 className="text-2xl font-black text-slate-100 mb-2">Facility Dashboard</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Oakwood Memory Care</p>
          </div>

          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Find incoming patient..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#111827] rounded-xl text-sm font-bold outline-none text-slate-100 placeholder:text-slate-500 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">
                Incoming Transitions
              </h3>
              {incomingPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient.id)}
                  className={cn(
                    "w-full p-4 rounded-3xl transition-all flex items-center gap-4 group text-left",
                    selectedPatient === patient.id
                      ? "bg-posthog-cta text-white shadow-lg shadow-black/40"
                      : "bg-slate-900 border border-slate-800 hover:border-indigo-700 hover:shadow-md",
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border",
                      selectedPatient === patient.id
                        ? "bg-white/20 border-white/20"
                        : "bg-[#111827] border-slate-800 text-slate-400",
                    )}
                  >
                    {patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold truncate text-sm">{patient.name}</p>
                    <p className={cn("text-[10px] font-bold uppercase tracking-tight opacity-70", selectedPatient === patient.id ? "text-indigo-100" : "text-slate-500")}>
                      {patient.status} | {patient.type}
                    </p>
                  </div>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#111827] relative">
          <AnimatePresence mode="wait">
            {profile ? (
              <FacilityProfileView key={profile.id} profile={profile} />
            ) : selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-slate-900 flex items-center justify-center text-posthog-orange mb-6 border border-slate-700">
                  <FileStack size={44} />
                </div>
                <h2 className="text-3xl font-black text-slate-100 mb-3">{selected.name}</h2>
                <p className="max-w-md text-slate-400 font-bold">
                  This demo patient does not have a completed Bridge Summary yet.
                </p>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-slate-100 mb-8 border border-slate-700/50 shadow-inner">
                  <Users size={64} />
                </div>
                <h2 className="text-3xl font-black text-slate-100 mb-4 tracking-tight">Open A Bridge Profile</h2>
                <p className="text-slate-400 max-w-sm font-bold text-lg leading-relaxed">
                  Pick a patient from the list to view the AI-generated summary, care cues, therapy content, and family handoff.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FacilityProfileView({ profile }: { profile: FacilityProfile }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-10 max-w-6xl mx-auto space-y-8 pb-28"
    >
      <header className="bg-slate-900 rounded-[2rem] p-8 border border-slate-700 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-[2rem] bg-slate-800 flex items-center justify-center text-posthog-orange text-3xl font-black">
              {profile.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-4xl font-black text-slate-100">{profile.fullName}</h2>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-500/30">
                  Bridge Summary Ready
                </span>
              </div>
              <p className="mt-2 text-lg font-bold text-slate-400">{profile.diagnosisLine}</p>
              <p className="mt-4 max-w-3xl text-slate-200 leading-relaxed">{profile.whoIAm}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="p-4 bg-[#111827] border border-slate-700 rounded-2xl text-posthog-orange hover:shadow-lg transition-all">
              <Download size={22} />
            </button>
            <button className="p-4 bg-[#111827] border border-slate-700 rounded-2xl text-posthog-orange hover:shadow-lg transition-all">
              <Share2 size={22} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SummaryCard title="What Comforts Me" icon={Heart} items={profile.comforts} />
        <SummaryCard title="PT / Care Team Notes" icon={Activity} items={profile.ptCareTeamNotes} />
        <SummaryCard title="Facility Instructions" icon={Building2} items={profile.facilityNotes} />
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-slate-900 rounded-[2rem] p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-posthog-orange" />
            <h3 className="text-2xl font-black text-slate-100">Staff Quick Start</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.quickTips.map((tip) => (
              <QuickTip key={tip.label} label={tip.label} value={tip.value} />
            ))}
          </div>
        </div>

        <div className="bg-indigo-950 text-white rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="text-emerald-300" />
            <h3 className="text-xl font-black">Contact Directory</h3>
          </div>
          <div className="space-y-4">
            {profile.contacts.map((contact) => (
              <Contact key={contact.name} name={contact.name} role={contact.role} detail={contact.detail} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[2rem] p-8 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <FileStack className="text-posthog-orange" />
            Therapy Content Library
          </h3>
          <span className="text-xs font-black uppercase tracking-widest text-posthog-orange">
            {profile.therapy.length} of {profile.therapy.length} shown
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {profile.therapy.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden">
              <img src={item.image} alt="" className="h-32 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center gap-2 text-posthog-orange mb-2">
                  {item.type === "music" ? <Music size={16} /> : item.type === "photo" ? <ImageIcon size={16} /> : <MessageSquare size={16} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                <h4 className="font-black text-slate-100">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-400 line-clamp-3">{item.body}</p>
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
    <section className="bg-slate-900 rounded-[2rem] p-6 border border-slate-700 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center text-posthog-orange">
          <Icon size={22} />
        </div>
        <h3 className="font-black text-slate-100">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-xl bg-slate-800 p-3 text-sm font-bold text-slate-300">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickTip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-800 p-4 border border-slate-700">
      <p className="text-[10px] font-black uppercase tracking-widest text-posthog-orange">{label}</p>
      <p className="mt-2 text-sm font-bold leading-relaxed text-slate-200">{value}</p>
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
