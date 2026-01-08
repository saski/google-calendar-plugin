# OAuth 2.0 Setup Guide for Google Calendar Extension

## Overview

This extension requires OAuth 2.0 credentials to access the Google Calendar API. Follow these steps to set up OAuth in Google Cloud Console.

## Step-by-Step Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `Google Calendar Full-Year View`
5. Click "Create"
6. Wait for project creation, then select it

### 2. Enable Google Calendar API

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on "Google Calendar API"
4. Click **Enable**
5. Wait for API to be enabled

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Click **Create**

**Fill in the required fields**:
- **App name**: `Google Calendar Full-Year View`
- **User support email**: [Your email address]
- **Developer contact information**: [Your email address]
- **App logo**: (Optional - can skip)
- Click **Save and Continue**

**Scopes**:
1. Click **Add or Remove Scopes**
2. Search for: `https://www.googleapis.com/auth/calendar.readonly`
3. Check the box next to it
4. Click **Update**
5. Click **Save and Continue**

**Test users** (if app is in Testing mode):
1. Click **Add Users**
2. Add your email address
3. Click **Add**
4. Click **Save and Continue**

**Summary**:
1. Review the information
2. Click **Back to Dashboard**

### 4. Create OAuth 2.0 Client ID

**First, get your Extension ID**:
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select your project directory: `/Users/ignacio.viejo/saski/google-calendar-plugin`
6. **Copy the Extension ID** (looks like: `abcdefghijklmnopqrstuvwxyz123456`)

**Create Credentials**:
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure consent screen (follow Step 3 above)
4. **Application type**: Select **Chrome extension**
5. **Name**: `Google Calendar Full-Year View Extension`
6. **Application ID**: Paste your Extension ID from above
7. Click **Create**
8. **Copy the Client ID** (looks like: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`)

### 5. Update manifest.json

1. Open `manifest.json` in your project
2. Find the `oauth2` section:
   ```json
   "oauth2": {
     "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
     ...
   }
   ```
3. Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID
4. Save the file

### 6. Reload Extension

1. Go to `chrome://extensions/`
2. Find your extension
3. Click the reload icon (circular arrow)
4. Verify no errors appear

## Verification

### Test OAuth Flow

1. Open Google Calendar: https://calendar.google.com
2. Click the extension icon in Chrome toolbar
3. The extension should prompt for OAuth (when API is called)
4. Complete the OAuth consent flow
5. Check browser console for any errors

### Check Token Storage

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Expand **Storage** > **Extension Storage**
4. Look for `oauthToken` key
5. Verify token is stored

## Troubleshooting

### "Invalid client" error
- Verify Client ID is correct in `manifest.json`
- Check Extension ID matches the one in Google Cloud Console
- Ensure OAuth consent screen is configured

### "Access blocked" error
- Check if your email is in test users list (if app is in Testing mode)
- Verify scopes are added correctly
- Check OAuth consent screen configuration

### Extension ID changed
- If you reload the extension and ID changes, update it in Google Cloud Console
- Or create a new OAuth client ID with the new Extension ID

## Security Notes

- **Never commit** your Client ID to public repositories
- Keep your OAuth credentials secure
- The Client ID is safe to include in the extension (it's public)
- The extension only requests read-only access to calendars

## References

- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Chrome Extension OAuth](https://developer.chrome.com/docs/extensions/mv3/security/#oauth2)
- [Google Calendar API](https://developers.google.com/calendar/api)

---

**Current Status**: `manifest.json` has placeholder `YOUR_CLIENT_ID.apps.googleusercontent.com`  
**Action Required**: Complete OAuth setup and update manifest.json

