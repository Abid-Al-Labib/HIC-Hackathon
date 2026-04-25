import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Image as ImageIcon, MessageSquare, Heart, Play, Pause } from 'lucide-react';
import { MOCK_PATIENT, MOCK_MEMORIES } from '../../constants';
import type { MemoryType } from '../../types';
import { cn } from '../../lib/utils';

export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState<'daily' | 'gallery' | 'music' | 'story'>('daily');
  const [isPlaying, setIsPlaying] = useState(false);

  const dailyMemory = MOCK_MEMORIES[0];

  return (
    <div className="min-h-screen bg-posthog-parchment dark:bg-[#111827] flex flex-col pt-4 overflow-hidden">
      <header className="px-8 mb-4">
        <div className="bg-posthog-sage dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-posthog-border dark:border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-posthog-deep-ink dark:text-slate-100">Good morning, {MOCK_PATIENT.preferredName}</h1>
            <p className="text-xl text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500 font-medium">Today is Saturday, April 25th</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-posthog-light-sage dark:bg-slate-800 flex items-center justify-center border-4 border-white shadow-md">
              <span className="text-2xl font-bold text-posthog-orange">EJ</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 px-8 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-xl border-8 border-white aspect-[4/3] md:aspect-auto">
                <img
                  src={dailyMemory.assetUrl}
                  alt={dailyMemory.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <span className="px-4 py-1 bg-posthog-sage dark:bg-slate-900/20 backdrop-blur-md rounded-full text-sm font-bold uppercase tracking-widest mb-2 inline-block">
                    Today's Special Memory
                  </span>
                  <h2 className="text-5xl font-bold leading-tight">{dailyMemory.title}</h2>
                </div>
              </div>

              <div className="bg-posthog-sage dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-lg border border-posthog-border/50 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-posthog-ink/60 dark:text-slate-500 mb-6">
                    <MessageSquare size={32} />
                    <span className="text-2xl font-semibold">Listen to the story</span>
                  </div>
                  <p className="text-3xl leading-relaxed text-posthog-ink dark:text-slate-200 font-medium italic">
                    "{dailyMemory.description}"
                  </p>
                </div>

                <div className="flex items-center gap-6 mt-8">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-24 h-24 rounded-full bg-posthog-cta flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} className="translate-x-1" fill="currentColor" />}
                  </button>
                  <div>
                    <div className="text-posthog-orange text-2xl font-bold">{isPlaying ? 'Playing Narrative...' : 'Play Voice Narration'}</div>
                    <div className="text-posthog-ink/60 dark:text-slate-500 text-xl">Voice: Daughter Sarah</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {MOCK_MEMORIES.filter(m => m.type === 'photo').map((memory) => (
                <div key={memory.id} className="bg-posthog-sage dark:bg-slate-900 p-4 rounded-3xl shadow-md border border-posthog-border/50 dark:border-slate-800 hover:scale-[1.02] transition-transform cursor-pointer">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                    <img src={memory.assetUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  <h3 className="text-2xl font-bold text-center text-posthog-deep-ink dark:text-slate-100">{memory.title}</h3>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-4"
            >
              <h2 className="text-4xl font-bold mb-8 text-posthog-deep-ink dark:text-slate-100">Your Favorite Music</h2>
              {[
                { title: 'Moon River', artist: 'Andy Williams', year: '1961' },
                { title: 'Unforgettable', artist: 'Nat King Cole', year: '1951' },
                { title: 'The Way You Look Tonight', artist: 'Frank Sinatra', year: '1964' }
              ].map((song, i) => (
                <div key={i} className="bg-posthog-sage dark:bg-slate-900 p-8 rounded-3xl shadow-md flex items-center justify-between group cursor-pointer hover:bg-posthog-light-sage/50 dark:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-posthog-light-sage dark:bg-slate-800 flex items-center justify-center text-posthog-orange">
                      <Music size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-posthog-deep-ink dark:text-slate-100">{song.title}</h3>
                      <p className="text-xl text-posthog-ink/70 dark:text-posthog-ink/60 dark:text-slate-500">{song.artist} • {song.year}</p>
                    </div>
                  </div>
                  <button className="w-16 h-16 rounded-full bg-posthog-light-sage dark:bg-slate-800 text-posthog-ink/60 dark:text-slate-500 group-hover:bg-posthog-cta group-hover:text-white transition-all flex items-center justify-center">
                    <Play size={24} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 p-8 bg-posthog-sage dark:bg-slate-900/80 backdrop-blur-xl border-t border-posthog-border dark:border-slate-700 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.1)]">
        <div className="max-w-screen-xl mx-auto grid grid-cols-4 gap-4">
          {[
            { id: 'daily', label: "Today's Story", icon: Heart },
            { id: 'gallery', label: 'Photos', icon: ImageIcon },
            { id: 'music', label: 'Music', icon: Music },
            { id: 'story', label: 'Your Life', icon: MessageSquare },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as 'daily' | 'gallery' | 'music' | 'story')}
              className={cn(
                "flex flex-col items-center gap-2 py-4 px-2 rounded-3xl transition-all",
                activeTab === item.id
                  ? "bg-posthog-cta text-white shadow-lg shadow-posthog-orange/20 -translate-y-2"
                  : "text-posthog-ink/60 dark:text-slate-500 hover:bg-posthog-light-sage dark:bg-slate-800"
              )}
            >
              <item.icon size={36} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="text-xl font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
