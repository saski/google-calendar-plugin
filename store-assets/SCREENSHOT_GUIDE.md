# Screenshot Creation Guide

## Requirements
- Format: PNG
- Size: 1280x800 pixels (required)
- Minimum: 1 screenshot
- Maximum: 5 screenshots
- File size: < 1MB per image

## Screenshots to Create

### 1. Main Feature (1280x800-1.png)
**Purpose**: Show the full-year view in action

**What to capture:**
- Google Calendar with full-year view activated
- Show the sequential day layout (all 365 days visible)
- Include sample events displayed in the view
- Highlight the "Full Year View" button or toggle
- Show the scrollable interface

**Steps:**
1. Load extension in Chrome (unpacked or installed)
2. Navigate to https://calendar.google.com
3. Click the "Full Year View" button to activate
4. Scroll to show a good portion of the year with events
5. Take screenshot using browser DevTools or screenshot tool
6. Edit/crop to exactly 1280x800 pixels
7. Save as `store-assets/screenshots/1280x800-1.png`

### 2. Event Details (1280x800-2.png)
**Purpose**: Demonstrate event interaction and rendering

**What to capture:**
- Full-year view with events visible
- Show event hover state (tooltip or details popup)
- Or show event click interaction
- Demonstrate how events are color-coded
- Show multiple events on different dates

**Steps:**
1. Ensure you have events in your calendar
2. Activate full-year view
3. Hover over or click an event to show details
4. Capture the interaction state
5. Edit/crop to exactly 1280x800 pixels
6. Save as `store-assets/screenshots/1280x800-2.png`

### 3. Comparison View (1280x800-3.png) [Optional]
**Purpose**: Show the benefit of full-year view vs standard view

**What to capture:**
- Side-by-side comparison (if possible)
- Or show standard monthly view vs full-year view
- Highlight the advantage of seeing the full year
- Show how it helps with long-term planning

**Steps:**
1. Take screenshot of standard monthly view
2. Take screenshot of full-year view
3. Create side-by-side comparison image
4. Edit to exactly 1280x800 pixels
5. Save as `store-assets/screenshots/1280x800-3.png`

## Screenshot Tools

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Use Device Toolbar (Ctrl+Shift+M)
3. Set custom size: 1280x800
4. Take screenshot: Cmd+Shift+P → "Capture screenshot"

### macOS
- Built-in screenshot tool: Cmd+Shift+4
- Or use Preview app for cropping

### Windows
- Snipping Tool or Snip & Sketch
- Use image editor to resize to 1280x800

### Online Tools
- Use image editors like GIMP, Photoshop, or online tools
- Ensure final size is exactly 1280x800 pixels

## Optimization Tips

1. **File Size**: Compress PNGs to keep under 1MB
   - Use tools like TinyPNG or ImageOptim
   - Reduce color depth if needed
   - Remove unnecessary metadata

2. **Quality**: Maintain clarity while reducing size
   - Use PNG compression
   - Avoid excessive blur
   - Keep text readable

3. **Content**: Make screenshots informative
   - Show actual functionality
   - Include relevant events
   - Highlight key features

## Checklist

Before submitting:
- [ ] All screenshots are exactly 1280x800 pixels
- [ ] All screenshots are PNG format
- [ ] Each screenshot is under 1MB
- [ ] Screenshots show actual extension functionality
- [ ] Screenshots are clear and readable
- [ ] At least 1 screenshot is created
- [ ] Screenshots are saved in `store-assets/screenshots/`

## Notes

- Screenshots must accurately represent the extension's functionality
- Chrome Web Store reviewers will verify screenshots match the extension
- Update screenshots when major features change
- Consider creating screenshots in different languages if targeting international users
