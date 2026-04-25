import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Users, FileStack, Settings,
  Search, ArrowRight, Download, Star,
  Share2, Heart, Music, Image as ImageIcon,
  MessageSquare, Sparkles, AlertCircle, Phone
} from 'lucide-react';
import { MOCK_PATIENT, MOCK_MEMORIES } from '../../constants';
import { cn } from '../../lib/utils';

export default function FacilityPortal() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const incomingPatients = [
    { id: 'p1', name: 'Eleanor Johnson', status: 'Ready', score: 92, date: 'Oct 28', type: 'Memory Care' },
    { id: 'p2', name: 'Arthur Blank', status: 'In Review', score: 45, date: 'Nov 02', type: 'Assisted Living' },
    { id: 'p3', name: 'Maria Garcia', status: 'Ready', score: 88, date: 'Oct 30', type: 'High Support' }
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex overflow-hidden">
      {/* Icon-only Sidebar */}
      <aside className="w-20 bg-indigo-950 flex flex-col items-center py-8 gap-8 border-r border-indigo-900 z-20">
        <div className="w-12 h-12 rounded-2xl bg-posthog-cta flex items-center justify-center text-white shadow-xl shadow-indigo-900/40">
          <Building2 size={24} />
        </div>
        <nav className="flex flex-col gap-4">
          {[Users, FileStack, Star, Settings].map((Icon, i) => (
            <button key={i} className={`p-4 rounded-2xl transition-all ${i === 0 ? 'bg-indigo-800 text-white shadow-inner' : 'text-indigo-400 hover:bg-indigo-900 hover:text-white'}`}>
              <Icon size={24} />
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="w-10 h-10 rounded-full bg-indigo-800 border-2 border-indigo-700" />
        </div>
      </aside>

      <div className="flex-1 flex overflow-hidden">
        {/* Patient List */}
        <div className="w-96 bg-posthog-sage dark:bg-slate-900 border-r border-posthog-border dark:border-slate-700 flex flex-col h-screen shrink-0">
          <div className="p-8 border-b border-posthog-border/50 dark:border-slate-800">
            <h1 className="text-2xl font-black text-indigo-950 mb-2">Facility Dashboard</h1>
            <p className="text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">Oakwood Memory Care</p>
          </div>

          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-posthog-ink/60 dark:text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Find patient..."
                className="w-full pl-10 pr-4 py-2.5 bg-posthog-parchment dark:bg-[#111827] rounded-xl text-sm font-bold border-transparent focus:bg-posthog-sage dark:bg-slate-900 focus:border-posthog-border transition-all outline-none"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-posthog-ink/60 dark:text-slate-500 uppercase tracking-widest mb-2 px-2">Incoming Transitions</h3>
              {incomingPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient.id)}
                  className={cn(
                    "w-full p-4 rounded-3xl transition-all flex items-center gap-4 group text-left",
                    selectedPatient === patient.id
                      ? "bg-posthog-cta text-white shadow-lg shadow-indigo-100"
                      : "bg-posthog-sage dark:bg-slate-900 border border-posthog-border/50 dark:border-slate-800 hover:border-indigo-200 hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border",
                    selectedPatient === patient.id ? "bg-posthog-sage dark:bg-slate-900/20 border-white/20" : "bg-posthog-parchment dark:bg-[#111827] border-posthog-border/50 dark:border-slate-800 text-posthog-ink/60 dark:text-slate-500"
                  )}>
                    {patient.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold truncate text-sm">{patient.name}</p>
                    <p className={cn("text-[10px] font-bold uppercase tracking-tight opacity-70", selectedPatient === patient.id ? "text-indigo-100" : "text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500")}>
                      Admission: {patient.date}
                    </p>
                  </div>
                  <ArrowRight size={16} className={cn("transition-transform group-hover:translate-x-1", selectedPatient === patient.id ? "text-white" : "text-slate-300")} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Care Profile */}
        <div className="flex-1 overflow-y-auto bg-posthog-parchment dark:bg-[#111827]/50 relative">
          <AnimatePresence mode="wait">
            {selectedPatient ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-12 max-w-5xl mx-auto space-y-12 pb-32"
              >
                {/* Profile Header */}
                <header className="flex justify-between items-start">
                  <div className="flex items-center gap-8">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-posthog-sage dark:bg-slate-900 p-2 shadow-2xl shadow-indigo-100 relative">
                      <img
                        src="https://images.unsplash.com/photo-1544120199-dc35606d1563?auto=format&fit=crop&q=80&w=300"
                        className="w-full h-full object-cover rounded-[2rem]"
                        alt="Patient Profile"
                      />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-posthog-cta rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg">
                        <Heart size={20} fill="currentColor" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-4xl font-black text-indigo-950 tracking-tight">{MOCK_PATIENT.firstName} {MOCK_PATIENT.lastName}</h2>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-full ring-1 ring-emerald-200">Bridge Active</span>
                      </div>
                      <p className="text-xl text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 font-bold mt-2 italic">"{MOCK_PATIENT.preferredName}"</p>
                      <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500">
                        <span className="flex items-center gap-2 bg-posthog-sage dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-posthog-border/50 dark:border-slate-800">
                          <Star size={14} className="text-posthog-orange/80" />
                          DOB: May 12, 1942
                        </span>
                        <span className="flex items-center gap-2 bg-posthog-sage dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-posthog-border/50 dark:border-slate-800">
                          <AlertCircle size={14} className="text-rose-500" />
                          Dementia Type: {MOCK_PATIENT.dementiaType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="p-4 bg-posthog-sage dark:bg-slate-900 border border-posthog-border dark:border-slate-700 rounded-[2rem] text-posthog-ink/60 dark:text-slate-500 hover:text-posthog-orange hover:shadow-lg transition-all">
                      <Download size={24} />
                    </button>
                    <button className="p-4 bg-posthog-sage dark:bg-slate-900 border border-posthog-border dark:border-slate-700 rounded-[2rem] text-posthog-ink/60 dark:text-slate-500 hover:text-posthog-orange hover:shadow-lg transition-all">
                      <Share2 size={24} />
                    </button>
                  </div>
                </header>

                {/* AI Care Insights */}
                <section className="bg-posthog-sage dark:bg-slate-900 rounded-[3rem] p-10 border border-posthog-border dark:border-slate-700 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-posthog-light-sage/50 dark:bg-slate-800/50 rounded-full blur-3xl -mr-32 -mt-32 opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-2xl bg-posthog-cta flex items-center justify-center text-white shadow-lg">
                        <Sparkles size={20} />
                      </div>
                      <h3 className="text-2xl font-black text-indigo-950 tracking-tight">AI Generated Care Insights</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-[10px] font-black text-posthog-ink/60 dark:text-slate-500 uppercase tracking-widest mb-3">Life Narrative Summary</h4>
                          <p className="text-lg text-posthog-ink dark:text-slate-200 leading-relaxed font-medium">
                            Eleanor was a dedicated primary school teacher in Gary, Indiana for 35 years. She took great pride in her flower garden and her role as a community choir leader. She values <span className="text-posthog-orange font-bold underline decoration-indigo-200 decoration-2 underline-offset-4">tradition, early mornings, and active listening.</span>
                          </p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-posthog-ink/60 dark:text-slate-500 uppercase tracking-widest mb-3">Key Comfort Patterns</h4>
                          <ul className="space-y-3">
                            {[
                              'Responds best to female voices, particularly daughter Sarah',
                              "Calms significantly when Nat King Cole's 'Unforgettable' plays",
                              'Prefers soft high-contrast light to avoid sun-downing anxiety',
                              'Loves holding a cold cup of tea, reminds her of childhood'
                            ].map((trait, i) => (
                              <li key={i} className="flex items-start gap-3 text-posthog-ink/80 dark:text-slate-300 font-bold text-sm bg-posthog-parchment dark:bg-[#111827] p-3 rounded-2xl border border-posthog-border/50 dark:border-slate-800">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                  <Star size={10} fill="currentColor" />
                                </div>
                                {trait}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="bg-indigo-950 text-white rounded-[2rem] p-8 shadow-2xl">
                          <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">Staff Quick-Tips</h4>
                          <div className="space-y-6">
                            <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-xl bg-posthog-sage dark:bg-slate-900/10 flex items-center justify-center text-white shadow-inner shrink-0">
                                <MessageSquare size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-indigo-200 mb-1 uppercase">Opening Prompt</p>
                                <p className="text-sm font-medium leading-relaxed italic">"Mrs. Johnson, I heard your apple pies are the best in Indiana. What's your secret?"</p>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-xl bg-posthog-sage dark:bg-slate-900/10 flex items-center justify-center text-white shadow-inner shrink-0">
                                <AlertCircle size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-indigo-200 mb-1 uppercase">Avoid Topics</p>
                                <p className="text-sm font-medium leading-relaxed">Late 1990s workplace reorganization; topics related to her late brother Mark's passing in 2005.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-posthog-parchment dark:bg-[#111827] rounded-3xl border border-posthog-border/50 dark:border-slate-800 ring-1 ring-slate-200 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-posthog-light-sage dark:bg-slate-800 flex items-center justify-center text-posthog-orange">
                              <Phone size={24} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-posthog-deep-ink dark:text-slate-100 uppercase">Primary Family Contact</p>
                              <p className="text-sm font-bold text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500">Sarah Johnson (Daughter)</p>
                            </div>
                          </div>
                          <button className="px-6 py-2 bg-posthog-sage dark:bg-slate-900 text-posthog-orange rounded-xl text-xs font-black ring-1 ring-indigo-200 hover:bg-posthog-parchment dark:bg-[#111827] transition-all uppercase">Call Now</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Therapy Library Preview */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-indigo-950 tracking-tight flex items-center gap-3">
                      <FileStack className="text-posthog-orange" />
                      Therapy Library Preview
                    </h3>
                    <button className="text-sm font-black text-posthog-orange uppercase tracking-widest hover:underline">Open Full Vault</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: 'The Apple Pie Kitchen', type: 'Voice Story', icon: MessageSquare, color: 'bg-rose-50 text-rose-600' },
                      { title: 'Evening Lullabies: Ellie', type: 'Music Playlist', icon: Music, color: 'bg-posthog-light-sage/50 dark:bg-slate-800/50 text-posthog-orange' },
                      { title: 'Oakwood Ave: 1970s', type: 'Photo Journey', icon: ImageIcon, color: 'bg-emerald-50 text-emerald-600' }
                    ].map((item, i) => (
                      <div key={i} className="bg-posthog-sage dark:bg-slate-900 p-6 rounded-[2rem] border border-posthog-border dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm", item.color)}>
                          <item.icon size={28} />
                        </div>
                        <h4 className="text-lg font-black text-posthog-deep-ink dark:text-slate-100 mb-1 group-hover:text-posthog-orange transition-colors uppercase tracking-tight">{item.title}</h4>
                        <p className="text-xs font-bold text-posthog-ink/60 dark:text-slate-500 uppercase tracking-widest">{item.type}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-32 h-32 rounded-[2.5rem] bg-posthog-sage dark:bg-slate-900 flex items-center justify-center text-slate-100 mb-8 border border-posthog-border dark:border-slate-700/50 shadow-inner">
                  <Users size={64} />
                </div>
                <h2 className="text-3xl font-black text-posthog-deep-ink dark:text-slate-100 mb-4 tracking-tight">Access Secure Care Profiles</h2>
                <p className="text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 max-w-sm font-bold text-lg leading-relaxed">
                  Select an incoming patient from the directory to review their AI-generated transition summary.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
