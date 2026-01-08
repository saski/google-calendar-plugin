/**
 * OAuth handler for Google Calendar API authentication
 */

class OAuthHandler {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this._initialized = false;
  }

  /**
   * Internal logging method
   * @param {string} level - Log level (error, warn, info)
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
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

  /**
   * Initialize OAuth handler and restore token from storage
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._initialized) {
      this._log('info', 'Already initialized');
      return;
    }
    
    this._log('info', 'Initializing OAuth handler...');
    
    // Wait for chrome.runtime
    await this.waitForChromeRuntime();
    this._log('info', 'chrome.runtime is available');
    
    // Restore token from storage
    const storedToken = await this.loadToken();
    if (storedToken) {
      this._log('info', 'Token restored from storage');
      this.token = storedToken;
      // Restore expiry if stored, or set default
      const storedExpiry = await this.loadTokenExpiry();
      this.tokenExpiry = storedExpiry || Date.now() + 60 * 60 * 1000;
    } else {
      this._log('info', 'No stored token found');
    }
    
    this._initialized = true;
    this._log('info', 'Initialization complete');
  }

  /**
   * Get access token, refreshing if necessary
   * @param {number} retries - Number of retry attempts
   * @returns {Promise<string>} Access token
   */
  async getAccessToken(retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Ensure initialized before checking token
        if (!this._initialized) {
          await this.initialize();
        }
        
        if (this.isTokenValid()) {
          return this.token;
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

  /**
   * Check if current token is still valid
   * @returns {boolean}
   */
  isTokenValid() {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }
    // Refresh 5 minutes before expiry
    return Date.now() < (this.tokenExpiry - 5 * 60 * 1000);
  }

  /**
   * Wait for chrome.runtime to be available and verify it's responsive
   * @param {number} maxWait - Maximum wait time in milliseconds
   * @returns {Promise<void>}
   */
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
        this._log('info', 'Background script not ready, waiting...');
        }
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    this._log('error', 'chrome.runtime not available after waiting', maxWait, 'ms');
    throw new Error(
      'chrome.runtime not available after waiting. ' +
      'Make sure the extension is properly loaded and the background service worker is running. ' +
      'Try reloading the page.'
    );
  }

  /**
   * Authenticate user and get access token
   * In Manifest V3, content scripts must use message passing to background script
   * @returns {Promise<string>} Access token
   */
  async authenticate() {
    this._log('info', 'Starting authentication...');
    
    // Wait for chrome.runtime to be available
    try {
      await this.waitForChromeRuntime();
      this._log('info', 'chrome.runtime verified, requesting token...');
    } catch (error) {
      this._log('error', 'Failed to wait for chrome.runtime:', error.message);
      return Promise.reject(new Error('chrome.runtime is not available. Make sure the extension is properly loaded and reload the page.'));
    }

    return new Promise((resolve, reject) => {
      try {
        // Send message to background script to get auth token
        chrome.runtime.sendMessage(
          { action: 'getAuthToken', interactive: true },
          async (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            
            if (!response) {
              reject(new Error('No response from background script. Make sure the background script is running.'));
              return;
            }
            
            if (!response.success) {
              reject(new Error(response.error || 'Failed to get auth token'));
              return;
            }
            
            if (!response.token) {
              reject(new Error('No token in response'));
              return;
            }
            
            this.token = response.token;
            // Token expires in 1 hour, store expiry
            this.tokenExpiry = Date.now() + 60 * 60 * 1000;
            await this.storeToken(response.token);
            this._initialized = true;
            this._log('info', 'Authentication successful');
            resolve(response.token);
          }
        );
      } catch (error) {
        this._log('error', 'OAuth authentication failed:', error.message);
        reject(new Error(`OAuth authentication failed: ${error.message}`));
      }
    });
  }

  /**
   * Store token in extension storage
   * @param {string} token
   */
  async storeToken(token) {
    if (typeof chrome === 'undefined' || !chrome || !chrome.storage || !chrome.storage.local) {
      this._log('warn', 'chrome.storage.local is not available, token not persisted');
      return;
    }
    const expiry = Date.now() + 60 * 60 * 1000; // 1 hour
    this._log('info', 'Storing token with expiry', new Date(expiry).toISOString());
    return chrome.storage.local.set({ 
      oauthToken: token,
      oauthTokenExpiry: expiry
    });
  }

  /**
   * Load token from storage
   * @returns {Promise<string|null>}
   */
  async loadToken() {
    if (typeof chrome === 'undefined' || !chrome || !chrome.storage || !chrome.storage.local) {
      return null;
    }
    const result = await chrome.storage.local.get(['oauthToken']);
    return result.oauthToken || null;
  }

  /**
   * Load token expiry from storage
   * @returns {Promise<number|null>}
   */
  async loadTokenExpiry() {
    if (typeof chrome === 'undefined' || !chrome || !chrome.storage || !chrome.storage.local) {
      return null;
    }
    const result = await chrome.storage.local.get(['oauthTokenExpiry']);
    return result.oauthTokenExpiry || null;
  }

  /**
   * Revoke token and sign out
   */
  async signOut() {
    if (this.token) {
      if (typeof chrome !== 'undefined' && chrome && chrome.runtime && typeof chrome.runtime.sendMessage === 'function') {
        try {
          await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              { action: 'removeCachedAuthToken', token: this.token },
              (response) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                  return;
                }
                if (response && !response.success) {
                  reject(new Error(response.error || 'Failed to remove token'));
                  return;
                }
                resolve();
              }
            );
          });
        } catch (error) {
          this._log('warn', 'Failed to remove cached auth token:', error.message);
        }
      }
      this.token = null;
      this.tokenExpiry = null;
      this._initialized = false;
      if (typeof chrome !== 'undefined' && chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.remove(['oauthToken', 'oauthTokenExpiry']);
      }
    }
  }
}

// Export as global
window.OAuthHandler = OAuthHandler;

