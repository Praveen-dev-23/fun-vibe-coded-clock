import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Web Audio API synthesizer for a soothing, premium multi-tone chime.
 * Self-contained without external audio assets.
 */
export function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Peaceful 4-note bell chime: D5 (587.33), F#5 (739.99), A5 (880.00), D6 (1174.66)
    const notes = [
      { freq: 587.33, start: 0, duration: 0.8 },
      { freq: 739.99, start: 0.22, duration: 0.9 },
      { freq: 880.00, start: 0.44, duration: 1.1 },
      { freq: 1174.66, start: 0.66, duration: 1.5 },
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      // Smooth attack and lingering decay
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration + 0.05);
    });
  } catch (err) {
    console.warn('Timer chime could not be played:', err);
  }
}

export function useTimer(initialSeconds = 300) {
  const [duration, setDuration] = useState(() => {
    const saved = localStorage.getItem('one_timer_duration');
    return saved !== null ? parseInt(saved, 10) : initialSeconds;
  });

  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('one_timer_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const endTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Persist duration & sound settings
  useEffect(() => {
    localStorage.setItem('one_timer_duration', duration.toString());
  }, [duration]);

  useEffect(() => {
    localStorage.setItem('one_timer_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Main countdown ticker based on real timestamp delta
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const checkTime = () => {
      if (!endTimeRef.current) return;
      const remainingMs = endTimeRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeft(remainingSec);

      if (remainingSec <= 0) {
        setIsRunning(false);
        setIsCompleted(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (soundEnabled) {
          playChimeSound();
        }
      }
    };

    // Immediate check
    checkTime();

    intervalRef.current = setInterval(checkTime, 200);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, soundEnabled]);

  const start = useCallback(() => {
    if (isCompleted || timeLeft <= 0) {
      setTimeLeft(duration);
      endTimeRef.current = Date.now() + duration * 1000;
    } else {
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }
    setIsCompleted(false);
    setIsRunning(true);
  }, [duration, isCompleted, timeLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (endTimeRef.current) {
      const remainingSec = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remainingSec);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(duration);
    endTimeRef.current = null;
  }, [duration]);

  const setCustomDuration = useCallback((seconds) => {
    setIsRunning(false);
    setIsCompleted(false);
    setDuration(seconds);
    setTimeLeft(seconds);
    endTimeRef.current = null;
  }, []);

  const addTime = useCallback((additionalSeconds) => {
    setTimeLeft((prev) => {
      const next = prev + additionalSeconds;
      if (isRunning) {
        endTimeRef.current = Date.now() + next * 1000;
      }
      return next;
    });
    setDuration((prev) => Math.max(prev, prev + additionalSeconds));
  }, [isRunning]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const dismissCompleted = useCallback(() => {
    setIsCompleted(false);
  }, []);

  // Format helper: { hours, minutes, seconds, formattedString }
  const formatTime = useCallback((totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hrs > 0) {
      return {
        hasHours: true,
        hours: pad(hrs),
        minutes: pad(mins),
        seconds: pad(secs),
        formattedString: `${pad(hrs)}:${pad(mins)}:${pad(secs)}`,
      };
    }

    return {
      hasHours: false,
      hours: '00',
      minutes: pad(mins),
      seconds: pad(secs),
      formattedString: `${pad(mins)}:${pad(secs)}`,
    };
  }, []);

  // Progress percentage (0 to 1)
  const progress = duration > 0 ? Math.max(0, Math.min(1, (duration - timeLeft) / duration)) : 0;

  return {
    duration,
    timeLeft,
    isRunning,
    isCompleted,
    soundEnabled,
    progress,
    start,
    pause,
    toggle,
    reset,
    setCustomDuration,
    addTime,
    toggleSound,
    dismissCompleted,
    formatTime,
  };
}
