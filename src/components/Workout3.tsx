import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ArrowLeft, Home, Menu, X, CheckCircle2, Activity, Shield, Zap, Eye, Lock, Play, MessageSquare, Mic, Tag } from 'lucide-react';
import { User, UserState } from '../types';

interface Workout3Props {
  user: User;
  userState: UserState;
  onComplete: () => void;
  onBack: () => void;
  onNowClick: () => void;
  refreshState: () => void;
}

type Screen = 
  | 'entry' | 'main_narration' | 'body_before_mind' | 'goal' | 'evolution_context' 
  | 'modern_triggers' | 'misinterpretation_loop' | 'why_calm_fails' 
  | 'example_heat' | 'example_crowd' | 'example_stomach' | 'example_checking'
  | 'core_message' | 'transition_to_drills'
  | 'd1_entry' | 'd1_r1_l2' | 'd1_r1_l3' | 'd1_speed1' | 'd1_speed2' | 'd1_speed3' | 'd1_lockin' | 'd1_penny'
  | 'd2_entry' | 'd2_exposure' | 'd2_rapid1' | 'd2_rapid2' | 'd2_rapid3' | 'd2_rapid4' | 'd2_lockin' | 'd2_penny'
  | 'd3_entry' | 'd3_hold1' | 'd3_hold2' | 'd3_lockin' | 'd3_penny'
  | 'drills_complete' | 'muscle_summary' | 'closing_transition' | 'closing_core' | 'closing_insight' 
  | 'closing_transfer' | 'closing_forward_look' | 'journal' | 'journal_confirm' | 'skill_reps_entry' | 'complete';

export default function Workout3({ user, userState, onComplete, onBack, onNowClick, refreshState }: Workout3Props) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('entry');
  const [showSections, setShowSections] = useState(false);
  const [d1Stack, setD1Stack] = useState<string[]>([]);
  const [d1Feedback, setD1Feedback] = useState<string | null>(null);
  const [d1Timer, setD1Timer] = useState(6);
  const [d2Tapped, setD2Tapped] = useState<{ a: boolean; c: boolean }>({ a: false, c: false });
  const [d2Feedback, setD2Feedback] = useState<string | null>(null);
  const [d3Timer, setD3Timer] = useState(10);
  const [d3Status, setD3Status] = useState<string | null>(null);
  const [journalText, setJournalText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setJournalText(prev => prev + (prev ? " " : "") + speechToText);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Recognition start error:", err);
      setIsListening(false);
    }
  };

  const SECTIONS: { id: Screen; label: string; group: string }[] = [
    { id: 'entry', label: 'Orientation', group: 'Intro' },
    { id: 'body_before_mind', label: 'Body Logic', group: 'Theory' },
    { id: 'modern_triggers', label: 'Triggers', group: 'Theory' },
    { id: 'd1_entry', label: 'Drill 1: Name the Stack', group: 'Drills' },
    { id: 'd2_entry', label: 'Drill 2: Regression Illusion', group: 'Drills' },
    { id: 'd3_entry', label: 'Drill 3: Hold Position', group: 'Drills' },
    { id: 'muscle_summary', label: 'Summary', group: 'Review' },
  ];

  useEffect(() => {
    if (currentScreen === 'd1_penny') {
      logRep('Sensation Separation', 'workout3.d1_completed_at');
    } else if (currentScreen === 'd2_penny') {
      logRep('Sensation Separation', 'workout3.d2_completed_at');
    } else if (currentScreen === 'd3_penny') {
      logRep('Non-Reactivity', 'workout3.d3_completed_at');
    }
  }, [currentScreen]);
  const DRILL_SCREENS = ['d1_r1_l2', 'd1_r1_l3', 'd1_speed1', 'd1_speed2', 'd1_speed3', 'd2_exposure', 'd2_rapid1', 'd2_rapid2', 'd2_rapid3', 'd2_rapid4', 'd3_hold1', 'd3_hold2'];
  const isDrill = DRILL_SCREENS.includes(currentScreen);

  const logRep = async (muscleKey: string, trackingKey: string) => {
    await fetch('/api/log-rep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, muscleKey, trackingKey })
    });
    refreshState();
  };

  // Drill 1 Speed Timers
  useEffect(() => {
    if (['d1_speed1', 'd1_speed2', 'd1_speed3'].includes(currentScreen)) {
      setD1Timer(6);
      const interval = setInterval(() => {
        setD1Timer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setD1Feedback("Speed is how the stack wins.");
            setTimeout(() => {
              setD1Feedback(null);
              setD1Timer(6);
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

  // Drill 3 Hold Timers
  useEffect(() => {
    if (currentScreen === 'd3_hold1') {
      setD3Timer(10);
      const interval = setInterval(() => {
        setD3Timer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setD3Status("No action is also an action.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    if (currentScreen === 'd3_hold2') {
      setD3Timer(15);
      const interval = setInterval(() => {
        setD3Timer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setD3Status("The body expected instruction. You didn't give one.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

  const renderNav = () => (
    <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={() => setShowSections(true)} className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
          <Menu size={14} /> Sections
        </button>
      </div>
      {!isDrill && (
        <button onClick={onNowClick} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity bg-accent/5 px-3 py-1.5 rounded-full text-accent">
          <Brain size={12} /> Now
        </button>
      )}
    </div>
  );

  const renderCTA = (text: string, next: Screen, delay = 0) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }} className="absolute bottom-32 left-6 right-6 flex justify-center">
      <button onClick={() => setCurrentScreen(next)} className="bg-accent text-bg px-12 py-4 rounded-full font-medium hover:scale-105 active:scale-95 transition-all">
        ▶ {text}
      </button>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-bg z-50 overflow-hidden flex flex-col">
      <AnimatePresence>
        {showSections && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-md p-8 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <h2 className="font-serif italic text-2xl">Workout Sections</h2>
              <button onClick={() => setShowSections(false)} className="p-2 hover:bg-accent/5 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-8 pb-12">
              {['Intro', 'Theory', 'Drills', 'Review'].map(group => (
                <div key={group} className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-30 font-bold">{group}</h3>
                  <div className="grid gap-2">
                    {SECTIONS.filter(s => s.group === group).map(section => (
                      <button key={section.id} onClick={() => { setCurrentScreen(section.id); setShowSections(false); }} className={`text-left p-4 rounded-2xl transition-all flex justify-between items-center ${currentScreen === section.id ? 'bg-accent text-bg' : 'bg-accent/5 hover:bg-accent/10'}`}>
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
            className="flex-1 relative flex flex-col items-center overflow-hidden bg-gradient-to-b from-orange-50/20 to-bg"
          >
            {renderNav()}
            
            {/* Centered Animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div animate={{ opacity: [0.7, 1, 0.7], y: [0, -5, 0] }} transition={{ duration: 20, repeat: Infinity }} className="text-accent/20">
                <Brain size={64} className="mx-auto" />
              </motion.div>
            </div>

            {/* Bottom Text */}
            <div className="absolute top-[62%] w-full px-8 text-center">
              <div className="h-32 flex flex-col justify-center space-y-4">
                <p className="font-serif italic text-2xl">“When the body feels unsafe,”</p>
                <p className="font-serif italic text-2xl">“the mind tries to protect you.”</p>
                <p className="text-sm opacity-50">Today you train the body’s response pattern.</p>
              </div>
            </div>
            {renderCTA('Begin Workout', 'main_narration', 2.2)}
          </motion.div>
        )}

        {currentScreen === 'main_narration' && (
          <motion.div key="main_narration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl leading-tight">Today is a turning point.</h2>
              <p className="opacity-60">The alarm stays active because the body hasn’t learned what ‘non-danger’ feels like yet.</p>
              <p className="text-xl font-serif italic">“Safety is felt — not thought.”</p>
              {renderCTA('Continue', 'body_before_mind')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'body_before_mind' && (
          <motion.div key="body_before_mind" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-12 w-full max-w-xs">
              <h2 className="font-serif italic text-3xl text-center">The body speaks first.</h2>
              <div className="space-y-6">
                {['Body reacts first', 'Mind interprets', 'Alarm escalates'].map((text, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 1.2 }} className="p-4 bg-accent/5 rounded-2xl text-center border border-accent/10">
                    {text}
                  </motion.div>
                ))}
              </div>
              <p className="text-xs italic opacity-50 text-center">“The mind interprets the body — not logic.”</p>
              {renderCTA('Continue', 'goal')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'goal' && (
          <motion.div key="goal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <p className="opacity-60">Today’s goal isn’t to calm thoughts. It’s to retrain the body’s baseline.</p>
              <div className="space-y-4">
                {['“This isn\'t danger.”', '“This sensation is allowed.”', '“No reaction is required.”'].map((text, i) => (
                  <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 1.5 }} className="text-2xl font-serif italic">{text}</motion.p>
                ))}
              </div>
              {renderCTA('Continue', 'evolution_context')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'evolution_context' && (
          <motion.div key="evolution_context" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-line/5">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="col-header">Why the body learns fast</h2>
              <p className="opacity-60">Your body learned to protect you long before thinking existed. Sudden sensations often meant action was required.</p>
              <p className="text-xl font-serif italic">“React first — think later.”</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Old rule. New world.</p>
              {renderCTA('Continue', 'modern_triggers')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'modern_triggers' && (
          <motion.div key="modern_triggers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="w-full max-w-xs space-y-8">
              <h2 className="col-header text-center">Modern Triggers</h2>
              <div className="grid grid-cols-2 gap-2">
                {['Caffeine', 'Dehydration', 'Hunger', 'Heat', 'Crowds', 'Silence', 'Stress', 'Relaxation'].map((item, i) => (
                  <motion.div key={item} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="p-3 bg-accent/5 rounded-xl text-center text-sm">
                    {item}
                  </motion.div>
                ))}
              </div>
              <p className="text-xs opacity-50 text-center italic">“The body doesn’t read context — it reads sensation.”</p>
              {renderCTA('Continue', 'misinterpretation_loop')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'misinterpretation_loop' && (
          <motion.div key="misinterpretation_loop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-12 max-w-xs">
              <div className="relative w-32 h-32 mx-auto">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-accent/20 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest opacity-40">Body Loop</div>
              </div>
              <div className="space-y-4">
                <p className="text-sm opacity-60">The mind reads the preparation as proof. Not because danger exists — but because the signal was misread.</p>
                <p className="font-bold">“Misinterpretation keeps the alarm alive.”</p>
              </div>
              {renderCTA('Continue', 'why_calm_fails')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'why_calm_fails' && (
          <motion.div key="why_calm_fails" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-ink text-bg">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Why “Calm Down” Fails</h2>
              <p className="opacity-60">If the body still feels unsafe, the mind reads: ‘If we’re calming down, something must be wrong.’</p>
              <div className="space-y-2">
                <p className="text-xl font-serif italic">“Safety is not instruction.”</p>
                <p className="text-xl font-serif italic">“Safety is experience.”</p>
              </div>
              {renderCTA('See Examples', 'example_heat')}
            </div>
          </motion.div>
        )}

        {/* Examples */}
        {currentScreen === 'example_heat' && (
          <motion.div key="example_heat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="col-header">Example: Heat</h2>
              <div className="space-y-4">
                {['Body warms up.', 'Mind recalls a past alarm.', 'Muscles tighten.', 'Heat increases.'].map((t, i) => (
                  <p key={i} className="text-sm opacity-60">{t}</p>
                ))}
              </div>
              <div className="pt-8 border-t border-line/10 space-y-2">
                <p className="text-sm font-serif italic">“The place was never the problem. The sensation was misread.”</p>
              </div>
              {renderCTA('Next', 'example_crowd')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_crowd' && (
          <motion.div key="example_crowd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="col-header">Example: Crowd</h2>
              <div className="space-y-4">
                {['Body notices compression.', 'Mind says: ‘We’re trapped.’', 'Chest tightens.', 'Breath shortens.'].map((t, i) => (
                  <p key={i} className="text-sm opacity-60">{t}</p>
                ))}
              </div>
              <div className="pt-8 border-t border-line/10 space-y-2">
                <p className="text-sm font-serif italic">“Compression was interpreted as danger.”</p>
              </div>
              {renderCTA('Next', 'example_stomach')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_stomach' && (
          <motion.div key="example_stomach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="col-header">Example: Stomach</h2>
              <div className="space-y-4">
                {['Body needed food or rest.', 'Mind labeled it alarm.', 'Fear added tension.', 'Tension increased sensation.'].map((t, i) => (
                  <p key={i} className="text-sm opacity-60">{t}</p>
                ))}
              </div>
              <div className="pt-8 border-t border-line/10 space-y-2">
                <p className="text-sm font-serif italic">“The first signal was neutral.”</p>
              </div>
              {renderCTA('Next', 'example_checking')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_checking' && (
          <motion.div key="example_checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="col-header">Example: Checking</h2>
              <div className="space-y-4">
                {['You check your body.', 'Heart. Breath. Balance.', 'Checking sends one message:', '“We are not safe yet.”'].map((t, i) => (
                  <p key={i} className="text-sm opacity-60">{t}</p>
                ))}
              </div>
              <p className="text-xs italic opacity-50">“Safety is delayed not because danger exists, but because reassurance is searched for instead of taught.”</p>
              {renderCTA('Continue', 'core_message')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'core_message' && (
          <motion.div key="core_message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-12 max-w-xs">
              <div className="space-y-6">
                <p className="text-2xl font-serif italic">“My body is allowed to feel sensations.”</p>
                <p className="text-2xl font-serif italic">“Sensations are information — not proof of danger.”</p>
              </div>
              <p className="text-sm opacity-60 italic">“Repeated non-reaction updates the system. The alarm triggers less easily.”</p>
              {renderCTA('Begin Training', 'transition_to_drills')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'transition_to_drills' && (
          <motion.div key="transition_to_drills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <Shield size={48} className="mx-auto text-accent opacity-20" />
              <h2 className="font-serif italic text-3xl">You’re re-educating a protective system that never learned this before.</h2>
              <p className="opacity-60 italic">“You’re not fixing anything.”</p>
              {renderCTA('Start Body Safety Training', 'd1_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 1: Name the Stack */}
        {currentScreen === 'd1_entry' && (
          <motion.div key="d1_entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Name the Stack</h2>
              <p className="text-xs uppercase tracking-widest opacity-40">Muscle: Pattern Deconstruction</p>
              <p className="opacity-60">Fear feels instant. It isn’t. Three layers fire in seconds.</p>
              <p className="text-sm font-bold">Sensation. Meaning. Identity.</p>
              {renderCTA('Start Drill', 'd1_r1_l2')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd1_r1_l2' && (
          <motion.div key="d1_r1_l2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-12">
              <p className="text-2xl font-serif italic">“Your heart rate jumps.”</p>
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest opacity-40">Tap what appears next automatically:</p>
                <div className="grid gap-3">
                  {[
                    { id: 'a', label: 'That’s a sensation', fb: 'That’s awareness — not the automatic pattern.' },
                    { id: 'b', label: 'Something is wrong', fb: 'That’s layer 2: Meaning.', correct: true },
                    { id: 'c', label: 'I’m going backwards', fb: 'That’s the collapse — not the first reaction.' }
                  ].map(opt => (
                    <button key={opt.id} onClick={() => { setD1Feedback(opt.fb); if (opt.correct) setTimeout(() => { setD1Feedback(null); setCurrentScreen('d1_r1_l3'); }, 1500); }} className="p-4 bg-line/20 rounded-2xl text-sm font-medium hover:bg-line/30 transition-colors">{opt.label}</button>
                  ))}
                </div>
              </div>
              {d1Feedback && <p className="text-xs italic text-accent">{d1Feedback}</p>}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd1_r1_l3' && (
          <motion.div key="d1_r1_l3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-12">
              <div className="space-y-2 opacity-40">
                <p className="text-sm">Sensation: Heart rate jumped</p>
                <p className="text-sm">Meaning: Something is wrong</p>
              </div>
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest opacity-40">What usually comes next?</p>
                <div className="grid gap-3">
                  {[
                    { id: 'a', label: 'This will pass' },
                    { id: 'b', label: 'I’m back to where I started', correct: true },
                    { id: 'c', label: 'It’s just caffeine' }
                  ].map(opt => (
                    <button key={opt.id} onClick={() => { if (opt.correct) setCurrentScreen('d1_lockin'); }} className="p-4 bg-line/20 rounded-2xl text-sm font-medium hover:bg-line/30 transition-colors">{opt.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'd1_lockin' && (
          <motion.div key="d1_lockin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <p className="text-lg">Sensation</p>
                <p className="text-lg">Meaning</p>
                <p className="text-lg">Identity</p>
              </div>
              <p className="text-2xl font-serif italic">“This is the stack.”</p>
              {renderCTA('Continue', 'd1_speed1')}
            </div>
          </motion.div>
        )}

        {/* Drill 1 Speed Rounds */}
        {[
          { id: 'd1_speed1', prompt: '“Chest tightness.”', q: 'What fires first?', opts: [{ l: 'Danger', c: true }, { l: 'Pressure' }, { l: 'This is happening again' }], next: 'd1_speed2' },
          { id: 'd1_speed2', prompt: '“Warm face.”', q: 'What fires first?', opts: [{ l: 'Embarrassment', c: true }, { l: 'Heat' }, { l: 'I’m losing control' }], next: 'd1_speed3' },
          { id: 'd1_speed3', prompt: '“Shallow breath.”', q: 'What fires first?', opts: [{ l: 'Danger', c: true }, { l: 'Air moving' }, { l: 'It’s happening again' }], next: 'd1_penny' }
        ].map(round => currentScreen === round.id && (
          <motion.div key={round.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="absolute top-12 left-0 right-0 flex justify-center"><div className="w-32 h-1 bg-line/20 rounded-full overflow-hidden"><motion.div initial={{ width: '100%' }} animate={{ width: 0 }} transition={{ duration: 6, ease: "linear" }} className="h-full bg-accent" /></div></div>
            <div className="text-center space-y-12">
              <p className="text-3xl font-serif italic">{round.prompt}</p>
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest opacity-40">{round.q}</p>
                <div className="grid gap-3">
                  {round.opts.map((opt, i) => (
                    <button key={i} onClick={() => { if (opt.c) setCurrentScreen(round.next as Screen); else setD1Feedback("Meaning fires fast."); }} className="p-4 bg-line/20 rounded-2xl text-sm font-medium">{opt.l}</button>
                  ))}
                </div>
              </div>
              {d1Feedback && <p className="text-xs italic text-accent">{d1Feedback}</p>}
            </div>
          </motion.div>
        ))}

        {currentScreen === 'd1_penny' && (
          <motion.div key="d1_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Activation is not regression.</h2>
              <p className="opacity-60">You separated sensation from meaning. That separation is control.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Rep Logged: Sensation Separation +1</p>
              {renderCTA('Next Drill', 'd2_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 2: Break the Regression Illusion */}
        {currentScreen === 'd2_entry' && (
          <motion.div key="d2_entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Break the Regression Illusion</h2>
              <p className="text-xs uppercase tracking-widest opacity-40">Muscle: Identity Stability</p>
              <p className="opacity-60">Patterns firing ≠ progress erased.</p>
              {renderCTA('Start', 'd2_exposure')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd2_exposure' && (
          <motion.div key="d2_exposure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-12 max-w-xs">
              <p className="text-lg opacity-60">“You felt steady for weeks.”</p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-2xl font-serif italic">“Today a strong sensation appears.”</motion.p>
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest opacity-40">What does the mind say?</p>
                <div className="grid gap-3">
                  <button onClick={() => setD2Tapped(prev => ({ ...prev, a: true }))} disabled={d2Tapped.a} className={`p-4 rounded-2xl text-sm transition-all ${d2Tapped.a ? 'opacity-20 bg-line/10' : 'bg-line/20'}`}>The past reactivated</button>
                  <button onClick={() => { if (d2Tapped.a && d2Tapped.c) setCurrentScreen('d2_rapid1'); }} disabled={!d2Tapped.a || !d2Tapped.c} className={`p-4 rounded-2xl text-sm transition-all ${d2Tapped.a && d2Tapped.c ? 'bg-accent text-bg shadow-lg' : 'opacity-20 bg-line/10'}`}>A body signal appeared</button>
                  <button onClick={() => setD2Tapped(prev => ({ ...prev, c: true }))} disabled={d2Tapped.c} className={`p-4 rounded-2xl text-sm transition-all ${d2Tapped.c ? 'opacity-20 bg-line/10' : 'bg-line/20'}`}>I failed</button>
                </div>
              </div>
              {d2Tapped.a && !d2Tapped.c && <p className="text-xs italic opacity-40">“That’s the illusion.”</p>}
              {d2Tapped.c && <p className="text-xs italic opacity-40">“That’s collapse language.”</p>}
            </div>
          </motion.div>
        )}

        {/* Drill 2 Rapid Rounds */}
        {[
          { id: 'd2_rapid1', p: '“Sensation appears after calm week.”', opts: [{ l: 'Pattern firing', c: true }, { l: 'Progress erased' }], fb: 'Patterns can fire during progress.', next: 'd2_rapid2' },
          { id: 'd2_rapid2', p: '“Strong sensation after a good month.”', opts: [{ l: 'Regression' }, { l: 'Temporary activation', c: true }], fb: 'Activation is not identity.', next: 'd2_rapid3' },
          { id: 'd2_rapid3', p: '“Old memory triggered by body signal.”', opts: [{ l: 'I’m back' }, { l: 'Association activated', c: true }], fb: 'Associations are not reversals.', next: 'd2_rapid4' },
          { id: 'd2_rapid4', p: '“Unexpected intensity during rest.”', opts: [{ l: 'Something broke' }, { l: 'Body fluctuation', c: true }], fb: 'Fluctuation is normal.', next: 'd2_lockin' }
        ].map(round => currentScreen === round.id && (
          <motion.div key={round.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
             <div className="absolute top-12 left-0 right-0 flex justify-center"><div className="w-32 h-1 bg-line/20 rounded-full overflow-hidden"><motion.div initial={{ width: '100%' }} animate={{ width: 0 }} transition={{ duration: 5, ease: "linear" }} className="h-full bg-accent" /></div></div>
             <div className="text-center space-y-12">
               <p className="text-2xl font-serif italic">{round.p}</p>
               <div className="grid gap-3">
                 {round.opts.map((opt, i) => (
                   <button key={i} onClick={() => { if (opt.c) setCurrentScreen(round.next as Screen); else setD2Feedback(round.fb); }} className="p-4 bg-line/20 rounded-2xl text-sm font-medium">{opt.l}</button>
                 ))}
               </div>
               {d2Feedback && <p className="text-xs italic text-accent">{d2Feedback}</p>}
             </div>
          </motion.div>
        ))}

        {currentScreen === 'd2_lockin' && (
          <motion.div key="d2_lockin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-xs">
              <p className="text-xl font-serif italic">“Progress doesn’t disappear.”</p>
              <p className="text-xl font-serif italic">“Patterns can fire during progress.”</p>
              <p className="text-xl font-serif italic">“Those are not opposites.”</p>
              {renderCTA('Continue', 'd2_penny')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd2_penny' && (
          <motion.div key="d2_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Activation is not regression.</h2>
              <p className="opacity-60">You separated sensation from meaning. That separation is control.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Rep Logged: Sensation Separation +1</p>
              {renderCTA('Next Drill', 'd3_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 3: Hold Position */}
        {currentScreen === 'd3_entry' && (
          <motion.div key="d3_entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Hold Position</h2>
              <p className="text-xs uppercase tracking-widest opacity-40">Muscle: Non-Interference Tolerance</p>
              <p className="opacity-60">When sensation appears, the body waits for instruction.</p>
              {renderCTA('Start', 'd3_hold1')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_hold1' && (
          <motion.div key="d3_hold1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="absolute top-12 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-4 border-line/10 flex items-center justify-center relative">
                <motion.div initial={{ pathLength: 1 }} animate={{ pathLength: 0 }} transition={{ duration: 10, ease: "linear" }} className="absolute inset-0 border-4 border-accent rounded-full" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
                <span className="font-mono text-xl">{d3Timer}</span>
              </div>
            </div>
            <div className="text-center space-y-12 w-full max-w-xs">
              <p className="text-2xl font-serif italic">“Bring attention to a mild sensation.”</p>
              <div className="grid grid-cols-3 gap-4">
                {['Fix', 'Check', 'Leave It'].map(btn => (
                  <button key={btn} onClick={() => { if (btn === 'Leave It') return; setD3Status(btn === 'Fix' ? "Reaction reinforces the pattern." : "Monitoring keeps the loop active."); setD3Timer(10); }} className="p-4 bg-line/20 rounded-2xl text-xs font-bold uppercase tracking-widest">{btn}</button>
                ))}
              </div>
              {d3Status && <p className="text-xs italic text-accent">{d3Status}</p>}
              {d3Timer === 0 && renderCTA('Continue', 'd3_hold2')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_hold2' && (
          <motion.div key="d3_hold2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent/5">
            <div className="absolute top-12 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-4 border-line/10 flex items-center justify-center relative">
                <motion.div initial={{ pathLength: 1 }} animate={{ pathLength: 0 }} transition={{ duration: 15, ease: "linear" }} className="absolute inset-0 border-4 border-accent rounded-full" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
                <span className="font-mono text-xl">{d3Timer}</span>
              </div>
            </div>
            <div className="text-center space-y-12 w-full max-w-xs">
              <p className="text-2xl font-serif italic">“Stay again.”</p>
              <div className="grid grid-cols-3 gap-4">
                {['Fix', 'Check', 'Leave It'].map(btn => (
                  <button key={btn} onClick={() => { if (btn === 'Leave It') return; setD3Status(btn === 'Fix' ? "Reaction reinforces the pattern." : "Monitoring keeps the loop active."); setD3Timer(15); }} className="p-4 bg-line/20 rounded-2xl text-xs font-bold uppercase tracking-widest">{btn}</button>
                ))}
              </div>
              {d3Status && <p className="text-xs italic text-accent">{d3Status}</p>}
              {d3Timer === 0 && renderCTA('Continue', 'd3_lockin')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_lockin' && (
          <motion.div key="d3_lockin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-xs">
              <p className="text-xl font-serif italic">“You didn’t remove sensation.”</p>
              <p className="text-xl font-serif italic">“You removed reaction.”</p>
              <p className="text-xl font-serif italic">“That’s how safety is learned.”</p>
              {renderCTA('Continue', 'd3_penny')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_penny' && (
          <motion.div key="d3_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Activation is not regression.</h2>
              <p className="opacity-60">You separated sensation from meaning. That separation is control.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Rep Logged: Sensation Separation +1</p>
              {renderCTA('Finish Drills', 'drills_complete')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'drills_complete' && (
          <motion.div key="drills_complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-4xl">You trained three muscles today:</h2>
              <div className="space-y-2 text-left">
                {['Separating layers', 'Breaking regression illusion', 'Holding without reacting'].map(t => (
                  <div key={t} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" /><span className="text-sm">{t}</span></div>
                ))}
              </div>
              <p className="text-xs italic opacity-40">“That’s cognitive strength.”</p>
              {renderCTA('Muscle Summary', 'muscle_summary')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'muscle_summary' && (
          <motion.div key="muscle_summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-12 w-full max-w-xs">
              <h2 className="font-serif italic text-4xl">Muscles Activated</h2>
              <div className="space-y-6">
                {['Sensation Separation', 'Non-Reactivity'].map((text, i) => (
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
          <motion.div key="closing_transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-orange-50/10 to-bg">
            <div className="text-center space-y-6">
              <h2 className="font-serif italic text-4xl">✨ What Just Changed</h2>
              {renderCTA('Continue', 'closing_core')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_core' && (
          <motion.div key="closing_core" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-xs">
              {[
                "You didn’t calm your body today.",
                "You taught it something new.",
                "That sensations can exist...",
                "without danger following.",
                "That’s how safety is learned."
              ].map((text, i) => (
                <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 1.4 }} className="text-lg opacity-60">
                  {text}
                </motion.p>
              ))}
              {renderCTA('Continue', 'closing_insight', 7)}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_insight' && (
          <motion.div key="closing_insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8 max-w-xs">
              <p className="text-2xl font-serif italic">“Fear survives on reaction.”</p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-2xl font-serif italic">“Safety appears when reaction reduces.”</motion.p>
              {renderCTA('Continue', 'closing_transfer')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_transfer' && (
          <motion.div key="closing_transfer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-xs">
              <p className="text-sm opacity-60">Later today, something may appear. A sensation. A moment. A familiar signal.</p>
              <p className="text-lg font-serif italic">“You don’t need to solve it. You don’t need to fix it. Let it exist.”</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">That’s the new instruction.</p>
              {renderCTA('Continue', 'closing_forward_look')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_forward_look' && (
          <motion.div key="closing_forward_look" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8 max-w-xs">
              <p className="opacity-60">Next, you’ll learn how the mind restarts fear through thinking. And how to stop it before it hijacks the day.</p>
              <p className="text-xs italic opacity-30">“If you want a neutral reset point, Return To Now is always available from Home.”</p>
              {renderCTA('Reflect on Today', 'journal')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'journal' && (
          <motion.div key="journal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-8">
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8">
              <div className="space-y-2 text-center">
                <p className="col-header">Training Log — Workout 3</p>
                <h2 className="font-serif italic text-3xl">What sensation did you allow today without reacting to it?</h2>
                <p className="text-xs opacity-40 uppercase tracking-widest">No explanation needed.</p>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 p-4 bg-line/20 rounded-2xl flex flex-col items-center gap-2 opacity-50"><MessageSquare size={20} /><span className="text-xs">Type</span></button>
                <button 
                  onClick={startListening}
                  className={`flex-1 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-line/20 hover:bg-line/30'}`}
                >
                  <Mic size={20} />
                  <span className="text-xs">{isListening ? 'Listening...' : 'Voice'}</span>
                </button>
              </div>
              <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} className="w-full h-32 bg-line/10 rounded-2xl p-4 outline-none focus:ring-1 ring-accent/20 transition-all resize-none" placeholder="Your reflection..." />
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest opacity-40">Add tags:</p>
                <div className="flex flex-wrap gap-2">
                  {['Body', 'Thought', 'Situation', 'Unknown'].map(tag => (
                    <button key={tag} onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} className={`px-4 py-2 rounded-full text-xs transition-all ${selectedTags.includes(tag) ? 'bg-accent text-bg' : 'bg-line/20'}`}>{tag}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => setCurrentScreen('journal_confirm')} className="bg-accent text-bg py-4 rounded-full font-medium">Save Reflection</button>
              <button onClick={() => setCurrentScreen('skill_reps_entry')} className="text-xs opacity-40 uppercase tracking-widest text-center">Skip for Now</button>
            </div>
          </motion.div>
        )}

        {currentScreen === 'journal_confirm' && (
          <motion.div key="journal_confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-full mx-auto flex items-center justify-center"><CheckCircle2 size={32} /></div>
              <div className="space-y-2">
                <h2 className="font-serif italic text-3xl">This moment is saved.</h2>
                <p className="opacity-60">Entry stored.</p>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={() => setCurrentScreen('skill_reps_entry')} className="bg-accent text-bg px-12 py-4 rounded-full font-medium">Continue to Skill Reps</button>
                <button onClick={onComplete} className="text-xs uppercase tracking-widest opacity-40">Return Home</button>
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'skill_reps_entry' && (
          <motion.div key="skill_reps_entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-xs">
              {[
                "You’ve trained the body.",
                "Now train the mislabel.",
                "The body isn’t the problem — the prediction is.",
                "These are not calming exercises.",
                "They are perception training."
              ].map((text, i) => (
                <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 1.4 }} className="text-lg opacity-60">
                  {text}
                </motion.p>
              ))}
              {renderCTA('Start Skill Reps', 'complete', 7)}
            </div>
          </motion.div>
        )}

        {currentScreen === 'complete' && (
          <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-12 max-w-xs">
              <div className="space-y-4">
                <h2 className="font-serif italic text-4xl">Nothing dangerous happened.</h2>
                <p className="opacity-60">Your mind predicted it would. You saw the gap. That gap is power.</p>
              </div>
              <p className="text-2xl font-serif italic">“This is how fear weakens.”</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Workout completion logs on button tap.</p>
              <button onClick={onComplete} className="bg-accent text-bg px-12 py-4 rounded-full font-medium hover:scale-105 transition-all">Finish Training</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
