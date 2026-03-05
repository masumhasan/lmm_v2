import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import WorkoutList from './components/WorkoutList';
import WorkoutZero from './components/WorkoutZero';
import Workout1 from './components/Workout1';
import Workout2 from './components/Workout2';
import Workout3 from './components/Workout3';
import Workout4 from './components/Workout4';
import DriftFeed from './components/DriftFeed';
import ReturnToNow from './components/ReturnToNow';
import MuscleSummary from './components/MuscleSummary';
import AICoach from './components/AICoach';
import Onboarding from './components/Onboarding';
import MuscleDashboard from './components/MuscleDashboard';
import { User, Workout, UserState } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ArrowRight } from 'lucide-react';
import { DotLottie } from '@lottiefiles/dotlottie-web';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [userState, setUserState] = useState<UserState>({ progress: [], stats: {}, tracking: {}, completedWorkouts: [], muscleProgress: [] });
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [repsDone, setRepsDone] = useState(0);
  const [showMuscleDashboard, setShowMuscleDashboard] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!user && canvasRef.current) {
      const dotLottie = new DotLottie({
        autoplay: true,
        loop: true,
        canvas: canvasRef.current,
        src: "/FixedBlur.lottie",
      });

      return () => {
        dotLottie.destroy();
      };
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetch(`/api/progress/${user.id}`)
        .then(res => res.json())
        .then(data => {
          const statsMap: Record<string, number> = {};
          data.stats.forEach((s: any) => {
            statsMap[s.muscle_name] = s.value;
          });
          setUserState({ 
            progress: data.progress, 
            stats: statsMap, 
            tracking: data.tracking,
            completedWorkouts: data.completedWorkouts || [],
            muscleProgress: data.muscleProgress || []
          });
        });
    }
  }, [user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as any).email.value;
    const username = email.split('@')[0];
    login(username);
  };

  const login = (username: string, isNew = false) => {
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: 'password' })
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        if (isNew) setIsNewUser(true);
      });
  };

  const completeWorkout = () => {
    if (!user || !selectedWorkout) return;

    const isSpecialWorkout = selectedWorkout.id === 0 || selectedWorkout.id === 1 || selectedWorkout.id === 2 || selectedWorkout.id === 3 || selectedWorkout.id === 4;
    const endpoint = isSpecialWorkout ? '/api/complete-workout' : '/api/progress';
    const body = isSpecialWorkout 
      ? JSON.stringify({ userId: user.id, workoutId: selectedWorkout.id })
      : JSON.stringify({
          userId: user.id,
          workoutId: selectedWorkout.id,
          reps: selectedWorkout.reps,
          muscles: selectedWorkout.muscles
        });

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })
      .then(res => res.json())
      .then(() => {
        refreshState();
      });
  };

  const refreshState = () => {
    if (!user) return;
    fetch(`/api/progress/${user.id}`)
      .then(res => res.json())
      .then(data => {
        const statsMap: Record<string, number> = {};
        data.stats.forEach((s: any) => {
          statsMap[s.muscle_name] = s.value;
        });
        setUserState({ 
          progress: data.progress, 
          stats: statsMap, 
          tracking: data.tracking,
          completedWorkouts: data.completedWorkouts || [],
          muscleProgress: data.muscleProgress || []
        });
        setIsTraining(false);
        setSelectedWorkout(null);
        setRepsDone(0);
        setActiveTab('profile');
      });
  };

  if (!user) {
    if (showOnboarding) {
      return (
        <Onboarding 
          onComplete={(username) => login(username, true)} 
          onLoginClick={() => setShowOnboarding(false)}
        />
      );
    }

    return (
      <div className="fixed inset-0 bg-bg flex items-center justify-center p-6 overflow-hidden">
        <div className="atmospheric-bg">
          <canvas 
            ref={canvasRef}
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative w-full max-w-xs h-full flex flex-col items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-12"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-3xl mx-auto flex items-center justify-center text-bg">
                <Brain size={32} />
              </div>
              <h1 className="font-serif italic text-4xl tracking-tight text-ink">LearnMyMind</h1>
              <p className="text-sm opacity-50 uppercase tracking-widest text-ink">Welcome Back</p>
            </div>

            <form id="login-form" onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="col-header">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-transparent border-b border-line py-2 focus:border-accent outline-none transition-colors text-ink"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="col-header">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full bg-transparent border-b border-line py-2 focus:border-accent outline-none transition-colors text-ink"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </form>

            <div className="text-center space-y-4">
              <button 
                onClick={() => setShowOnboarding(true)}
                className="text-[10px] opacity-30 uppercase tracking-widest hover:opacity-100 block mx-auto"
              >
                New here? Start Onboarding
              </button>
            </div>
          </motion.div>

          <div className="absolute bottom-12 left-0 right-0 flex justify-center">
            <button
              form="login-form"
              type="submit"
              className="bg-accent text-bg py-2.5 px-10 rounded-xl font-medium flex items-center justify-center gap-2 text-sm min-w-[160px]"
            >
              Start Training
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <header className="space-y-1">
              <p className="text-xs opacity-50 uppercase tracking-widest">Welcome back,</p>
              <h2 className="font-serif italic text-4xl">{user.username}</h2>
            </header>

            <div className="bg-accent p-8 rounded-[40px] space-y-8 relative overflow-hidden shadow-2xl shadow-accent/20">
              {isNewUser && (
                <div className="absolute top-0 right-0 bg-white text-accent px-6 py-2 text-[10px] uppercase tracking-[0.2em] font-bold rounded-bl-2xl shadow-sm">
                  New Training Floor
                </div>
              )}
              <div className="space-y-3">
                <h3 className="text-3xl font-serif italic text-white leading-none">Daily Goal</h3>
                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em]">Complete 1 workout and 1 drift session</p>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white w-1/3" />
              </div>
              <div className="flex flex-col gap-6">
                <button
                  onClick={() => setActiveTab('workouts')}
                  className="text-[10px] uppercase tracking-[0.2em] border border-white/20 text-white px-6 py-4 rounded-full hover:bg-white hover:text-accent transition-all duration-300 font-medium"
                >
                  Continue Training
                </button>
                {isNewUser && (
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.25em] text-center font-mono">
                    Workout 0: Attention Control is ready
                  </p>
                )}
              </div>
            </div>

            <section>
              <h3 className="col-header mb-6">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="premium-card p-6 border-none shadow-sm">
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2">Total Reps</div>
                  <div className="data-value text-3xl">{userState.progress.reduce((acc, p) => acc + p.reps, 0)}</div>
                </div>
                <div className="premium-card p-6 border-none shadow-sm">
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2">Streak</div>
                  <div className="data-value text-3xl">2 Days</div>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'workouts' && (
          <motion.div key="workouts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {isTraining && selectedWorkout ? (
              (selectedWorkout.id === 0 || selectedWorkout.id === 1 || selectedWorkout.id === 2 || selectedWorkout.id === 3 || selectedWorkout.id === 4) ? (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <Brain size={48} className="opacity-20 animate-pulse" />
                <p className="text-sm opacity-40 uppercase tracking-widest">Training Session Active</p>
                <button 
                  onClick={() => setActiveTab('workouts')} 
                  className="bg-accent text-bg px-8 py-3 rounded-full text-xs uppercase tracking-widest"
                >
                  Resume Workout
                </button>
              </div>
            ) : (
                <div className="space-y-12 text-center py-12">
                <div className="space-y-2">
                  <h2 className="font-serif italic text-3xl">{selectedWorkout.title}</h2>
                  <p className="text-xs opacity-50 uppercase tracking-widest">Repetition {repsDone} / {selectedWorkout.reps}</p>
                </div>

                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96" cy="96" r="80"
                      stroke="currentColor" strokeWidth="4" fill="transparent"
                      className="text-ink/5"
                    />
                    <motion.circle
                      cx="96" cy="96" r="80"
                      stroke="currentColor" strokeWidth="4" fill="transparent"
                      strokeDasharray="502.6"
                      initial={{ strokeDashoffset: 502.6 }}
                      animate={{ strokeDashoffset: 502.6 - (repsDone / selectedWorkout.reps) * 502.6 }}
                      className="text-accent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain size={48} className="opacity-20 text-accent" />
                  </div>
                </div>

                <div className="absolute bottom-32 left-6 right-6 flex justify-center">
                  <button
                    onClick={() => {
                      if (repsDone < selectedWorkout.reps) {
                        setRepsDone(prev => prev + 1);
                      } else {
                        completeWorkout();
                      }
                    }}
                    className="w-full bg-accent text-bg py-6 rounded-3xl font-serif italic text-xl shadow-xl active:scale-95 transition-transform"
                  >
                    {repsDone < selectedWorkout.reps ? 'Tap to Rep' : 'Finish Workout'}
                  </button>
                </div>
              </div>
            )
          ) : (
            <WorkoutList 
              onSelect={(w) => {
                setSelectedWorkout(w);
                setIsTraining(true);
              }} 
              completedWorkouts={userState.completedWorkouts}
            />
            )}
          </motion.div>
        )}

        {activeTab === 'drift' && (
          <motion.div key="drift" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DriftFeed />
          </motion.div>
        )}

        {activeTab === 'now' && (
          <motion.div key="now" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ReturnToNow 
              onComplete={() => setActiveTab('home')} 
              isFromWorkout={isTraining}
              onBackToWorkout={() => setActiveTab('workouts')}
            />
          </motion.div>
        )}

        {activeTab === 'coach' && (
          <motion.div key="coach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AICoach />
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-center mb-12">
              <button 
                onClick={() => setShowMuscleDashboard(true)}
                className="text-[10px] uppercase tracking-[0.2em] bg-ink/5 text-ink/60 px-8 py-3 rounded-full hover:bg-ink/10 transition-all duration-300 font-medium"
              >
                View Cognitive Muscles
              </button>
            </div>
            <MuscleSummary state={userState} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMuscleDashboard && (
          <MuscleDashboard 
            userState={userState} 
            onBack={() => setShowMuscleDashboard(false)} 
          />
        )}
      </AnimatePresence>

      {/* Persistent Workout1 Overlay */}
      {isTraining && selectedWorkout && selectedWorkout.id === 1 && (
        <div className={activeTab === 'workouts' ? 'block' : 'hidden'}>
          <Workout1 
            user={user} 
            userState={userState} 
            onComplete={completeWorkout} 
            onBack={() => setIsTraining(false)}
            onNowClick={() => setActiveTab('now')}
            refreshState={refreshState}
          />
        </div>
      )}

      {/* Persistent Workout4 Overlay */}
      {isTraining && selectedWorkout && selectedWorkout.id === 4 && (
        <div className={activeTab === 'workouts' ? 'block' : 'hidden'}>
          <Workout4 
            user={user} 
            userState={userState} 
            onComplete={completeWorkout} 
            onBack={() => setIsTraining(false)}
            onNowClick={() => setActiveTab('now')}
            refreshState={refreshState}
          />
        </div>
      )}

      {/* Persistent Workout3 Overlay */}
      {isTraining && selectedWorkout && selectedWorkout.id === 3 && (
        <div className={activeTab === 'workouts' ? 'block' : 'hidden'}>
          <Workout3 
            user={user} 
            userState={userState} 
            onComplete={completeWorkout} 
            onBack={() => setIsTraining(false)}
            onNowClick={() => setActiveTab('now')}
            refreshState={refreshState}
          />
        </div>
      )}

      {/* Persistent Workout2 Overlay */}
      {isTraining && selectedWorkout && selectedWorkout.id === 2 && (
        <div className={activeTab === 'workouts' ? 'block' : 'hidden'}>
          <Workout2 
            user={user} 
            userState={userState} 
            onComplete={completeWorkout} 
            onBack={() => setIsTraining(false)}
            onNowClick={() => setActiveTab('now')}
            refreshState={refreshState}
          />
        </div>
      )}

      {/* Persistent WorkoutZero Overlay */}
      {isTraining && selectedWorkout && selectedWorkout.id === 0 && (
        <div className={activeTab === 'workouts' ? 'block' : 'hidden'}>
          <WorkoutZero 
            user={user} 
            userState={userState} 
            onComplete={completeWorkout} 
            onBack={() => setIsTraining(false)}
            onNowClick={() => setActiveTab('now')}
            refreshState={refreshState}
          />
        </div>
      )}
    </Layout>
  );
}
