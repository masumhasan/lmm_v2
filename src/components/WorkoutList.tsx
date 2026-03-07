import React from 'react';
import { Workout } from '../types';
import { WORKOUTS } from '../constants';
import { Play, ChevronRight, Lock, Activity } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface WorkoutListProps {
  onSelect: (workout: Workout) => void;
  completedWorkouts: number[];
}

export default function WorkoutList({ onSelect, completedWorkouts }: WorkoutListProps) {
  const isUnlocked = (workoutId: number) => {
    return true; // Unlock all for development phase
  };

  return (
    <div className="relative">
      {/* Background Lottie */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center -z-10 opacity-40">
        <div className="w-full max-w-4xl aspect-square">
          <DotLottieReact
            src="/wave-bg.lottie"
            loop
            autoplay
          />
        </div>
      </div>

      <div className="space-y-12 relative z-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="col-header">Training Modules</h2>
            <div className="flex items-center gap-2 text-[10px] font-mono opacity-30">
              <Activity size={10} />
              <span>SYSTEM ACTIVE</span>
            </div>
          </div>
          
          <div className="divide-y divide-line border-t border-b border-line">
            {WORKOUTS.map((workout) => {
              const unlocked = isUnlocked(workout.id);
              return (
                <div
                  key={workout.id}
                  onClick={() => unlocked && onSelect(workout)}
                  className={`group relative py-6 transition-all duration-500 cursor-pointer hover:px-4 ${!unlocked ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <span className="font-mono text-sm opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                        {workout.id.toString().padStart(2, '0')}
                      </span>
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium tracking-tight group-hover:text-accent transition-colors duration-300 flex items-center gap-2">
                          {workout.title}
                          {!unlocked && <Lock size={12} className="opacity-40" />}
                        </h3>
                        <p className="text-xs text-neutral line-clamp-1 max-w-xs">
                          {unlocked 
                            ? workout.description 
                            : `Restricted access. Complete previous modules.`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-[9px] font-mono uppercase opacity-30 tracking-widest">Complexity</div>
                        <div className="font-mono text-[10px]">{workout.difficulty}/10</div>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all duration-500">
                        <ChevronRight size={14} className="opacity-40 group-hover:opacity-100" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle hover background */}
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 -z-10 transition-opacity duration-500 rounded-xl" />
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-accent p-10 space-y-8 text-white rounded-[40px] relative overflow-hidden shadow-2xl shadow-accent/30">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-3">
                <h3 className="font-serif italic text-3xl text-white normal-case tracking-tight">Quick Reset</h3>
                <p className="text-xs opacity-60">3-minute cognitive recalibration</p>
              </div>
              <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white hover:text-accent transition-all duration-500 shadow-lg">
                <Play size={20} fill="currentColor" />
              </button>
            </div>
            <div className="flex gap-3">
              {['FOCUS', 'CLARITY', 'PEACE'].map((tag) => (
                <span key={tag} className="text-[10px] font-mono uppercase tracking-widest border border-white/20 px-4 py-1.5 rounded-full bg-white/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Abstract design element */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -right-6 -bottom-6 w-48 h-48 rounded-full border border-white/10 pointer-events-none" />
        </section>
      </div>
    </div>
  );
}
