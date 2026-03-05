import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Brain, ArrowLeft, Home, Menu, X, CheckCircle2, Activity, Shield, Zap, Eye, Lock, Play, MessageSquare, Mic, Tag, Cloud, Wind, Scissors, Timer, ChevronRight } from 'lucide-react';
import { User, UserState } from '../types';

interface Workout4Props {
  user: User;
  userState: UserState;
  onComplete: () => void;
  onBack: () => void;
  onNowClick: () => void;
  refreshState: () => void;
}

type Screen = 
  | 'entry' | 'main_narration' | 'core_definition' | 'protective_logic' 
  | 'attention_misread' | 'noise_escalation' | 'loss_of_control' 
  | 'examples_intro' | 'example_text' | 'example_replay' | 'example_future'
  | 'why_thinking_fails' | 'core_shift' | 'transition_to_drills'
  | 'd1_entry' | 'd1_split' | 'd1_lockin' | 'd1_penny'
  | 'd2_entry' | 'd2_prompt' | 'd2_wait' | 'd2_result' | 'd2_lockin' | 'd2_penny'
  | 'd3_entry' | 'd3_generator' | 'd3_cut' | 'd3_open_hold' | 'd3_result' | 'd3_lockin' | 'd3_penny'
  | 'drills_complete' | 'muscle_summary' | 'closing_transition' | 'closing_main' | 'closing_insight' 
  | 'closing_transfer' | 'journal' | 'journal_confirm' | 'skill_reps_entry' | 'complete';

export default function Workout4({ user, userState, onComplete, onBack, onNowClick, refreshState }: Workout4Props) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('entry');
  const [showSections, setShowSections] = useState(false);
  
  // Drill 1 state
  const [d1HoldTime, setD1HoldTime] = useState(0);
  const [d1IsHolding, setD1IsHolding] = useState(false);
  const d1IntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Drill 2 state
  const [d2Delay, setD2Delay] = useState(0);
  const [d2WaitTime, setD2WaitTime] = useState(0);

  // Drill 3 state
  const [d3Text, setD3Text] = useState("");
  const [d3Phase, setD3Phase] = useState(0); // 0: typing, 1: wait, 2: continue typing, 3: cut ready, 4: cut done
  const fullText = "What if this means that I should have done something else?";

  // Journal state
  const [journalData, setJournalData] = useState({
    thought: "",
    label: "",
    instead: ""
  });
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
      // For Workout4, we have multiple fields. We'll append to the "thought" field by default or whichever is focused.
      // For simplicity, let's append to the first empty field or the "thought" field.
      setJournalData(prev => ({
        ...prev,
        thought: prev.thought + (prev.thought ? " " : "") + speechToText
      }));
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
    { id: 'core_definition', label: 'What is Overthinking', group: 'Theory' },
    { id: 'attention_misread', label: 'The Core Mistake', group: 'Theory' },
    { id: 'd1_entry', label: 'Drill 1: Starve the Noise', group: 'Drills' },
    { id: 'd2_entry', label: 'Drill 2: Urgency Breaker', group: 'Drills' },
    { id: 'd3_entry', label: 'Drill 3: Cut the Loop', group: 'Drills' },
    { id: 'muscle_summary', label: 'Summary', group: 'Review' },
  ];

  useEffect(() => {
    if (currentScreen === 'd1_penny') {
      logRep('Attention Control', 'workout4.d1_completed_at');
    } else if (currentScreen === 'd2_penny') {
      logRep('Urgency Resistance', 'workout4.d2_completed_at');
    } else if (currentScreen === 'd3_penny') {
      logRep('Completion Tolerance', 'workout4.d3_completed_at');
    }
  }, [currentScreen]);
  const DRILL_SCREENS = ['d1_split', 'd2_prompt', 'd2_wait', 'd3_generator', 'd3_cut', 'd3_open_hold'];
  const isDrill = DRILL_SCREENS.includes(currentScreen);

  const logRep = async (muscleKey: string, trackingKey: string) => {
    await fetch('/api/log-rep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, muscleKey, trackingKey })
    });
    refreshState();
  };

  // Drill 1 Logic
  useEffect(() => {
    if (d1IsHolding) {
      d1IntervalRef.current = setInterval(() => {
        setD1HoldTime(prev => {
          if (prev >= 4) {
            clearInterval(d1IntervalRef.current!);
            return 4;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (d1IntervalRef.current) clearInterval(d1IntervalRef.current);
      if (d1HoldTime < 4) setD1HoldTime(0);
    }
    return () => { if (d1IntervalRef.current) clearInterval(d1IntervalRef.current); };
  }, [d1IsHolding]);

  // Drill 2 Logic
  useEffect(() => {
    if (currentScreen === 'd2_wait') {
      setD2WaitTime(0);
      const interval = setInterval(() => {
        setD2WaitTime(prev => {
          if (prev >= 10) {
            clearInterval(interval);
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

  // Drill 3 Logic
  useEffect(() => {
    if (currentScreen === 'd3_generator') {
      let i = 0;
      const target = "What if this means that I...";
      const interval = setInterval(() => {
        setD3Text(target.substring(0, i));
        i++;
        if (i > target.length) {
          clearInterval(interval);
          setTimeout(() => setCurrentScreen('d3_cut'), 1500);
        }
      }, 80);
      return () => clearInterval(interval);
    }
    if (currentScreen === 'd3_cut') {
      let i = "What if this means that I...".length;
      const interval = setInterval(() => {
        setD3Text(fullText.substring(0, i));
        i++;
        if (i > fullText.length) clearInterval(interval);
      }, 100);
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
    <div className="fixed inset-0 bg-bg z-50 overflow-hidden flex flex-col font-sans text-ink">
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
            className="flex-1 relative flex flex-col items-center overflow-hidden bg-gradient-to-b from-blue-50/20 to-bg"
          >
            {renderNav()}
            
            {/* Centered Animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative h-32 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} className="absolute text-accent/10"><Cloud size={120} /></motion.div>
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 4, repeat: Infinity }} className="w-16 h-16 bg-accent/5 rounded-full blur-xl" />
              </div>
            </div>

            {/* Bottom Text */}
            <div className="absolute top-[62%] w-full px-8 text-center">
              <div className="h-32 flex flex-col justify-center space-y-4">
                <p className="font-serif italic text-2xl">“The mind doesn’t get loud by accident.”</p>
                <p className="font-serif italic text-2xl">“Noise is a signal.”</p>
                <p className="text-sm opacity-50">Today, you learn why it happens.</p>
              </div>
              <p className="text-[10px] uppercase tracking-widest opacity-30 mt-4">Workout start — muscles load in 2 seconds.</p>
            </div>
            {renderCTA('Begin Workout', 'main_narration', 2.2)}
          </motion.div>
        )}

        {currentScreen === 'main_narration' && (
          <motion.div key="main_narration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl leading-tight">Overthinking isn’t intelligence.</h2>
              <p className="opacity-60">It’s protection running without a clear target. This isn’t about fixing thoughts. It’s about training where attention goes.</p>
              <p className="text-xl font-serif italic">“Noise is attention without direction.”</p>
              {renderCTA('Continue', 'core_definition')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'core_definition' && (
          <motion.div key="core_definition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-12 w-full max-w-xs">
              <h2 className="font-serif italic text-3xl text-center">What it actually is.</h2>
              <div className="space-y-6">
                {['Attention locks', 'Thoughts repeat', 'Noise increases'].map((text, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.8 }} className="p-4 bg-accent/5 rounded-2xl text-center border border-accent/10">
                    {text}
                  </motion.div>
                ))}
              </div>
              <p className="text-xs italic opacity-50 text-center">“Overthinking isn’t too many thoughts. It’s the same thoughts being revisited.”</p>
              {renderCTA('Continue', 'protective_logic')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'protective_logic' && (
          <motion.div key="protective_logic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="col-header">Protective Logic</h2>
              <p className="opacity-60">Your system follows a simple rule: ‘If attention keeps returning here, this must matter.’</p>
              <p className="text-xl font-serif italic">“Attention is treated as importance.”</p>
              {renderCTA('Continue', 'attention_misread')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'attention_misread' && (
          <motion.div key="attention_misread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-12 max-w-xs">
              <div className="flex items-center justify-center gap-8">
                <span className="text-lg font-medium">Attention</span>
                <motion.div initial={{ width: 0 }} animate={{ width: 40 }} transition={{ delay: 0.5 }} className="h-px bg-ink/20" />
                <span className="text-lg font-medium">Danger</span>
              </div>
              <div className="space-y-4">
                <p className="text-2xl font-serif italic">“Attention ≠ Danger”</p>
                <p className="text-sm opacity-60">The system confuses attention with danger. Focus does not mean threat.</p>
              </div>
              {renderCTA('Continue', 'noise_escalation')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'noise_escalation' && (
          <motion.div key="noise_escalation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="w-full max-w-xs space-y-12 relative h-64 flex flex-col items-center justify-center">
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: [0, 1, 0], x: [ -20, 20 ] }} transition={{ duration: 4, delay: i * 1, repeat: Infinity }} className="absolute text-xs opacity-20 italic">Thought fragment...</motion.div>
              ))}
              <div className="text-center space-y-4 z-10">
                <p className="text-sm opacity-60">When attention doesn’t release, thoughts don’t resolve — they replay.</p>
                <p className="font-bold">“Urgency is a sensation created by repetition.”</p>
              </div>
            </div>
            {renderCTA('Continue', 'loss_of_control')}
          </motion.div>
        )}

        {currentScreen === 'loss_of_control' && (
          <motion.div key="loss_of_control" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Why it feels uncontrollable.</h2>
              <p className="opacity-60">The system isn’t searching for answers. It’s keeping attention active — just in case.</p>
              <p className="text-xl font-serif italic">“Noise is unresolved attention.”</p>
              {renderCTA('See Examples', 'examples_intro')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'examples_intro' && (
          <motion.div key="examples_intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <p className="text-lg font-serif italic">“This is how noise starts in everyday moments.”</p>
              {renderCTA('Next', 'example_text')}
            </div>
          </motion.div>
        )}

        {/* Examples */}
        {currentScreen === 'example_text' && (
          <motion.div key="example_text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="col-header">Example: Text Message</h2>
              <div className="space-y-4">
                {['A message hasn’t been answered.', 'Attention stays on the silence.', 'Thoughts repeat.', 'Noise builds.'].map((t, i) => (
                  <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }} className="text-sm opacity-60">{t}</motion.p>
                ))}
              </div>
              <div className="pt-8 border-t border-line/10">
                <p className="text-sm font-serif italic">“Nothing required action.”</p>
              </div>
              {renderCTA('Next', 'example_replay')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_replay' && (
          <motion.div key="example_replay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="col-header">Example: Replay</h2>
              <div className="space-y-4">
                {['A conversation ends.', 'Attention returns hours later.', 'Thoughts replay.', 'Noise increases.'].map((t, i) => (
                  <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }} className="text-sm opacity-60">{t}</motion.p>
                ))}
              </div>
              <div className="pt-8 border-t border-line/10">
                <p className="text-sm font-serif italic">“The moment had passed.”</p>
              </div>
              {renderCTA('Next', 'example_future')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_future' && (
          <motion.div key="example_future" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="col-header">Example: Future Scanning</h2>
              <div className="space-y-4">
                {['A future event appears.', 'Attention stays on imagined outcomes.', 'Thoughts multiply.'].map((t, i) => (
                  <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }} className="text-sm opacity-60">{t}</motion.p>
                ))}
              </div>
              <div className="pt-8 border-t border-line/10">
                <p className="text-sm font-serif italic">“No outcome had arrived.”</p>
              </div>
              {renderCTA('Continue', 'why_thinking_fails')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'why_thinking_fails' && (
          <motion.div key="why_thinking_fails" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-ink text-bg">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">What doesn’t work.</h2>
              <p className="opacity-60">Trying to think your way out of noise keeps attention exactly where it is.</p>
              <p className="text-xl font-serif italic">“More thinking feeds the loop.”</p>
              {renderCTA('Continue', 'core_shift')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'core_shift' && (
          <motion.div key="core_shift" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-12 max-w-xs">
              <div className="space-y-4">
                <p className="text-2xl font-serif italic">“Noise fades when attention disengages.”</p>
                <div className="space-y-2 opacity-60 text-sm">
                  <p>Not by force.</p>
                  <p>Not by answers.</p>
                  <p>By removing fuel.</p>
                </div>
              </div>
              {renderCTA('Continue', 'transition_to_drills')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'transition_to_drills' && (
          <motion.div key="transition_to_drills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <Wind size={48} className="mx-auto text-accent opacity-20" />
              <h2 className="font-serif italic text-3xl">You’re not solving thoughts. You’re training attention under noise.</h2>
              <p className="opacity-60 italic">“Now you train the attention mechanics.”</p>
              {renderCTA('Start Attention Training', 'd1_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 1: Starve the Noise */}
        {currentScreen === 'd1_entry' && (
          <motion.div key="d1_entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Starve the Noise</h2>
              <p className="text-xs uppercase tracking-widest opacity-40">Muscle: Attention Fuel Control</p>
              <p className="opacity-60">Overthinking only runs while you feed it. Where attention goes — noise grows.</p>
              {renderCTA('Start', 'd1_split')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd1_split' && (
          <motion.div key="d1_split" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-row">
            <div className="flex-1 bg-line/5 flex flex-col items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
                {['Think about this.', 'Don’t ignore this.', 'This matters.', 'You should solve this.'].map((t, i) => (
                  <motion.p 
                    key={i} 
                    animate={{ 
                      x: d1IsHolding ? [0, 5, -5, 0] : [ -100, 100 ],
                      opacity: d1IsHolding ? 0.1 : 0.4,
                      scale: d1IsHolding ? 0.9 : 1
                    }} 
                    transition={{ 
                      x: { duration: d1IsHolding ? 8 : 12, repeat: Infinity, ease: "linear", delay: i * 2 },
                      opacity: { duration: 0.5 }
                    }} 
                    className="text-lg italic whitespace-nowrap"
                  >
                    {t}
                  </motion.p>
                ))}
              </div>
            </div>
            <div 
              className={`flex-1 flex flex-col items-center justify-center p-8 transition-colors ${d1IsHolding ? 'bg-accent/10' : 'bg-bg'}`}
              onMouseDown={() => setD1IsHolding(true)}
              onMouseUp={() => setD1IsHolding(false)}
              onTouchStart={() => setD1IsHolding(true)}
              onTouchEnd={() => setD1IsHolding(false)}
            >
              <div className="text-center space-y-4">
                <p className="text-[10px] uppercase tracking-widest opacity-40">Quiet Zone</p>
                <p className="text-sm font-medium">Press and hold here</p>
                <div className="w-32 h-1 bg-line/20 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${(d1HoldTime / 4) * 100}%` }} className="h-full bg-accent" />
                </div>
              </div>
              {d1HoldTime >= 4 && renderCTA('Continue', 'd1_lockin')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd1_lockin' && (
          <motion.div key="d1_lockin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-6">
              <p className="text-2xl font-serif italic">“You didn’t stop thoughts. You stopped feeding them.”</p>
              <p className="text-sm opacity-60">Noise runs when it’s fed.</p>
              {renderCTA('Continue', 'd1_penny')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd1_penny' && (
          <motion.div key="d1_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Noise runs on attention.</h2>
              <p className="opacity-60">You didn’t stop thoughts. You removed fuel.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Rep Logged: Attention Control +1</p>
              {renderCTA('Next Drill', 'd2_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 2: Urgency Breaker */}
        {currentScreen === 'd2_entry' && (
          <motion.div key="d2_entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Urgency Breaker</h2>
              <p className="text-xs uppercase tracking-widest opacity-40">Muscle: Delay Authority</p>
              <p className="opacity-60">Force urgency to wait — and watch it collapse. Urgency is a feeling — not a fact.</p>
              {renderCTA('Start', 'd2_prompt')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd2_prompt' && (
          <motion.div key="d2_prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-xs space-y-12">
              <div className="p-8 bg-accent/5 rounded-3xl border border-accent/10 text-center">
                <p className="text-xl font-serif italic">“This needs thinking about — now.”</p>
              </div>
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-widest opacity-40 text-center">Set a delay:</p>
                <input 
                  type="range" min="0" max="10" step="1" value={d2Delay} 
                  onChange={(e) => setD2Delay(parseInt(e.target.value))}
                  className="w-full h-2 bg-line/20 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-40">
                  <span>Now</span>
                  <span>5s</span>
                  <span>10s</span>
                </div>
              </div>
              {d2Delay === 10 && renderCTA('Wait', 'd2_wait')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd2_wait' && (
          <motion.div key="d2_wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-6xl opacity-20">Wait.</h2>
              <div className="w-32 h-1 bg-line/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 10, ease: "linear" }} className="h-full bg-accent" />
              </div>
              {d2WaitTime >= 10 && renderCTA('Result Check', 'd2_result')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd2_result' && (
          <motion.div key="d2_result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-xs">
              <p className="text-lg opacity-60">“The urgency promised something.”</p>
              <p className="text-2xl font-serif italic">“Nothing arrived.”</p>
              <p className="text-sm font-medium pt-4">That’s attention control under pressure.</p>
              {renderCTA('Continue', 'd2_lockin')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd2_lockin' && (
          <motion.div key="d2_lockin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-6">
              <p className="text-2xl font-serif italic">“Urgency is not intelligence. It’s pressure.”</p>
              {renderCTA('Continue', 'd2_penny')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd2_penny' && (
          <motion.div key="d2_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Delay breaks authority.</h2>
              <p className="opacity-60">Urgency promised consequences. Nothing arrived.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Rep Logged: Urgency Resistance +1</p>
              {renderCTA('Next Drill', 'd3_entry')}
            </div>
          </motion.div>
        )}

        {/* Drill 3: Cut the Loop Mid-Sentence */}
        {currentScreen === 'd3_entry' && (
          <motion.div key="d3_entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Cut the Loop</h2>
              <p className="text-xs uppercase tracking-widest opacity-40">Muscle: Completion Resistance</p>
              <p className="opacity-60">Overthinking survives by finishing thoughts. This drill trains leaving thoughts unfinished.</p>
              {renderCTA('Start', 'd3_generator')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_generator' && (
          <motion.div key="d3_generator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-xs text-center space-y-12">
              <p className="text-[10px] uppercase tracking-widest opacity-40">Wait.</p>
              <div className="p-8 bg-accent/5 rounded-3xl border border-accent/10 min-h-[120px] flex items-center justify-center">
                <p className="text-xl font-serif italic">{d3Text}<motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-0.5 h-6 bg-accent ml-1 align-middle" /></p>
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_cut' && (
          <motion.div key="d3_cut" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-xs text-center space-y-12">
              <p className="text-xs font-bold text-accent uppercase tracking-widest">Do not finish it.</p>
              <div className="p-8 bg-accent/5 rounded-3xl border border-accent/10 min-h-[120px] flex items-center justify-center">
                <p className="text-xl font-serif italic">{d3Text}<motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-0.5 h-6 bg-accent ml-1 align-middle" /></p>
              </div>
              <div className="space-y-4">
                <p className="text-xs opacity-40">Tap CUT before the thought completes.</p>
                <button onClick={() => setCurrentScreen('d3_open_hold')} className="bg-ink text-bg px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest">Cut Here</button>
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_open_hold' && (
          <motion.div key="d3_open_hold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-xs text-center space-y-12">
              <motion.div animate={{ scale: 0.95 }} className="p-8 bg-accent/5 rounded-3xl border border-accent/10 min-h-[120px] flex items-center justify-center opacity-40">
                <p className="text-xl font-serif italic">{d3Text.substring(0, d3Text.length - 10)}—</p>
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-lg font-serif italic">“Leave it unfinished.”</motion.p>
              <div className="w-32 h-1 bg-line/10 mx-auto rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 4, ease: "linear" }} onAnimationComplete={() => setCurrentScreen('d3_result')} className="h-full bg-accent" />
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_result' && (
          <motion.div key="d3_result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-xs">
              <p className="text-lg opacity-60">“The thought didn’t finish.”</p>
              <p className="text-lg opacity-60">“Nothing bad happened.”</p>
              <p className="text-2xl font-serif italic pt-4">“Completion was never required.”</p>
              {renderCTA('Continue', 'd3_lockin')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_lockin' && (
          <motion.div key="d3_lockin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-6">
              <p className="text-2xl font-serif italic">“Thoughts don't need endings. They need less authority.”</p>
              {renderCTA('Continue', 'd3_penny')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_penny' && (
          <motion.div key="d3_penny" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Nothing required an ending.</h2>
              <p className="opacity-60">The thought stayed unfinished. You didn’t complete it.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Rep Logged: Completion Tolerance +1</p>
              {renderCTA('Finish Drills', 'drills_complete')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'drills_complete' && (
          <motion.div key="drills_complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-4xl">You trained three skills today:</h2>
              <div className="space-y-4 text-left">
                {['You starved attention.', 'You broke urgency.', 'You denied completion.'].map(t => (
                  <div key={t} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" /><span className="text-sm">{t}</span></div>
                ))}
              </div>
              <div className="pt-8 space-y-2">
                <p className="text-sm opacity-60">Overthinking runs on habits. You just interrupted all three.</p>
                <p className="text-xs italic opacity-40">“That’s cognitive strength under pressure.”</p>
              </div>
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
                {['Attention Control', 'Urgency Resistance', 'Completion Tolerance', 'Cognitive Distance'].map((text, i) => (
                  <motion.div key={text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.4 }} className="flex items-center gap-4">
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
          <motion.div key="closing_transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50/10 to-bg">
            <div className="text-center space-y-6">
              <h2 className="font-serif italic text-4xl">✨ What Just Changed</h2>
              <p className="opacity-60">The system no longer runs your attention automatically.</p>
              {renderCTA('Continue', 'closing_main')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_main' && (
          <motion.div key="closing_main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-xs">
              {[
                "You didn’t stop thoughts today.",
                "You stopped obeying them.",
                "You noticed the moment your system tried to take control...",
                "And you interrupted it — before it turned into noise.",
                "When a thought lost urgency, you didn’t solve it.",
                "You removed its authority.",
                "That’s how overthinking weakens."
              ].map((text, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 1.4 }} className="text-lg opacity-60">
                  {text}
                </motion.p>
              ))}
              {renderCTA('Continue', 'closing_insight', 10)}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_insight' && (
          <motion.div key="closing_insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8 max-w-xs">
              <p className="text-2xl font-serif italic">“Thoughts only control you”</p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-2xl font-serif italic">“when you treat them as instructions.”</motion.p>
              {renderCTA('Continue', 'closing_transfer')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_transfer' && (
          <motion.div key="closing_transfer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-xs">
              <p className="text-sm opacity-60">Later today, a thought will appear. It will sound urgent. It will ask for attention.</p>
              <p className="text-lg font-serif italic">“When that happens — do not engage. Label it. Delay it. Return.”</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">That interruption is the training.</p>
              {renderCTA('Reflect on Today', 'journal')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'journal' && (
          <motion.div key="journal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="max-w-md mx-auto w-full space-y-12 py-12">
              <div className="space-y-2 text-center">
                <p className="col-header">Reflect on Today</p>
                <h2 className="font-serif italic text-3xl">Complete these three lines:</h2>
                <p className="text-[10px] uppercase tracking-widest opacity-40">No explanation. No analysis. Just the interruption.</p>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">1. The thought that appeared:</label>
                  <input 
                    type="text" value={journalData.thought} 
                    onChange={(e) => setJournalData(prev => ({ ...prev, thought: e.target.value }))}
                    placeholder="What if..."
                    className="w-full bg-accent/5 rounded-2xl p-4 outline-none focus:ring-1 ring-accent/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">2. How I labeled it:</label>
                  <input 
                    type="text" value={journalData.label} 
                    onChange={(e) => setJournalData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Overthinking / Future noise / Mental replay"
                    className="w-full bg-accent/5 rounded-2xl p-4 outline-none focus:ring-1 ring-accent/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">3. What I did instead:</label>
                  <input 
                    type="text" value={journalData.instead} 
                    onChange={(e) => setJournalData(prev => ({ ...prev, instead: e.target.value }))}
                    placeholder="Returned to task / Stayed present / Did nothing"
                    className="w-full bg-accent/5 rounded-2xl p-4 outline-none focus:ring-1 ring-accent/20 transition-all"
                  />
                </div>
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

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest opacity-40">Tag if useful — or skip:</p>
                <div className="flex flex-wrap gap-2">
                  {['Overthinking', 'Work', 'Social', 'Health', 'Future', 'Unknown'].map(tag => (
                    <button key={tag} onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} className={`px-4 py-2 rounded-full text-xs transition-all ${selectedTags.includes(tag) ? 'bg-accent text-bg' : 'bg-line/20'}`}>{tag}</button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <button onClick={() => setCurrentScreen('journal_confirm')} className="bg-accent text-bg py-4 rounded-full font-medium">Save Reflection</button>
                <button onClick={() => setCurrentScreen('skill_reps_entry')} className="text-xs opacity-40 uppercase tracking-widest text-center">Skip for Now</button>
              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'journal_confirm' && (
          <motion.div key="journal_confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-full mx-auto flex items-center justify-center"><CheckCircle2 size={32} /></div>
              <div className="space-y-2">
                <h2 className="font-serif italic text-3xl">This interruption is recorded.</h2>
                <p className="opacity-60">Repetition makes it automatic.</p>
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
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-4xl">Train Attention Under Noise</h2>
              <p className="opacity-60">These games reveal how overthinking works — and how it loses control. You’re not calming anything here. You’re watching how the mind gives itself orders.</p>
              {renderCTA('Start Skill Reps', 'complete', 2)}
            </div>
          </motion.div>
        )}

        {currentScreen === 'complete' && (
          <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-12 max-w-xs">
              <div className="space-y-4">
                <h2 className="font-serif italic text-4xl">Overthinking didn’t stop because you solved it.</h2>
                <p className="opacity-60">It stopped because you stopped obeying it. This is a learning skill — not a fix.</p>
              </div>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Workout completion logs on button tap.</p>
              <div className="flex flex-col gap-4">
                <button onClick={() => setCurrentScreen('entry')} className="bg-accent/5 text-accent px-12 py-4 rounded-full font-medium border border-accent/10">Replay Training</button>
                <button onClick={onComplete} className="bg-accent text-bg px-12 py-4 rounded-full font-medium hover:scale-105 transition-all">Finish Training</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
