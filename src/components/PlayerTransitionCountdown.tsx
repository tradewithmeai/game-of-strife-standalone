import React, { useState, useEffect } from 'react';

interface PlayerTransitionCountdownProps {
  onTransitionComplete: () => void;
}

export const PlayerTransitionCountdown: React.FC<PlayerTransitionCountdownProps> = ({ 
  onTransitionComplete 
}) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      onTransitionComplete();
    }
  }, [countdown, onTransitionComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]">
      <div className="bg-retro-purple border-4 border-retro-cyan p-8 rounded-lg text-center animate-pulse">
        <div className="font-pixel text-2xl text-retro-cyan text-glow mb-4">
          PLAYER 2 START
        </div>
        
        {countdown > 0 ? (
          <div className="font-pixel text-6xl text-retro-yellow text-glow animate-bounce">
            {countdown}
          </div>
        ) : (
          <div className="font-pixel text-2xl text-retro-green text-glow">
            GO!
          </div>
        )}
        
        <div className="font-pixel text-sm text-retro-cyan mt-4">
          GET READY TO PLACE YOUR TOKENS
        </div>
      </div>
    </div>
  );
};