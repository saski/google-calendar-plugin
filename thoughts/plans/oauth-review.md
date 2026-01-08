# OAuth Handler Implementation Review

**Date:** 2026-01-07  
**Component:** `src/utils/oauth-handler.js`  
**Status:** Critical Issues Identified

## Executive Summary

The OAuth handler implementation has several critical issues that prevent proper authentication in the Chrome extension. The main problems stem from timing issues with `chrome.runtime` availability, missing token restoration, and immediate instantiation patterns that don't account for Manifest V3 service worker lifecycle.

## 🔴 Critical Issues

### 1. Immediate Instantiation Problem
**Location:** `src/content/calendar-api.js:8`

**Problem:**
- `OAuthHandler` is created synchronously in `CalendarAPI` constructor
- `chrome.runtime` may not be available when content script first loads
- Should use lazy initialization pattern

**Impact:** High - Causes "chrome.runtime is not available" errors on page load

**Current Code:**
```javascript
class CalendarAPI {
  constructor() {
    this.oauthHandler = new window.OAuthHandler(); // ❌ Immediate instantiation
    this.apiBase = 'https://www.googleapis.com/calendar/v3';
  }
}
```

### 2. Error Source Location
**Location:** `src/utils/oauth-handler.js:67`

**Problem:**
- Error "chrome.runtime is not available" comes from `authenticate()` method
- `waitForChromeRuntime()` may timeout before background script is ready
- 5-second timeout might be insufficient for Manifest V3 service worker startup

**Impact:** High - Authentication fails even when extension is properly loaded

**Current Code:**
```javascript
async authenticate() {
  try {
    await this.waitForChromeRuntime(); // ❌ May timeout
  } catch (error) {
    return Promise.reject(new Error('chrome.runtime is not available. Make sure the extension is properly loaded and reload the page.'));
  }
  // ...
}
```

### 3. Missing Token Restoration
**Location:** `src/utils/oauth-handler.js:125-131`

**Problem:**
- `loadToken()` method exists but is never called
- Tokens stored in `chrome.storage.local` are not restored on initialization
- Every session requires re-authentication

**Impact:** High - Poor user experience, unnecessary re-authentication

**Current Code:**
```javascript
async loadToken() {
  // ✅ Method exists but is never called
  if (typeof chrome === 'undefined' || !chrome || !chrome.storage || !chrome.storage.local) {
    return null;
  }
  const result = await chrome.storage.local.get(['oauthToken']);
  return result.oauthToken || null;
}
```

### 4. Constructor Check is Ineffective
**Location:** `src/utils/oauth-handler.js:11-15`

**Problem:**
- Only logs warning, doesn't prevent usage
- Check happens synchronously, but availability is async
- Should defer the check until first use

**Impact:** Medium - Misleading error messages, doesn't solve the problem

**Current Code:**
```javascript
constructor() {
  this.token = null;
  this.tokenExpiry = null;
  
  // ❌ Synchronous check that doesn't help
  if (typeof chrome !== 'undefined' && chrome && chrome.runtime) {
    console.log('OAuthHandler: chrome.runtime is available');
  } else {
    console.warn('OAuthHandler: chrome.runtime not immediately available, will wait during authentication');
  }
}
```

## 🟡 Design Issues

### 5. No Background Script Readiness Check
**Location:** `src/utils/oauth-handler.js:46-55`

**Problem:**
- Assumes background service worker is running
- Manifest V3 service workers can be inactive
- Should verify background script is responsive

**Impact:** Medium - Silent failures when background script isn't ready

**Current Code:**
```javascript
async waitForChromeRuntime(maxWait = 5000) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    if (typeof chrome !== 'undefined' && chrome && chrome.runtime && typeof chrome.runtime.sendMessage === 'function') {
      return; // ❌ Doesn't verify it actually works
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('chrome.runtime not available after waiting');
}
```

### 6. Error Handling in Content Script
**Location:** `src/content/content.js:24-27`

**Problem:**
- Errors are caught but not shown to user
- No retry mechanism
- Silent failures make debugging difficult

**Impact:** Medium - Poor user experience, difficult debugging

**Current Code:**
```javascript
} catch (error) {
  console.error('Failed to load events:', error);
  // ❌ No user feedback, no retry
}
```

### 7. waitForChromeRuntime Logic
**Location:** `src/utils/oauth-handler.js:46-55`

**Problem:**
- Checks for `chrome.runtime.sendMessage` but doesn't verify it works
- Should test actual message passing capability
- Timeout error message could be more helpful

**Impact:** Medium - May pass check but still fail on actual use

## ✅ What's Working Well

- Good separation of concerns
- Proper use of Manifest V3 message passing
- Token expiry handling (5-minute buffer)
- Storage abstraction for token persistence
- Error messages are descriptive (when they appear)
- Background script implementation is correct

## 📋 Recommended Fixes Priority

### High Priority

#### 1. Implement Lazy Initialization for OAuthHandler

**Change:** Modify `CalendarAPI` to lazily initialize `OAuthHandler`

```javascript
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
}
```

#### 2. Add Token Restoration on Initialization

**Change:** Add async initialization method to `OAuthHandler`

```javascript
class OAuthHandler {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this._initialized = false;
  }

  async initialize() {
    if (this._initialized) return;
    
    // Wait for chrome.runtime
    await this.waitForChromeRuntime();
    
    // Restore token from storage
    const storedToken = await this.loadToken();
    if (storedToken) {
      this.token = storedToken;
      // Restore expiry if stored, or set default
      const storedExpiry = await this.loadTokenExpiry();
      this.tokenExpiry = storedExpiry || Date.now() + 60 * 60 * 1000;
    }
    
    this._initialized = true;
  }
}
```

#### 3. Improve waitForChromeRuntime() with Actual Message Test

**Change:** Verify background script is actually responsive

```javascript
async waitForChromeRuntime(maxWait = 10000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    if (typeof chrome !== 'undefined' && chrome && chrome.runtime) {
      // Test actual message passing capability
      try {
        await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { action: 'ping' },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve();
              }
            }
          );
          // Timeout after 1 second
          setTimeout(() => reject(new Error('Message timeout')), 1000);
        });
        return; // Success - background script is responsive
      } catch (error) {
        // Background script not ready yet, continue waiting
      }
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  throw new Error(
    'chrome.runtime not available after waiting. ' +
    'Make sure the extension is properly loaded and the background service worker is running. ' +
    'Try reloading the page.'
  );
}
```

**Note:** This requires adding a 'ping' handler in background script.

### Medium Priority

#### 4. Add Background Script Health Check

**Change:** Add ping/pong mechanism in background script

```javascript
// In background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ success: true, timestamp: Date.now() });
    return true;
  }
  // ... existing handlers
});
```

#### 5. Improve Error Handling with User Feedback

**Change:** Add user-visible error messages in content.js

```javascript
async function loadEvents() {
  if (!calendarAPI) {
    calendarAPI = new window.CalendarAPI();
  }

  try {
    // Initialize OAuth handler first
    await calendarAPI.oauthHandler.initialize();
    
    const calendars = await calendarAPI.getCalendars();
    const calendarIds = calendars.map(cal => cal.id);
    const currentYear = new Date().getFullYear();
    
    const events = await calendarAPI.getYearEvents(currentYear, calendarIds);
    
    if (fullYearView) {
      fullYearView.setEvents(events);
    }
  } catch (error) {
    console.error('Failed to load events:', error);
    
    // Show error to user
    showErrorToUser(error.message || 'Failed to load calendar events. Please try again.');
    
    // Retry after delay
    setTimeout(() => loadEvents(), 5000);
  }
}

function showErrorToUser(message) {
  // Create or update error notification
  let errorDiv = document.getElementById('calendar-extension-error');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'calendar-extension-error';
    errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f44336; color: white; padding: 16px; border-radius: 4px; z-index: 10000; max-width: 400px;';
    document.body.appendChild(errorDiv);
  }
  errorDiv.textContent = message;
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (errorDiv && errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 10000);
}
```

#### 6. Add Retry Mechanism for Transient Failures

**Change:** Add exponential backoff retry logic

```javascript
async getAccessToken(retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (this.isTokenValid()) {
        return this.token;
      }
      
      // Ensure initialized before authenticating
      if (!this._initialized) {
        await this.initialize();
      }
      
      return await this.authenticate();
    } catch (error) {
      if (attempt === retries - 1) {
        throw error; // Last attempt failed
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Low Priority

#### 7. Refactor Constructor to Remove Synchronous Check

**Change:** Remove ineffective constructor check

```javascript
constructor() {
  this.token = null;
  this.tokenExpiry = null;
  this._initialized = false;
  // ✅ Removed ineffective synchronous check
}
```

#### 8. Add Better Logging for Debugging

**Change:** Add structured logging with levels

```javascript
_log(level, message, ...args) {
  const prefix = `[OAuthHandler:${level}]`;
  if (level === 'error') {
    console.error(prefix, message, ...args);
  } else if (level === 'warn') {
    console.warn(prefix, message, ...args);
  } else {
    console.log(prefix, message, ...args);
  }
}
```

#### 9. Consider Exponential Backoff for Retries

**Change:** Already included in recommendation #6 above

## Implementation Order

1. **First:** Implement lazy initialization (#1) - Quick fix for immediate error
2. **Second:** Add token restoration (#2) - Improves user experience
3. **Third:** Improve waitForChromeRuntime (#3) - More robust availability check
4. **Fourth:** Add background script ping (#4) - Verify background is ready
5. **Fifth:** Improve error handling (#5) - Better user feedback
6. **Sixth:** Add retry mechanism (#6) - Handle transient failures
7. **Seventh:** Refactor constructor (#7) - Clean up code
8. **Eighth:** Add better logging (#8) - Easier debugging

## Testing Recommendations

1. Test with extension freshly installed (no cached tokens)
2. Test with extension reloaded (background script restart)
3. Test with page reloaded (content script re-injection)
4. Test with slow network (timeout scenarios)
5. Test with background script disabled (error handling)
6. Test token expiry scenarios
7. Test multiple rapid authentication requests

## Related Files to Update

- `src/utils/oauth-handler.js` - Main implementation
- `src/content/calendar-api.js` - Lazy initialization
- `src/content/content.js` - Error handling and initialization
- `src/background/background.js` - Add ping handler
- `tests/unit/oauth-handler.test.js` - Update tests for new patterns

## Notes

- Manifest V3 service workers can be inactive and need to be woken up
- Content scripts run in isolated world, need message passing to background
- Token storage should also store expiry time for proper restoration
- Consider adding a "Sign Out" button in the UI to clear tokens
