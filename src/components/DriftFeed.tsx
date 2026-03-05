import React from 'react';
import { DRIFT_TILES } from '../constants';
import { motion } from 'motion/react';

export default function DriftFeed() {
  return (
    <div className="space-y-16 pb-24">
      <header className="text-center space-y-3">
        <p className="text-[10px] font-mono opacity-30 uppercase tracking-[0.3em]">Module: Drift</p>
        <h2 className="font-serif italic text-4xl">Psychological Mirroring</h2>
        <div className="w-12 h-px bg-line mx-auto mt-6" />
      </header>

      <div className="space-y-32">
        {DRIFT_TILES.map((tile, index) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center space-y-8"
          >
            {tile.type === 'image' ? (
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-bg group">
                <img
                  src={tile.imageUrl}
                  alt={tile.content}
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-in-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
              </div>
            ) : (
              <div className="py-20 px-8 border-t border-b border-line w-full relative overflow-hidden">
                <p className="font-serif text-3xl leading-relaxed italic text-ink/90 relative z-10">
                  "{tile.content}"
                </p>
                <div className="absolute top-4 left-4 text-[8px] font-mono opacity-20 tracking-widest">TEXT_FRAGMENT_{tile.id}</div>
              </div>
            )}
            <div className="font-mono text-[9px] opacity-20 tracking-[0.4em] uppercase">
              REF_ID_00{tile.id} // ANALYSIS_PENDING
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-24 space-y-8">
        <div className="w-px h-24 bg-gradient-to-b from-line to-transparent mx-auto" />
        <p className="text-[9px] font-mono uppercase tracking-[0.5em] opacity-20">End of Analysis Stream</p>
      </div>
    </div>
  );
}
