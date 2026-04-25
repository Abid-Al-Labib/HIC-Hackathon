import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Share2, Calendar,
  ChevronRight, Heart, Brain, Users, Sparkles,
  Camera, Mic, Music as MusicIcon, History,
  TrendingUp, MessageCircle, LayoutDashboard
} from 'lucide-react';
import { MOCK_PATIENT, MOCK_MEMORIES } from '../../constants';
import { UserRole } from '../../types';
import { cn } from '../../lib/utils';

interface CaregiverPortalProps {
  role: UserRole;
}

export default function CaregiverPortal({ role }: CaregiverPortalProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vault' | 'program' | 'family'>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3 text-indigo-600 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
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
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as 'dashboard' | 'vault' | 'program' | 'family')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === item.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <span className="font-bold">S</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">Sarah Johnson</p>
              <p className="text-xs text-slate-500 truncate">Primary Caregiver</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Care for {MOCK_PATIENT.preferredName}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
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
                  { label: 'Family Members', value: '8', sub: 'Active contributors', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Current Week', value: '4 / 12', sub: 'School & Youth', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Patient Mood', value: 'Positive', sub: 'Based on 4 logs', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110", stat.bg, stat.color)}>
                      <stat.icon size={24} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">{stat.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                  {/* AI Guided Prompt */}
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="text-indigo-600" />
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">AI Guided Input Prompt</h3>
                      </div>
                      <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100">
                        <p className="text-lg text-indigo-900 leading-relaxed font-medium">
                          "We're currently in the <span className="font-bold text-indigo-600 underline underline-offset-4">School & Youth</span> chapter. Tell me about a teacher {MOCK_PATIENT.preferredName} often mentioned, or a subject they excelled in during high school."
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2">
                          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
                            <Plus size={18} />
                            Share Narrative
                          </button>
                          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-2xl text-sm font-bold hover:bg-indigo-50 transition-all">
                            <Camera size={18} />
                            Upload Photos
                          </button>
                          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-2xl text-sm font-bold hover:bg-indigo-50 transition-all">
                            <Mic size={18} />
                            Record Audio
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Memory Submissions */}
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-slate-900">Recent Memory Submissions</h3>
                      <button className="text-indigo-600 font-bold text-sm hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {MOCK_MEMORIES.map((memory) => (
                        <div key={memory.id} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                          {memory.assetUrl ? (
                            <img src={memory.assetUrl} className="w-16 h-16 rounded-2xl object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                              <MusicIcon size={24} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 truncate">{memory.title}</h4>
                            <p className="text-sm text-slate-500 truncate">{memory.description}</p>
                          </div>
                          <div className="text-right shrink-0 px-4">
                            <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold ring-1 ring-emerald-100">Approved</span>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Yesterday</p>
                          </div>
                          <button className="text-slate-300 group-hover:text-slate-500 transition-colors">
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                  <div className="bg-indigo-900 text-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125" />
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

                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Connected Family</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Sarah J.', role: 'Daughter (Primary)', img: 'S' },
                        { name: 'Robert J.', role: 'Husband', img: 'R' },
                        { name: 'Thomas J.', role: 'Son', img: 'T' },
                      ].map((person, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-sm ring-1 ring-slate-100">
                              {person.img}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{person.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{person.role}</p>
                            </div>
                          </div>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                            <MessageCircle size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-6 py-3 border border-dashed border-slate-300 rounded-2xl text-sm font-bold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all">
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
                  <div key={m.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 group">
                    <div className="h-40 overflow-hidden relative">
                      {m.assetUrl ? (
                        <img src={m.assetUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <Brain size={48} />
                        </div>
                      )}
                      <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-indigo-600 rounded-full shadow-sm ring-1 ring-indigo-50 border border-white">
                        {m.type}
                      </span>
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold text-lg mb-2 line-clamp-1">{m.title}</h4>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{m.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {m.emotionTags.map(t => (
                          <span key={t} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold capitalize tracking-tight">#{t}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.lifePeriod.replace('_', ' ')}</span>
                        <button className="text-xs font-bold text-indigo-600 hover:underline">Edit Entry</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
