# Google Calendar Full-Year View

Chrome Extension adding a custom full-year view to Google Calendar.

## Implementation Status

✅ **All 7 phases implemented:**
- Phase 1: Project Setup & Manifest Configuration
- Phase 2: OAuth 2.0 Authentication Setup
- Phase 3: View Injection System
- Phase 4: Full-Year View Layout
- Phase 5: Google Calendar API Integration
- Phase 6: Event Display & Rendering
- Phase 7: Basic Interactions

## Development Setup

### Prerequisites

1. **Install dependencies** (for testing):
   ```bash
   npm install
   ```

2. **Create icon files** (required for extension to load):
   - Create `assets/icons/icon-16.png` (16x16 pixels)
   - Create `assets/icons/icon-48.png` (48x48 pixels)
   - Create `assets/icons/icon-128.png` (128x128 pixels)
   
   Or use placeholder icons temporarily.

3. **Configure OAuth** (required for API access):
   - Create Google Cloud Console project
   - Enable Google Calendar API
   - Configure OAuth consent screen
   - Create OAuth 2.0 Client ID (Chrome Extension type)
   - Add Client ID to `manifest.json` (replace `YOUR_CLIENT_ID`)

### Load Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the project directory (`google-calendar-plugin/`)

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Note**: If tests fail with "jest-environment-jsdom cannot be found", install it:
```bash
npm install --legacy-peer-deps jest-environment-jsdom
```

## Technical Notes

- **No build step required**: Code uses vanilla JavaScript with global module pattern
- **ES6 modules converted**: All imports/exports converted to work in Chrome Extension context
- **Date utilities**: Custom implementations replace date-fns for browser compatibility
- **Module loading**: All scripts loaded via manifest.json in dependency order

## File Structure

```
google-calendar-plugin/
├── manifest.json              # Extension manifest (V3)
├── package.json               # Dependencies and scripts
├── src/
│   ├── content/              # Content scripts
│   ├── background/            # Service worker
│   ├── popup/                # Extension popup
│   ├── styles/               # CSS files
│   └── utils/                # Utility functions
└── tests/                    # Test files
```

## Troubleshooting

### npm Permission Errors

If you get `EPERM` errors when running `npm install`:

```bash
# Remove macOS extended attributes
sudo xattr -cr ~/.nvm/versions/node/v18.20.8/
npm install --legacy-peer-deps
```

See `FIX_NPM_NOW.md` for detailed solutions.

### Dependency Conflicts

If you get `ERESOLVE` errors:

```bash
# Use legacy peer deps (already configured in .npmrc)
npm install --legacy-peer-deps
```

### Test Environment Issues

If tests fail with "Cannot find module '@jest/test-sequencer'":

```bash
# Remove macOS extended attributes blocking node_modules
sudo xattr -cr node_modules/
npm test
```

If tests fail with missing `jest-environment-jsdom`:

```bash
npm install --legacy-peer-deps jest-environment-jsdom
```

See `FIX_JEST_NOW.md` and `FIX_TESTS.md` for more details.

### Creating Icons

Use the provided icon generator:

1. Open `generate-icons.html` in your browser
2. Click "Generate Icons" or "Download All Icons"
3. Save icons to `assets/icons/` directory:
   - `icon-16.png`
   - `icon-48.png`
   - `icon-128.png`

## Next Steps

1. ✅ Install dependencies: `npm install --legacy-peer-deps`
2. ⚠️ Create icon files (use `generate-icons.html`)
3. ⚠️ Configure OAuth credentials (see Prerequisites)
4. ⚠️ Load extension in Chrome
5. ⚠️ Test on Google Calendar
6. ⚠️ Run automated tests: `npm test` (after fixing test environment)

