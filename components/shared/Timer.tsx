'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  isActive: boolean;
}

export default function Timer({ timeRemaining, totalTime, isActive }: TimerProps) {
  const [displayTime, setDisplayTime] = useState(timeRemaining);

  useEffect(() => {
    setDisplayTime(timeRemaining);
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    if (totalTime === 0) return '∞'; // Unlimited time
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (totalTime === 0) return 'text-gray-600 dark:text-gray-400';
    
    const percentage = (displayTime / totalTime) * 100;
    
    if (percentage > 50) return 'text-game-secondary';
    if (percentage > 20) return 'text-game-warning';
    return 'text-game-danger';
  };

  const getProgressPercentage = (): number => {
    if (totalTime === 0) return 0;
    return Math.max(0, (displayTime / totalTime) * 100);
  };

  const shouldPulse = (): boolean => {
    if (totalTime === 0) return false;
    const percentage = (displayTime / totalTime) * 100;
    return percentage <= 20 && isActive;
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`timer-display ${getTimerColor()} ${
          shouldPulse() ? 'animate-pulse-slow' : ''
        }`}
      >
        {formatTime(displayTime)}
      </div>
      
      {totalTime > 0 && (
        <div className="w-64 mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                getProgressPercentage() > 50
                  ? 'bg-game-secondary'
                  : getProgressPercentage() > 20
                  ? 'bg-game-warning'
                  : 'bg-game-danger'
              }`}
              style={{
                width: `${getProgressPercentage()}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0:00</span>
            <span>{formatTime(totalTime)}</span>
          </div>
        </div>
      )}
      
      {!isActive && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Timer paused
        </div>
      )}
    </div>
  );
} 