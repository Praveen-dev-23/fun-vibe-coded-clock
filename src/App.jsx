import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useClock } from './hooks/useClock';
import ControlDock from './components/ControlDock';
import SettingsModal from './components/SettingsModal';

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

  // UI state
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHoveringDock, setIsHoveringDock] = useState(false);

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

  // Controls auto-hide timer handler
  const resetInactivityTimer = useCallback(() => {
    setControlsVisible(true);

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Auto-hide controls after 3.2 seconds if not hovering dock and modal is closed
    inactivityTimerRef.current = setTimeout(() => {
      if (!isSettingsOpen && !isHoveringDock) {
        setControlsVisible(false);
      }
    }, 3200);
  }, [isSettingsOpen, isHoveringDock]);

  // Activity listeners: mouse, touch, keyboard
  useEffect(() => {
    const handleActivity = () => {
      resetInactivityTimer();
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('mousedown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    // Initial timeout trigger on page load
    resetInactivityTimer();

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

      if (key === 'f') {
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
  }, [toggleFullscreen, resetInactivityTimer]);

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

      {/* Primary Full-screen Clock Display */}
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
          onDockMouseEnter={() => setIsHoveringDock(true)}
          onDockMouseLeave={() => {
            setIsHoveringDock(false);
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
