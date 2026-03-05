import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ArrowLeft, ArrowRight, Home, LayoutGrid, CheckCircle2, AlertCircle, Bell, Calendar, Phone, Users, Info, MessageSquare, Lock, Menu, X } from 'lucide-react';
import { User, UserState, Workout } from '../types';

interface WorkoutZeroProps {
  user: User;
  userState: UserState;
  onComplete: () => void;
  onBack: () => void;
  onNowClick: () => void;
  refreshState: () => void;
}

type Screen = 
  | 'entry' | 'edu_intro' | 'edu_untrained' 
  | 'system_title' | 'system_reframe' | 'system_definition' | 'system_context' | 'system_symptoms' | 'system_shift'
  | 'training_title' | 'training_iceberg' | 'training_contents' | 'training_control' | 'training_rule' | 'training_old_scripts' | 'training_reset'
  | 'patterns_intro' | 'patterns_e1' | 'patterns_e2' | 'patterns_e3' | 'patterns_e4'
  | 'science_two_systems' | 'science_shift'
  | 'drill1_entry' | 'drill1_test' | 'drill1_reveal' | 'drill1_penny'
  | 'drill2_entry' | 'drill2_countdown' | 'drill2_reveal' | 'drill2_penny'
  | 'drill3_entry' | 'drill3_incomplete' | 'drill3_release' | 'drill3_penny'
  | 'muscle_summary' | 'closing_intro' | 'closing_main' | 'journal' | 'journal_confirm'
  | 'skill_reps_entry' | 'sr1_intro' | 'sr1_play' | 'sr1_insight' | 'sr1_penny'
  | 'sr2_intro' | 'sr2_play' | 'sr2_insight' | 'sr2_penny'
  | 'sr3_intro' | 'sr3_play' | 'sr3_insight' | 'sr3_penny'
  | 'complete';

export default function WorkoutZero({ user, userState, onComplete, onBack, onNowClick, refreshState }: WorkoutZeroProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('entry');
  const [breathCycle, setBreathCycle] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [srRound, setSrRound] = useState(1);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const [journalText, setJournalText] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showSections, setShowSections] = useState(false);

  const SECTIONS: { id: Screen; label: string; group: string }[] = [
    { id: 'entry', label: 'Introduction', group: 'Intro' },
    { id: 'system_title', label: 'The System', group: 'Theory' },
    { id: 'training_title', label: 'Training Principles', group: 'Theory' },
    { id: 'patterns_intro', label: 'Pattern Recognition', group: 'Theory' },
    { id: 'science_two_systems', label: 'The Science', group: 'Theory' },
    { id: 'drill1_entry', label: 'Drill 1: Reflex', group: 'Drills' },
    { id: 'drill2_entry', label: 'Drill 2: Urgency', group: 'Drills' },
    { id: 'drill3_entry', label: 'Drill 3: Tolerance', group: 'Drills' },
    { id: 'skill_reps_entry', label: 'Skill Reps', group: 'Practice' },
    { id: 'muscle_summary', label: 'Summary', group: 'Review' },
  ];

  const DRILL_SCREENS = ['drill1_test', 'drill2_countdown', 'drill3_incomplete', 'sr1_play'];
  const isDrill = DRILL_SCREENS.includes(currentScreen);
  
  // 10-minute rule helper
  const canLog = (key: string) => {
    const last = userState.tracking[key];
    if (!last) return true;
    return (Date.now() - parseInt(last)) >= 600000;
  };

  const logRep = async (muscleKey: string, trackingKey: string) => {
    if (!canLog(trackingKey)) return;
    await fetch('/api/log-rep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, muscleKey, trackingKey })
    });
    refreshState();
  };

  // Screen 1: Entry Logic
  useEffect(() => {
    if (currentScreen === 'entry') {
      const timer = setTimeout(() => {
        setBreathCycle(1);
        setTimeout(() => setIsLocked(false), 10000); // 10s lock or cycle complete
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Drill 2 Countdown
  useEffect(() => {
    if (currentScreen === 'drill2_countdown' && countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (currentScreen === 'drill2_countdown' && countdown === 0) {
      setTimeout(() => setCurrentScreen('drill2_reveal'), 2000);
    }
  }, [currentScreen, countdown]);

  useEffect(() => {
    if (currentScreen === 'drill1_penny') {
      logRep('Attention Control', 'workout0.d1_completed_at');
    } else if (currentScreen === 'drill2_penny') {
      logRep('Urgency Resistance', 'workout0.d2_completed_at');
    } else if (currentScreen === 'drill3_penny') {
      logRep('Completion Tolerance', 'workout0.d3_completed_at');
    } else if (currentScreen === 'sr1_penny') {
      logRep('Pattern Recognition', 'workout0.sr1_completed_at');
    }
  }, [currentScreen]);
  // Drill 1 Notifications
  useEffect(() => {
    if (currentScreen === 'drill1_test') {
      const timers = [
        setTimeout(() => setNotifications(['New message received.']), 2500),
        setTimeout(() => setNotifications(prev => [...prev, 'Reminder: You forgot something.']), 3500),
        setTimeout(() => setNotifications(prev => [...prev, 'This needs attention.']), 4500),
        setTimeout(() => setCurrentScreen('drill1_reveal'), 10000)
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [currentScreen]);

  const renderNav = (showHome = false) => (
    <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="btn-passive flex items-center gap-2">
          <ArrowLeft size={14} /> Back
        </button>
        <button 
          onClick={() => setShowSections(true)}
          className="btn-passive flex items-center gap-2"
        >
          <Menu size={14} /> Sections
        </button>
      </div>
      <div className="flex items-center gap-6">
        {!isDrill && (
          <button 
            onClick={onNowClick}
            className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all duration-500 bg-accent/5 px-4 py-2 rounded-full text-accent border border-accent/10"
          >
            <Brain size={12} /> Reset
          </button>
        )}
        {showHome && (
          <button onClick={onBack} className="opacity-30 hover:opacity-100 transition-all duration-500">
            <Home size={18} />
          </button>
        )}
      </div>
    </div>
  );

  const renderCTA = (text: string, next: Screen, disabled = false) => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="absolute bottom-24 left-8 right-8 flex justify-center"
    >
      <button
        disabled={disabled}
        onClick={() => {
          setCurrentScreen(next);
          if (window.navigator.vibrate) window.navigator.vibrate(10);
        }}
        className={`btn-primary min-w-[240px] ${disabled ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:shadow-accent/30'}`}
      >
        {text}
      </button>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-bg z-50 overflow-hidden flex flex-col">
      <AnimatePresence>
        {showSections && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-md p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="space-y-1">
                <p className="text-[10px] font-mono opacity-30 uppercase tracking-[0.3em]">Navigation</p>
                <h2 className="font-serif italic text-3xl">Workout Sections</h2>
              </div>
              <button 
                onClick={() => setShowSections(false)}
                className="p-3 hover:bg-accent/5 rounded-xl transition-all duration-500"
              >
                <X size={24} className="opacity-40" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-12 pb-12">
              {['Intro', 'Theory', 'Drills', 'Practice', 'Review'].map(group => (
                <div key={group} className="space-y-6">
                  <h3 className="text-[9px] font-mono uppercase tracking-[0.3em] opacity-20 font-bold">{group}</h3>
                  <div className="grid gap-3">
                    {SECTIONS.filter(s => s.group === group).map(section => (
                      <button
                        key={section.id}
                        onClick={() => {
                          setCurrentScreen(section.id);
                          setShowSections(false);
                        }}
                        className={`text-left p-5 rounded-xl transition-all duration-500 flex justify-between items-center group ${
                          currentScreen === section.id 
                            ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                            : 'bg-accent/5 hover:bg-accent/10'
                        }`}
                      >
                        <span className="font-medium tracking-tight">{section.label}</span>
                        {currentScreen === section.id ? (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        ) : (
                          <ArrowRight size={14} className="opacity-0 group-hover:opacity-20 transition-all duration-500 -translate-x-2 group-hover:translate-x-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentScreen === 'entry' && (
          <motion.div
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 relative flex flex-col items-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-orange-100/20 to-transparent pointer-events-none" />
            {renderNav()}
            
            {/* Top Instruction */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-[22%] text-center"
            >
              <p className="text-xs uppercase tracking-[0.2em] opacity-40">Take one slow breath.</p>
            </motion.div>

            {/* Centered Animation - Anchor Point */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <motion.div
                  animate={breathCycle === 1 ? {
                    scale: [1, 1.4, 1],
                    opacity: [0.1, 0.15, 0.1]
                  } : { scale: 1, opacity: 0.1 }}
                  transition={{ duration: 10, times: [0, 0.4, 1], ease: "easeInOut" }}
                  className="absolute inset-0 bg-accent rounded-full blur-3xl"
                />
                <motion.div
                  animate={breathCycle === 1 ? {
                    scale: [1, 1.4, 1]
                  } : { scale: 1 }}
                  transition={{ duration: 10, times: [0, 0.4, 1], ease: "easeInOut" }}
                  onAnimationComplete={() => setBreathCycle(2)}
                  className="w-32 h-32 border border-accent/20 rounded-full flex items-center justify-center"
                >
                  <Brain size={32} className="opacity-20 text-accent" />
                </motion.div>
              </div>
            </div>

            {/* Bottom Text - Positioned relative to center */}
            <div className="absolute top-[62%] w-full px-8 text-center">
              <div className="h-32 flex flex-col justify-center gap-4">
                <AnimatePresence>
                  {breathCycle === 1 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-serif italic text-2xl"
                    >
                      Inhale: I’m here.
                    </motion.p>
                  )}
                  {breathCycle === 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <p className="font-serif italic text-2xl">Exhale: Back to now.</p>
                      <p className="text-xs opacity-50 leading-relaxed max-w-[280px] mx-auto">This is not about fixing your mind. This is the first repetition in training it.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {!isLocked && breathCycle === 2 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="absolute bottom-24 left-6 right-6 flex flex-col items-center gap-6"
              >
                <p className="col-header">You are training attention.</p>
                <button
                  onClick={() => setCurrentScreen('edu_intro')}
                  className="bg-accent text-bg px-12 py-4 rounded-full font-medium hover:scale-105 active:scale-95 transition-all"
                >
                  ▶ Begin Workout
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentScreen === 'edu_intro' && (
          <motion.div
            key="edu_intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-line/50 depth-bg"
          >
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <p className="col-header">Muscle Focus: Attention Control</p>
              <h1 className="animate-line">The education you never received.</h1>
              <p className="opacity-60 animate-line" style={{ animationDelay: '0.3s' }}>You were never taught this.</p>
              {renderCTA('Continue', 'edu_untrained')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'edu_untrained' && (
          <motion.div
            key="edu_untrained"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-12 w-full max-w-xs">
              <div className="space-y-4">
                <h2 className="font-serif italic text-3xl">You didn’t fail.</h2>
                <p className="text-sm opacity-60 leading-relaxed">School taught you math, language, history... but not how to handle what it feels like to be human.</p>
              </div>
              
              <div className="space-y-4">
                {['Fear', 'Overthinking', 'Pressure', 'Self-doubt'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 1.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-1 h-1 bg-accent rounded-full" />
                    <span className="text-sm font-medium">{item}</span>
                  </motion.div>
                ))}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 6 }}
                  className="font-serif italic text-xl pt-4"
                >
                  And everything that comes with being human.
                </motion.p>
              </div>
              {renderCTA('Continue', 'system_title')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'system_title' && (
          <motion.div
            key="system_title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <LayoutGrid size={48} className="opacity-20" />
              </div>
              <h2 className="font-serif italic text-5xl">
                The <span className="border-b border-ink/40">System</span>
              </h2>
              <p className="text-sm opacity-50 uppercase tracking-widest">Protective. Fast. Not your identity.</p>
              {renderCTA('Continue', 'system_reframe')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'system_reframe' && (
          <motion.div
            key="system_reframe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-12 text-center">
              {['Not broken.', 'Not weak.', 'Not out of control.'].map((text, i) => (
                <motion.h2
                  key={text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.08 }}
                  whileInView={{ opacity: 1 }}
                  className="font-serif italic text-4xl"
                >
                  {text}
                </motion.h2>
              ))}
              {renderCTA('Continue', 'system_definition')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'system_definition' && (
          <motion.div
            key="system_definition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 text-center max-w-xs">
              <h2 className="font-serif italic text-3xl">It is a high-alert system. A loyal one.</h2>
              <p className="text-sm opacity-60">A hardworking one. But one that was designed to spot problems fast — not modern life.</p>
              <div className="pt-8">
                <p className="font-serif italic text-xl">Protection ≠ Truth</p>
              </div>
              {renderCTA('Continue', 'system_context')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'system_context' && (
          <motion.div
            key="system_context"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-12 w-full max-w-xs">
              <div className="space-y-4">
                <h2 className="font-serif italic text-2xl">Old World vs Modern World</h2>
                <p className="text-sm opacity-60">Back then, the system scanned for lions and danger. Now? It scans your phone notifications, your conversations, your to-do list...</p>
              </div>
              <div className="grid grid-cols-2 gap-4 h-32">
                <div className="bg-line rounded-2xl flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-accent/20 rotate-45" />
                </div>
                <div className="bg-line rounded-2xl flex flex-col gap-2 p-4">
                  <div className="h-2 w-full bg-accent/10 rounded" />
                  <div className="h-2 w-2/3 bg-accent/10 rounded" />
                  <div className="h-2 w-full bg-accent/10 rounded" />
                </div>
              </div>
              {renderCTA('Continue', 'system_symptoms')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'system_symptoms' && (
          <motion.div
            key="system_symptoms"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="font-serif italic text-3xl">Symptoms are Alarms</h2>
              <div className="space-y-4">
                {['Racing thoughts', 'Tightness', 'A sudden surge', 'Negative predictions', 'What ifs', 'Overthinking'].map((s, i) => (
                  <motion.p
                    key={s}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="text-sm opacity-60"
                  >
                    {s}
                  </motion.p>
                ))}
              </div>
              {renderCTA('Continue', 'system_shift')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'system_shift' && (
          <motion.div
            key="system_shift"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8">
              <motion.div
                animate={{ scale: [1, 0.95, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="space-y-4"
              >
                <h2 className="font-serif italic text-3xl">Stepping out of the Alarm</h2>
                <p className="opacity-60">You’ve lived inside those alarms for years. Now, you’ll step outside of them.</p>
              </motion.div>
              {renderCTA('Continue', 'training_title')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'training_title' && (
          <motion.div
            key="training_title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <Brain size={48} className="opacity-20" />
              </div>
              <h2 className="font-serif italic text-4xl leading-tight">The Training System</h2>
              <p className="col-header">Muscle Focus: Attention Control</p>
              <p className="text-xl opacity-60">“It learns by repetition.”</p>
              {renderCTA('Continue', 'training_iceberg')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'training_iceberg' && (
          <motion.div
            key="training_iceberg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="relative w-full max-w-xs aspect-square flex flex-col items-center">
              <div className="w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[100px] border-b-ink/10" />
              <div className="w-full h-1 bg-line my-2" />
              <div className="w-0 h-0 border-l-[120px] border-l-transparent border-r-[120px] border-r-transparent border-t-[200px] border-t-ink/5" />
              <div className="absolute top-12 text-[10px] uppercase tracking-widest opacity-40">Thoughts</div>
              <div className="absolute top-1/2 text-center space-y-4">
                <p className="font-serif italic text-xl">Imagine your mind as an iceberg.</p>
                <p className="text-xs opacity-50">The tiny part at the top — thoughts — is what you’re aware of.</p>
              </div>
            </div>
            {renderCTA('Continue', 'training_contents')}
          </motion.div>
        )}

        {currentScreen === 'training_contents' && (
          <motion.div
            key="training_contents"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="font-serif italic text-2xl">Underneath is everything else.</h2>
              <div className="space-y-4">
                {['Habits', 'Reactions', 'Emotional memory', 'Protective beliefs', 'Body responses'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.8 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 bg-line rounded-full" />
                    <span className="text-sm opacity-60">{item}</span>
                  </motion.div>
                ))}
              </div>
              {renderCTA('Continue', 'training_control')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'training_control' && (
          <motion.div
            key="training_control"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Autopilot</h2>
              <p className="font-bold">Mostly automatic</p>
              <p className="text-sm opacity-60">This training system runs most of your day automatically — without asking.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">That’s why change can feel hard — even when you want it.</p>
              {renderCTA('Continue', 'training_rule')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'training_rule' && (
          <motion.div
            key="training_rule"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl leading-tight">Your training system doesn’t follow what is true. It follows what is repeated.</h2>
              <p className="opacity-60">Not because it’s real — but because it’s familiar.</p>
              {renderCTA('Continue', 'training_old_scripts')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'training_old_scripts' && (
          <motion.div
            key="training_old_scripts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-6 w-full max-w-xs">
              <h2 className="font-serif italic text-2xl mb-8">Old Instructions</h2>
              {[
                '“I’m not enough.”',
                '“I can’t handle this.”',
                '“It’s happening again.”',
                '“What if I lose control?”'
              ].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 1.2 }}
                  className="bg-white p-4 rounded-2xl border border-line/5 shadow-sm"
                >
                  <p className="text-sm font-medium">{text}</p>
                </motion.div>
              ))}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5 }}
                className="text-center text-xs opacity-50 pt-4"
              >
                Your training system accepted these as instructions.
              </motion.p>
              {renderCTA('Continue', 'training_reset')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'training_reset' && (
          <motion.div
            key="training_reset"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-stone-50"
          >
            {renderNav()}
            <div className="text-center space-y-6">
              <h2 className="font-serif italic text-4xl">Reset</h2>
              <p className="opacity-60">Reset is where you start training new instructions.</p>
              {renderCTA('Continue', 'patterns_intro')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'patterns_intro' && (
          <motion.div
            key="patterns_intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-6 max-w-xs">
              <p className="col-header">Understanding the Pattern</p>
              <h2 className="font-serif italic text-3xl">Your system often misreads harmless moments as danger.</h2>
              <p className="text-sm opacity-50 uppercase tracking-widest">Let’s look at real life.</p>
              {renderCTA('Next', 'patterns_e1')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'patterns_e1' && (
          <motion.div
            key="patterns_e1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <div className="flex justify-center">
                <Phone size={48} className="opacity-20" />
              </div>
              <div className="space-y-4">
                <p className="font-medium">“Your phone lights up.”</p>
                <p className="font-medium">“It’s not the person you hoped it was.”</p>
                <div className="h-px bg-line/10 w-full" />
                <p className="text-sm opacity-40">System: “Something’s changed. I should check.”</p>
                <p className="text-sm font-serif italic">Truth: “They’re busy. Nothing changed. The system guessed danger.”</p>
              </div>
              <p className="text-[10px] opacity-40 text-center">A guess can feel real — without being evidence.</p>
              {renderCTA('Next Example', 'patterns_e2')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'patterns_e2' && (
          <motion.div
            key="patterns_e2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <div className="flex justify-center">
                <Calendar size={48} className="opacity-20" />
              </div>
              <div className="space-y-4">
                <p className="font-medium">“Your manager says: ‘Can we talk tomorrow?’”</p>
                <div className="h-px bg-line/10 w-full" />
                <p className="text-sm opacity-40">System: “What did I do wrong?”</p>
                <p className="text-sm font-serif italic">Truth: “It could be a new project. It could be nothing. The system guessed danger.”</p>
              </div>
              {renderCTA('Next Example', 'patterns_e3')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'patterns_e3' && (
          <motion.div
            key="patterns_e3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <div className="flex justify-center">
                <Users size={48} className="opacity-20" />
              </div>
              <div className="space-y-4">
                <p className="font-medium">“Your child misbehaves.”</p>
                <div className="h-px bg-line/10 w-full" />
                <p className="text-sm opacity-40">System: “You’re failing as a parent.”</p>
                <p className="text-sm font-serif italic">Truth: “They’re having a moment. The system guessed danger.”</p>
              </div>
              {renderCTA('Next Example', 'patterns_e4')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'patterns_e4' && (
          <motion.div
            key="patterns_e4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <div className="flex justify-center">
                <LayoutGrid size={48} className="opacity-20" />
              </div>
              <div className="space-y-4">
                <p className="font-medium">“You felt an alarm surge once in a public place.”</p>
                <p className="font-medium">“Your system stored that moment.”</p>
                <div className="h-px bg-line/10 w-full" />
                <p className="text-sm opacity-40">System: “Never go there again.”</p>
                <p className="text-sm font-serif italic">Truth: “The place wasn’t dangerous. Your internal state created a false association.”</p>
              </div>
              <p className="text-[10px] opacity-40 text-center">Tags can be retrained.</p>
              {renderCTA('Why This Happens', 'science_two_systems')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'science_two_systems' && (
          <motion.div
            key="science_two_systems"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-12 w-full max-w-xs">
              <div className="space-y-2">
                <p className="col-header">Attention Control</p>
                <h2 className="font-serif italic text-3xl">What’s Happening Inside You</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-3xl border border-line/5 shadow-sm space-y-2">
                  <h3 className="font-bold text-sm">The Alarm System</h3>
                  <p className="text-xs opacity-60">Fast. Emotional. Protective. Reacts before checking.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-line/5 shadow-sm space-y-2">
                  <h3 className="font-bold text-sm">The Clarity System</h3>
                  <p className="text-xs opacity-60">Calm. Observing. Practical. Checks what’s actually happening.</p>
                </div>
              </div>
              <p className="text-center font-serif italic">“Only one system can lead at a time.”</p>
              {renderCTA('Continue', 'science_shift')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'science_shift' && (
          <motion.div
            key="science_shift"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 text-center max-w-xs">
              <div className="space-y-4">
                <p className="text-xl">When you slow down…</p>
                <p className="text-xl">When you notice a thought…</p>
                <p className="font-serif italic text-2xl">Your system can shift from alarm → toward clarity.</p>
              </div>
              <p className="font-bold pt-8">This isn’t positive thinking.</p>
              <p className="text-sm opacity-60">This is how repetition builds steadiness.</p>
              {renderCTA('Practice', 'drill1_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 1: Notification Test */}
        {currentScreen === 'drill1_entry' && (
          <motion.div
            key="drill1_entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8">
              <div className="w-16 h-16 bg-line rounded-3xl mx-auto flex items-center justify-center">
                <Bell size={32} className="opacity-40 text-accent" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif italic text-3xl">Attention Control - Reflex Test</h2>
                <p className="text-sm opacity-50">You are training impulse resistance.</p>
              </div>
              {renderCTA('Start', 'drill1_test')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'drill1_test' && (
          <motion.div
            key="drill1_test"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 relative p-8"
          >
            <div className="absolute top-12 left-0 right-0 text-center">
              <p className="col-header">Do not tap anything.</p>
            </div>
            
            <div className="absolute top-24 right-8 space-y-4 max-w-[240px]">
              <AnimatePresence shadow-sm>
                {notifications.map((note, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-line/5 shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-2 h-2 bg-accent/20 rounded-full" />
                      <span className="text-[10px] uppercase tracking-widest opacity-40">System Alert</span>
                    </div>
                    <p className="text-sm font-medium">{note}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {currentScreen === 'drill1_reveal' && (
          <motion.div
            key="drill1_reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 text-center max-w-xs">
              <p className="text-xl font-serif italic">Your attention moved automatically..</p>
              <p className="text-xl font-serif italic">That wasn’t a conscious choice.</p>
              <p className="text-sm opacity-50 pt-8">That was automatic conditioning.</p>
              {renderCTA('Continue', 'drill1_penny')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'drill1_penny' && (
          <motion.div
            key="drill1_penny"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 penny-screen"
          >
            <div className="space-y-12 max-w-xs">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="penny-text"
              >
                Most reactions are rehearsed.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.2 }}
                className="penny-text"
              >
                You just interrupted one.
              </motion.p>
              <div className="pt-12">
                <p className="col-header text-white/40">Attention Control +1</p>
              </div>
              {renderCTA('Next Drill', 'drill2_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 2: Urgency Resistance */}
        {currentScreen === 'drill2_entry' && (
          <motion.div
            key="drill2_entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8">
              <div className="w-16 h-16 bg-line rounded-3xl mx-auto flex items-center justify-center">
                <AlertCircle size={32} className="opacity-40 text-accent" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif italic text-3xl">The Urgency Bait</h2>
                <p className="text-sm opacity-50">Urgency feels real. Watch closely.</p>
              </div>
              {renderCTA('Start', 'drill2_countdown')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'drill2_countdown' && (
          <motion.div
            key="drill2_countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            <div className="absolute top-12 left-0 right-0 text-center">
              <p className="col-header">Do not press the button.</p>
            </div>
            
            <div className="text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-6xl font-mono tracking-tighter">{countdown}</h2>
                <p className="text-sm opacity-50 uppercase tracking-widest">Seconds remaining</p>
              </div>

              <AnimatePresence>
                {countdown <= 5 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-serif italic text-2xl"
                  >
                    Time is running out.
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                animate={countdown <= 3 ? {
                  opacity: [1, 0.7, 1],
                  scale: [1, 1.02, 1]
                } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="bg-accent text-bg px-16 py-6 rounded-2xl font-bold text-xl uppercase tracking-widest"
              >
                PRESS NOW
              </motion.button>
            </div>
          </motion.div>
        )}

        {currentScreen === 'drill2_reveal' && (
          <motion.div
            key="drill2_reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 text-center max-w-xs">
              <p className="text-xl font-serif italic">Nothing required action.</p>
              <p className="text-xl font-serif italic">The pressure was artificial.</p>
              <p className="text-sm opacity-50 pt-8">Urgency trained your attention.</p>
              {renderCTA('Continue', 'drill2_penny')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'drill2_penny' && (
          <motion.div
            key="drill2_penny"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 penny-screen"
          >
            <div className="space-y-12 max-w-xs">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="penny-text"
              >
                Urgency is a sensation.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.2 }}
                className="penny-text"
              >
                Not a directive.
              </motion.p>
              <div className="pt-12">
                <p className="col-header text-white/40">Urgency Resistance +1</p>
              </div>
              {renderCTA('Next Drill', 'drill3_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 3: Completion Tolerance */}
        {currentScreen === 'drill3_entry' && (
          <motion.div
            key="drill3_entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8">
              <div className="w-16 h-16 bg-ink/5 rounded-3xl mx-auto flex items-center justify-center">
                <Brain size={32} className="opacity-40" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif italic text-3xl">Completion Tolerance — Open Loop Test</h2>
                <p className="text-sm opacity-50">You are training discomfort tolerance.</p>
              </div>
              {renderCTA('Start', 'drill3_incomplete')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'drill3_incomplete' && (
          <motion.div
            key="drill3_incomplete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            <div className="absolute top-12 left-0 right-0 text-center">
              <p className="col-header">Do not finish the word.</p>
            </div>
            
            <div className="text-center space-y-8 w-full max-w-xs">
              <p className="text-sm opacity-50">Type the word "CONTROL"</p>
              <input
                autoFocus
                value={inputText}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                  setInputText(val);
                  if (val === 'CONTROL') {
                    setTimeout(() => {
                      setInputText('CONTRO');
                      setIsLocked(true);
                      setTimeout(() => setCurrentScreen('drill3_release'), 5000);
                    }, 150);
                  }
                }}
                disabled={inputText === 'CONTRO' && isLocked}
                className="w-full bg-transparent border-b-2 border-line text-4xl text-center font-mono tracking-[0.5em] py-4 outline-none"
                placeholder="TYPE HERE"
              />
              <div className="h-8">
                {inputText === 'CONTRO' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-xs opacity-40"
                  >
                    <Lock size={12} /> System locked for 5s
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'drill3_release' && (
          <motion.div
            key="drill3_release"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 text-center max-w-xs">
              <p className="text-xl font-serif italic">Your system demanded closure.</p>
              <p className="text-xl font-serif italic">You held the loop open.</p>
              <p className="text-sm opacity-50 pt-8">That builds tolerance.</p>
              {renderCTA('Continue', 'drill3_penny')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'drill3_penny' && (
          <motion.div
            key="drill3_penny"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 penny-screen"
          >
            <div className="space-y-12 max-w-xs">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="penny-text"
              >
                Your system preferred closure.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.2 }}
                className="penny-text"
              >
                You proved closure is optional.
              </motion.p>
              <div className="pt-12">
                <p className="col-header text-white/40">Completion Tolerance +1</p>
              </div>
              {renderCTA('Continue', 'muscle_summary')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'muscle_summary' && (
          <motion.div
            key="muscle_summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-12 w-full max-w-xs">
              <h2 className="font-serif italic text-4xl">Muscles Activated</h2>
              <div className="space-y-6">
                {[
                  'Attention Control — activated',
                  'Urgency Resistance — activated',
                  'Completion Tolerance — activated'
                ].map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span className="text-lg font-serif italic">{text}</span>
                  </motion.div>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="text-sm opacity-60"
              >
                Repetition builds automatic strength.
              </motion.p>
              {renderCTA('Continue to Closing', 'closing_intro')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_intro' && (
          <motion.div
            key="closing_intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-line"
          >
            {renderNav()}
            <div className="text-center space-y-6">
              <h2 className="font-serif italic text-4xl">✨ Workout Complete</h2>
              <p className="col-header">Muscles Activated Today</p>
              <p className="text-xl opacity-60">“Your system isn’t the enemy.”</p>
              {renderCTA('Continue', 'closing_main')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_main' && (
          <motion.div
            key="closing_main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-6 text-center max-w-xs">
              {[
                'You saw how quickly your system reacts.',
                'Before thinking.',
                'Before deciding.',
                'You felt the impulse.',
                'You felt the urgency.',
                'You felt the need to complete.',
                'And you didn’t obey.',
                'That’s how conditioning updates.',
                'You completed your first workout..'
              ].map((text, i) => (
                <motion.p
                  key={text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.8 }}
                  className={`text-lg ${i === 6 ? 'font-serif italic text-2xl' : 'opacity-60'}`}
                >
                  {text}
                </motion.p>
              ))}
              {renderCTA('Reflect on Today', 'journal')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'journal' && (
          <motion.div
            key="journal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-8"
          >
            {renderNav()}
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8">
              <div className="space-y-2">
                <p className="col-header">Training Log — Workout 0</p>
                <h2 className="font-serif italic text-3xl">Where did your attention move automatically today?</h2>
                <p className="text-sm opacity-50">Which muscle could have been applied?</p>
              </div>

              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                className="w-full h-48 bg-line rounded-3xl p-6 outline-none focus:ring-2 ring-accent/5 transition-all resize-none"
                placeholder="✍️ Type your reflection..."
              />

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setCurrentScreen('journal_confirm')}
                  className="bg-accent text-bg py-4 rounded-full font-medium hover:scale-105 transition-all"
                >
                  Save Reflection
                </button>
                <button
                  onClick={() => setCurrentScreen('complete')}
                  className="text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'journal_confirm' && (
          <motion.div
            key="journal_confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            <div className="text-center space-y-8">
              <div className="w-16 h-16 bg-line text-accent rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif italic text-3xl">Training log updated.</h2>
                <p className="opacity-60">Repetition builds strength.</p>
              </div>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setCurrentScreen('skill_reps_entry')}
                  className="bg-accent text-bg px-12 py-4 rounded-full font-medium"
                >
                  Continue to Skill Reps
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'skill_reps_entry' && (
          <motion.div
            key="skill_reps_entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav(true)}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-4xl">Train Your Attention</h2>
              <p className="opacity-60">These games reveal how attention gets captured — and how it changes.</p>
              <p className="text-xs opacity-40 uppercase tracking-widest">You’re not calming anything here. You’re training attention control.</p>
              <button
                onClick={() => setCurrentScreen('sr1_intro')}
                className="bg-accent text-bg px-12 py-4 rounded-full font-medium hover:scale-105 transition-all"
              >
                ▶ Start Skill Reps
              </button>
            </div>
          </motion.div>
        )}

        {currentScreen === 'sr1_intro' && (
          <motion.div
            key="sr1_intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8">
              <div className="space-y-2">
                <h2 className="font-serif italic text-3xl">Which One Do You Believe?</h2>
                <p className="text-sm opacity-50 uppercase tracking-widest">All thoughts appear. Not all are believed.</p>
              </div>
              <p className="col-header">Tap the one that feels more believable.</p>
              {renderCTA('Start', 'sr1_play')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'sr1_play' && (
          <motion.div
            key="sr1_play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-8"
          >
            <div className="text-center mb-12">
              <p className="col-header">Round {srRound} of 6</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-6 max-w-sm mx-auto w-full">
              {[
                { a: "I might make a mistake.", b: "I might not." },
                { a: "They could be judging me.", b: "They might not even notice." },
                { a: "This could go badly.", b: "This could go fine." },
                { a: "Something feels off.", b: "Nothing is actually wrong." },
                { a: "I should think this through again.", b: "I’ve thought about this enough." },
                { a: "I might not handle this well.", b: "I’ve handled things before." }
              ][srRound - 1] && (
                <>
                  <button
                    onClick={() => {
                      setSelectedCard(0);
                      setTimeout(() => {
                        if (srRound < 6) {
                          setSrRound(prev => prev + 1);
                          setSelectedCard(null);
                        } else {
                          setCurrentScreen('sr1_insight');
                        }
                      }, 1500);
                    }}
                    className={`p-8 rounded-3xl border transition-all text-left ${selectedCard === 0 ? 'scale-105 border-accent bg-accent text-bg' : 'border-line hover:border-accent/30'}`}
                  >
                    <p className="text-lg font-serif italic">{[
                      { a: "I might make a mistake.", b: "I might not." },
                      { a: "They could be judging me.", b: "They might not even notice." },
                      { a: "This could go badly.", b: "This could go fine." },
                      { a: "Something feels off.", b: "Nothing is actually wrong." },
                      { a: "I should think this through again.", b: "I’ve thought about this enough." },
                      { a: "I might not handle this well.", b: "I’ve handled things before." }
                    ][srRound - 1].a}</p>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(1);
                      setTimeout(() => {
                        if (srRound < 6) {
                          setSrRound(prev => prev + 1);
                          setSelectedCard(null);
                        } else {
                          setCurrentScreen('sr1_insight');
                        }
                      }, 1500);
                    }}
                    className={`p-8 rounded-3xl border transition-all text-left ${selectedCard === 1 ? 'scale-105 border-accent bg-accent text-bg' : 'border-line hover:border-accent/30'}`}
                  >
                    <p className="text-lg font-serif italic">{[
                      { a: "I might make a mistake.", b: "I might not." },
                      { a: "They could be judging me.", b: "They might not even notice." },
                      { a: "This could go badly.", b: "This could go fine." },
                      { a: "Something feels off.", b: "Nothing is actually wrong." },
                      { a: "I should think this through again.", b: "I’ve thought about this enough." },
                      { a: "I might not handle this well.", b: "I’ve handled things before." }
                    ][srRound - 1].b}</p>
                  </button>
                </>
              )}
            </div>

            <AnimatePresence>
              {selectedCard !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center h-12"
                >
                  <p className="text-sm opacity-50">That belief wasn’t chosen logically. It felt familiar.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {currentScreen === 'sr1_insight' && (
          <motion.div
            key="sr1_insight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-6 text-center max-w-xs">
              {[
                'Belief feels true.',
                'But belief is often repetition.',
                'Repetition becomes familiarity.',
                'Familiarity becomes ‘truth.’'
              ].map((text, i) => (
                <motion.p
                  key={text}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 1.2 }}
                  className="text-xl font-serif italic"
                >
                  {text}
                </motion.p>
              ))}
              {renderCTA('Continue', 'sr1_penny')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'sr1_penny' && (
          <motion.div
            key="sr1_penny"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg"
          >
            <div className="space-y-8 text-center">
              <h2 className="font-serif italic text-3xl">Belief wasn’t chosen logically.</h2>
              <p className="text-xl opacity-60">It felt familiar.</p>
              <div className="pt-12">
                <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Rep Logged: Pattern Recognition +1</p>
              </div>
              {renderCTA('Finish Workout', 'complete')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-bg"
          >
            <div className="text-center space-y-12 max-w-xs">
              <div className="space-y-4">
                <h2 className="font-serif italic text-5xl">Workout 0 Complete</h2>
                <p className="text-xl opacity-60">You trained attention under pressure.</p>
                <p className="text-[10px] uppercase tracking-widest opacity-40">Completion logs on button tap.</p>
              </div>

              <div className="grid gap-4 w-full">
                <button
                  onClick={onComplete}
                  className="bg-accent text-bg py-4 rounded-2xl font-medium flex items-center justify-center gap-3 group"
                >
                  Return Home
                  <Home size={18} className="group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={onComplete}
                  className="border border-line py-4 rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-line transition-colors text-accent"
                >
                  Explore Tools Hub
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
