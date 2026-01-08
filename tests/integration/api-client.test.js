// Load jest-chrome for Chrome API mocking
require('jest-chrome');

// Load source files which attach classes to window
require('../../src/utils/oauth-handler.js');
require('../../src/content/calendar-api.js');
require('../../src/utils/event-parser.js');

// Mock fetch
global.fetch = jest.fn();

describe('CalendarAPI', () => {
  let api;
  let mockOAuthHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock chrome.runtime.sendMessage to respond to ping and getAuthToken
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      if (callback) {
        chrome.runtime.lastError = undefined;
        if (message && message.action === 'ping') {
          callback({ success: true, timestamp: Date.now() });
        } else if (message && message.action === 'getAuthToken') {
          callback({ success: true, token: 'mock_token' });
        } else {
          callback({});
        }
      }
      return true;
    });
    
    // Mock chrome.runtime.lastError to be undefined (no error)
    chrome.runtime.lastError = undefined;
    
    // Mock chrome.storage.local with actual storage
    const mockStorage = {};
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      const result = {};
      const keysArray = Array.isArray(keys) ? keys : (keys ? [keys] : Object.keys(mockStorage));
      keysArray.forEach(key => {
        if (mockStorage[key] !== undefined) {
          result[key] = mockStorage[key];
        }
      });
      if (callback) callback(result);
      return Promise.resolve(result);
    });
    chrome.storage.local.set.mockImplementation((data, callback) => {
      Object.assign(mockStorage, data);
      if (callback) callback();
      return Promise.resolve();
    });
    
    // Create mock OAuthHandler first
    mockOAuthHandler = {
      getAccessToken: jest.fn().mockResolvedValue('mock_token'),
      initialize: jest.fn().mockResolvedValue(undefined),
      isTokenValid: jest.fn().mockReturnValue(false),
      authenticate: jest.fn().mockResolvedValue('mock_token')
    };
    
    // Create API instance
    api = new window.CalendarAPI();
    
    // Set the private property directly to bypass the getter
    // This prevents the real handler from being created when getter is accessed
    api._oauthHandler = mockOAuthHandler;
    
    fetch.mockClear();
  });

  test('should fetch calendars', async () => {
    const mockCalendars = {
      items: [
        { id: 'primary', summary: 'Primary Calendar' },
        { id: 'cal2', summary: 'Work Calendar' }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCalendars
    });

    const calendars = await api.getCalendars();

    expect(calendars).toHaveLength(2);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/calendarList'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock_token'
        })
      })
    );
  }, 15000); // Increase timeout for this test

  test('should fetch events for date range', async () => {
    const mockEvents = {
      items: [
        {
          id: 'event1',
          summary: 'Test Event',
          start: { dateTime: '2026-01-15T10:00:00Z' },
          end: { dateTime: '2026-01-15T11:00:00Z' }
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEvents
    });

    const timeMin = new Date(2026, 0, 1);
    const timeMax = new Date(2026, 11, 31);
    const events = await api.getEvents('primary', timeMin, timeMax);

    expect(events).toHaveLength(1);
    expect(events[0].summary).toBe('Test Event');
  }, 15000); // Increase timeout for this test
});

describe('EventParser', () => {
  test('should parse event date range', () => {
    const event = {
      id: 'test',
      summary: 'Test',
      start: { date: '2026-01-15' },
      end: { date: '2026-01-16' }
    };

    const range = window.EventParser.getEventDateRange(event);
    expect(range.start.toDateString()).toBe(new Date(2026, 0, 15).toDateString());
    expect(range.isMultiDay).toBe(false); // End is exclusive, so same day
  });

  test('should get events for specific date', () => {
    const events = [
      {
        id: '1',
        summary: 'Event 1',
        start: { date: '2026-01-15' },
        end: { date: '2026-01-16' }
      },
      {
        id: '2',
        summary: 'Event 2',
        start: { date: '2026-01-16' },
        end: { date: '2026-01-17' }
      }
    ];

    const date = new Date(2026, 0, 15);
    const eventsForDate = window.EventParser.getEventsForDate(events, date);
    
    expect(eventsForDate).toHaveLength(1);
    expect(eventsForDate[0].id).toBe('1');
  });
});

