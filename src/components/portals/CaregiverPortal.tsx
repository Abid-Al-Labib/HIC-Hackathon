import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Share2, Calendar,
  ChevronRight, Heart, Brain, Users, Sparkles,
  Camera, Mic, Music as MusicIcon, History,
  TrendingUp, MessageCircle, LayoutDashboard, Volume2
} from 'lucide-react';
import { MOCK_PATIENT, MOCK_MEMORIES } from '../../constants';
import { UserRole } from '../../types';
import { cn } from '../../lib/utils';
import NarrationStudio from '../NarrationStudio';

interface CaregiverPortalProps {
  role: UserRole;
}

type CaregiverTab = 'dashboard' | 'vault' | 'program' | 'family' | 'narration';

export default function CaregiverPortal({ role }: CaregiverPortalProps) {
  const [activeTab, setActiveTab] = useState<CaregiverTab>('dashboard');

  return (
    <div className="min-h-screen bg-posthog-parchment dark:bg-[#111827] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-posthog-sage dark:bg-slate-900 border-r border-posthog-border dark:border-slate-700 flex flex-col h-screen fixed sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3 text-posthog-orange mb-8">
            <div className="w-10 h-10 rounded-xl bg-posthog-cta flex items-center justify-center text-white">
              <Brain size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">MemoryBridge</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'vault', label: 'Memory Vault', icon: History },
              { id: 'program', label: '12-Week Program', icon: Calendar },
              { id: 'family', label: 'Family & Collaborators', icon: Users },
              { id: 'narration', label: 'Narration Studio', icon: Volume2 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as CaregiverTab)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === item.id
                    ? "bg-posthog-light-sage/50 dark:bg-slate-800/50 text-indigo-700"
                    : "text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 hover:bg-posthog-parchment dark:bg-[#111827] hover:text-posthog-deep-ink dark:text-slate-100"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-posthog-border/50 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-posthog-parchment dark:bg-[#111827] rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-posthog-light-sage dark:bg-slate-800 flex items-center justify-center text-posthog-orange">
              <span className="font-bold">S</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-posthog-deep-ink dark:text-slate-100 truncate">Sarah Johnson</p>
              <p className="text-xs text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 truncate">Primary Caregiver</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 min-w-0">
        <header className="h-20 bg-posthog-sage dark:bg-slate-900 border-b border-posthog-border dark:border-slate-700 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-posthog-deep-ink dark:text-slate-100">Care for {MOCK_PATIENT.preferredName}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-posthog-cta text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              <Plus size={18} />
              Add Memory
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Memories', value: '142', sub: '+12 this week', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
                  { label: 'Family Members', value: '8', sub: 'Active contributors', icon: Users, color: 'text-posthog-orange', bg: 'bg-posthog-light-sage/50 dark:bg-slate-800/50' },
                  { label: 'Current Week', value: '4 / 12', sub: 'School & Youth', icon: Calendar, color: 'text-posthog-orange', bg: 'bg-posthog-light-sage/50 dark:bg-slate-800/50' },
                  { label: 'Patient Mood', value: 'Positive', sub: 'Based on 4 logs', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-posthog-sage dark:bg-slate-900 p-6 rounded-[2rem] border border-posthog-border/50 dark:border-slate-800 shadow-sm">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110", stat.bg, stat.color)}>
                      <stat.icon size={24} />
                    </div>
                    <div className="text-2xl font-bold text-posthog-deep-ink dark:text-slate-100">{stat.value}</div>
                    <div className="text-sm font-medium text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 mt-1">{stat.label}</div>
                    <div className="text-xs text-posthog-ink/60 dark:text-slate-500 mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                  {/* AI Guided Prompt */}
                  <div className="bg-posthog-sage dark:bg-slate-900 rounded-[2.5rem] p-8 border border-posthog-border/50 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-posthog-light-sage/50 dark:bg-slate-800/50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="text-posthog-orange" />
                        <h3 className="text-xl font-bold text-posthog-deep-ink dark:text-slate-100 tracking-tight">AI Guided Input Prompt</h3>
                      </div>
                      <div className="bg-posthog-light-sage/50 dark:bg-slate-800/50/50 rounded-3xl p-6 border border-posthog-border">
                        <p className="text-lg text-indigo-900 leading-relaxed font-medium">
                          "We're currently in the <span className="font-bold text-posthog-orange underline underline-offset-4">School & Youth</span> chapter. Tell me about a teacher {MOCK_PATIENT.preferredName} often mentioned, or a subject they excelled in during high school."
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2">
                          <button className="flex items-center gap-2 px-6 py-3 bg-posthog-cta text-white rounded-2xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
                            <Plus size={18} />
                            Share Narrative
                          </button>
                          <button className="flex items-center gap-2 px-6 py-3 bg-posthog-sage dark:bg-slate-900 border border-indigo-200 text-posthog-orange rounded-2xl text-sm font-bold hover:bg-posthog-light-sage/50 dark:bg-slate-800/50 transition-all">
                            <Camera size={18} />
                            Upload Photos
                          </button>
                          <button className="flex items-center gap-2 px-6 py-3 bg-posthog-sage dark:bg-slate-900 border border-indigo-200 text-posthog-orange rounded-2xl text-sm font-bold hover:bg-posthog-light-sage/50 dark:bg-slate-800/50 transition-all">
                            <Mic size={18} />
                            Record Audio
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Memory Submissions */}
                  <div className="bg-posthog-sage dark:bg-slate-900 rounded-[2.5rem] p-8 border border-posthog-border/50 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-posthog-deep-ink dark:text-slate-100">Recent Memory Submissions</h3>
                      <button className="text-posthog-orange font-bold text-sm hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {MOCK_MEMORIES.map((memory) => (
                        <div key={memory.id} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-posthog-parchment dark:bg-[#111827] transition-colors border border-transparent hover:border-posthog-border/50 dark:border-slate-800 group">
                          {memory.assetUrl ? (
                            <img src={memory.assetUrl} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-posthog-light-sage/50 dark:bg-slate-800/50 flex items-center justify-center text-posthog-orange shrink-0">
                              <MusicIcon size={24} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-posthog-deep-ink dark:text-slate-100 truncate">{memory.title}</h4>
                            <p className="text-sm text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 truncate">{memory.description}</p>
                          </div>
                          <div className="text-right shrink-0 px-4">
                            <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold ring-1 ring-emerald-100">Approved</span>
                            <p className="text-[10px] text-posthog-ink/60 dark:text-slate-500 mt-1 uppercase font-bold tracking-wider">Yesterday</p>
                          </div>
                          <button className="text-slate-300 group-hover:text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 transition-colors">
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                  <div className="bg-indigo-900 text-white rounded-[2.5rem] p-8 shadow-xl shadow-posthog-orange/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-posthog-sage dark:bg-slate-900/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-4">
                        <Share2 size={20} className="text-indigo-300" />
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Care Bridge Status</span>
                      </div>
                      <h4 className="text-xl font-bold mb-2">Facility Readiness</h4>
                      <div className="w-full h-2 bg-indigo-800 rounded-full mb-4">
                        <div className="w-3/4 h-full bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                      </div>
                      <p className="text-sm text-indigo-100 leading-relaxed opacity-90 mb-6">
                        Summary profile is 75% complete. 2 more narratives needed from the 'Family' chapter.
                      </p>
                      <button className="w-full py-3 bg-emerald-400 text-indigo-950 font-bold rounded-2xl text-sm shadow-md hover:bg-emerald-300 transition-all flex items-center justify-center gap-2">
                        Preview Profile
                        <Sparkles size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-posthog-sage dark:bg-slate-900 rounded-[2.5rem] p-8 border border-posthog-border/50 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-posthog-deep-ink dark:text-slate-100 mb-6">Connected Family</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Sarah J.', role: 'Daughter (Primary)', img: 'S' },
                        { name: 'Robert J.', role: 'Husband', img: 'R' },
                        { name: 'Thomas J.', role: 'Son', img: 'T' },
                      ].map((person, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-posthog-parchment dark:bg-[#111827] flex items-center justify-center font-bold text-posthog-ink/60 dark:text-slate-500 text-sm ring-1 ring-slate-100">
                              {person.img}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-posthog-deep-ink dark:text-slate-100">{person.name}</p>
                              <p className="text-[10px] text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 uppercase font-black tracking-tighter">{person.role}</p>
                            </div>
                          </div>
                          <button className="p-2 text-posthog-ink/60 dark:text-slate-500 hover:text-posthog-orange transition-colors">
                            <MessageCircle size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-6 py-3 border border-dashed border-slate-300 rounded-2xl text-sm font-bold text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 hover:border-indigo-400 hover:text-posthog-orange transition-all">
                      Invite Collaborator
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'vault' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_MEMORIES.map((m) => (
                  <div key={m.id} className="bg-posthog-sage dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-posthog-border/50 dark:border-slate-800 group">
                    <div className="h-40 overflow-hidden relative">
                      {m.assetUrl ? (
                        <img src={m.assetUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                      ) : (
                        <div className="w-full h-full bg-posthog-light-sage dark:bg-slate-800 flex items-center justify-center text-slate-300">
                          <Brain size={48} />
                        </div>
                      )}
                      <span className="absolute top-4 left-4 px-3 py-1 bg-posthog-sage dark:bg-slate-900/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-posthog-orange rounded-full shadow-sm ring-1 ring-indigo-50 border border-white">
                        {m.type}
                      </span>
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold text-lg mb-2 line-clamp-1">{m.title}</h4>
                      <p className="text-sm text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 mb-4 line-clamp-2 leading-relaxed">{m.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {m.emotionTags.map(t => (
                          <span key={t} className="px-2.5 py-0.5 rounded-lg bg-posthog-light-sage/50 dark:bg-slate-800/50 text-posthog-orange text-[10px] font-bold capitalize tracking-tight">#{t}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                        <span className="text-[10px] font-black text-posthog-ink/60 dark:text-slate-500 uppercase tracking-widest">{m.lifePeriod.replace('_', ' ')}</span>
                        <button className="text-xs font-bold text-posthog-orange hover:underline">Edit Entry</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'narration' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <NarrationStudio />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
