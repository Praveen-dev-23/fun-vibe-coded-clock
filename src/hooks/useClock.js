import { useState, useEffect } from 'react';

/**
 * Custom hook to get synchronized local system time with exact formatting.
 */
export function useClock(is24Hour = false) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Immediate precise sync
    let timerId;

    const tick = () => {
      const current = new Date();
      setNow(current);

      // Schedule next tick precisely on the millisecond boundary of the next second
      const msUntilNextSecond = 1000 - current.getMilliseconds();
      timerId = setTimeout(tick, msUntilNextSecond);
    };

    tick();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  // Time components
  const hoursRaw = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  let hoursDisplay;
  let period = null;

  if (is24Hour) {
    hoursDisplay = String(hoursRaw).padStart(2, '0');
  } else {
    const h12 = hoursRaw % 12 || 12;
    hoursDisplay = String(h12).padStart(2, '0');
    period = hoursRaw >= 12 ? 'PM' : 'AM';
  }

  // Full date: e.g. "Friday, October 23, 2026"
  const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });
  const fullDate = now.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Timezone resolution
  let timezoneAbbr = '';
  try {
    const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(now);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    timezoneAbbr = tzPart ? tzPart.value : '';
  } catch {
    timezoneAbbr = 'LOCAL';
  }

  // If timezone is generic offset, get system IANA name as fallback
  let timezoneName = '';
  try {
    timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    timezoneName = '';
  }

  return {
    rawDate: now,
    hours: hoursDisplay,
    minutes,
    seconds,
    period,
    weekday,
    fullDate,
    timezoneAbbr: timezoneAbbr || timezoneName,
    timezoneName,
    isoString: now.toISOString(),
  };
}
