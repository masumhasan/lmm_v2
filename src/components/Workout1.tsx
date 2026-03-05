import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ArrowLeft, ArrowRight, Home, CheckCircle2, AlertCircle, Bell, Lock, Menu, X, Eye, MessageSquare, Zap, Mic, Play } from 'lucide-react';
import { User, UserState } from '../types';

interface Workout1Props {
  user: User;
  userState: UserState;
  onComplete: () => void;
  onBack: () => void;
  onNowClick: () => void;
  refreshState: () => void;
}

type Screen = 
  | 'entry' | 'edu_intro' | 'core_shift'
  | 'stories_title' | 'why_stories' | 'reframe'
  | 'examples_intro' | 'example_social' | 'example_health' | 'example_relationship' | 'example_past_tag'
  | 'evidence_title' | 'evidence_rule' | 'transition_drills'
  | 'd1_intro' | 'd1_play' | 'd1_penny'
  | 'd2_intro' | 'd2_play' | 'd2_penny'
  | 'd3_play1' | 'd3_play2' | 'd3_penny'
  | 'muscle_summary' | 'closing_intro' | 'closing_message' | 'closing_forward' | 'journal' | 'journal_confirm'
  | 'sr1_intro' | 'sr1_play' | 'sr1_penny'
  | 'sr2_intro' | 'sr2_play' | 'sr2_penny'
  | 'sr3_intro' | 'sr3_play' | 'sr3_penny'
  | 'complete';

export default function Workout1({ user, userState, onComplete, onBack, onNowClick, refreshState }: Workout1Props) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('entry');
  const [pulseCount, setPulseCount] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [d1Index, setD1Index] = useState(0);
  const [d1Tapped, setD1Tapped] = useState<number[]>([]);
  const [d2Intensity, setD2Intensity] = useState(0);
  const [d2Lines, setD2Lines] = useState<number>(0);
  const [isHolding, setIsHolding] = useState(false);
  const [d3Detected, setD3Detected] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = (next?: Screen) => {
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
      console.log("Speech detected:", speechToText);
      setD3Detected(true);
      setIsListening(false);
      setTimeout(() => setCurrentScreen(next || 'd3_play2'), 2000);
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
  const [journalText, setJournalText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const SECTIONS: { id: Screen; label: string; group: string }[] = [
    { id: 'entry', label: 'Orientation', group: 'Intro' },
    { id: 'edu_intro', label: 'Workout Intro', group: 'Intro' },
    { id: 'stories_title', label: 'The Stories', group: 'Theory' },
    { id: 'examples_intro', label: 'Real-Life Examples', group: 'Theory' },
    { id: 'evidence_title', label: 'Evidence vs Story', group: 'Theory' },
    { id: 'd1_intro', label: 'Drill 1: Snap Detection', group: 'Drills' },
    { id: 'd2_intro', label: 'Drill 2: Distortion', group: 'Drills' },
    { id: 'd3_play1', label: 'Drill 3: Author Shift', group: 'Drills' },
    { id: 'muscle_summary', label: 'Summary', group: 'Review' },
  ];

  const DRILL_SCREENS = ['d1_play', 'd2_play', 'd3_play1', 'd3_play2', 'sr1_play', 'sr2_play', 'sr3_play'];
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

  // Screen 1: Entry Logic
  useEffect(() => {
    if (currentScreen === 'entry') {
      const timer1 = setTimeout(() => setPulseCount(1), 100);
      const timer2 = setTimeout(() => setPulseCount(2), 5000);
      const timerCTA = setTimeout(() => setShowCTA(true), 2200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timerCTA);
      };
    }
  }, [currentScreen]);

  // Drill 1: Snap Detection Logic
  const d1Fragments = [
    "They walked past.",
    "They walked past. Didn’t look at me.",
    "They walked past. Didn’t look at me. That felt deliberate.",
    "The meeting ended.",
    "The meeting ended. No one mentioned my idea.",
    "The meeting ended. No one mentioned my idea. They didn’t value it."
  ];

  useEffect(() => {
    if (currentScreen === 'd1_play') {
      if (d1Index < d1Fragments.length) {
        const delay = Math.random() * 400 + 900;
        const timer = setTimeout(() => {
          setD1Index(prev => prev + 1);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        setTimeout(() => setCurrentScreen('d1_penny'), 800);
      }
    }
  }, [currentScreen, d1Index]);

  // Drill 2: Distortion Logic
  useEffect(() => {
    if (currentScreen === 'd2_play') {
      if (!isHolding && d2Lines < 4) {
        const timer = setInterval(() => {
          setD2Lines(prev => prev + 1);
          setD2Intensity(prev => prev + 25);
        }, 1500);
        return () => clearInterval(timer);
      }
      if (d2Lines === 4) {
        const timer = setTimeout(() => setCurrentScreen('d2_penny'), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentScreen, isHolding, d2Lines]);

  useEffect(() => {
    if (currentScreen === 'd1_penny') {
      logRep('Story Separation', 'workout1.d1_completed_at');
    } else if (currentScreen === 'd2_penny') {
      logRep('Pattern Recognition', 'workout1.d2_completed_at');
    } else if (currentScreen === 'd3_penny') {
      logRep('Story Separation', 'workout1.d3_completed_at');
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === 'd2_intro') {
      setD2Lines(0);
      setD2Intensity(0);
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
        {showHome && !isDrill && (
          <button onClick={onBack} className="opacity-30 hover:opacity-100 transition-all duration-500">
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
      className="absolute bottom-24 left-8 right-8 flex justify-center"
    >
      <button
        onClick={() => {
          setCurrentScreen(next);
          if (window.navigator.vibrate) window.navigator.vibrate(10);
        }}
        className="btn-primary min-w-[240px] hover:shadow-accent/30"
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
            {renderNav()}
            
            {/* Centered Animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <AnimatePresence>
                  {pulseCount > 0 && (
                    <motion.div
                      key={pulseCount}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: [0, 0.2, 0] }}
                      transition={{ duration: 4, ease: "easeOut" }}
                      className="absolute inset-0 bg-accent rounded-full blur-3xl"
                    />
                  )}
                </AnimatePresence>
                <div className="w-32 h-32 border border-accent/20 rounded-full flex items-center justify-center">
                  <Brain size={32} className="opacity-20 text-accent" />
                </div>
              </div>
            </div>

            {/* Bottom Text */}
            <div className="absolute top-[62%] w-full px-8 text-center">
              <div className="h-32 flex flex-col justify-center gap-2">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="font-serif italic text-2xl"
                >
                  Stress often begins as a sentence.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.4 }}
                  className="text-sm opacity-50"
                >
                  Before you notice your body.
                </motion.p>
              </div>
            </div>
            {showCTA && renderCTA('Begin Workout', 'edu_intro')}
          </motion.div>
        )}

        {currentScreen === 'edu_intro' && (
          <motion.div
            key="edu_intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-line/5"
          >
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <p className="col-header">Muscle Focus: Story Separation</p>
              <h2 className="font-serif italic text-3xl leading-tight">Most stress isn’t caused by what happens.</h2>
              <p className="opacity-60">It’s caused by what your system says about what happens.</p>
              <div className="pt-8 space-y-4">
                <p className="text-lg font-serif italic">Stories feel convincing.</p>
                <p className="text-lg font-serif italic opacity-40">Reality is quieter.</p>
              </div>
              {renderCTA('Continue', 'core_shift')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'core_shift' && (
          <motion.div
            key="core_shift"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-12">
              <div className="space-y-4">
                <motion.h2 
                  animate={{ filter: 'blur(4px)', opacity: 0.5 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  className="font-serif italic text-4xl"
                >
                  This is a thought.
                </motion.h2>
                <h2 className="font-serif italic text-4xl">This is not a fact.</h2>
              </div>
              <p className="text-sm opacity-50 italic">Separation cue: story ≠ fact</p>
              {renderCTA('Continue', 'stories_title')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'stories_title' && (
          <motion.div
            key="stories_title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <MessageSquare size={48} className="opacity-20" />
              </div>
              <h2 className="font-serif italic text-4xl">The Stories Your Mind Creates</h2>
              <p className="text-sm opacity-50 uppercase tracking-widest">Why thoughts escalate so fast.</p>
              {renderCTA('Continue', 'why_stories')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'why_stories' && (
          <motion.div
            key="why_stories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <h2 className="font-serif italic text-2xl">Your system fears one thing most.</h2>
              <div className="space-y-4">
                {['Silence', 'Uncertainty', 'Missing information'].map((text, i) => (
                  <motion.p
                    key={text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 1 }}
                    className="text-lg opacity-60"
                  >
                    {text}
                  </motion.p>
                ))}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.5 }}
                  className="font-serif italic text-xl pt-4 border-t border-line/10"
                >
                  So it fills the gap.
                </motion.p>
              </div>
              {renderCTA('Continue', 'reframe')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'reframe' && (
          <motion.div
            key="reframe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl leading-tight">This doesn’t mean you’re dramatic.</h2>
              <p className="opacity-60">It means your system is doing what it was trained to do.</p>
              <div className="space-y-2 pt-8">
                <p className="font-medium">“This is instinct.”</p>
                <p className="font-medium opacity-40">“Not failure.”</p>
              </div>
              {renderCTA('Continue', 'examples_intro')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'examples_intro' && (
          <motion.div
            key="examples_intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Real-Life Story Examples</h2>
              <p className="opacity-60">Stories don’t announce themselves. They arrive as conclusions.</p>
              {renderCTA('See Examples', 'example_social')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_social' && (
          <motion.div
            key="example_social"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <div className="space-y-2">
                <p className="col-header">System:</p>
                <p className="text-xl font-medium">They didn’t greet you. Something’s wrong.</p>
              </div>
              <div className="h-px bg-line/10 w-full" />
              <div className="space-y-2">
                <p className="col-header">Reality:</p>
                <p className="text-xl font-serif italic">They didn’t see you.</p>
              </div>
              <p className="text-xs opacity-40 text-center">The story appeared instantly.</p>
              {renderCTA('Next Example', 'example_health')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_health' && (
          <motion.div
            key="example_health"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <div className="space-y-2">
                <p className="col-header">System:</p>
                <p className="text-xl font-medium">“Something feels off. What if this gets worse?”</p>
              </div>
              <div className="h-px bg-line/10 w-full" />
              <div className="space-y-2">
                <p className="col-header">Reality:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Stress', 'Fatigue', 'Posture', 'Dehydration'].map(t => (
                    <span key={t} className="text-sm font-serif italic">{t}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs opacity-40 text-center">Meaning added before evidence.</p>
              {renderCTA('Next Example', 'example_relationship')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_relationship' && (
          <motion.div
            key="example_relationship"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <div className="space-y-2">
                <p className="col-header">System:</p>
                <p className="text-xl font-medium">“They’re being short. They’re losing interest.”</p>
              </div>
              <div className="h-px bg-line/10 w-full" />
              <div className="space-y-2">
                <p className="col-header">Reality:</p>
                <p className="text-xl font-serif italic">“They’re tired. They’re distracted.”</p>
              </div>
              {renderCTA('Next Example', 'example_past_tag')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'example_past_tag' && (
          <motion.div
            key="example_past_tag"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-8 w-full max-w-xs">
              <div className="space-y-4">
                <p className="col-header">System Memory Tag:</p>
                <p className="text-lg font-medium">“You once felt anxious here.”</p>
                <p className="text-sm opacity-60 italic">Your system tagged the place — not the moment.</p>
              </div>
              <div className="h-px bg-line/10 w-full" />
              <div className="space-y-2">
                <p className="col-header">Reality:</p>
                <p className="text-lg font-serif italic">“The danger wasn’t the location. It was the internal state.”</p>
              </div>
              <p className="text-xs opacity-40 text-center">Tags can be updated.</p>
              {renderCTA('Continue to Evidence', 'evidence_title')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'evidence_title' && (
          <motion.div
            key="evidence_title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <Eye size={48} className="opacity-20" />
              </div>
              <h2 className="font-serif italic text-4xl">Evidence vs Story</h2>
              <p className="text-sm opacity-50 uppercase tracking-widest">One question breaks spirals.</p>
              <p className="text-xs opacity-40 italic">Separation cue: evidence first</p>
              {renderCTA('Continue', 'evidence_rule')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'evidence_rule' && (
          <motion.div
            key="evidence_rule"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl leading-tight">“If you don’t have proof — it’s a story.”</h2>
              <p className="opacity-60 italic">Separation Rep: evidence first</p>
              <div className="pt-8 space-y-4">
                <p className="text-sm opacity-50">Your system can imagine anything. Evidence is quieter.</p>
                <p className="text-sm font-medium">Standing with what's real changes the spiral.</p>
              </div>
              {renderCTA('Transition to Drills', 'transition_drills')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'transition_drills' && (
          <motion.div
            key="transition_drills"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-accent text-bg"
          >
            {renderNav()}
            <div className="text-center space-y-8">
              <Zap size={48} className="mx-auto opacity-40" />
              <div className="space-y-2">
                <h2 className="font-serif italic text-4xl">Training Begins</h2>
                <p className="opacity-60">Reps for Story Separation</p>
              </div>
              <div className="space-y-4 pt-12">
                {['“What if this means something bad?”', '“They probably think differently of me.”', '“This doesn’t feel right.”'].map((t, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: i * 0.5 }}
                    className="text-sm italic"
                  >
                    {t}
                  </motion.p>
                ))}
              </div>
              <p className="text-xs opacity-60 pt-8">You notice them — and choose not to follow.</p>
              {renderCTA('Continue Reps', 'd1_intro')}
            </div>
          </motion.div>
        )}

        {/* Drill 1: Snap Detection */}
        {currentScreen === 'd1_intro' && (
          <motion.div
            key="d1_intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Snap Detection</h2>
              <p className="col-header">Muscle Focus: Pattern Recognition + Story Separation</p>
              <p className="opacity-60">Stories form in fragments. You’re training detection speed.</p>
              <p className="text-xs opacity-40 uppercase tracking-widest">“You’re sharpening perception.”</p>
              {renderCTA('Start', 'd1_play')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd1_play' && (
          <motion.div
            key="d1_play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-bg cursor-pointer"
            onClick={() => {
              if (d1Index === 1 || d1Index === 2 || d1Index === 4 || d1Index === 5) {
                setD1Tapped(prev => [...prev, d1Index]);
                if (window.navigator.vibrate) window.navigator.vibrate(30);
              }
            }}
          >
            <div className="absolute top-12 left-0 right-0 text-center">
              <p className="text-[10px] uppercase tracking-widest opacity-40">Tap the moment the sentence adds meaning.</p>
            </div>
            <div className="text-center max-w-sm">
              <AnimatePresence mode="wait">
                <motion.p
                  key={d1Index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-2xl font-serif italic leading-relaxed"
                >
                  {d1Fragments[d1Index]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {currentScreen === 'd1_penny' && (
          <motion.div
            key="d1_penny"
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
                You detected the exact moment meaning began.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.2 }}
                className="penny-text"
              >
                Detection is separation.
              </motion.p>
              <div className="pt-12">
                <p className="col-header text-white/40">Story Separation +1</p>
              </div>
              {renderCTA('Continue', 'd2_intro')}
            </div>
          </motion.div>
        )}

        {/* Drill 2: Distortion Under Pressure */}
        {currentScreen === 'd2_intro' && (
          <motion.div
            key="d2_intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8">
              <h2 className="font-serif italic text-4xl">Distortion Under Pressure</h2>
              <p className="col-header">Muscle Focus: Story Separation (Interruption Under Pressure)</p>
              <p className="opacity-60">Stories amplify quickly. You’re training interruption under pressure.</p>
              <p className="text-xs opacity-40 uppercase tracking-widest">“Watch how intensity builds.”</p>
              {renderCTA('Begin', 'd2_play')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'd2_play' && (
          <motion.div
            key="d2_play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col bg-ink text-bg relative p-8"
            onMouseDown={() => setIsHolding(true)}
            onMouseUp={() => setIsHolding(false)}
            onTouchStart={() => setIsHolding(true)}
            onTouchEnd={() => setIsHolding(false)}
          >
            <div className="absolute top-12 left-0 right-0 text-center">
              <p className="text-[10px] uppercase tracking-widest opacity-40">Press and hold to slow the build. Release to let it continue.</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {[
                "I made a small mistake.",
                "That was embarrassing.",
                "People noticed.",
                "This will affect how they see me."
              ].slice(0, d2Lines + 1).map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-serif italic"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <div className="absolute right-6 top-1/4 bottom-1/4 w-1 bg-bg/10 rounded-full overflow-hidden">
              <motion.div
                animate={{ height: `${d2Intensity}%` }}
                className="w-full bg-accent absolute bottom-0"
              />
            </div>
          </motion.div>
        )}

        {currentScreen === 'd2_penny' && (
          <motion.div
            key="d2_penny"
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
                Intensity rises when interpretation compounds.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.2 }}
                className="penny-text"
              >
                You practiced interruption under pressure.
              </motion.p>
              <div className="pt-12">
                <p className="col-header text-white/40">Pattern Recognition +1</p>
              </div>
              {renderCTA('Continue', 'd3_play1')}
            </div>
          </motion.div>
        )}

        {/* Drill 3: Author Shift */}
        {currentScreen === 'd3_play1' && (
          <motion.div
            key="d3_play1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-12 w-full max-w-xs">
              <div className="space-y-4">
                <p className="col-header">Drill 3 of 3</p>
                <h2 className="text-4xl font-serif italic">This is going to go badly.</h2>
                <p className="text-xs opacity-50 uppercase tracking-widest">Say it exactly as written.</p>
              </div>
              <div className="relative flex flex-col items-center gap-8">
                <motion.button
                  animate={isListening ? {
                    scale: [1, 1.2, 1],
                    boxShadow: ["0 0 0px rgba(26,31,54,0)", "0 0 40px rgba(26,31,54,0.2)", "0 0 0px rgba(26,31,54,0)"]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  onClick={() => startListening()}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isListening ? 'bg-accent text-white' : 'bg-accent/5 text-accent hover:bg-accent/10'}`}
                >
                  <Mic size={32} />
                </motion.button>
                
                {isListening && (
                  <div className="flex gap-1 items-center h-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 16, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-accent rounded-full"
                      />
                    ))}
                  </div>
                )}

                <AnimatePresence>
                  {d3Detected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-accent font-medium"
                    >
                      <CheckCircle2 size={18} />
                      Speech Detected
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[10px] uppercase tracking-widest opacity-30">Voice Detection Active</p>
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_play2' && (
          <motion.div
            key="d3_play2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-12">
              <div className="space-y-4">
                <p className="text-xs opacity-50 uppercase tracking-widest">The system said,</p>
                <h2 className="text-4xl font-serif italic">“This is going to go badly.”</h2>
                <p className="text-xs opacity-50 uppercase tracking-widest pt-8">Say it this way.</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => startListening('d3_penny')}
                className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${isListening ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'border-accent text-accent hover:bg-accent/5'}`}
              >
                <Mic size={32} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {currentScreen === 'd3_penny' && (
          <motion.div
            key="d3_penny"
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
                The sentence stayed the same.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1.2 }}
                className="penny-text"
              >
                Your position changed. That shift is separation.
              </motion.p>
              <div className="pt-12">
                <p className="col-header text-white/40">Story Separation +1</p>
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
                {['Story Separation', 'Pattern Recognition'].map((text, i) => (
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
              <p className="text-xs opacity-40 italic">“This screen shows muscles only. No reps log here.”</p>
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
              <p className="text-xl opacity-60">“Stories feel real. Separation builds control.”</p>
              {renderCTA('Continue', 'closing_message')}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_message' && (
          <motion.div
            key="closing_message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="space-y-6 text-center max-w-xs">
              {[
                "Your system will always create stories.",
                "It will guess.",
                "It will predict.",
                "It will try to keep you safe.",
                "But now you can notice the story…",
                "…instead of becoming the story.",
                "And that changes everything."
              ].map((text, i) => (
                <motion.p
                  key={text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 1.4 }}
                  className={`text-lg ${i >= 4 ? 'font-serif italic text-2xl' : 'opacity-60'}`}
                >
                  {text}
                </motion.p>
              ))}
              {renderCTA('Continue', 'closing_forward', 10)}
            </div>
          </motion.div>
        )}

        {currentScreen === 'closing_forward' && (
          <motion.div
            key="closing_forward"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {renderNav()}
            <div className="text-center space-y-8 max-w-xs">
              <h2 className="font-serif italic text-3xl">Next, you’ll learn how stories turn into emotional loops — and how to interrupt them earlier.</h2>
              <p className="text-sm opacity-60">One layer at a time. One skill at a time.</p>
              <p className="text-[10px] uppercase tracking-widest opacity-30">Return To Now is available from Home.</p>
              {renderCTA('Update Training Log', 'journal')}
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
                <p className="col-header">Training Log — Workout 1</p>
                <h2 className="font-serif italic text-3xl text-center">What story did your system tell you today?</h2>
                <p className="text-sm opacity-50 text-center italic">“And what was the real evidence?”</p>
              </div>

              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                className="w-full h-48 bg-line rounded-3xl p-6 outline-none focus:ring-2 ring-accent/5 transition-all resize-none"
                placeholder="✍️ Type your reflection..."
              />

              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest opacity-40 text-center">Tag this if it helps you remember.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Work', 'Family', 'Self', 'Body', 'Social', 'Unknown'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      className={`px-4 py-2 rounded-full text-xs transition-all ${selectedTags.includes(tag) ? 'bg-accent text-bg' : 'bg-line text-ink/60'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setCurrentScreen('journal_confirm')}
                  className="bg-accent text-bg py-4 rounded-full font-medium hover:scale-105 transition-all"
                >
                  Save Training Log
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
                <p className="opacity-60">Repetition builds separation.</p>
              </div>
              <div className="flex flex-col gap-4">
                <button
                  onClick={onComplete}
                  className="bg-accent text-bg px-12 py-4 rounded-full font-medium"
                >
                  Return Home
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
