import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, Activity, Eye, Volume2, TouchpadIcon as Touch } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type RTNScreen = 'entry' | 'visual' | 'audio' | 'physical' | 'exit';

interface ReturnToNowProps {
  onComplete: () => void;
  onBackToWorkout?: () => void;
  isFromWorkout?: boolean;
}

export default function ReturnToNow({ onComplete, onBackToWorkout, isFromWorkout }: ReturnToNowProps) {
  const [screen, setScreen] = useState<RTNScreen>('entry');
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    if (['visual', 'audio', 'physical'].includes(screen)) {
      setShowContinue(false);
      const timer = setTimeout(() => {
        setShowContinue(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const renderScreen = () => {
    switch (screen) {
      case 'entry':
        return (
          <motion.div 
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center space-y-12 max-w-xs"
          >
            <div className="space-y-4">
              <p className="text-[10px] font-mono opacity-30 uppercase tracking-[0.4em]">Protocol: RTN-01</p>
              <h2 className="font-serif italic text-5xl tracking-tight">Return To Now</h2>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-neutral">
              <p>This protocol does not alter emotional state.</p>
              <p>It recalibrates the focal point of attention.</p>
            </div>
            <button
              onClick={() => setScreen('visual')}
              className="px-16 py-5 bg-accent text-white rounded-xl font-medium shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all duration-500"
            >
              Initialize Recalibration
            </button>
          </motion.div>
        );
      case 'visual':
        return (
          <motion.div 
            key="visual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center space-y-12 max-w-xs"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent">
              <Eye size={32} strokeWidth={1.5} />
            </div>
            <div className="space-y-4">
              <h2 className="font-serif italic text-4xl">Visual Anchor</h2>
              <p className="text-lg text-ink/80">Identify 3 objective items.</p>
              <p className="text-xs font-mono opacity-30 uppercase tracking-widest">Label only. No narrative.</p>
            </div>
            <div className="space-y-2 text-[10px] font-mono opacity-20 uppercase tracking-[0.3em]">
              <p>“Surface”</p>
              <p>“Illumination”</p>
              <p>“Boundary”</p>
            </div>
            <AnimatePresence>
              {showContinue && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setScreen('audio')}
                  className="px-16 py-5 bg-accent text-white rounded-xl font-medium shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all duration-500"
                >
                  Proceed
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case 'audio':
        return (
          <motion.div 
            key="audio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center space-y-12 max-w-xs"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent">
              <Volume2 size={32} strokeWidth={1.5} />
            </div>
            <div className="space-y-4">
              <h2 className="font-serif italic text-4xl">Auditory Anchor</h2>
              <p className="text-lg text-ink/80">Detect 2 distinct sounds.</p>
              <p className="text-xs font-mono opacity-30 uppercase tracking-widest">Near or distant. Pure observation.</p>
            </div>
            <AnimatePresence>
              {showContinue && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setScreen('physical')}
                  className="px-16 py-5 bg-accent text-white rounded-xl font-medium shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all duration-500"
                >
                  Proceed
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case 'physical':
        return (
          <motion.div 
            key="physical"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center space-y-12 max-w-xs"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent">
              <Touch size={32} strokeWidth={1.5} />
            </div>
            <div className="space-y-4">
              <h2 className="font-serif italic text-4xl">Somatic Anchor</h2>
              <p className="text-lg text-ink/80">Acknowledge 1 point of contact.</p>
              <div className="text-xs font-mono opacity-30 uppercase tracking-[0.2em] space-y-2">
                <p>Feet // Floor</p>
                <p>Spine // Support</p>
                <p>Hands // Surface</p>
              </div>
            </div>
            <AnimatePresence>
              {showContinue && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setScreen('exit')}
                  className="px-16 py-5 bg-accent text-white rounded-xl font-medium shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all duration-500"
                >
                  Proceed
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case 'exit':
        return (
          <motion.div 
            key="exit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center space-y-12 max-w-xs"
          >
            <div className="space-y-4">
              <Activity size={32} className="mx-auto text-accent opacity-40" />
              <h2 className="font-serif italic text-4xl leading-tight">Attention Repositioned</h2>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-neutral">
              <p>Cognitive fragments may persist.</p>
              <p>Somatic sensations may persist.</p>
              <p className="text-accent font-medium uppercase tracking-widest text-[10px]">Attention is now centered.</p>
            </div>
            <div className="w-full space-y-4">
              <button
                onClick={onComplete}
                className="w-full bg-accent text-white py-5 rounded-xl font-medium flex items-center justify-center gap-3 shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all duration-500"
              >
                Return to Home
                <Home size={18} />
              </button>
              {isFromWorkout && onBackToWorkout && (
                <button
                  onClick={onBackToWorkout}
                  className="w-full border border-line py-5 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-accent/5 transition-all duration-500 text-accent"
                >
                  Back to Training
                  <ArrowLeft size={18} />
                </button>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-bg z-50 flex items-center justify-center p-8 selection:bg-accent/10 selection:text-accent">
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
}
