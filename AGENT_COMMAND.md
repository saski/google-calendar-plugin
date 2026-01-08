# Command for Separate Agent

## Task

Fix remaining Jest test failures. Current status: 2/4 test suites failing due to `chrome is not defined` errors.

## Command to Run

```bash
cd /Users/ignacio.viejo/saski/google-calendar-plugin && ./fix-tests.sh
```

## What Needs to be Fixed

1. **jest-chrome not properly initialized** - `chrome` global is undefined in tests
2. **Missing chrome API mocks** - `chrome.runtime.getURL`, `chrome.storage.local`, `chrome.identity` need mocks
3. **Test setup issues** - Some tests need better initialization

## Expected Outcome

After running the command:
- All 4 test suites should pass
- No `chrome is not defined` errors
- All test assertions should pass

## Files Created

- `FIX_REMAINING_TEST_ISSUES.md` - Detailed analysis of issues
- `fix-tests.sh` - Automated fix script
- `RUN_FIX_TESTS.md` - Quick reference guide

## Current Test Status

- ✅ `tests/unit/date-utils.test.js` - PASS
- ❌ `tests/unit/oauth-handler.test.js` - FAIL (chrome not defined)
- ✅ `tests/integration/api-client.test.js` - PASS (with warnings)
- ❌ `tests/integration/view-injection.test.js` - FAIL (chrome not defined, document issues)

---

**Run**: `./fix-tests.sh` from the project directory

