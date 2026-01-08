# Manual Setup Guide - Google Calendar Full-Year View Extension

**Date**: 2026-01-07  
**Status**: Step-by-step manual setup instructions

## Prerequisites

- ✅ Icons created (completed)
- ⚠️ npm permissions need fixing
- ⚠️ OAuth setup required
- ⚠️ Extension loading and testing

---

## Step 1: Fix npm Permissions (REQUIRED)

**Time**: 5-10 minutes  
**Requires**: Admin/sudo access

### Option A: Use Automated Script (Recommended)

```bash
cd /Users/ignacio.viejo/saski/google-calendar-plugin
chmod +x fix-npm-macos.sh
./fix-npm-macos.sh
```

**When prompted:**
1. Choose option **3** (Both - removes quarantine and fixes permissions)
2. Enter your password when sudo prompts

### Option B: Manual Commands

```bash
# Remove quarantine attributes
sudo xattr -dr com.apple.quarantine ~/.nvm/versions/node/v18.20.8/

# Fix file permissions
sudo chown -R $(whoami) ~/.nvm/versions/node/v18.20.8/
chmod -R u+rw ~/.nvm/versions/node/v18.20.8/
```

### Verify Fix

```bash
cd /Users/ignacio.viejo/saski/google-calendar-plugin
npm install
npm test
```

**Expected**: All tests should pass (15/15 tests, 4/4 suites)

---

## Step 2: Install Dependencies

**Time**: 2-3 minutes

```bash
cd /Users/ignacio.viejo/saski/google-calendar-plugin
npm install
```

**Verify installation:**
```bash
npm list --depth=0
```

**Expected output should show:**
- jest
- jest-chrome
- jest-environment-jsdom
- @jest/test-sequencer
- @types/jest

---

## Step 3: Run Automated Tests

**Time**: 1-2 minutes

```bash
npm test
```

**Expected result:**
```
Test Suites: 4 passed, 4 total
Tests:       15 passed, 15 total
```

**If tests fail**, check:
- All dependencies installed correctly
- No permission errors
- Jest configuration is correct

---

## Step 4: OAuth Setup in Google Cloud Console

**Time**: 30-60 minutes  
**Requires**: Google account with Cloud Console access

### 4.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click project dropdown at top
3. Click **"New Project"**
4. Enter project name: `Google Calendar Full-Year View`
5. Click **"Create"**
6. Wait for creation, then select the project

### 4.2 Enable Google Calendar API

1. In left sidebar: **APIs & Services** > **Library**
2. Search for: `Google Calendar API`
3. Click on **"Google Calendar API"**
4. Click **"Enable"**
5. Wait for API to be enabled

### 4.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **"External"** user type (unless you have Google Workspace)
3. Click **"Create"**

**Fill required fields:**
- **App name**: `Google Calendar Full-Year View`
- **User support email**: [Your email address]
- **Developer contact information**: [Your email address]
- **App logo**: (Optional - can skip)
- Click **"Save and Continue"**

**Add Scopes:**
1. Click **"Add or Remove Scopes"**
2. Search for: `https://www.googleapis.com/auth/calendar.readonly`
3. Check the box next to it
4. Click **"Update"**
5. Click **"Save and Continue"**

**Test Users** (if app is in Testing mode):
1. Click **"Add Users"**
2. Add your email address
3. Click **"Add"**
4. Click **"Save and Continue"**

**Summary:**
1. Review the information
2. Click **"Back to Dashboard"**

### 4.4 Get Extension ID (Required for OAuth)

**Before creating OAuth credentials, you need the Extension ID:**

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top right)
4. Click **"Load unpacked"**
5. Select: `/Users/ignacio.viejo/saski/google-calendar-plugin`
6. **Copy the Extension ID** (looks like: `abcdefghijklmnopqrstuvwxyz123456`)
   - It appears under the extension name
   - Save this ID - you'll need it in the next step

### 4.5 Create OAuth 2.0 Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. If prompted, configure consent screen (follow Step 4.3 above)

**Configure OAuth Client:**
- **Application type**: Select **"Chrome extension"**
- **Name**: `Google Calendar Full-Year View Extension`
- **Application ID**: Paste your Extension ID from Step 4.4
- Click **"Create"**

**Copy the Client ID:**
- The Client ID looks like: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
- **Save this Client ID** - you'll need it in the next step

### 4.6 Update manifest.json

1. Open: `/Users/ignacio.viejo/saski/google-calendar-plugin/manifest.json`
2. Find the `oauth2` section (around line 43-48)
3. Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID
4. Save the file

**Example:**
```json
"oauth2": {
  "client_id": "123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/calendar.readonly"
  ]
}
```

### 4.7 Reload Extension

1. Go to `chrome://extensions/`
2. Find your extension
3. Click the **reload icon** (circular arrow)
4. Verify no errors appear

---

## Step 5: Load Extension in Chrome

**Time**: 5 minutes

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top right)
4. Click **"Load unpacked"**
5. Select project directory: `/Users/ignacio.viejo/saski/google-calendar-plugin`
6. Verify extension appears in list

**Expected result:**
- Extension name: "Google Calendar Full-Year View"
- Version: 0.1.0
- No red error messages
- Extension ID visible (needed for OAuth)

**If errors appear:**
- Check browser console for details
- Verify all icon files exist in `assets/icons/`
- Verify `manifest.json` is valid JSON

---

## Step 6: Manual Testing Checklist

**Time**: 1-2 hours

### 6.1 OAuth Flow Testing

- [ ] Open Google Calendar: https://calendar.google.com
- [ ] Open browser DevTools (F12) > Console tab
- [ ] Check for content script loading messages
- [ ] Click extension icon in Chrome toolbar
- [ ] Verify popup appears (may be minimal initially)
- [ ] Navigate to a calendar view that triggers API call
- [ ] Verify OAuth consent screen appears
- [ ] Complete OAuth flow
- [ ] Verify token stored:
  - Open DevTools > Application tab
  - Expand Storage > Extension Storage
  - Check for `oauthToken` key

### 6.2 View Injection Testing

- [ ] Open Google Calendar: https://calendar.google.com
- [ ] Look for "Full Year" option in view switcher
- [ ] Verify "Full Year" button appears
- [ ] Click "Full Year" button
- [ ] Verify standard calendar view hides
- [ ] Verify full-year view container appears
- [ ] Check browser console for errors

### 6.3 Layout Testing

- [ ] Verify 12 month rows display
- [ ] Verify days 1-31 appear sequentially in each row
- [ ] Verify month labels (JAN, FEB, etc.) appear correctly
- [ ] Verify weekend colors:
  - Saturdays are light green
  - Sundays are light pink
  - Weekdays are light blue
- [ ] Test horizontal scroll on smaller screen/window
- [ ] Verify month labels stay fixed during scroll

### 6.4 Event Display Testing

- [ ] Verify events appear in correct day cells
- [ ] Verify event colors match Google Calendar colors
- [ ] Test days with 1-3 events (should show individual dots)
- [ ] Test days with 4+ events (should show count indicator)
- [ ] Verify multi-day events appear on all relevant days
- [ ] Test hover over event dots (should show tooltip)
- [ ] Verify tooltip shows event title, location, time

### 6.5 Interaction Testing

- [ ] Click on day cell with events
- [ ] Verify event list modal appears
- [ ] Verify modal shows all events for that day
- [ ] Verify modal displays event details correctly
- [ ] Test closing modal:
  - Click X button
  - Click outside modal
  - Press Escape key
- [ ] Test clicking day cell with no events
- [ ] Verify console log for "would open create dialog"

### 6.6 Performance Testing

- [ ] Measure view load time (should be < 2 seconds)
- [ ] Test with calendar containing many events
- [ ] Verify smooth scrolling
- [ ] Check memory usage in DevTools
- [ ] Test with multiple calendars

### 6.7 Error Handling Verification

- [ ] Test with no internet connection (should handle gracefully)
- [ ] Test with invalid OAuth token (should prompt re-auth)
- [ ] Test with API rate limit (should show error message)
- [ ] Test with empty calendar (should display empty grid)
- [ ] Test with very large number of events
- [ ] Verify console error messages are user-friendly
- [ ] Check for any unhandled promise rejections

---

## Step 7: Troubleshooting

### Extension Won't Load

**Check:**
- All icon files exist: `assets/icons/icon-{16,48,128}.png`
- `manifest.json` is valid JSON
- No syntax errors in content scripts
- Browser console for specific errors

### OAuth Not Working

**Check:**
- Client ID is correct in `manifest.json`
- Extension ID matches the one in Google Cloud Console
- OAuth consent screen is configured
- Your email is in test users list (if app is in Testing mode)
- Scopes are added correctly

### Tests Failing

**Check:**
- All dependencies installed: `npm list`
- npm permissions fixed
- Jest configuration correct
- Test files are in correct location

### Events Not Displaying

**Check:**
- OAuth token is stored (DevTools > Application > Extension Storage)
- API calls are successful (Network tab in DevTools)
- Console for error messages
- Calendar has events to display

---

## Completion Checklist

Before running `/fic-validate-plan`, ensure:

- [x] Icons created and in place ✅
- [ ] OAuth configured and Client ID added to manifest
- [ ] Dependencies installed (`npm install` completed)
- [ ] All automated tests passing (`npm test`)
- [ ] Extension loads in Chrome without errors
- [ ] Basic manual testing completed (view injection works)
- [ ] OAuth flow tested and working
- [ ] Events display correctly
- [ ] Interactions (hover, click) working
- [ ] No critical console errors
- [ ] Code quality acceptable

---

## Next Steps After Completion

1. **Run validation**:
   ```
   /fic-validate-plan thoughts/shared/plans/2026-01-07-google-calendar-full-year-view.md
   ```

2. **Create git commits** (if using version control)

3. **Consider Phase 2 features**:
   - Advanced filtering
   - Mobile optimization
   - Offline support

---

**Last Updated**: 2026-01-07  
**Status**: Ready for manual setup

