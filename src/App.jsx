import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useClock } from './hooks/useClock';
import { useTimer } from './hooks/useTimer';
import ControlDock from './components/ControlDock';
import SettingsModal from './components/SettingsModal';
import TimerView from './components/TimerView';
import { Bell, ArrowRight } from 'lucide-react';

const THEMES = {
  MIDNIGHT: 'midnight',
  WARM_PAPER: 'warm-paper',
  AMBER_GLOW: 'amber-glow',
};

const THEME_CYCLE = [THEMES.MIDNIGHT, THEMES.WARM_PAPER, THEMES.AMBER_GLOW];

export default function App() {
  // Persistent Settings
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('one_theme') || THEMES.MIDNIGHT;
  });

  const [is24Hour, setIs24Hour] = useState(() => {
    const saved = localStorage.getItem('one_is_24h');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [showSeconds, setShowSeconds] = useState(() => {
    const saved = localStorage.getItem('one_show_seconds');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [showDate, setShowDate] = useState(() => {
    const saved = localStorage.getItem('one_show_date');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [fontWeight, setFontWeight] = useState(() => {
    return localStorage.getItem('one_font_weight') || 'light';
  });

  const [colonBlink, setColonBlink] = useState(() => {
    const saved = localStorage.getItem('one_colon_blink');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Mode: 'clock' | 'timer'
  const [activeMode, setActiveMode] = useState('clock');

  // UI state
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const inactivityTimerRef = useRef(null);

  // Synchronized system clock hook
  const {
    hours,
    minutes,
    seconds,
    period,
    weekday,
    fullDate,
    timezoneAbbr,
    isoString,
  } = useClock(is24Hour);

  // Timer hook
  const timer = useTimer(300);
  const timerFormatted = timer.formatTime(timer.timeLeft);
  const timerBadge = timerFormatted.formattedString;

  // Update HTML data-theme and meta theme-color
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('one_theme', theme);

    const metaTheme = document.getElementById('meta-theme-color');
    if (metaTheme) {
      if (theme === THEMES.WARM_PAPER) {
        metaTheme.setAttribute('content', '#F6F4EE');
      } else if (theme === THEMES.AMBER_GLOW) {
        metaTheme.setAttribute('content', '#090603');
      } else {
        metaTheme.setAttribute('content', '#080808');
      }
    }
  }, [theme]);

  // Save other settings to localStorage
  useEffect(() => {
    localStorage.setItem('one_is_24h', JSON.stringify(is24Hour));
  }, [is24Hour]);

  useEffect(() => {
    localStorage.setItem('one_show_seconds', JSON.stringify(showSeconds));
  }, [showSeconds]);

  useEffect(() => {
    localStorage.setItem('one_show_date', JSON.stringify(showDate));
  }, [showDate]);

  useEffect(() => {
    localStorage.setItem('one_font_weight', fontWeight);
  }, [fontWeight]);

  useEffect(() => {
    localStorage.setItem('one_colon_blink', JSON.stringify(colonBlink));
  }, [colonBlink]);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request could not be fulfilled:', err);
    }
  }, []);

  // Refs to avoid stale closures in event listeners and timeouts
  const isHoveringDockRef = useRef(false);
  const isSettingsOpenRef = useRef(isSettingsOpen);
  const activeModeRef = useRef(activeMode);

  useEffect(() => {
    isSettingsOpenRef.current = isSettingsOpen;
  }, [isSettingsOpen]);

  useEffect(() => {
    activeModeRef.current = activeMode;
  }, [activeMode]);

  // Controls auto-hide timer handler
  const resetInactivityTimer = useCallback(() => {
    setControlsVisible(true);

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    // Keep controls persistently visible when hovering dock, in settings, or in timer mode
    if (isHoveringDockRef.current || isSettingsOpenRef.current || activeModeRef.current === 'timer') {
      return;
    }

    // Auto-hide controls after 5 seconds of inactivity on main clock view
    inactivityTimerRef.current = setTimeout(() => {
      if (!isHoveringDockRef.current && !isSettingsOpenRef.current && activeModeRef.current !== 'timer') {
        setControlsVisible(false);
      }
    }, 5000);
  }, []);

  // Activity listeners: mouse, touch, keyboard
  useEffect(() => {
    const handleActivity = () => {
      resetInactivityTimer();
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('mousedown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [resetInactivityTimer]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is inside an input or form
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();

      if (key === 'c') {
        e.preventDefault();
        setActiveMode((prev) => (prev === 'clock' ? 'timer' : 'clock'));
        resetInactivityTimer();
      } else if (e.code === 'Space' && activeMode === 'timer') {
        e.preventDefault();
        timer.toggle();
        resetInactivityTimer();
      } else if (key === 'r' && activeMode === 'timer') {
        e.preventDefault();
        timer.reset();
        resetInactivityTimer();
      } else if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
        resetInactivityTimer();
      } else if (key === 'h') {
        e.preventDefault();
        setControlsVisible((prev) => !prev);
      } else if (key === 't') {
        e.preventDefault();
        setTheme((prev) => {
          const currentIndex = THEME_CYCLE.indexOf(prev);
          const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
          return THEME_CYCLE[nextIndex];
        });
        resetInactivityTimer();
      } else if (key === 's') {
        e.preventDefault();
        setShowSeconds((prev) => !prev);
        resetInactivityTimer();
      } else if (key === 'm') {
        e.preventDefault();
        setIs24Hour((prev) => !prev);
        resetInactivityTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, resetInactivityTimer, activeMode, timer]);

  return (
    <div
      className={`clock-viewport ${!controlsVisible ? 'cursor-hidden' : ''}`}
      onClick={() => {
        if (!controlsVisible) {
          setControlsVisible(true);
          resetInactivityTimer();
        }
      }}
    >
      {/* Ambient background glow for Amber Glow theme */}
      <div className="ambient-glow" aria-hidden="true" />

      {/* Timer Completion Banner when on Clock view */}
      {timer.isCompleted && activeMode === 'clock' && (
        <aside className="timer-notification-toast" role="alert" aria-live="assertive">
          <div className="toast-left">
            <span className="toast-icon-wrap">
              <Bell size={16} />
            </span>
            <span className="toast-message">Timer session completed</span>
          </div>
          <div className="toast-right">
            <button
              type="button"
              className="toast-btn primary"
              onClick={() => {
                setActiveMode('timer');
                timer.dismissCompleted();
              }}
            >
              <span>View</span>
              <ArrowRight size={13} />
            </button>
            <button
              type="button"
              className="toast-btn secondary"
              onClick={timer.dismissCompleted}
            >
              Dismiss
            </button>
          </div>
        </aside>
      )}

      {/* Main Stage: Clock OR Timer */}
      {activeMode === 'clock' ? (
        <main className="clock-main-stage" aria-label="Current local time">
          <div className="time-wrapper">
            <time
              dateTime={isoString}
              className={`time-display weight-${fontWeight} ${
                showSeconds ? 'time-with-seconds' : 'time-without-seconds'
              }`}
            >
              {/* Hours */}
              <span className="digit-chunk">{hours}</span>

              {/* Separator */}
              <span
                className={`time-colon ${colonBlink ? 'colon-blinking' : ''}`}
                aria-hidden="true"
              >
                :
              </span>

              {/* Minutes */}
              <span className="digit-chunk">{minutes}</span>

              {/* Optional Seconds */}
              {showSeconds && (
                <>
                  <span
                    className={`time-colon ${colonBlink ? 'colon-blinking' : ''}`}
                    aria-hidden="true"
                  >
                    :
                  </span>
                  <span className="digit-chunk seconds-chunk">{seconds}</span>
                </>
              )}
            </time>

            {/* AM / PM Badge in 12h mode */}
            {!is24Hour && period && (
              <span className="period-badge" aria-label={period}>
                {period}
              </span>
            )}
          </div>

          {/* Calendar & Timezone Metadata */}
          {showDate && (
            <div className="clock-metadata" aria-label="Date and timezone">
              <span className="meta-item">{weekday}</span>
              <span className="meta-dot" aria-hidden="true" />
              <span className="meta-item">{fullDate}</span>
              <span className="meta-dot" aria-hidden="true" />
              <span className="meta-item meta-timezone" title="Local system timezone">
                {timezoneAbbr}
              </span>
            </div>
          )}
        </main>
      ) : (
        <main className="timer-main-stage" aria-label="Focus timer">
          <TimerView
            timer={timer}
            fontWeight={fontWeight}
            onReturnToClock={() => {
              setActiveMode('clock');
              resetInactivityTimer();
            }}
          />
        </main>
      )}

      {/* Floating Discreet Control Dock */}
      <div
        className={`control-overlay ${
          controlsVisible || isSettingsOpen ? 'visible' : 'hidden'
        }`}
        aria-hidden={!controlsVisible && !isSettingsOpen}
      >
        <ControlDock
          theme={theme}
          setTheme={setTheme}
          is24Hour={is24Hour}
          setIs24Hour={setIs24Hour}
          showSeconds={showSeconds}
          setShowSeconds={setShowSeconds}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          openSettings={() => setIsSettingsOpen(true)}
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          isTimerRunning={timer.isRunning}
          timerBadge={timerBadge}
          onDockMouseEnter={() => {
            isHoveringDockRef.current = true;
            if (inactivityTimerRef.current) {
              clearTimeout(inactivityTimerRef.current);
              inactivityTimerRef.current = null;
            }
            setControlsVisible(true);
          }}
          onDockMouseLeave={() => {
            isHoveringDockRef.current = false;
            resetInactivityTimer();
          }}
        />
      </div>

      {/* Floating Settings Preferences Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          resetInactivityTimer();
        }}
        theme={theme}
        setTheme={setTheme}
        is24Hour={is24Hour}
        setIs24Hour={setIs24Hour}
        showSeconds={showSeconds}
        setShowSeconds={setShowSeconds}
        showDate={showDate}
        setShowDate={setShowDate}
        fontWeight={fontWeight}
        setFontWeight={setFontWeight}
        colonBlink={colonBlink}
        setColonBlink={setColonBlink}
      />
    </div>
  );
}

