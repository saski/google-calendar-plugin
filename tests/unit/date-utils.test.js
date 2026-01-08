// Load source file which attaches DateUtils to window
require('../../src/utils/date-utils.js');

describe('DateUtils', () => {
  test('should get 12 months for year', () => {
    const months = window.DateUtils.getMonthsForYear(2026);
    expect(months).toHaveLength(12);
  });

  test('should get correct days in month', () => {
    const jan2026 = new Date(2026, 0, 1);
    const days = window.DateUtils.getDaysInMonth(jan2026);
    expect(days).toHaveLength(31);
    expect(days[0].dayOfMonth).toBe(1);
    expect(days[0].dayOfWeek).toBe('THU');
  });

  test('should identify weekends correctly', () => {
    const jan2026 = new Date(2026, 0, 1); // Thursday
    const days = window.DateUtils.getDaysInMonth(jan2026);
    const saturday = days.find(d => d.dayOfMonth === 3); // Jan 3 is Saturday
    const sunday = days.find(d => d.dayOfMonth === 4); // Jan 4 is Sunday
    
    expect(saturday.isWeekend).toBe(true);
    expect(sunday.isWeekend).toBe(true);
  });

  test('should get month abbreviation', () => {
    const jan = new Date(2026, 0, 1);
    expect(window.DateUtils.getMonthAbbreviation(jan)).toBe('JAN');
  });
});

