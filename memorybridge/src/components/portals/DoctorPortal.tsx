import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Activity, ClipboardList, TrendingUp, 
  Search, Filter, Bell, Settings, ArrowUpRight,
  Brain, FileText, CheckCircle2, Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MOCK_PATIENT, MOCK_MOOD_LOGS } from '../../constants';

// Formatting data for chart
const chartData = MOCK_MOOD_LOGS.map(log => ({
  time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  moodScore: log.mood === 'happy' ? 4 : log.mood === 'calm' ? 3 : log.mood === 'confused' ? 2 : 1
}));

export default function DoctorPortal() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Clinician Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 text-indigo-600 mb-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Brain size={22} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Clinician</span>
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
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div>
              <p className="text-xs font-bold text-slate-900">Dr. Aris Thorne</p>
              <p className="text-[10px] text-slate-500 font-medium">Neurologist</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors">
            <Bell size={14} />
            Notifications
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">Reviewing engagement metrics for Alzheimer's cohort</p>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search patients..." 
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium w-64 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm"
                />
             </div>
             <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all">
                <Filter size={18} />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Detail Panel (The Current Patient) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-3xl bg-indigo-50 border-2 border-white shadow-md flex items-center justify-center text-indigo-600 font-black text-2xl">
                        EJ
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white" title="Active in session" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">{MOCK_PATIENT.firstName} {MOCK_PATIENT.lastName}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{MOCK_PATIENT.dementiaType}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full">Stage: {MOCK_PATIENT.stage}</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:ring-4 hover:ring-slate-100 transition-all">
                    Generate Report
                  </button>
                </div>

                {/* Patient Vitals Chart */}
                <div className="mb-8">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={16} />
                        Engagement Trend
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-600" /> Attention</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200" /> Baseline</span>
                      </div>
                   </div>
                   <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={chartData}>
                           <defs>
                             <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                           <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                           <YAxis hide />
                           <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 700 }}
                           />
                           <Area type="monotone" dataKey="moodScore" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-8">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Medication Sync</p>
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <CheckCircle2 size={16} />
                        <span>Up to date</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Avg Engagement</p>
                      <div className="flex items-center gap-1 text-slate-900 font-bold">
                        <span>42m</span>
                        <span className="text-[10px] text-emerald-500 font-black">+14%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Last Review</p>
                      <div className="flex items-center gap-2 text-slate-500 font-bold">
                        <Clock size={16} />
                        <span>Oct 14</span>
                      </div>
                    </div>
                </div>
            </div>

            {/* Clinical Observations */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Reminiscence Log</h3>
                   <button className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Add Note</button>
                </div>
                <div className="space-y-6">
                   {[
                     { date: 'Oct 22', note: 'Patient showed high response to audio recordings from grandson. Agitation decreased by 30% after 10-minute exposure.', physician: 'Nurse Miller' },
                     { date: 'Oct 19', note: 'Visual stimuli from childhood home (Gary, Indiana) triggered lucid verbal communication of 5+ sentences.', physician: 'Dr. Thorne' }
                   ].map((item, i) => (
                      <div key={i} className="flex gap-6 pb-6 border-b border-slate-50 last:border-0 last:pb-0 group">
                        <div className="shrink-0 w-16 text-[10px] font-black text-slate-400 uppercase pt-1">{item.date}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{item.note}"</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest tracking-tighter">Recorded by {item.physician}</p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 hover:text-slate-600">
                          <Settings size={14} />
                        </button>
                      </div>
                   ))}
                </div>
            </div>
          </div>

          {/* Right Panel - Ready for Transition */}
          <div className="space-y-8">
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between aspect-square lg:aspect-auto">
               <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
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
                  <button className="w-full mt-4 py-4 bg-white text-indigo-600 rounded-2xl font-extrabold text-sm shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    Review Transition Summary
                    <ArrowUpRight size={18} />
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Active Alerts</h3>
                <div className="space-y-4">
                   {[
                     { label: 'Missed Input', patient: 'Arthur B.', urgency: 'low' },
                     { label: 'Low Engagement', patient: 'Maria G.', urgency: 'high' },
                     { label: 'Mood Shift', patient: 'Ellie J.', urgency: 'med' }
                   ].map((alert, i) => (
                     <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-50 ring-1 ring-slate-100 group cursor-pointer hover:ring-indigo-100 transition-all">
                       <div className={`w-2 h-2 rounded-full ${alert.urgency === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : alert.urgency === 'med' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                       <div className="flex-1 overflow-hidden">
                         <p className="text-xs font-black text-slate-800 uppercase tracking-tighter truncate">{alert.label}</p>
                         <p className="text-[10px] text-slate-500 font-bold truncate">{alert.patient}</p>
                       </div>
                       <ChevronRightIcon size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
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

import { Share2, ChevronRight as ChevronRightIcon } from "lucide-react";
