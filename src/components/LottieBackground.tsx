import React, { useEffect, useRef } from 'react';
import { DotLottie } from '@lottiefiles/dotlottie-web';

interface LottieBackgroundProps {
  src: string;
  opacity?: number;
  className?: string;
}

export default function LottieBackground({ src, opacity = 1, className = "" }: LottieBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const dotLottie = new DotLottie({
        autoplay: true,
        loop: true,
        canvas: canvasRef.current,
        src: src,
      });

      return () => {
        dotLottie.destroy();
      };
    }
  }, [src]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} style={{ opacity }}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover"
      />
    </div>
  );
}
