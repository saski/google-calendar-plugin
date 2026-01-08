// Load jest-chrome for Chrome API mocking
require('jest-chrome');

// Load source file which attaches OAuthHandler to window
require('../../src/utils/oauth-handler.js');

describe('OAuthHandler', () => {
  let oauthHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock chrome.runtime.sendMessage to respond to ping and other messages
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      // Ensure callback is called synchronously
      if (callback) {
        if (message && message.action === 'ping') {
          // Clear any lastError before calling callback
          chrome.runtime.lastError = undefined;
          callback({ success: true, timestamp: Date.now() });
        } else if (message && message.action === 'getAuthToken') {
          chrome.runtime.lastError = undefined;
          const mockToken = 'mock_access_token_123';
          callback({ success: true, token: mockToken });
        } else {
          chrome.runtime.lastError = undefined;
          callback({});
        }
      }
      return true; // Indicates async response
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
    
    oauthHandler = new window.OAuthHandler();
  });

  test('should authenticate and get access token', async () => {
    const mockToken = 'mock_access_token_123';
    
    // Override mock for this specific test
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      if (callback) {
        chrome.runtime.lastError = undefined;
        if (message && message.action === 'ping') {
          callback({ success: true, timestamp: Date.now() });
        } else if (message && message.action === 'getAuthToken') {
          callback({ success: true, token: mockToken });
        } else {
          callback({});
        }
      }
      return true;
    });

    const token = await oauthHandler.authenticate();

    expect(token).toBe(mockToken);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { action: 'getAuthToken', interactive: true },
      expect.any(Function)
    );
  }, 15000); // Increase timeout for this test

  test('should check token validity', () => {
    oauthHandler.token = 'valid_token';
    oauthHandler.tokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    expect(oauthHandler.isTokenValid()).toBe(true);
  });

  test('should detect expired token', () => {
    oauthHandler.token = 'expired_token';
    oauthHandler.tokenExpiry = Date.now() - 1000; // Expired

    expect(oauthHandler.isTokenValid()).toBe(false);
  });

  test('should store and load token', async () => {
    const token = 'test_token_123';
    await oauthHandler.storeToken(token);

    const loadedToken = await oauthHandler.loadToken();
    expect(loadedToken).toBe(token);
    
    // Check that set was called
    expect(chrome.storage.local.set).toHaveBeenCalled();
    
    // Check the actual call arguments
    const setCalls = chrome.storage.local.set.mock.calls;
    expect(setCalls.length).toBeGreaterThan(0);
    const lastCall = setCalls[setCalls.length - 1];
    expect(lastCall[0]).toHaveProperty('oauthToken', token);
    expect(lastCall[0]).toHaveProperty('oauthTokenExpiry');
    expect(typeof lastCall[0].oauthTokenExpiry).toBe('number');
  });
});

