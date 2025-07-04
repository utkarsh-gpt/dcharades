'use client';

import { useEffect, useState, useRef } from 'react';
import Timer from '../shared/Timer';
import { useTimerSounds } from '@/lib/blockbuster/useTimerSounds';

interface BlockbusterTimerProps {
  timeRemaining: number;
  totalTime: number;
  isActive: boolean;
  onTimerEnd?: () => void;
  onTimerStart?: () => void;
}

export default function BlockbusterTimer({ 
  timeRemaining, 
  totalTime, 
  isActive, 
  onTimerEnd,
  onTimerStart 
}: BlockbusterTimerProps) {
  const [prevTimeRemaining, setPrevTimeRemaining] = useState(timeRemaining);
  const [prevIsActive, setPrevIsActive] = useState(isActive);
  const [hasStarted, setHasStarted] = useState(false);
  const { playStartSound, playTicksSound, stopTicksSound, playEndSound } = useTimerSounds();
  const isTickingSoundPlaying = useRef(false);

  useEffect(() => {
    // Timer started
    playTicksSound();
    if (!prevIsActive && isActive && timeRemaining > 0) {
      setHasStarted(true);
      playStartSound();
      onTimerStart?.();
      
      // Start ticking sound after a short delay to let start sound play
      setTimeout(() => {
        if (timeRemaining > 0) {
          isTickingSoundPlaying.current = true;
        }
      }, 500);
    }

    // Timer stopped/paused
    if (prevIsActive && !isActive) {
      stopTicksSound();
      isTickingSoundPlaying.current = false;
    }

    // Timer resumed
    if (!prevIsActive && isActive && hasStarted && timeRemaining > 0) {
      playTicksSound();
      isTickingSoundPlaying.current = true;
    }

    // Timer ended
    if (prevTimeRemaining > 0 && timeRemaining === 0 && isActive) {
      playEndSound();
      setTimeout(() => {
        stopTicksSound();
        isTickingSoundPlaying.current = false;
      }, 100);
      onTimerEnd?.();
    }

    // Timer was reset to a higher value (button press in head-to-head)
    if (prevTimeRemaining < timeRemaining && isActive && hasStarted) {
      // This indicates a timer reset/extension - play start sound
      playStartSound();
      
      // Ensure ticking sound is playing
      if (!isTickingSoundPlaying.current) {
        setTimeout(() => {
          if (timeRemaining > 0 && isActive) {
            playTicksSound();
            isTickingSoundPlaying.current = true;
          }
        }, 500);
      }
    }

    setPrevTimeRemaining(timeRemaining);
    setPrevIsActive(isActive);
  }, [timeRemaining, isActive, prevTimeRemaining, prevIsActive, hasStarted, playStartSound, playTicksSound, stopTicksSound, playEndSound, onTimerEnd, onTimerStart]);

  // Clean up sounds when component unmounts or timer becomes inactive
  useEffect(() => {
    return () => {
      if (isTickingSoundPlaying.current) {
        stopTicksSound();
        isTickingSoundPlaying.current = false;
      }
    };
  }, [stopTicksSound]);

  // Stop ticking sound when timer becomes inactive (but not when it reaches 0, that's handled above)
  useEffect(() => {
    if (!isActive && timeRemaining > 0 && isTickingSoundPlaying.current) {
      stopTicksSound();
      isTickingSoundPlaying.current = false;
    }
  }, [isActive, timeRemaining, stopTicksSound]);

  return (
    <Timer
      timeRemaining={timeRemaining}
      totalTime={totalTime}
      isActive={isActive}
    />
  );
} 