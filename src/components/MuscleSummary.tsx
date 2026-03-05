import React from 'react';
import { UserState } from '../types';
import { TrendingUp, Award, Zap, Activity } from 'lucide-react';

export default function MuscleSummary({ state }: { state: UserState }) {
  const muscles = Object.entries(state.stats);

  return (
    <div className="space-y-16">
      <header className="mb-12 px-4">
        <div className="space-y-4">
          <p className="col-header text-center sm:text-left">Subject Profile</p>
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline gap-4">
            <h2 className="text-5xl md:text-6xl font-serif italic text-ink/20 leading-none">Performance Data</h2>
            <div className="font-mono text-3xl opacity-20 tracking-tighter">LVL 04</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-6 px-4">
        <div 
          className="premium-card p-8 flex flex-col justify-between aspect-square text-white border-none shadow-xl"
          style={{ backgroundColor: '#2d3250' }}
        >
          <Award size={24} strokeWidth={1.5} className="opacity-40" />
          <div className="space-y-2">
            <div className="col-header text-white/40">Aggregate Reps</div>
            <div className="data-value text-5xl font-light">
              {state.progress.reduce((acc, p) => acc + p.reps, 0)}
            </div>
          </div>
        </div>
        <div className="premium-card p-8 flex flex-col justify-between aspect-square bg-white border-line/10">
          <TrendingUp size={24} strokeWidth={1.5} className="text-accent opacity-20" />
          <div className="space-y-2">
            <div className="col-header opacity-40">Modules Completed</div>
            <div className="data-value text-5xl font-light text-ink">{state.progress.length}</div>
          </div>
        </div>
      </div>

      <section className="px-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="col-header">Neural Development</h3>
          <Activity size={12} className="opacity-20" />
        </div>
        <div className="space-y-4">
          {muscles.length > 0 ? (
            muscles.map(([name, value]) => (
              <div key={name} className="premium-card p-5 flex justify-between items-center group hover:border-accent/30 transition-all duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Zap size={14} className="text-accent opacity-40 group-hover:opacity-100 transition-all" />
                  </div>
                  <span className="text-sm font-medium tracking-tight text-ink">{name}</span>
                </div>
                <span className="font-mono text-xs text-accent">{value} PTS</span>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border border-dashed border-line/20 rounded-3xl bg-line/5">
              <p className="col-header opacity-30">No developmental data recorded</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-8 px-4 pb-12">
        <h3 className="col-header">Historical Log</h3>
        <div className="space-y-4">
          {state.progress.slice(-5).reverse().map((p, i) => (
            <div key={i} className="font-mono text-[10px] flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity duration-500 py-3 border-b border-line/10">
              <span className="tracking-widest font-bold">MODULE_ID_{p.workout_id.toString().padStart(2, '0')}</span>
              <span className="tracking-tighter">{p.reps} REPS // {new Date(p.completed_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
