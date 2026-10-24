import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Plus, Minus, ArrowLeft, BellRing } from 'lucide-react';

const PRESETS = [
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '15m', seconds: 900 },
  { label: '25m', seconds: 1500, highlight: 'Pomodoro' },
  { label: '45m', seconds: 2700 },
  { label: '60m', seconds: 3600 },
];

export default function TimerView({
  timer,
  fontWeight = 'light',
  onReturnToClock,
}) {
  const {
    duration,
    timeLeft,
    isRunning,
    isCompleted,
    soundEnabled,
    progress,
    toggle,
    reset,
    setCustomDuration,
    addTime,
    toggleSound,
    formatTime,
  } = timer;

  const timeData = formatTime(timeLeft);

  // SVG Ring calculation
  const circleSize = 340;
  const strokeWidth = 5;
  const center = circleSize / 2;
  const radius = center - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;
  // Progress goes from 0 (empty or full) to circumference
  const strokeDashoffset = circumference - (1 - progress) * circumference;

  return (
    <div className={`timer-stage ${isCompleted ? 'timer-completed-state' : ''}`}>
      {/* Top back button for direct touch/mouse navigation */}
      <div className="timer-top-actions">
        <button
          type="button"
          className="pill-button timer-back-btn"
          onClick={onReturnToClock}
          title="Back to Clock (Shortcut: C)"
        >
          <ArrowLeft size={15} />
          <span>CLOCK</span>
        </button>

        <button
          type="button"
          className={`pill-icon-button ${soundEnabled ? 'active-sound' : 'muted-sound'}`}
          onClick={toggleSound}
          title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
          aria-label={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Main Dial & Countdown Center */}
      <div className="timer-center-wrapper">
        <div className="timer-ring-container">
          <svg
            className="timer-svg"
            width="100%"
            height="100%"
            viewBox={`0 0 ${circleSize} ${circleSize}`}
            aria-hidden="true"
          >
            {/* Background track */}
            <circle
              className="timer-ring-bg"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Animated progress ring */}
            <circle
              className="timer-ring-progress"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </svg>

          {/* Time Numerals Centered in Ring */}
          <div className="timer-display-content">
            {isCompleted ? (
              <div className="timer-finished-badge">
                <BellRing size={32} className="bell-ringing" />
                <span className="finished-title">TIME'S UP</span>
              </div>
            ) : (
              <div
                className={`timer-digits weight-${fontWeight} ${
                  timeData.hasHours ? 'timer-with-hours' : ''
                }`}
                aria-live="polite"
              >
                {timeData.hasHours && (
                  <>
                    <span className="digit-chunk">{timeData.hours}</span>
                    <span className="timer-colon">:</span>
                  </>
                )}
                <span className="digit-chunk">{timeData.minutes}</span>
                <span className="timer-colon">:</span>
                <span className="digit-chunk">{timeData.seconds}</span>
              </div>
            )}

            {/* Sub-label showing session or total time */}
            <div className="timer-subcaption">
              {isCompleted
                ? 'Session complete'
                : isRunning
                ? 'Focusing'
                : `${Math.round(duration / 60)} min session`}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Adjust Stepper (-1m, +1m, +5m) */}
      <div className="timer-steppers" aria-label="Adjust timer duration">
        <button
          type="button"
          className="stepper-btn"
          onClick={() => addTime(-60)}
          disabled={timeLeft <= 60}
          title="Subtract 1 minute"
        >
          <Minus size={13} />
          <span>1m</span>
        </button>

        <button
          type="button"
          className="stepper-btn"
          onClick={() => addTime(60)}
          title="Add 1 minute"
        >
          <Plus size={13} />
          <span>1m</span>
        </button>

        <button
          type="button"
          className="stepper-btn"
          onClick={() => addTime(300)}
          title="Add 5 minutes"
        >
          <Plus size={13} />
          <span>5m</span>
        </button>
      </div>

      {/* Quick Presets Pills */}
      <div className="timer-presets" role="radiogroup" aria-label="Timer presets">
        {PRESETS.map((p) => {
          const isSelected = duration === p.seconds;
          return (
            <button
              key={p.seconds}
              type="button"
              className={`preset-pill ${isSelected ? 'active' : ''}`}
              onClick={() => setCustomDuration(p.seconds)}
              role="radio"
              aria-checked={isSelected}
              title={p.highlight ? `${p.label} (${p.highlight})` : p.label}
            >
              <span>{p.label}</span>
              {p.highlight && <span className="preset-highlight-dot" />}
            </button>
          );
        })}
      </div>

      {/* Primary Action Controls (Play / Pause, Reset) */}
      <div className="timer-actions">
        <button
          type="button"
          className="timer-btn-reset"
          onClick={reset}
          title="Reset timer (Shortcut: R)"
          aria-label="Reset timer"
        >
          <RotateCcw size={18} />
        </button>

        <button
          type="button"
          className={`timer-btn-primary ${isRunning ? 'running' : ''}`}
          onClick={toggle}
          title={isRunning ? 'Pause (Shortcut: Space)' : 'Start (Shortcut: Space)'}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? (
            <>
              <Pause size={18} />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>{isCompleted ? 'RESTART' : 'START'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
