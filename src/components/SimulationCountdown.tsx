
import React, { useState, useEffect } from 'react';

interface SimulationCountdownProps {
  onCountdownComplete: () => void;
}

export const SimulationCountdown: React.FC<SimulationCountdownProps> = ({ onCountdownComplete }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
      } else {
        onCountdownComplete();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  if (countdown === 0) {
    return (
      <div className="fixed inset-0 bg-retro-dark bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center font-pixel">
          <div className="text-6xl text-retro-yellow text-glow animate-pulse mb-4">
            GO!
          </div>
          <div className="text-lg text-retro-cyan">
            STARTING SIMULATION...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-retro-dark bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center font-pixel">
        <div className="text-8xl text-retro-yellow text-glow animate-bounce mb-4">
          {countdown}
        </div>
        <div className="text-lg text-retro-cyan">
          STARTING SIMULATION IN...
        </div>
      </div>
    </div>
  );
};
