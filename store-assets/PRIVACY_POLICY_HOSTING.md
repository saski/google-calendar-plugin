# Privacy Policy Hosting Guide

## Overview

The Chrome Web Store requires a publicly accessible privacy policy URL for extensions that handle user data. This guide explains how to host the privacy policy and update the manifest.

## Hosting Options

### Option 1: GitHub Pages (Recommended - Free)

**Advantages:**
- Free hosting
- Automatic HTTPS
- Easy updates via git
- No additional services needed

**Steps:**

1. **Create docs directory in repository**
   ```bash
   mkdir docs
   cp store-assets/privacy-policy.html docs/privacy-policy.html
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to "Pages" section
   - Select "main" branch and "/docs" folder
   - Click "Save"

3. **Get your URL**
   - URL format: `https://[USERNAME].github.io/[REPO-NAME]/privacy-policy.html`
   - Example: `https://yourusername.github.io/google-calendar-plugin/privacy-policy.html`

4. **Update manifest.json**
   ```json
   {
     "privacy_policy": "https://yourusername.github.io/google-calendar-plugin/privacy-policy.html"
   }
   ```

5. **Verify**
   - Visit the URL in a browser
   - Ensure the page loads correctly
   - Check that all links work

### Option 2: Netlify (Free)

**Advantages:**
- Free tier available
- Automatic HTTPS
- Custom domain support
- Easy deployment

**Steps:**

1. **Create account** at https://netlify.com

2. **Deploy site**
   - Drag and drop the `store-assets` folder
   - Or connect GitHub repository
   - Netlify will provide a URL

3. **Get URL**
   - Format: `https://[RANDOM-NAME].netlify.app/privacy-policy.html`
   - Or use custom domain if configured

4. **Update manifest.json** with the Netlify URL

### Option 3: Vercel (Free)

**Advantages:**
- Free tier available
- Automatic HTTPS
- Fast CDN
- Easy GitHub integration

**Steps:**

1. **Create account** at https://vercel.com

2. **Import project**
   - Connect GitHub repository
   - Configure build settings (static site)

3. **Deploy**
   - Vercel will provide a URL
   - Format: `https://[PROJECT-NAME].vercel.app/privacy-policy.html`

4. **Update manifest.json** with the Vercel URL

### Option 4: Personal Website

**If you have an existing website:**

1. **Upload HTML file**
   - Upload `privacy-policy.html` to your web server
   - Place in appropriate directory

2. **Get URL**
   - Format: `https://yourdomain.com/privacy-policy.html`

3. **Update manifest.json** with your domain URL

## Updating manifest.json

After hosting the privacy policy, update `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Google Calendar Full-Year View",
  "version": "0.1.0",
  "description": "Adds a full-year view to Google Calendar with sequential day layout",
  "privacy_policy": "https://yourusername.github.io/google-calendar-plugin/privacy-policy.html",
  // ... rest of manifest
}
```

**Important:**
- The URL must be publicly accessible
- The URL must use HTTPS (required by Chrome Web Store)
- The URL must return valid HTML
- The page should load within a reasonable time

## Verification Checklist

Before submitting to Chrome Web Store:

- [ ] Privacy policy is hosted at a public URL
- [ ] URL uses HTTPS
- [ ] Page loads correctly in a browser
- [ ] All links in the policy work
- [ ] Privacy policy URL is added to `manifest.json`
- [ ] URL is accessible from different networks (test on mobile)
- [ ] Page is mobile-friendly (responsive design)

## Testing

1. **Test URL accessibility**
   ```bash
   curl -I https://your-privacy-policy-url.html
   ```
   Should return HTTP 200 status

2. **Test in browser**
   - Open URL in incognito/private window
   - Verify page renders correctly
   - Check all links work

3. **Test HTTPS**
   - Ensure URL uses HTTPS (not HTTP)
   - Check SSL certificate is valid

## Troubleshooting

### Issue: Page not found (404)
- **Solution**: Verify file path and GitHub Pages settings
- Check that file is in the correct directory
- Ensure GitHub Pages is enabled for the correct branch/folder

### Issue: Mixed content warnings
- **Solution**: Ensure all resources use HTTPS
- Check that external links use HTTPS

### Issue: Page not updating
- **Solution**: Clear browser cache
- GitHub Pages may take a few minutes to update
- Force refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Maintenance

### Updating the Privacy Policy

1. **Edit the HTML file**
   - Update content as needed
   - Update "Last updated" date

2. **Commit and push**
   ```bash
   git add store-assets/privacy-policy.html
   git commit -m "Update privacy policy"
   git push
   ```

3. **Verify update**
   - Wait a few minutes for GitHub Pages to update
   - Visit the URL to confirm changes

### Keeping It Current

- Review privacy policy periodically
- Update when Extension features change
- Update when data handling changes
- Keep "Last updated" date current

## Notes

- The privacy policy must be accessible before Chrome Web Store submission
- Chrome Web Store reviewers will verify the URL is accessible
- Users can access the privacy policy from the Chrome Web Store listing
- Keep the policy simple and clear for users
