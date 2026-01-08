/**
 * Parse and normalize Google Calendar events
 */
class EventParser {
  /**
   * Parse event date (handles both date and dateTime)
   * @param {Object} event - Google Calendar event
   * @param {string} field - 'start' or 'end'
   * @returns {Date}
   */
  parseEventDate(event, field) {
    const dateField = event[field];
    
    // Validate dateField exists
    if (!dateField) {
      // Only warn for critical missing fields, not for every event
      return new Date(); // Fallback to current date
    }
    
    // If dateField is already a Date object, return it
    if (dateField instanceof Date) {
      return isNaN(dateField.getTime()) ? new Date() : dateField;
    }
    
    // Try dateTime first (for timed events)
    if (dateField.dateTime) {
      const date = new Date(dateField.dateTime);
      if (isNaN(date.getTime())) {
        return new Date(); // Fallback silently
      }
      return date;
    }
    
    // Try date (for all-day events)
    if (dateField.date) {
      const date = new Date(dateField.date);
      if (isNaN(date.getTime())) {
        return new Date(); // Fallback silently
      }
      return date;
    }
    
    // If dateField is a string, try to parse it directly
    if (typeof dateField === 'string') {
      const date = new Date(dateField);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // No valid date field found - return current date silently
    // Only log if it's a truly unexpected structure
    if (typeof dateField === 'object' && Object.keys(dateField).length > 0) {
      // This is an object but doesn't have date/dateTime - might be a different format
      return new Date();
    }
    
    return new Date(); // Fallback to current date
  }

  /**
   * Check if event is all-day
   * @param {Object} event
   * @returns {boolean}
   */
  isAllDayEvent(event) {
    return !!event.start.date && !event.start.dateTime;
  }

  /**
   * Get event date range
   * @param {Object} event
   * @returns {{start: Date, end: Date, isMultiDay: boolean}}
   */
  getEventDateRange(event) {
    try {
      const start = this.parseEventDate(event, 'start');
      const end = this.parseEventDate(event, 'end');
      
      // Validate dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error(`Invalid dates for event ${event.id}`);
      }
      
      // For all-day events, end date is exclusive, so subtract 1 day
      const adjustedEnd = this.isAllDayEvent(event) 
        ? new Date(end.getTime() - 24 * 60 * 60 * 1000)
        : end;
      
      const isMultiDay = start.toDateString() !== adjustedEnd.toDateString();
      
      return {
        start,
        end: adjustedEnd,
        isMultiDay
      };
    } catch (error) {
      console.warn(`Error parsing date range for event ${event.id}:`, error);
      // Return a default range (today) as fallback
      const now = new Date();
      return {
        start: now,
        end: now,
        isMultiDay: false
      };
    }
  }

  /**
   * Get events for a specific date
   * @param {Array<Object>} events - All events
   * @param {Date} date - Target date
   * @returns {Array<Object>} Events on that date
   */
  getEventsForDate(events, date) {
    const dateStr = date.toDateString();
    return events.filter(event => {
      try {
        const range = this.getEventDateRange(event);
        const eventStartStr = range.start.toDateString();
        const eventEndStr = range.end.toDateString();
        
        // Event is on this date if date is between start and end (inclusive)
        return dateStr >= eventStartStr && dateStr <= eventEndStr;
      } catch (error) {
        console.warn(`Skipping event ${event.id} due to parsing error:`, error);
        return false; // Skip events that can't be parsed
      }
    });
  }

  /**
   * Normalize event for display
   * @param {Object} event
   * @returns {Object} Normalized event
   */
  normalizeEvent(event) {
    const range = this.getEventDateRange(event);
    return {
      id: event.id,
      title: event.summary || '(No title)',
      description: event.description || '',
      location: event.location || '',
      start: range.start,
      end: range.end,
      isMultiDay: range.isMultiDay,
      isAllDay: this.isAllDayEvent(event),
      colorId: event.colorId || '1',
      calendarId: event.calendarId || 'primary'
    };
  }
}

// Export as global
window.EventParser = new EventParser();

