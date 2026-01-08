/**
 * Jest setup file for Chrome Extension mocking
 */

// Setup jest-chrome for Chrome Extension API mocking
const chrome = require('jest-chrome');

// Make chrome available globally
global.chrome = chrome;

// Ensure chrome.runtime exists before setting properties
if (!chrome.runtime) {
  chrome.runtime = {};
}

// Mock chrome.runtime.getURL
chrome.runtime.getURL = jest.fn((path) => {
  return `chrome-extension://test-id/${path}`;
});

// Mock chrome.runtime.sendMessage to handle ping and other messages
if (!chrome.runtime.sendMessage) {
  chrome.runtime.sendMessage = jest.fn((message, callback) => {
    // Default behavior: respond to ping
    if (message && message.action === 'ping') {
      if (callback) {
        callback({ success: true, timestamp: Date.now() });
      }
      return true;
    }
    // For other messages, call callback with empty response
    if (callback) {
      callback({});
    }
    return true;
  });
}

// Ensure chrome.runtime.lastError is undefined by default
chrome.runtime.lastError = undefined;

// Create in-memory storage for chrome.storage.local mock
const mockStorage = {};

// Ensure chrome.storage.local is properly mocked with actual storage
if (!chrome.storage || !chrome.storage.local) {
  chrome.storage = {
    local: {
      get: jest.fn((keys, callback) => {
        const result = {};
        const keysArray = Array.isArray(keys) ? keys : (keys ? [keys] : Object.keys(mockStorage));
        keysArray.forEach(key => {
          if (mockStorage[key] !== undefined) {
            result[key] = mockStorage[key];
          }
        });
        if (callback) callback(result);
        return Promise.resolve(result);
      }),
      set: jest.fn((items, callback) => {
        Object.assign(mockStorage, items);
        if (callback) callback();
        return Promise.resolve();
      }),
      remove: jest.fn((keys, callback) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        keysArray.forEach(key => {
          delete mockStorage[key];
        });
        if (callback) callback();
        return Promise.resolve();
      })
    }
  };
} else {
  // If chrome.storage.local already exists, enhance it with actual storage
  const originalGet = chrome.storage.local.get;
  const originalSet = chrome.storage.local.set;
  const originalRemove = chrome.storage.local.remove;
  
  chrome.storage.local.get = jest.fn((keys, callback) => {
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
  
  chrome.storage.local.set = jest.fn((items, callback) => {
    Object.assign(mockStorage, items);
    if (callback) callback();
    return Promise.resolve();
  });
  
  chrome.storage.local.remove = jest.fn((keys, callback) => {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    keysArray.forEach(key => {
      delete mockStorage[key];
    });
    if (callback) callback();
    return Promise.resolve();
  });
}

// Clear storage before each test
beforeEach(() => {
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
});

// Ensure chrome.identity is properly mocked
if (!chrome.identity) {
  chrome.identity = {
    getAuthToken: jest.fn((options, callback) => {
      if (callback) {
        callback('mock_token');
      }
      return Promise.resolve('mock_token');
    })
  };
}
