import React from 'react';
import { motion } from 'motion/react';
import {
  Users, Activity, ClipboardList, TrendingUp,
  Search, Filter, Bell, Settings, ArrowUpRight,
  Brain, FileText, CheckCircle2, Clock,
  Share2, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_PATIENT, MOCK_MOOD_LOGS } from '../../constants';

const chartData = MOCK_MOOD_LOGS.map(log => ({
  time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  moodScore: log.mood === 'happy' ? 4 : log.mood === 'calm' ? 3 : log.mood === 'confused' ? 2 : 1
}));

export default function DoctorPortal() {
  return (
    <div className="min-h-screen bg-[#111827] text-slate-100 flex">
      {/* Clinician Sidebar */}
      <aside className="w-64 bg-posthog-sage dark:bg-slate-900 border-r border-posthog-border dark:border-slate-700 flex flex-col fixed h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 text-posthog-orange mb-10">
            <div className="w-10 h-10 rounded-xl bg-posthog-cta flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Brain size={22} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-100">Clinician</span>
          </div>

          <nav className="space-y-1.5">
            {[
              { label: 'Patient List', icon: Users, active: true },
              { label: 'Performance', icon: Activity },
              { label: 'Care Protocols', icon: ClipboardList },
              { label: 'Clinical Notes', icon: FileText },
            ].map((item, i) => (
              <button
                key={i}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  item.active
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-800 bg-[#111827]/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-700" />
            <div>
              <p className="text-xs font-bold text-slate-100">Dr. Patricia Lee</p>
              <p className="text-[10px] text-slate-500 font-medium">Neurologist</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors">
            <Bell size={14} />
            Notifications
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 p-8 bg-[#111827]">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Clinical Dashboard</h1>
            <p className="text-slate-400 font-medium mt-1">Reviewing engagement metrics for Alzheimer's cohort</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search patients..."
                className="pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium w-64 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>
            <button className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
              <Filter size={18} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Detail Panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-700 shadow-sm">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-slate-800 border-2 border-slate-600 shadow-md flex items-center justify-center text-posthog-orange font-black text-2xl">
                      EJ
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900" title="Active in session" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-100">{MOCK_PATIENT.firstName} {MOCK_PATIENT.lastName}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{MOCK_PATIENT.dementiaType}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-500" />
                      <span className="text-xs font-bold text-posthog-orange px-2 py-0.5 bg-slate-800 rounded-full">Stage: {MOCK_PATIENT.stage}</span>
                    </div>
                  </div>
                </div>
                <button className="px-6 py-2.5 bg-posthog-cta text-white rounded-xl text-sm font-bold shadow-lg hover:ring-4 hover:ring-slate-700 transition-all">
                  Generate Report
                </button>
              </div>

              {/* Engagement Chart */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} />
                    Engagement Trend
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-posthog-orange" /> Attention</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" /> Baseline</span>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.35)', fontSize: '12px', fontWeight: 700 }}
                      />
                      <Area type="monotone" dataKey="moodScore" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-8">
                <div className="p-4 bg-[#111827] rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Medication Sync</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <CheckCircle2 size={16} />
                    <span>Up to date</span>
                  </div>
                </div>
                <div className="p-4 bg-[#111827] rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Avg Engagement</p>
                  <div className="flex items-center gap-1 text-slate-100 font-bold">
                    <span>42m</span>
                    <span className="text-[10px] text-emerald-500 font-black">+14%</span>
                  </div>
                </div>
                <div className="p-4 bg-[#111827] rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Last Review</p>
                  <div className="flex items-center gap-2 text-slate-400 font-bold">
                    <Clock size={16} />
                    <span>Oct 14</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reminiscence Log */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-700 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-100 tracking-tight">Reminiscence Log</h3>
                <button className="text-posthog-orange font-black text-xs uppercase tracking-widest hover:underline">Add Note</button>
              </div>
              <div className="space-y-6">
                {[
                  { date: 'Oct 22', note: 'Patient showed high response to audio recordings from grandson. Agitation decreased by 30% after 10-minute exposure.', physician: 'Nurse Miller' },
                  { date: 'Oct 19', note: 'Visual stimuli from childhood home (his first classroom) triggered lucid verbal communication of 5+ sentences.', physician: 'Dr. Lee' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 pb-6 border-b border-slate-800 last:border-0 last:pb-0 group">
                    <div className="shrink-0 w-16 text-[10px] font-black text-slate-500 uppercase pt-1">{item.date}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200 leading-relaxed italic">"{item.note}"</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Recorded by {item.physician}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-500 hover:text-slate-200">
                      <Settings size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-8">
            <div className="bg-posthog-cta rounded-[2.5rem] p-8 text-white shadow-xl shadow-black/30 flex flex-col justify-between aspect-square lg:aspect-auto">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-posthog-sage dark:bg-slate-900/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <Share2 className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-black mb-2">Bridge Generation</h3>
                <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                  Patient has been flagged for <span className="font-bold text-white">Advanced Memory Care</span> transition.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Care Profile</span>
                  <span className="text-emerald-400">92% Complete</span>
                </div>
                <div className="h-2 w-full bg-indigo-900/50 rounded-full">
                  <div className="h-full w-[92%] bg-emerald-400 rounded-full" />
                </div>
                <button className="w-full mt-4 py-4 bg-slate-900 text-posthog-orange rounded-2xl font-extrabold text-sm shadow-md hover:bg-[#111827] transition-all flex items-center justify-center gap-2">
                  Review Transition Summary
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-slate-100 mb-6 tracking-tight">Active Alerts</h3>
              <div className="space-y-4">
                {[
                  { label: 'Missed Input', patient: 'Robert E.', urgency: 'low' },
                  { label: 'Low Engagement', patient: 'Robert E.', urgency: 'high' },
                  { label: 'Mood Shift', patient: 'Robert E.', urgency: 'med' }
                ].map((alert, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#111827] border border-slate-800 ring-1 ring-slate-800 group cursor-pointer hover:ring-indigo-700/40 transition-all">
                    <div className={`w-2 h-2 rounded-full ${alert.urgency === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : alert.urgency === 'med' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-black text-slate-100 uppercase tracking-tighter truncate">{alert.label}</p>
                      <p className="text-[10px] text-slate-500 font-bold truncate">{alert.patient}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
