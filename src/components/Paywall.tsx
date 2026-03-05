import React from 'react';
import { motion } from 'motion/react';
import { Brain, Check, X } from 'lucide-react';

interface PaywallProps {
  onClose: () => void;
  onSubscribe: () => void;
}

export default function Paywall({ onClose, onSubscribe }: PaywallProps) {
  return (
    <div className="fixed inset-0 bg-bg z-[100] flex flex-col p-8">
      <button 
        onClick={onClose}
        className="self-end p-2 opacity-40 hover:opacity-100 transition-opacity"
      >
        <X size={24} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 max-w-sm mx-auto">
        <div className="w-20 h-20 bg-accent rounded-[24px] flex items-center justify-center text-white shadow-lg">
          <Brain size={40} />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">Unlock Full Training</h1>
          <div className="space-y-2 text-lg opacity-60">
            <p>Access all workouts.</p>
            <p>Build all cognitive muscles.</p>
            <p>Train without limits.</p>
          </div>
        </div>

        <div className="w-full space-y-8">
          <div className="space-y-1">
            <div className="text-4xl font-bold text-accent">$9</div>
            <div className="text-sm opacity-50 uppercase tracking-widest font-medium">per month</div>
          </div>

          <div className="space-y-4">
            <button
              onClick={onSubscribe}
              className="btn-primary w-full text-lg"
            >
              ▶ Start Subscription
            </button>
            <button
              className="w-full py-4 text-sm font-medium opacity-40 hover:opacity-100 transition-opacity"
            >
              Restore Purchase
            </button>
          </div>

          <p className="text-[11px] opacity-40 uppercase tracking-widest">
            Cancel anytime in settings.
          </p>
        </div>
      </div>
    </div>
  );
}
