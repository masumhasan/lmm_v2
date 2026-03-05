import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ArrowLeft, Home, Menu, X, CheckCircle2, AlertCircle, Zap, Activity, Repeat, Eye, Shield, Lock, Play } from 'lucide-react';
import { User, UserState } from '../types';

interface Workout2Props {
  user: User;
  userState: UserState;
  onComplete: () => void;
  onBack: () => void;
  onNowClick: () => void;
  refreshState: () => void;
}

type Screen = 
  | 'entry' | 'main_narration' | 'definition' | 'explanation'
  | 'example_heartbeat' | 'example_breath' | 'example_social' | 'example_avoidance'
  | 'loop_intro' | 'loop_steps' | 'penny_drop' | 'metaphor' | 'control_returns' | 'final_lockin'
  | 'd1_entry' | 'd1_play' | 'd1_penny'
  | 'd2_entry' | 'd2_play_intro' | 'd2_play_loop' | 'd2_penny'
  | 'd3_entry' | 'd3_play' | 'd3_penny'
  | 'muscle_summary' | 'closing_transition' | 'closing_core' | 'closing_forward' | 'journal' | 'journal_confirm'
  | 'skill_reps_entry' | 'sr1_intro' | 'sr1_play' | 'sr1_penny'
  | 'sr2_intro' | 'sr2_play' | 'sr2_penny'
  | 'sr3_intro' | 'sr3_play' | 'sr3_penny'
  | 'complete';

export default function Workout2({ user, userState, onComplete, onBack, onNowClick, refreshState }: Workout2Props) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('entry');
  const [showSections, setShowSections] = useState(false);
  const [loopStep, setLoopStep] = useState(0);
  const [d1Escalation, setD1Escalation] = useState(0);
  const [d2Round, setD2Round] = useState(1);
  const [d2Phase, setD2Phase] = useState(1);
  const [d2Intensity, setD2Intensity] = useState(0);
  const [d2Answered, setD2Answered] = useState<boolean | null>(null);
  const [d3Selected, setD3Selected] = useState<number | null>(null);
  const [d3MicroText, setD3MicroText] = useState<string | null>(null);
  const [journalText, setJournalText] = useState('');
  const [sr1Status, setSr1Status] = useState<'Stable' | 'Slightly Elevated' | 'Elevated'>('Stable');
  const [sr1Tapped, setSr1Tapped] = useState(false);
  const [sr2Value, setSr2Value] = useState(60);
  const [sr2Rebounds, setSr2Rebounds] = useState(0);
  const [sr3Phase, setSr3Phase] = useState(1);
  const [sr3Tapped, setSr3Tapped] = useState(false);

  const SECTIONS: { id: Screen; label: string; group: string }[] = [
    { id: 'entry', label: 'Orientation', group: 'Intro' },
    { id: 'definition', label: 'What is the Loop?', group: 'Theory' },
    { id: 'example_heartbeat', label: 'Real-Life Examples', group: 'Theory' },
    { id: 'loop_intro', label: 'Loop Breakdown', group: 'Theory' },
    { id: 'd1_entry', label: 'Drill 1: Watch It Multiply', group: 'Drills' },
    { id: 'd2_entry', label: 'Drill 2: Non-Response', group: 'Drills' },
    { id: 'd3_entry', label: 'Drill 3: Interrupt', group: 'Drills' },
    { id: 'muscle_summary', label: 'Summary', group: 'Review' },
  ];

  const DRILL_SCREENS = ['d1_play', 'd2_play_loop', 'd3_play', 'sr1_play', 'sr2_play', 'sr3_play'];
  const isDrill = DRILL_SCREENS.includes(currentScreen);

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

  // Drill 1: Escalation Build
  useEffect(() => {
    if (currentScreen === 'd1_play') {
      const intervals = [1200, 2400, 3600, 4800, 6000];
      const timers = intervals.map((ms, i) => setTimeout(() => setD1Escalation(i + 1), ms));
      const endTimer = setTimeout(() => setCurrentScreen('d1_penny'), 9000);
      return () => {
        timers.forEach(clearTimeout);
        clearTimeout(endTimer);
      };
    }
  }, [currentScreen]);

  // Drill 2: Non-Response Loop
  useEffect(() => {
    if (currentScreen === 'd2_play_loop') {
      const timer = setTimeout(() => setD2Phase(2), 1200);
      const failTimer = setTimeout(() => {
        if (d2Answered === null) {
          setD2Intensity(prev => prev + 25);
          setTimeout(() => {
            if (d2Round < 3) {
              setD2Round(prev => prev + 1);
              setD2Phase(1);
              setD2Answered(null);
            } else {
              setCurrentScreen('d2_penny');
            }
          }, 2000);
        }
      }, 6200);
      return () => {
        clearTimeout(timer);
        clearTimeout(failTimer);
      };
    }
  }, [currentScreen, d2Round, d2Answered]);

  // Skill Rep 1: Checking Trap
  useEffect(() => {
    if (currentScreen === 'sr1_play') {
      const timers = [
        setTimeout(() => setSr1Status('Slightly Elevated'), 3000),
        setTimeout(() => { if (!sr1Tapped) setSr1Status('Stable'); }, 12000),
        setTimeout(() => setCurrentScreen('sr1_penny'), 20000)
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [currentScreen, sr1Tapped]);

  useEffect(() => {
    if (currentScreen === 'd1_penny') {
      logRep('Escalation Awareness', 'workout2.d1_completed_at');
    } else if (currentScreen === 'd2_penny') {
      logRep('Loop Disruption', 'workout2.d2_completed_at');
    } else if (currentScreen === 'd3_penny') {
      logRep('Loop Disruption', 'workout2.d3_completed_at');
    }
  }, [currentScreen]);
  // Skill Rep 3: Escape Reflex
  useEffect(() => {
    if (currentScreen === 'sr3_play') {
      const timers = [
        setTimeout(() => setSr3Phase(2), 6000),
        setTimeout(() => setSr3Phase(3), 14000),
        setTimeout(() => setSr3Phase(4), 22000),
        setTimeout(() => setCurrentScreen('sr3_penny'), 32000)
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [currentScreen]);

  const renderNav = (showHome = false) => (
    <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
          <ArrowLeft size={14} /> Back
        </button>
        <button 
          onClick={() => setShowSections(true)}
          className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
        >
          <Menu size={14} /> Sections
        </button>
      </div>
      <div className="flex items-center gap-4">
        {!isDrill && (
          <button 
            onClick={onNowClick}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity bg-accent/5 px-3 py-1.5 rounded-full text-accent"
          >
            <Brain size={12} /> Now
          </button>
        )}
        {showHome && !isDrill && (
          <button onClick={onBack} className="opacity-50 hover:opacity-100 transition-opacity">
            <Home size={18} />
          </button>
        )}
      </div>
    </div>
  );

  const renderCTA = (text: string, next: Screen, delay = 0) => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ delay }}
      className="absolute bottom-32 left-6 right-6 flex justify-center"
    >
      <button
        onClick={() => setCurrentScreen(next)}
        className="bg-accent text-bg px-12 py-4 rounded-full font-medium hover:scale-105 active:scale-95 transition-all"
      >
        ▶ {text}
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
              <h2 className="font-serif italic text-2xl">Workout Sections</h2>
              <button 
                onClick={() => setShowSections(false)}
                className="p-2 hover:bg-accent/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pb-12">
              {['Intro', 'Theory', 'Drills', 'Practice', 'Review'].map(group => (
                <div key={group} className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-30 font-bold">{group}</h3>
                  <div className="grid gap-2">
                    {SECTIONS.filter(s => s.group === group).map(section => (
                      <button
                        key={section.id}
                        onClick={() => {
                          setCurrentScreen(section.id);
                          setShowSections(false);
                        }}
                        className={`text-left p-4 rounded-2xl transition-all flex justify-between items-center ${
                          currentScreen === section.id 
                            ? 'bg-accent text-bg' 
                            : 'bg-accent/5 hover:bg-accent/10'
                        }`}
                      >
                        <span className="font-medium">{section.label}</span>
                        {currentScreen === section.id && <div className="w-1.5 h-1.5 bg-bg rounded-full" />}
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
            {renderNav()}
            
            {/* Centered Animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-accent rounded-full blur-3xl"
                />
                <div className="w-32 h-32 border border-accent/20 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 border border-accent/10 rounded-full scale-110" />
                  <Brain size={32} className="opacity-20 text-accent" />
                </div>
              </div>
            </div>

            {/* Bottom Text */}
            <div className="absolute top-[62%] w-full px-8 text-center">
              <div className="h-32 flex flex-col justify-center space-y-4">
                <p className="font-serif italic text-2xl">Today you’ll see the loop.</p>
                <p className="text-sm opacity-50">Not as an idea — as a pattern.</p>
                <p className="text-xs opacity-30 italic">“Once you see it, you can spot where fuel gets added.”</p>
              </div>
            </div>
            {renderCTA('Begin Workout', 'main_narration', 2)}
          </motion.div>
        )}

        {currentScreen === 'main_narration' && (
          <motion.div key="main_narration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl leading-tight">Pause for a second.</h2>
              <p className="opacity-60">You’re learning how the mind runs—mechanically.</p>
              <p className="text-lg font-serif italic">“Awareness changes what you follow.”</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Training focus: recognize the echo.</p>
              {renderCTA('Continue', 'definition')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'definition' && (
          <motion.div key="definition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-12 w-full max-w-xs">
              <div className="space-y-4">
                <h2 className="font-serif italic text-3xl">The Mechanism</h2>
                <p className="text-sm opacity-60">An alarm in the mind triggers a reaction in the body... and the body reaction triggers a second alarm in the mind.</p>
              </div>
              <div className="relative h-32 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-2 border-dashed border-accent/20 rounded-full flex items-center justify-center"
                >
                  <div className="absolute top-0 w-2 h-2 bg-accent rounded-full" />
                  <div className="absolute bottom-0 w-2 h-2 bg-accent/40 rounded-full" />
                </motion.div>
                <div className="absolute text-[10px] uppercase tracking-widest opacity-40">Mind ↔ Body</div>
              </div>
              <p className="text-xs italic opacity-50">“A protection system reacting to itself.”</p>
              {renderCTA('Continue', 'explanation')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'explanation' && (
          <motion.div key="explanation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <div className="space-y-2">
                <p className="text-xl font-serif italic">Mind → body → mind → body…</p>
                <h2 className="text-3xl font-serif italic">Until it feels endless.</h2>
              </div>
              <p className="opacity-60">“This isn’t new information. It’s the same signal being re-read.”</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Training focus: notice the echo</p>
              {renderCTA('See Real-Life Examples', 'example_heartbeat')}
            </div>
          </motion.div>
        )}

        {/* Examples */}
        {currentScreen === 'example_heartbeat' && (
          <motion.div key="example_heartbeat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="col-header">The Heartbeat Loop</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase opacity-40">Sensation</p>
                  <p className="text-sm">A sudden fast heartbeat.</p>
                  <p className="text-sm">Your body tenses.</p>
                  <p className="text-sm">Heart rate increases.</p>
                </div>
                <div className="space-y-4 border-l border-line/10 pl-4">
                  <p className="text-[10px] uppercase opacity-40">Meaning</p>
                  <p className="text-sm italic">“Something is wrong.”</p>
                  <div className="h-4" />
                  <p className="text-sm italic">“See? It’s getting worse.”</p>
                </div>
              </div>
              <div className="pt-8 border-t border-line/10 space-y-2">
                <p className="text-sm font-serif italic">“That second interpretation is the echo that feeds the loop.”</p>
              </div>
              {renderCTA('Next Example', 'example_breath')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_breath' && (
          <motion.div key="example_breath" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="col-header">The Breath Loop</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase opacity-40">Sensation</p>
                  <p className="text-sm">You notice your breathing.</p>
                  <p className="text-sm">Chest tightens.</p>
                  <p className="text-sm">Breath shortens.</p>
                </div>
                <div className="space-y-4 border-l border-line/10 pl-4">
                  <p className="text-[10px] uppercase opacity-40">Meaning</p>
                  <p className="text-sm italic">“Why is my breathing different??”</p>
                  <div className="h-4" />
                  <p className="text-sm italic">“This is escalating.”</p>
                </div>
              </div>
              <div className="pt-8 border-t border-line/10 space-y-2 text-center">
                <p className="text-xs opacity-40 uppercase tracking-widest">Training focus: spot the ‘proof’ moment</p>
              </div>
              {renderCTA('Next Example', 'example_social')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_social' && (
          <motion.div key="example_social" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="col-header">The Social Loop</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase opacity-40">Sensation</p>
                  <p className="text-sm">You feel nervous before speaking.</p>
                  <p className="text-sm">Hands sweat.</p>
                  <p className="text-sm">Sensations increase.</p>
                </div>
                <div className="space-y-4 border-l border-line/10 pl-4">
                  <p className="text-[10px] uppercase opacity-40">Meaning</p>
                  <p className="text-sm italic">“You’ll embarrass yourself.”</p>
                  <div className="h-4" />
                  <p className="text-sm italic">“You’re losing control.”</p>
                </div>
              </div>
              <div className="pt-8 border-t border-line/10 text-center">
                <p className="text-xs opacity-40 uppercase tracking-widest">Training focus: catch the second alarm</p>
              </div>
              {renderCTA('Next Example', 'example_avoidance')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_avoidance' && (
          <motion.div key="example_avoidance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="col-header">The Avoidance Loop</h2>
              <div className="space-y-4">
                <p className="text-sm">“You once felt the alarm rise in a supermarket.”</p>
                <p className="text-sm italic opacity-60">System: “Don’t go back.”</p>
                <div className="h-px bg-line/10 w-full" />
                <p className="text-sm font-medium">“Avoidance marks the situation as important.”</p>
                <p className="text-xs opacity-40">Earlier alarm → stronger body response → stronger echo.</p>
              </div>
              {renderCTA('Break It Down', 'loop_intro')}
            </div>
          </motion.div>
        )}

        {/* Loop Breakdown */}
        {currentScreen === 'loop_intro' && (
          <motion.div key="loop_intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">The Loop That Feels Like the Alarm</h2>
              <p className="opacity-60">It’s the same signal being interpreted twice.</p>
              <div className="py-8 flex justify-center gap-4 items-center text-[10px] uppercase tracking-widest opacity-40">
                <span>Mind</span>
                <ArrowLeft size={12} className="rotate-180" />
                <span>Body</span>
                <ArrowLeft size={12} className="rotate-180" />
                <span>Mind</span>
                <ArrowLeft size={12} className="rotate-180" />
                <span>Body</span>
              </div>
              <p className="text-xs opacity-40 italic">Training Focus: build the loop structure</p>
              {renderCTA('Continue', 'loop_steps')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'loop_steps' && (
          <motion.div key="loop_steps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="w-full max-w-xs space-y-12">
              <p className="text-[10px] uppercase tracking-widest opacity-40 text-center">Training Set: 4-step loop. Tap Next to build.</p>
              
              <div className="space-y-8">
                {loopStep >= 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <p className="text-xs font-bold uppercase opacity-30">Step 1: Something Appears</p>
                    <p className="text-sm">A thought, a memory, or a sensation.</p>
                  </motion.div>
                )}
                {loopStep >= 1 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <p className="text-xs font-bold uppercase opacity-30">Step 2: The System Flags It</p>
                    <p className="text-sm italic">“This could be dangerous.”</p>
                  </motion.div>
                )}
                {loopStep >= 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <p className="text-xs font-bold uppercase opacity-30">Step 3: The Body Responds</p>
                    <p className="text-sm">Heart speeds up, muscles tighten.</p>
                  </motion.div>
                )}
                {loopStep >= 3 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <p className="text-xs font-bold uppercase opacity-30">Step 4: The Second Alarm (The Echo)</p>
                    <p className="text-sm font-medium">“See? That confirms it.”</p>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-center">
                {loopStep < 3 ? (
                  <button onClick={() => setLoopStep(prev => prev + 1)} className="bg-accent/10 text-accent px-8 py-3 rounded-full text-xs uppercase tracking-widest">Next Step</button>
                ) : (
                  renderCTA('Continue', 'penny_drop')
                )}
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'penny_drop' && (
          <motion.div key="penny_drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">The loop grows here — not at the first sensation.</h2>
              <p className="text-xl opacity-60">But at the alarm about the sensation.</p>
              <p className="text-sm opacity-40 italic">“Nothing new happened. The echo was treated as new.”</p>
              {renderCTA('Continue', 'metaphor')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'metaphor' && (
          <motion.div key="metaphor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <Repeat size={48} className="mx-auto opacity-20" />
              <h2 className="font-serif italic text-3xl">It’s like a microphone hearing its own output.</h2>
              <p className="opacity-60">And increasing the volume.</p>
              <p className="text-xs opacity-40 uppercase tracking-widest">Training Focus: The echo amplifies itself.</p>
              {renderCTA('Continue', 'control_returns')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'control_returns' && (
          <motion.div key="control_returns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Where Control Returns</h2>
              <p className="opacity-60">You don’t need to stop the first sensation. You don’t need to change the body.</p>
              <p className="text-xl font-serif italic">“Don’t answer the second alarm.”</p>
              {renderCTA('Continue', 'final_lockin')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'final_lockin' && (
          <motion.div key="final_lockin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Echoes fade when they aren’t treated as new information.</h2>
              <p className="opacity-60 italic">“When the body reacts, nothing new has happened.”</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Next: 3 drills. No scoring. Just reps.</p>
              {renderCTA('Continue to Reps', 'd1_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 1: Watch It Multiply */}
        {currentScreen === 'd1_entry' && (
          <motion.div key="d1_entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Watch It Multiply</h2>
              <p className="opacity-60">Loops don’t grow from new danger. They grow from repeated meaning.</p>
              <p className="text-xs opacity-40 italic">“You are observing mechanics. Not calming anything.”</p>
              {renderCTA('Start', 'd1_play')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd1_play' && (
          <motion.div key="d1_play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-bg">
            <div className="space-y-4 text-center">
              <p className="text-3xl font-serif italic opacity-20">Sensation</p>
              <div className="space-y-1">
                {Array.from({ length: Math.pow(2, d1Escalation - 1) }).map((_, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-serif italic text-accent"
                    style={{ fontSize: `${1 + (d1Escalation * 0.03)}rem` }}
                  >
                    What if this is bad?
                  </motion.p>
                ))}
              </div>
              {d1Escalation >= 4 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] uppercase tracking-widest opacity-40 pt-8">Do nothing.</motion.p>
              )}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd1_penny' && (
          <motion.div key="d1_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">The sensation did not multiply. The meaning multiplied.</h2>
              <p className="opacity-60">Repetition is added fuel. The loop grows from reaction to reaction.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Rep Logged: Escalation Awareness +1</p>
              {renderCTA('Next Drill', 'd2_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 2: Do Not Answer */}
        {currentScreen === 'd2_entry' && (
          <motion.div key="d2_entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Do Not Answer the Second Alarm</h2>
              <p className="opacity-60">The loop grows when the system answers its own echo.</p>
              {renderCTA('Start', 'd2_play_intro')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd2_play_intro' && (
          <motion.div key="d2_play_intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-xs">
              <p className="text-lg">The first sensation appears. Then the system adds a second alarm.</p>
              <p className="font-serif italic text-2xl">You will see the echo. Do not answer it.</p>
              <p className="text-xs opacity-40 uppercase tracking-widest">You’re training non-response under pressure</p>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} onAnimationComplete={() => setCurrentScreen('d2_play_loop')} />
          </motion.div>
        )}

        {currentScreen === 'd2_play_loop' && (
          <motion.div key="d2_play_loop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-ink text-bg">
            <div className="absolute top-12 text-[10px] uppercase tracking-widest opacity-40">Round {d2Round} / 3</div>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-accent/20 rounded-full"
                style={{ borderWidth: `${2 + d2Intensity/10}px` }}
              />
              <div className="text-center space-y-4">
                <p className="text-lg opacity-60">Sensation</p>
                {d2Phase === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                    <p className="text-xl font-serif italic text-accent">What if this gets worse?</p>
                    <p className="text-[8px] uppercase opacity-30">Answer it.</p>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="absolute bottom-32 left-6 right-6 grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setD2Answered(true);
                  setD2Intensity(prev => Math.max(0, prev - 10));
                  setTimeout(() => {
                    if (d2Round < 3) {
                      setD2Round(prev => prev + 1);
                      setD2Phase(1);
                      setD2Answered(null);
                    } else {
                      setCurrentScreen('d2_penny');
                    }
                  }, 1500);
                }}
                className="bg-accent text-bg py-4 rounded-full text-xs uppercase tracking-widest font-bold"
              >
                ECHO
              </button>
              <button 
                onClick={() => {
                  setD2Answered(false);
                  setTimeout(() => {
                    if (d2Round < 3) {
                      setD2Round(prev => prev + 1);
                      setD2Phase(1);
                      setD2Answered(null);
                    } else {
                      setCurrentScreen('d2_penny');
                    }
                  }, 1500);
                }}
                className="bg-bg/10 text-bg py-4 rounded-full text-xs uppercase tracking-widest font-bold"
              >
                Not Now
              </button>
            </div>

            {d2Answered !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-ink/80 backdrop-blur-sm">
                <p className="text-xl font-serif italic">{d2Answered ? "That was the second alarm." : "Restraint."}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentScreen === 'd2_penny' && (
          <motion.div key="d2_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">The second alarm only survives when it’s answered.</h2>
              <p className="opacity-60">You didn’t answer. That’s restraint.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Rep Logged: Loop Disruption +1</p>
              {renderCTA('Next Drill', 'd3_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 3: Interrupt Structure */}
        {currentScreen === 'd3_entry' && (
          <motion.div key="d3_entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Interrupt the Structure</h2>
              <p className="opacity-60">The loop has a predictable sequence. Break it at the right point.</p>
              <p className="text-xs opacity-40 uppercase tracking-widest">Muscles: Structural Interruption · Alarm Loop Recognition</p>
              {renderCTA('Start', 'd3_play')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_play' && (
          <motion.div key="d3_play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="absolute top-12 text-[10px] uppercase tracking-widest opacity-40">Tap the stage where the loop grows.</div>
            
            <div className="space-y-4 w-full max-w-xs">
              {[
                { label: "Sensation", msg: "This begins the cycle — but doesn’t grow it." },
                { label: "Meaning", msg: "Meaning activates the body — but isn’t the growth point." },
                { label: "Body Tension", msg: "The body reacts — but tension alone isn’t escalation." },
                { label: "Fear of the Sensation", msg: "This is where the loop grows.", correct: true },
                { label: "Escalation", msg: "Escalation is the result — not the cause." }
              ].map((item, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: d3Selected === null || d3Selected === i ? 1 : 0.3, x: 0, scale: d3Selected === i ? 1.05 : 1 }}
                  onClick={() => {
                    if (d3Selected === null || !item.correct) {
                      setD3Selected(i);
                      setD3MicroText(item.msg);
                      if (item.correct) {
                        setTimeout(() => setCurrentScreen('d3_penny'), 4000);
                      }
                    }
                  }}
                  className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${d3Selected === i ? (item.correct ? 'bg-accent text-bg border-accent' : 'bg-accent/5 border-accent/20') : 'bg-line/20 border-transparent'}`}
                >
                  <span className="font-medium">{item.label}</span>
                  {i < 4 && <ArrowLeft size={14} className="-rotate-90 opacity-20" />}
                </motion.button>
              ))}
            </div>

            {d3MicroText && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 text-center max-w-xs">
                <p className="text-sm italic opacity-60">{d3MicroText}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {currentScreen === 'd3_penny' && (
          <motion.div key="d3_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">You found the growth point.</h2>
              <p className="opacity-60">The loop expands when fear is added to sensation. Interrupt here — and escalation cannot multiply.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Rep Logged: Loop Disruption +1</p>
              {renderCTA('Continue', 'muscle_summary')}
            </div>
          </motion.div>
        )}

        {/* Summary & Closing */}
        {currentScreen === 'muscle_summary' && (
          <motion.div key="muscle_summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-12 w-full max-w-xs">
              <h2 className="font-serif italic text-4xl">Muscles Activated</h2>
              <div className="space-y-6">
                {['Loop Disruption', 'Escalation Awareness'].map((text, i) => (
                  <motion.div key={text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.5 }} className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span className="text-lg font-serif italic">{text}</span>
                  </motion.div>
                ))}
              </div>
              <div className="pt-8 border-t border-line/10 space-y-2">
                <p className="text-xs opacity-40">Set Complete: Education + Drills</p>
                <p className="text-xs font-bold">Repetition builds automatic strength.</p>
              </div>
              {renderCTA('Continue to Closing', 'closing_transition')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_transition' && (
          <motion.div key="closing_transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-line">
            {renderNav()}
            <div className="text-center space-y-6">
              <h2 className="font-serif italic text-4xl">✨ Workout 2 Complete</h2>
              <p className="col-header">Set Summary</p>
              <p className="text-xl opacity-60">“The alarm isn’t endless — it’s a loop.”</p>
              {renderCTA('Continue', 'closing_core')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_core' && (
          <motion.div key="closing_core" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-6 text-center max-w-xs">
              {[
                "Today you saw the mechanism.",
                "A signal appeared. The system reacted.",
                "Then it reacted again to its own reaction.",
                "That second reaction is the echo.",
                "The loop grows when the echo is treated as new information.",
                "Recognition removes automatic escalation."
              ].map((text, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 1.5 }} className="text-lg opacity-60">
                  {text}
                </motion.p>
              ))}
              {renderCTA('Continue', 'closing_forward', 9)}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_forward' && (
          <motion.div key="closing_forward" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Next, you’ll train how the system rebuilds safety — so loops form less.</h2>
              <p className="text-sm opacity-60">You don’t need to remove sensations. You don’t need to overpower reactions.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-30">Return To Now is available from Home.</p>
              {renderCTA('Update Training Log', 'journal')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'journal' && (
          <motion.div key="journal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-8">
            {renderNav()}
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8">
              <div className="space-y-2">
                <p className="col-header">Training Log — Workout 2</p>
                <h2 className="font-serif italic text-3xl text-center">What was one Alarm Loop you noticed today?</h2>
                <p className="text-sm opacity-50 text-center italic">“What was the first spark?”</p>
              </div>
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                className="w-full h-48 bg-line rounded-3xl p-6 outline-none focus:ring-2 ring-accent/5 transition-all resize-none"
                placeholder="✍️ Type your reflection..."
              />
              <button onClick={() => setCurrentScreen('journal_confirm')} className="bg-accent text-bg py-4 rounded-full font-medium hover:scale-105 transition-all">
                Save Training Log Entry
              </button>
            </div>
          </motion.div>
        )}

        {currentScreen === 'journal_confirm' && (
          <motion.div key="journal_confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8">
              <div className="w-16 h-16 bg-line text-accent rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif italic text-3xl">Entry stored.</h2>
                <p className="opacity-60">Repetition builds recognition.</p>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={() => setCurrentScreen('skill_reps_entry')} className="bg-accent text-bg px-12 py-4 rounded-full font-medium">Continue to Skill Reps</button>
                <button onClick={onComplete} className="text-xs uppercase tracking-widest opacity-40">Return Home</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Skill Reps */}
        {currentScreen === 'skill_reps_entry' && (
          <motion.div key="skill_reps_entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Skill Reps</h2>
              <p className="opacity-60">3 short reps. No scoring. No feedback. Just training.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Muscles: Response Restraint · Anti-Checking · Anti-Forcing · Anti-Escape</p>
              {renderCTA('Start Skill Reps', 'sr1_intro')}
            </div>
          </motion.div>
        )}

        {/* SR1: Checking Trap */}
        {currentScreen === 'sr1_intro' && (
          <motion.div key="sr1_intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">The Checking Trap</h2>
              <p className="opacity-60">The loop survives because you keep checking if it’s gone. Do not check the signal. Just watch it.</p>
              {renderCTA('Start', 'sr1_play')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'sr1_play' && (
          <motion.div key="sr1_play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="absolute top-12 text-[10px] uppercase tracking-widest opacity-40">Do not tap the signal.</div>
            <div className="text-center space-y-8">
              <p className="text-xl font-serif italic">Signal Status: <span className={sr1Status === 'Elevated' ? 'text-accent' : ''}>{sr1Status}</span></p>
              <motion.div
                animate={{ scale: sr1Status === 'Stable' ? [1, 1.04, 1] : [1, 1.1, 1], opacity: sr1Status === 'Stable' ? 0.2 : 0.4 }}
                transition={{ duration: 2.5, repeat: Infinity }}
                onClick={() => {
                  if (!sr1Tapped) {
                    setSr1Tapped(true);
                    setSr1Status('Elevated');
                  }
                }}
                className="w-12 h-12 bg-accent rounded-full mx-auto cursor-pointer"
              />
              {sr1Tapped && <p className="text-xs italic opacity-60">Checking feeds it.</p>}
            </div>
          </motion.div>
        )}

        {currentScreen === 'sr1_penny' && (
          <motion.div key="sr1_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-6 max-w-xs">
              {[
                "You weren’t feeling danger.",
                "You were checking for it.",
                "Monitoring tells the system: ‘this must matter.’",
                "No checking. No fuel."
              ].map((text, i) => (
                <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 1.4 }} className="text-lg opacity-60">
                  {text}
                </motion.p>
              ))}
              {renderCTA('Next', 'sr2_intro', 6)}
            </div>
          </motion.div>
        )}

        {/* SR2: Control Rebound */}
        {currentScreen === 'sr2_intro' && (
          <motion.div key="sr2_intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">The Control Rebound</h2>
              <p className="opacity-60">Try to control the signal. Drag it down to zero.</p>
              {renderCTA('Start', 'sr2_play')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'sr2_play' && (
          <motion.div key="sr2_play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="absolute top-12 text-[10px] uppercase tracking-widest opacity-40">{sr2Rebounds >= 3 ? "Stop adjusting." : "Drag it down to zero."}</div>
            <div className="w-full max-w-xs space-y-8">
              <div className="text-center space-y-2">
                <p className="col-header">Signal Level</p>
                <p className="text-4xl font-mono">{Math.round(sr2Value)}</p>
              </div>
              <input
                type="range"
                min="0" max="100"
                value={sr2Value}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSr2Value(val);
                  if (val < 40 && sr2Rebounds < 3) {
                    setTimeout(() => {
                      setSr2Rebounds(prev => prev + 1);
                      setSr2Value(75 + (sr2Rebounds * 5));
                    }, 500);
                  }
                }}
                className="w-full accent-accent"
              />
              {sr2Rebounds > 0 && sr2Rebounds < 3 && <p className="text-center text-xs italic opacity-40">Forcing control creates resistance.</p>}
              {sr2Rebounds >= 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }} onAnimationComplete={() => {
                  const interval = setInterval(() => {
                    setSr2Value(prev => {
                      if (prev <= 30) {
                        clearInterval(interval);
                        setTimeout(() => setCurrentScreen('sr2_penny'), 2000);
                        return 30;
                      }
                      return prev - 1;
                    });
                  }, 100);
                }} />
              )}
            </div>
          </motion.div>
        )}

        {currentScreen === 'sr2_penny' && (
          <motion.div key="sr2_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-6 max-w-xs">
              {[
                "Control intensifies the loop.",
                "Force creates rebound.",
                "Non-interference removes momentum.",
                "You don’t win by overpowering it."
              ].map((text, i) => (
                <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 1.4 }} className="text-lg opacity-60">
                  {text}
                </motion.p>
              ))}
              {renderCTA('Next', 'sr3_intro', 6)}
            </div>
          </motion.div>
        )}

        {/* SR3: Escape Reflex */}
        {currentScreen === 'sr3_intro' && (
          <motion.div key="sr3_intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">The Escape Reflex</h2>
              <p className="opacity-60">The loop grows when you try to escape the signal. Do not respond to the urge.</p>
              {renderCTA('Start', 'sr3_play')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'sr3_play' && (
          <motion.div key="sr3_play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8" onClick={() => { if (!sr3Tapped) setSr3Tapped(true); }}>
            <div className="text-center space-y-12">
              <div className="space-y-2">
                <h2 className="text-4xl font-serif italic">Sensation Present.</h2>
                <p className="text-xs opacity-30 uppercase tracking-widest">No action required.</p>
              </div>
              
              <div className="space-y-4">
                {sr3Phase >= 2 && ["Make it stop.", "This shouldn’t be here.", "What if this doesn’t pass?", "Do something."].slice(0, sr3Phase === 2 ? 4 : 5).map((text, i) => (
                  <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: sr3Phase === 3 ? 0.7 : 0.45 }} className="text-lg italic">{text}</motion.p>
                ))}
                {sr3Phase >= 3 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} className="text-lg italic font-bold">Waiting feels wrong.</motion.p>}
                {sr3Phase === 4 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-serif italic text-accent">Sensation Passing.</motion.p>}
              </div>

              {sr3Tapped && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-24 left-0 right-0 text-center">
                  <p className="text-xs italic opacity-40">That was the escape reflex.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {currentScreen === 'sr3_penny' && (
          <motion.div key="sr3_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-6 max-w-xs">
              {[
                "You weren’t trapped by the sensation.",
                "You were pulled by the need to escape it.",
                "When escape isn’t answered—",
                "the loop has nothing to build on.",
                "Reaction fuels alarms. Non-response weakens them."
              ].map((text, i) => (
                <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 1.6 }} className="text-lg opacity-60">
                  {text}
                </motion.p>
              ))}
              {renderCTA('Continue', 'complete', 8)}
            </div>
          </motion.div>
        )}

        {currentScreen === 'complete' && (
          <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-12 max-w-xs">
              <div className="space-y-4">
                <h2 className="font-serif italic text-4xl">You’re Seeing the Pattern</h2>
                <p className="opacity-60">The system creates stories automatically. You don’t have to follow them automatically.</p>
              </div>
              <div className="space-y-4 text-left">
                <p className="text-xs uppercase tracking-widest opacity-40">You practiced:</p>
                <div className="space-y-2">
                  {['No checking', 'No forcing', 'No escape'].map(t => (
                    <div key={t} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-accent" />
                      <span className="text-sm">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={onComplete} className="bg-accent text-bg px-12 py-4 rounded-full font-medium hover:scale-105 transition-all">Finish Training</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
