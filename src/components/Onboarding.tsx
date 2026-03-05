import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DotLottie } from '@lottiefiles/dotlottie-web';

const LottieIcon = ({ src }: { src: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const dotLottie = new DotLottie({
        autoplay: true,
        loop: true,
        canvas: canvasRef.current,
        src,
      });

      return () => {
        dotLottie.destroy();
      };
    }
  }, [src]);

  return (
    <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="w-8 h-8" />
    </div>
  );
};
import { 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  LayoutGrid, 
  Wind, 
  Mail, 
  Lock, 
  User, 
  ChevronRight 
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (username: string) => void;
  onLoginClick: () => void;
}

type OnboardingStep = 
  | 'welcome' 
  | 'what_is' 
  | 'what_is_not' 
  | 'how_it_works' 
  | 'layers' 
  | 'expectation' 
  | 'signup'
  | 'login'
  | 'forgot_password'
  | 'account';

export default function Onboarding({ onComplete, onLoginClick }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
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
  }, []);

  const next = (nextStep: OnboardingStep) => setStep(nextStep);

  const renderScreen = () => {
    switch (step) {
      case 'welcome':
        return (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12 text-center max-w-xs"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 bg-accent rounded-3xl mx-auto flex items-center justify-center text-bg shadow-xl shadow-accent/20"
            >
              <Brain size={40} />
            </motion.div>
            <div className="space-y-4">
              <h1 className="font-serif italic text-5xl tracking-tight text-ink">LearnMyMind</h1>
              <p className="text-xl opacity-60 text-ink">Train the mind you live in.</p>
            </div>
            <div className="space-y-3 text-sm opacity-40 uppercase tracking-[0.25em] text-ink font-mono">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>“Not therapy.</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>Not motivation.</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} className="text-ink opacity-100 font-bold">Training.”</motion.p>
            </div>
          </motion.div>
        );

      case 'what_is':
        return (
          <motion.div
            key="what_is"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12 max-w-xs"
          >
            <h2 className="font-serif italic text-3xl">What This Is</h2>
            <div className="space-y-6 text-lg opacity-80 leading-relaxed">
              <p>A structured mental training system.</p>
              <p>Built around cognitive workouts.</p>
              <p>Designed to strengthen attention and separation.</p>
            </div>
          </motion.div>
        );

      case 'what_is_not':
        return (
          <motion.div
            key="what_is_not"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12 max-w-xs"
          >
            <h2 className="font-serif italic text-3xl">What This Isn’t</h2>
            <div className="space-y-4 text-lg opacity-80 leading-relaxed">
              <p>Not therapy.</p>
              <p>Not medical advice.</p>
              <p>Not emotional support.</p>
              <p>Not a quick fix.</p>
            </div>
            <div className="pt-8 space-y-1">
              <p className="text-xs opacity-40 uppercase tracking-widest leading-relaxed">
                It does not change how you feel.
              </p>
              <p className="text-xs opacity-40 uppercase tracking-widest leading-relaxed">
                It trains where attention goes.
              </p>
            </div>
          </motion.div>
        );

      case 'how_it_works':
        return (
          <motion.div
            key="how_it_works"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12 max-w-xs"
          >
            <h2 className="font-serif italic text-3xl">How Training Works</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <LottieIcon src="/flash.lottie" />
                <div className="space-y-1">
                  <h3 className="font-medium">Workouts</h3>
                  <p className="text-sm opacity-60">Structured cognitive sessions.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                  <CheckCircle2 size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">Skill Reps</h3>
                  <p className="text-sm opacity-60">Short drills that strengthen control.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                  <LayoutGrid size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">Training Log</h3>
                  <p className="text-sm opacity-60">Track what you noticed.</p>
                </div>
              </div>
            </div>
            <p className="text-xs opacity-40 uppercase tracking-widest">Repetition builds automatic strength.</p>
          </motion.div>
        );

      case 'layers':
        return (
          <motion.div
            key="layers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12 max-w-xs"
          >
            <h2 className="font-serif italic text-3xl">Three Ways to Train</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <LottieIcon src="/flash.lottie" />
                <div className="space-y-1">
                  <h3 className="font-medium">Workouts</h3>
                  <p className="text-sm opacity-60">Build core mental muscles.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <LottieIcon src="/reset.lottie" />
                <div className="space-y-1">
                  <h3 className="font-medium">Return To Now</h3>
                  <p className="text-sm opacity-60">Neutral attention reset.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <LottieIcon src="/wave.lottie" />
                <div className="space-y-1">
                  <h3 className="font-medium">Drift</h3>
                  <p className="text-sm opacity-60">Pattern exposure through media.</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'expectation':
        return (
          <motion.div
            key="expectation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12 max-w-xs"
          >
            <h2 className="font-serif italic text-3xl">What To Expect</h2>
            <div className="space-y-4 text-lg opacity-80 leading-relaxed">
              <p>Your system will still produce thoughts.</p>
              <p>Stories will still appear.</p>
              <p>Sensations will still exist.</p>
              <p className="italic pt-4">Pause.</p>
              <p>You will notice them sooner.</p>
              <p>And respond differently.</p>
            </div>
          </motion.div>
        );

      case 'signup':
        return (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12 w-full max-w-sm"
          >
            <div className="text-center space-y-2">
              <p className="col-header">Step 1 of 2</p>
              <h2 className="font-serif italic text-4xl">Create Account</h2>
              <p className="text-sm opacity-50">Join the training floor.</p>
            </div>

            <div className="space-y-8">
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-line py-3 focus:border-accent outline-none transition-all peer placeholder-transparent"
                  placeholder="Email"
                  id="signup-email"
                />
                <label 
                  htmlFor="signup-email"
                  className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest opacity-40 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:opacity-20 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:opacity-40"
                >
                  Email
                </label>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-line py-3 focus:border-accent outline-none transition-all peer placeholder-transparent"
                  placeholder="Password"
                  id="signup-password"
                />
                <label 
                  htmlFor="signup-password"
                  className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest opacity-40 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:opacity-20 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:opacity-40"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-line py-3 focus:border-accent outline-none transition-all peer placeholder-transparent"
                  placeholder="Confirm Password"
                  id="signup-confirm"
                />
                <label 
                  htmlFor="signup-confirm"
                  className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest opacity-40 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:opacity-20 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:opacity-40"
                >
                  Confirm Password
                </label>
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={() => setStep('login')}
                className="btn-passive"
              >
                Already have an account? Login
              </button>
            </div>
          </motion.div>
        );

      case 'login':
        return (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 w-full max-w-sm"
          >
            <div className="text-center space-y-2">
              <h2 className="font-serif italic text-3xl">Welcome Back</h2>
              <p className="text-sm opacity-50">Resume your training.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="col-header">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-line/20 py-2 focus:border-ink outline-none transition-colors"
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="col-header">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-line/20 py-2 focus:border-ink outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div className="text-right">
                <button 
                  onClick={() => setStep('forgot_password')}
                  className="text-[10px] opacity-30 uppercase tracking-widest hover:opacity-100 transition-opacity"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={() => setStep('signup')}
                className="text-[10px] opacity-30 uppercase tracking-widest hover:opacity-100 transition-opacity"
              >
                Don't have an account? Signup
              </button>
            </div>
          </motion.div>
        );

      case 'forgot_password':
        return (
          <motion.div
            key="forgot_password"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 w-full max-w-sm"
          >
            <div className="text-center space-y-2">
              <h2 className="font-serif italic text-3xl">Reset Password</h2>
              <p className="text-sm opacity-50">We'll send you a link.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="col-header">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-line/20 py-2 focus:border-ink outline-none transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={() => setStep('login')}
                className="text-[10px] opacity-30 uppercase tracking-widest hover:opacity-100 transition-opacity"
              >
                Back to Login
              </button>
            </div>
          </motion.div>
        );

      case 'account':
        return (
          <motion.div
            key="account"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 w-full max-w-sm"
          >
            <div className="text-center space-y-2">
              <h2 className="font-serif italic text-3xl">Account</h2>
              <p className="text-sm opacity-50">Simple.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="col-header">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-b border-line/20 py-2 focus:border-ink outline-none transition-colors"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${agreed ? 'bg-accent border-accent' : 'border-line/30 group-hover:border-accent/40'}`}>
                    {agreed && <CheckCircle2 size={20} className="text-bg" />}
                  </div>
                </div>
                <span className="text-xs opacity-60 leading-relaxed">
                  I understand this is an educational training system.
                </span>
              </label>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-bg z-50 flex items-center justify-center p-6 overflow-hidden depth-bg">
      <div className="atmospheric-bg">
        <canvas 
          ref={canvasRef}
          className="w-full h-full object-cover opacity-40"
        />
      </div>
      
      <div className="relative w-full max-w-xs h-full flex flex-col items-center justify-center z-10">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>

        <div className="absolute bottom-12 left-0 right-0 flex flex-col gap-6 items-center">
          <button
            disabled={(step === 'account' && (!username || !agreed)) || (step === 'signup' && (!email || !password || !confirmPassword)) || (step === 'login' && (!email || !password)) || (step === 'forgot_password' && !email)}
            onClick={() => {
              if (step === 'welcome') next('what_is');
              else if (step === 'what_is') next('what_is_not');
              else if (step === 'what_is_not') next('how_it_works');
              else if (step === 'how_it_works') next('layers');
              else if (step === 'layers') next('expectation');
              else if (step === 'expectation') next('signup');
              else if (step === 'signup') next('account');
              else if (step === 'login') onComplete(username || email.split('@')[0]);
              else if (step === 'forgot_password') next('login');
              else if (step === 'account') onComplete(username);
            }}
            className="btn-primary min-w-[200px] hover:shadow-accent/30 hover:scale-[1.02]"
          >
            {step === 'welcome' && '▶ Begin'}
            {(step === 'what_is' || step === 'what_is_not' || step === 'how_it_works' || step === 'layers' || step === 'expectation') && '▶ Continue'}
            {step === 'signup' && '▶ Create Account'}
            {step === 'login' && '▶ Login'}
            {step === 'forgot_password' && '▶ Send Reset Link'}
            {step === 'account' && '▶ Enter Training Floor'}
          </button>

          {step === 'welcome' && (
            <button
              onClick={() => setStep('login')}
              className="btn-passive"
            >
              Already have an account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
