/**
 * Date utility functions (replacing date-fns for Chrome Extension compatibility)
 */

function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function eachMonthOfInterval({ start, end }) {
  const months = [];
  const current = new Date(start);
  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function format(date, formatStr) {
  if (formatStr === 'MMM') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  }
  if (formatStr === 'EEE') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }
  return date.toString();
}

function getDay(date) {
  return date.getDay();
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Date utilities for full-year view
 */
class DateUtils {
  /**
   * Get all months for a given year
   * @param {number} year
   * @returns {Date[]} Array of month start dates
   */
  getMonthsForYear(year) {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(new Date(year, 0, 1));
    return eachMonthOfInterval({ start, end });
  }

  /**
   * Get days in month as array of date objects
   * @param {Date} monthDate
   * @returns {Array<{date: Date, dayOfMonth: number, dayOfWeek: string}>}
   */
  getDaysInMonth(monthDate) {
    const daysInMonth = getDaysInMonth(monthDate);
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      days.push({
        date,
        dayOfMonth: day,
        dayOfWeek: format(date, 'EEE').toUpperCase(),
        isWeekend: isWeekend(date)
      });
    }
    
    return days;
  }

  /**
   * Get month name abbreviation
   * @param {Date} monthDate
   * @returns {string} Month abbreviation (JAN, FEB, etc.)
   */
  getMonthAbbreviation(monthDate) {
    return format(monthDate, 'MMM').toUpperCase();
  }

  /**
   * Check if date is Saturday
   * @param {Date} date
   * @returns {boolean}
   */
  isSaturday(date) {
    return getDay(date) === 6;
  }

  /**
   * Check if date is Sunday
   * @param {Date} date
   * @returns {boolean}
   */
  isSunday(date) {
    return getDay(date) === 0;
  }
}

// Export as global
window.DateUtils = new DateUtils();

