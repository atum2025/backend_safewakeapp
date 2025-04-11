import { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
  duration?: number; // Duration in seconds, default 180 (3 minutes)
  onTimeout: () => void;
  isActive?: boolean;
}

const CountdownTimer = ({ 
  duration = 180, 
  onTimeout,
  isActive = true
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            onTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, onTimeout]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate minutes for display text
  const minutesRemaining = Math.ceil(timeLeft / 60);
  const minutesText = minutesRemaining === 1 ? 'minuto' : 'minutos';

  return (
    <div className="relative w-64 h-64 mb-4">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#EAEAEA" strokeWidth="8" />
        
        {/* Progress circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="none" 
          stroke="#FF6B00" 
          strokeWidth="8" 
          className="timer-progress timer-animation" 
        />
      </svg>
      
      {/* Timer Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-white">{formatTime(timeLeft)}</span>
        <span className="text-sm text-gray-300 mt-2">{minutesText} restantes</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
