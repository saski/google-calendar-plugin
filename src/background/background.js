/**
 * Service worker for Google Calendar Full-Year View extension
 * Handles OAuth authentication via chrome.identity API
 */

console.log('Google Calendar Full-Year View extension loaded');

/**
 * Handle messages from content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ success: true, timestamp: Date.now() });
    return true;
  }
  

  if (request.action === 'getAuthToken') {
    handleGetAuthToken(request.interactive || false)
      .then(token => sendResponse({ success: true, token }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates we will send a response asynchronously
  }
  
  if (request.action === 'removeCachedAuthToken') {
    handleRemoveCachedAuthToken(request.token)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

/**
 * Get OAuth access token
 * @param {boolean} interactive - Whether to show OAuth UI if needed
 * @returns {Promise<string>} Access token
 */
async function handleGetAuthToken(interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken(
      { interactive },
      (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!token) {
          reject(new Error('Failed to get auth token'));
          return;
        }
        resolve(token);
      }
    );
  });
}

/**
 * Remove cached auth token
 * @param {string} token - Token to remove
 * @returns {Promise<void>}
 */
async function handleRemoveCachedAuthToken(token) {
  return new Promise((resolve, reject) => {
    chrome.identity.removeCachedAuthToken({ token }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}
