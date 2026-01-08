// OAuthHandler loaded from manifest

/**
 * Google Calendar API client
 */
class CalendarAPI {
  constructor() {
    this._oauthHandler = null; // Lazy initialization
    this.apiBase = 'https://www.googleapis.com/calendar/v3';
  }

  get oauthHandler() {
    if (!this._oauthHandler) {
      this._oauthHandler = new window.OAuthHandler();
    }
    return this._oauthHandler;
  }

  /**
   * Get all calendars for user
   * @returns {Promise<Array>} List of calendars
   */
  async getCalendars() {
    const token = await this.oauthHandler.getAccessToken();
    const url = `${this.apiBase}/users/me/calendarList`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calendars: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  /**
   * Get events for a date range
   * @param {string} calendarId - Calendar ID (use 'primary' for primary calendar)
   * @param {Date} timeMin - Start date
   * @param {Date} timeMax - End date
   * @returns {Promise<Array>} List of events
   */
  async getEvents(calendarId, timeMin, timeMax) {
    const token = await this.oauthHandler.getAccessToken();
    const url = `${this.apiBase}/calendars/${encodeURIComponent(calendarId)}/events`;
    
    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: '2500',
      singleEvents: 'true',
      orderBy: 'startTime'
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  /**
   * Get events for entire year
   * @param {number} year
   * @param {Array<string>} calendarIds - Calendar IDs to fetch from
   * @returns {Promise<Array>} All events for the year
   */
  async getYearEvents(year, calendarIds = ['primary']) {
    const timeMin = new Date(year, 0, 1);
    const timeMax = new Date(year, 11, 31, 23, 59, 59);

    const allEvents = [];
    
    for (const calendarId of calendarIds) {
      try {
        const events = await this.getEvents(calendarId, timeMin, timeMax);
        // Add calendar metadata to each event
        events.forEach(event => {
          event.calendarId = calendarId;
        });
        allEvents.push(...events);
      } catch (error) {
        console.error(`Failed to fetch events from calendar ${calendarId}:`, error);
        // Continue with other calendars
      }
    }

    return allEvents;
  }
}

// Export as global
window.CalendarAPI = CalendarAPI;

