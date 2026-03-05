import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { UserState } from '../types';

interface MuscleDashboardProps {
  userState: UserState;
  onBack: () => void;
}

export default function MuscleDashboard({ userState, onBack }: MuscleDashboardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-bg z-[60] flex flex-col p-8 overflow-y-auto depth-bg"
    >
      <header className="flex justify-between items-start mb-16 section-padding">
        <div>
          <p className="col-header mb-2">Progress Tracking</p>
          <h1 className="animate-line">Cognitive Muscles</h1>
          <p className="text-sm opacity-60 mt-2 animate-line" style={{ animationDelay: '0.2s' }}>Repetition builds automatic strength.</p>
        </div>
        <button 
          onClick={onBack}
          className="btn-passive flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </header>

      <div className="space-y-16 max-w-md mx-auto w-full pb-32">
        {userState.muscleProgress.map((muscle, idx) => (
          <motion.div 
            key={muscle.muscle_id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="space-y-6 premium-card p-6"
          >
            <div className="flex justify-between items-baseline">
              <h2 className="text-xl font-bold tracking-tight text-ink">{muscle.muscle_name}</h2>
              <div className="flex items-baseline gap-2">
                <span className="col-header">Reps</span>
                <span className="data-value text-2xl text-accent">{muscle.rep_count}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="col-header">Sessions Trained</p>
              <div className="flex flex-wrap gap-2">
                {muscle.sessions_trained.length > 0 ? (
                  muscle.sessions_trained.map((sessionId) => (
                    <span 
                      key={sessionId}
                      className="text-[10px] font-mono bg-accent/5 px-3 py-1.5 rounded-full border border-accent/10 text-accent/80"
                    >
                      S_{sessionId}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] italic opacity-30">No sessions recorded</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
