#!/bin/bash

# Fix remaining Jest test issues
# Run this script to fix chrome mocking and test setup issues

set -e

echo "🔧 Fixing Jest Test Issues"
echo "============================"
echo ""

cd "$(dirname "$0")"

echo "1. Updating jest.setup.js..."

cat > jest.setup.js << 'EOF'
/**
 * Jest setup file for Chrome Extension mocking
 */

// Setup jest-chrome for Chrome Extension API mocking
const chrome = require('jest-chrome');

// Make chrome available globally
global.chrome = chrome;

// Mock chrome.runtime.getURL
chrome.runtime.getURL = jest.fn((path) => {
  return `chrome-extension://test-id/${path}`;
});

// Ensure chrome.storage.local is properly mocked
if (!chrome.storage || !chrome.storage.local) {
  chrome.storage = {
    local: {
      get: jest.fn((keys, callback) => {
        if (callback) callback({});
        return Promise.resolve({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      remove: jest.fn((keys, callback) => {
        if (callback) callback();
        return Promise.resolve();
      })
    }
  };
}

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
EOF

echo "✅ jest.setup.js updated"
echo ""

echo "2. Checking test files..."
echo ""

# Verify oauth-handler test has jest-chrome
if grep -q "require('jest-chrome')" tests/unit/oauth-handler.test.js; then
  echo "✅ oauth-handler.test.js already requires jest-chrome"
else
  echo "⚠️  oauth-handler.test.js may need jest-chrome require"
fi

# Verify view-injection test setup
if grep -q "require.*view-injector" tests/integration/view-injection.test.js; then
  echo "✅ view-injection.test.js loads source file"
else
  echo "⚠️  view-injection.test.js may need source file require"
fi

echo ""
echo "3. Running tests to verify fixes..."
echo ""

npm test

echo ""
echo "✨ Done!"
echo ""
echo "If tests still fail, check:"
echo "1. jest-chrome is properly installed: npm list jest-chrome"
echo "2. All source files are loaded before tests run"
echo "3. chrome mocks are set up correctly in jest.setup.js"

