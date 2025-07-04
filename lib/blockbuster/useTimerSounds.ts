import { useRef, useEffect } from 'react';

export interface TimerSounds {
  playStartSound: () => void;
  playTicksSound: () => void;
  stopTicksSound: () => void;
  playEndSound: () => void;
}

export function useTimerSounds(): TimerSounds {
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const ticksSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements
    startSoundRef.current = new Audio('/lib/blockbuster/timer-start.mp3');
    ticksSoundRef.current = new Audio('/lib/blockbuster/timer-ticks.mp3');
    endSoundRef.current = new Audio('/lib/blockbuster/timer-end.mp3');

    // Configure audio elements
    if (startSoundRef.current) {
      startSoundRef.current.preload = 'auto';
      startSoundRef.current.volume = 0.3;
    }

    if (ticksSoundRef.current) {
      ticksSoundRef.current.preload = 'auto';
      ticksSoundRef.current.volume = 0.7;
    //   ticksSoundRef.current.loop = true;
    }

    if (endSoundRef.current) {
      endSoundRef.current.preload = 'auto';
      endSoundRef.current.volume = 0.8;
    }

    // Cleanup function
    return () => {
      if (startSoundRef.current) {
        startSoundRef.current.pause();
        startSoundRef.current.src = '';
      }
      if (ticksSoundRef.current) {
        ticksSoundRef.current.pause();
        ticksSoundRef.current.src = '';
      }
      if (endSoundRef.current) {
        endSoundRef.current.pause();
        endSoundRef.current.src = '';
      }
    };
  }, []);

  const playStartSound = () => {
    if (startSoundRef.current) {
      startSoundRef.current.currentTime = 0;
      startSoundRef.current.play().catch(console.error);
    }
  };

  const playTicksSound = () => {
    if (ticksSoundRef.current && ticksSoundRef.current.paused) {
      ticksSoundRef.current.currentTime = 0;
      ticksSoundRef.current.play().catch(console.error);
    }
  };

  const stopTicksSound = () => {
    if (ticksSoundRef.current && !ticksSoundRef.current.paused) {
      ticksSoundRef.current.pause();
      ticksSoundRef.current.currentTime = 0;
    }
  };

  const playEndSound = () => {
    if (endSoundRef.current) {
      endSoundRef.current.currentTime = 0;
      // Add a small delay to ensure the ticks sound has stopped
      setTimeout(() => {
        if (endSoundRef.current) {
          endSoundRef.current.play().catch(console.error);
        }
      }, 50);
    }
  };

  return {
    playStartSound,
    playTicksSound,
    stopTicksSound,
    playEndSound,
  };
} 