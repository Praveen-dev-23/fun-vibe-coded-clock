import React, { useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  is24Hour,
  setIs24Hour,
  showSeconds,
  setShowSeconds,
  showDate,
  setShowDate,
  fontWeight,
  setFontWeight,
  colonBlink,
  setColonBlink,
}) {
  const modalRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="settings-card" ref={modalRef}>
        <div className="settings-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-color)" />
            <h2 id="settings-title" className="settings-title">Preferences</h2>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close preferences"
          >
            <X size={16} />
          </button>
        </div>

        <div className="settings-section">
          {/* Theme Selector */}
          <div className="settings-row">
            <div className="settings-label">
              <span className="label-title">Theme</span>
              <span className="label-subtitle">Visual atmosphere & palette</span>
            </div>
            <div className="segmented-control" role="radiogroup" aria-label="Select theme">
              <button
                type="button"
                className={`segment-btn ${theme === 'midnight' ? 'active' : ''}`}
                onClick={() => setTheme('midnight')}
                role="radio"
                aria-checked={theme === 'midnight'}
              >
                Midnight
              </button>
              <button
                type="button"
                className={`segment-btn ${theme === 'warm-paper' ? 'active' : ''}`}
                onClick={() => setTheme('warm-paper')}
                role="radio"
                aria-checked={theme === 'warm-paper'}
              >
                Paper
              </button>
              <button
                type="button"
                className={`segment-btn ${theme === 'amber-glow' ? 'active' : ''}`}
                onClick={() => setTheme('amber-glow')}
                role="radio"
                aria-checked={theme === 'amber-glow'}
              >
                Amber
              </button>
            </div>
          </div>

          {/* 12 / 24 Hour Toggle */}
          <div className="settings-row">
            <div className="settings-label">
              <span className="label-title">24-Hour Format</span>
              <span className="label-subtitle">Display 00–23 instead of 12-hour AM/PM</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={is24Hour}
                onChange={(e) => setIs24Hour(e.target.checked)}
                aria-label="Toggle 24-hour time format"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Seconds Toggle */}
          <div className="settings-row">
            <div className="settings-label">
              <span className="label-title">Show Seconds</span>
              <span className="label-subtitle">Continuous real-time precision</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showSeconds}
                onChange={(e) => setShowSeconds(e.target.checked)}
                aria-label="Toggle seconds display"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Date & Timezone Toggle */}
          <div className="settings-row">
            <div className="settings-label">
              <span className="label-title">Date & Timezone</span>
              <span className="label-subtitle">Subtle calendar line beneath clock</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showDate}
                onChange={(e) => setShowDate(e.target.checked)}
                aria-label="Toggle date and timezone visibility"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Colon Pulse */}
          <div className="settings-row">
            <div className="settings-label">
              <span className="label-title">Pulsing Colon</span>
              <span className="label-subtitle">Soft rhythmic breathing between units</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={colonBlink}
                onChange={(e) => setColonBlink(e.target.checked)}
                aria-label="Toggle pulsing colon"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Typography Weight */}
          <div className="settings-row">
            <div className="settings-label">
              <span className="label-title">Type Weight</span>
              <span className="label-subtitle">Stroke thickness of numerals</span>
            </div>
            <div className="segmented-control" role="radiogroup" aria-label="Font weight">
              <button
                type="button"
                className={`segment-btn ${fontWeight === 'ultralight' ? 'active' : ''}`}
                onClick={() => setFontWeight('ultralight')}
              >
                Thin
              </button>
              <button
                type="button"
                className={`segment-btn ${fontWeight === 'light' ? 'active' : ''}`}
                onClick={() => setFontWeight('light')}
              >
                Light
              </button>
              <button
                type="button"
                className={`segment-btn ${fontWeight === 'regular' ? 'active' : ''}`}
                onClick={() => setFontWeight('regular')}
              >
                Regular
              </button>
              <button
                type="button"
                className={`segment-btn ${fontWeight === 'medium' ? 'active' : ''}`}
                onClick={() => setFontWeight('medium')}
              >
                Medium
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="shortcut-guide">
            <div className="shortcut-title">Keyboard Shortcuts</div>
            <div className="shortcut-grid">
              <div className="shortcut-item">
                <span>Clock / Timer</span>
                <span className="kbd">C</span>
              </div>
              <div className="shortcut-item">
                <span>Fullscreen</span>
                <span className="kbd">F</span>
              </div>
              <div className="shortcut-item">
                <span>Hide / Show Controls</span>
                <span className="kbd">H</span>
              </div>
              <div className="shortcut-item">
                <span>Cycle Theme</span>
                <span className="kbd">T</span>
              </div>
              <div className="shortcut-item">
                <span>Toggle Seconds</span>
                <span className="kbd">S</span>
              </div>
              <div className="shortcut-item">
                <span>12h / 24h</span>
                <span className="kbd">M</span>
              </div>
              <div className="shortcut-item">
                <span>Timer Play/Pause</span>
                <span className="kbd">SPACE</span>
              </div>
              <div className="shortcut-item">
                <span>Close Settings</span>
                <span className="kbd">ESC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

