import React from 'react';
import { Bot, Lock, Info, Activity } from 'lucide-react';

export default function AICoach() {
  return (
    <div className="space-y-12 h-[75vh] flex flex-col pb-12">
      <header className="flex items-center justify-between p-6 premium-card border-none bg-surface shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
            <Bot size={28} strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif italic text-2xl text-ink">Neural Assistant</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-40 text-ink">System Standby</span>
            </div>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-[10px] font-mono opacity-30">
          AI
        </div>
      </header>

      <div className="flex-1 space-y-10 overflow-y-auto px-2 py-4 scrollbar-hide">
        <div className="flex gap-4 max-w-[85%]">
          <div className="w-8 h-8 rounded-lg bg-accent/5 border border-accent/10 flex items-center justify-center flex-shrink-0">
            <Bot size={14} className="text-accent opacity-40" />
          </div>
          <div className="bg-surface border border-line p-5 rounded-2xl rounded-tl-none text-sm leading-relaxed text-ink/80 shadow-sm">
            Greetings. I am the LearnMyMind Neural Assistant. In future iterations, I will provide real-time cognitive interventions based on your physiological and psychological data.
          </div>
        </div>

        <div className="flex gap-4 max-w-[85%]">
          <div className="w-8 h-8 rounded-lg bg-accent/5 border border-accent/10 flex items-center justify-center flex-shrink-0">
            <Bot size={14} className="text-accent opacity-40" />
          </div>
          <div className="bg-surface border border-line p-5 rounded-2xl rounded-tl-none text-sm leading-relaxed text-ink/80 shadow-sm">
            Current access is restricted to architectural preview. Please continue with the foundational training modules to calibrate your baseline.
          </div>
        </div>
      </div>

      <section className="premium-card p-8 space-y-6 bg-accent text-white border-none relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Lock size={18} className="opacity-60" />
            </div>
            <h4 className="font-medium tracking-tight text-lg">Expansion Pending</h4>
          </div>
          <p className="text-xs opacity-70 leading-relaxed max-w-[280px]">
            Full neural integration, including real-time stress-response guidance, is scheduled for the next system expansion.
          </p>
          <div className="pt-4 flex items-center gap-3 text-[9px] font-mono uppercase tracking-[0.3em] opacity-50">
            <Activity size={12} />
            <span>Layer B Protocol Required</span>
          </div>
        </div>
        
        {/* Abstract design element */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
      </section>
    </div>
  );
}
