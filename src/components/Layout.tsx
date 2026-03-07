import React from 'react';
import { motion } from 'motion/react';
import { Home, Wind, Activity, Brain, User, MessageSquare } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'workouts', icon: Activity, label: 'Train' },
    { id: 'now', icon: Brain, label: 'Reset' },
    { id: 'drift', icon: Wind, label: 'Drift' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-bg relative overflow-hidden selection:bg-accent/10 selection:text-accent depth-bg">
      {/* Subtle Header */}
      <header className="px-8 pt-[72px] pb-10 flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="font-serif italic text-3xl tracking-tight text-ink">LearnMyMind</h1>
          <div className="text-[9px] font-mono uppercase tracking-[0.3em] opacity-30 text-ink">Cognitive Laboratory</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="px-8"
        >
          {children}
        </motion.div>
      </main>

      {/* Minimal Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface/80 backdrop-blur-xl border-t border-line px-8 py-6 z-50">
        <div className="flex justify-between items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${
                activeTab === tab.id ? 'text-accent scale-105' : 'text-neutral hover:text-ink'
              }`}
            >
              <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
              <span className={`text-[9px] font-mono uppercase tracking-wider transition-opacity duration-300 ${
                activeTab === tab.id ? 'opacity-100' : 'opacity-40'
              }`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-3 w-1 h-1 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
