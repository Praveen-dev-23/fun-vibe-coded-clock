import React from 'react';
import { Maximize2, Minimize2, Sliders, Clock, Eye, EyeOff } from 'lucide-react';

export default function ControlDock({
  theme,
  setTheme,
  is24Hour,
  setIs24Hour,
  showSeconds,
  setShowSeconds,
  isFullscreen,
  toggleFullscreen,
  openSettings,
  onDockMouseEnter,
  onDockMouseLeave,
}) {
  return (
    <>
      {/* Top Bar: Subtle branding & hint */}
      <header className="top-bar" aria-label="Brand and application state">
        <div className="brand-title">
          <span className="brand-dot" />
          <span>ONE</span>
        </div>
      </header>

      {/* Bottom Floating Control Dock */}
      <nav
        className="bottom-dock"
        aria-label="Clock controls"
        onMouseEnter={onDockMouseEnter}
        onMouseLeave={onDockMouseLeave}
      >
        {/* 12h / 24h Switch */}
        <button
          type="button"
          className={`pill-button ${is24Hour ? 'active' : ''}`}
          onClick={() => setIs24Hour((prev) => !prev)}
          title="Toggle 12h/24h format (Shortcut: M)"
          aria-label={`Switch to ${is24Hour ? '12-hour' : '24-hour'} format`}
        >
          <span>{is24Hour ? '24H' : '12H'}</span>
        </button>

        {/* Seconds Toggle */}
        <button
          type="button"
          className={`pill-button ${showSeconds ? 'active' : ''}`}
          onClick={() => setShowSeconds((prev) => !prev)}
          title="Toggle seconds (Shortcut: S)"
          aria-label={`${showSeconds ? 'Hide' : 'Show'} seconds`}
        >
          {showSeconds ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>SEC</span>
        </button>

        <div className="dock-divider" role="separator" />

        {/* Theme Quick Switcher */}
        <div className="theme-switcher-group" role="radiogroup" aria-label="Select theme">
          <button
            type="button"
            className={`theme-pill-btn ${theme === 'midnight' ? 'active' : ''}`}
            onClick={() => setTheme('midnight')}
            title="Midnight Theme"
            role="radio"
            aria-checked={theme === 'midnight'}
            aria-label="Midnight theme"
          >
            <span className="theme-dot-preview preview-midnight" />
          </button>
          <button
            type="button"
            className={`theme-pill-btn ${theme === 'warm-paper' ? 'active' : ''}`}
            onClick={() => setTheme('warm-paper')}
            title="Warm Paper Theme"
            role="radio"
            aria-checked={theme === 'warm-paper'}
            aria-label="Warm Paper theme"
          >
            <span className="theme-dot-preview preview-warm-paper" />
          </button>
          <button
            type="button"
            className={`theme-pill-btn ${theme === 'amber-glow' ? 'active' : ''}`}
            onClick={() => setTheme('amber-glow')}
            title="Amber Glow Theme"
            role="radio"
            aria-checked={theme === 'amber-glow'}
            aria-label="Amber Glow theme"
          >
            <span className="theme-dot-preview preview-amber-glow" />
          </button>
        </div>

        <div className="dock-divider" role="separator" />

        {/* Fullscreen Button */}
        <button
          type="button"
          className="pill-icon-button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen (Shortcut: F)' : 'Enter fullscreen (Shortcut: F)'}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          className="pill-icon-button"
          onClick={openSettings}
          title="Open settings"
          aria-label="Open settings"
        >
          <Sliders size={16} />
        </button>
      </nav>
    </>
  );
}
