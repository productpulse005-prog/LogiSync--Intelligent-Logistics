/**
 * Helper utilities for rendering clean human-friendly delivery schedule dates, days, and time slots.
 * Always resolves dynamically to the user's runtime current date.
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentDateLiveLabel(): {
  dayName: string;
  formattedDate: string;
  fullDateString: string;
} {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  return {
    dayName,
    formattedDate,
    fullDateString: `${dayName}, ${formattedDate}`,
  };
}

export function parseDateSafe(dateStr?: string): Date {
  const now = new Date();
  if (!dateStr || dateStr.trim() === '') {
    return now;
  }

  // Check YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? now : parsed;
}

export function formatDeliverySchedule(deliveryDate?: string, deliveryWindow?: string): {
  dayName: string;
  formattedDate: string;
  window: string;
  fullScheduleLabel: string;
  isToday: boolean;
  isTomorrow: boolean;
  relativeDayLabel: string;
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let targetDate = parseDateSafe(deliveryDate);
  const targetStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  // If date was in the past (e.g. from an older session), roll it forward to today at runtime
  if (targetStart.getTime() < todayStart.getTime()) {
    targetDate = now;
  }

  const diffDays = Math.round((targetStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
  const isToday = diffDays <= 0;
  const isTomorrow = diffDays === 1;

  const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
  const formattedDate = targetDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const window = deliveryWindow || '02:00 PM – 05:00 PM';

  let relativeDayLabel = `${dayName}, ${formattedDate}`;
  if (isToday) {
    relativeDayLabel = `Today (${dayName}, ${formattedDate})`;
  } else if (isTomorrow) {
    relativeDayLabel = `Tomorrow (${dayName}, ${formattedDate})`;
  }

  return {
    dayName,
    formattedDate,
    window,
    fullScheduleLabel: `${relativeDayLabel} • ${window}`,
    isToday,
    isTomorrow,
    relativeDayLabel,
  };
}

export function getUpcomingScheduleSlots(): {
  slotId: string;
  dateStr: string;
  dayName: string;
  formattedDate: string;
  timeWindow: string;
  displayLabel: string;
}[] {
  const slots = [];
  const now = new Date();

  // Tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowYear = tomorrow.getFullYear();
  const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const tomorrowDayNum = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowDateStr = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDayNum}`;
  const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'short' });
  const tomorrowFormatted = tomorrow.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  // Day after tomorrow
  const dayAfter = new Date(now);
  dayAfter.setDate(now.getDate() + 2);
  const dayAfterYear = dayAfter.getFullYear();
  const dayAfterMonth = String(dayAfter.getMonth() + 1).padStart(2, '0');
  const dayAfterDayNum = String(dayAfter.getDate()).padStart(2, '0');
  const dayAfterDateStr = `${dayAfterYear}-${dayAfterMonth}-${dayAfterDayNum}`;
  const dayAfterDay = dayAfter.toLocaleDateString('en-US', { weekday: 'short' });
  const dayAfterFormatted = dayAfter.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  // 3 days later
  const day3 = new Date(now);
  day3.setDate(now.getDate() + 3);
  const day3Year = day3.getFullYear();
  const day3Month = String(day3.getMonth() + 1).padStart(2, '0');
  const day3DayNum = String(day3.getDate()).padStart(2, '0');
  const day3DateStr = `${day3Year}-${day3Month}-${day3DayNum}`;
  const day3Day = day3.toLocaleDateString('en-US', { weekday: 'short' });
  const day3Formatted = day3.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  slots.push(
    {
      slotId: `${tomorrowDateStr}_morning`,
      dateStr: tomorrowDateStr,
      dayName: tomorrowDay,
      formattedDate: tomorrowFormatted,
      timeWindow: '10:00 AM – 01:00 PM',
      displayLabel: `Tomorrow (${tomorrowDay}, ${tomorrowFormatted}) • 10:00 AM – 01:00 PM`,
    },
    {
      slotId: `${tomorrowDateStr}_afternoon`,
      dateStr: tomorrowDateStr,
      dayName: tomorrowDay,
      formattedDate: tomorrowFormatted,
      timeWindow: '02:00 PM – 05:00 PM',
      displayLabel: `Tomorrow (${tomorrowDay}, ${tomorrowFormatted}) • 02:00 PM – 05:00 PM`,
    },
    {
      slotId: `${tomorrowDateStr}_evening`,
      dateStr: tomorrowDateStr,
      dayName: tomorrowDay,
      formattedDate: tomorrowFormatted,
      timeWindow: '06:00 PM – 09:00 PM',
      displayLabel: `Tomorrow (${tomorrowDay}, ${tomorrowFormatted}) • 06:00 PM – 09:00 PM`,
    },
    {
      slotId: `${dayAfterDateStr}_morning`,
      dateStr: dayAfterDateStr,
      dayName: dayAfterDay,
      formattedDate: dayAfterFormatted,
      timeWindow: '10:00 AM – 01:00 PM',
      displayLabel: `${dayAfterDay}, ${dayAfterFormatted} • 10:00 AM – 01:00 PM`,
    },
    {
      slotId: `${dayAfterDateStr}_afternoon`,
      dateStr: dayAfterDateStr,
      dayName: dayAfterDay,
      formattedDate: dayAfterFormatted,
      timeWindow: '02:00 PM – 05:00 PM',
      displayLabel: `${dayAfterDay}, ${dayAfterFormatted} • 02:00 PM – 05:00 PM`,
    },
    {
      slotId: `${day3DateStr}_morning`,
      dateStr: day3DateStr,
      dayName: day3Day,
      formattedDate: day3Formatted,
      timeWindow: '10:00 AM – 01:00 PM',
      displayLabel: `${day3Day}, ${day3Formatted} • 10:00 AM – 01:00 PM`,
    }
  );

  return slots;
}
