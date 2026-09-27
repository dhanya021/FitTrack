/**
 * Calculates current and longest workout streaks based on workout dates.
 * A streak is defined as consecutive calendar days with at least 1 workout.
 * 
 * @param {Array<Date|string>} dates - Array of workout dates
 * @returns {{ currentStreak: number, longestStreak: number }}
 */
const calculateStreaks = (dates) => {
  if (!dates || dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Normalize each date to local YYYY-MM-DD string to avoid timezone bugs
  const toDateString = (d) => {
    const dateObj = new Date(d);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Unique sorted dates
  const uniqueDateStrings = Array.from(
    new Set(dates.map((d) => toDateString(d)))
  ).sort();

  if (uniqueDateStrings.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Convert YYYY-MM-DD to epoch days (UTC midnight representation)
  const getEpochDay = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return Math.floor(Date.UTC(y, m - 1, d) / (24 * 60 * 60 * 1000));
  };

  const epochDays = uniqueDateStrings.map(getEpochDay);

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < epochDays.length; i++) {
    if (epochDays[i] === epochDays[i - 1] + 1) {
      tempStreak += 1;
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Calculate current streak
  const now = new Date();
  const todayStr = toDateString(now);
  const todayEpoch = getEpochDay(todayStr);
  const yesterdayEpoch = todayEpoch - 1;

  const dateSet = new Set(epochDays);

  let currentStreak = 0;

  if (dateSet.has(todayEpoch)) {
    // Workout done today: count backwards from today
    let checkDay = todayEpoch;
    while (dateSet.has(checkDay)) {
      currentStreak += 1;
      checkDay -= 1;
    }
  } else if (dateSet.has(yesterdayEpoch)) {
    // No workout yet today, but workout done yesterday: streak is active
    let checkDay = yesterdayEpoch;
    while (dateSet.has(checkDay)) {
      currentStreak += 1;
      checkDay -= 1;
    }
  } else {
    // Neither today nor yesterday had a workout
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak)
  };
};

module.exports = { calculateStreaks };
