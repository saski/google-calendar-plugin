# Chrome Web Store Submission Guide

## Prerequisites

### 1. Google Developer Account
- **Cost**: $5 one-time registration fee
- **Sign up**: https://chrome.google.com/webstore/devconsole
- **Payment**: Credit card required
- **Verification**: May require phone verification

**Steps to create account:**
1. Visit Chrome Web Store Developer Dashboard
2. Click "Get Started" or "Sign In"
3. Accept Developer Agreement
4. Pay $5 registration fee
5. Complete account setup

### 2. Extension Package
- **Command**: `npm run package`
- **Output**: `dist/extension-v{VERSION}.zip`
- **Size**: Must be < 5MB
- **Format**: ZIP file containing extension files

**Verify package:**
```bash
npm run package
ls -lh dist/extension-v*.zip
```

### 3. Store Assets
- **Screenshots**: At least 1 (1280x800 PNG, < 1MB each)
- **Description**: Short (132 chars) and detailed (16K chars)
- **Privacy policy**: Hosted and accessible via HTTPS URL
- **Icons**: Already included in package (16x16, 48x48, 128x128)

## Submission Steps

### Step 1: Access Developer Dashboard

1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with your Google account
3. If first time, complete developer registration ($5 fee)

### Step 2: Create New Item

1. Click **"New Item"** button (top right)
2. You'll be prompted to upload a ZIP file
3. Click **"Choose File"** and select `dist/extension-v{VERSION}.zip`
4. Click **"Upload"**

**Note**: The upload may take a few moments depending on file size.

### Step 3: Fill Store Listing

After upload, you'll see the store listing form. Fill in each section:

#### Basic Information

**Name** (required)
- Enter: "Google Calendar Full-Year View"
- Max 45 characters
- This appears as the extension title

**Summary** (required)
- Short description: "Adds a full-year view to Google Calendar with sequential day layout for better long-term planning"
- Max 132 characters
- Appears in search results and listing preview

**Description** (required)
- Copy from `store-assets/store-listing.md`
- Max 16,000 characters
- Use markdown formatting (will be converted)
- Include features, use cases, benefits

**Category** (required)
- Select: **Productivity**
- This helps users discover your extension

**Language** (required)
- Select: **English (United States)** or your primary language

#### Visual Assets

**Icon** (required)
- Already included in package (128x128)
- Chrome will extract it automatically
- Verify it displays correctly

**Screenshots** (required)
- Minimum: 1 screenshot
- Maximum: 5 screenshots
- Format: PNG, 1280x800 pixels
- Size: < 1MB each
- Upload from `store-assets/screenshots/`

**Promotional Images** (optional)
- Small tile: 440x280 pixels
- Large tile: 920x680 pixels (optional)
- Used for featured placements

#### Privacy & Compliance

**Privacy Policy** (required if handling user data)
- Enter the hosted privacy policy URL
- Must be publicly accessible via HTTPS
- Example: `https://yourusername.github.io/google-calendar-plugin/privacy-policy.html`
- Verify URL works before submitting

**Single Purpose** (required)
- Select: **Yes** (extension has single purpose)
- Describe the single purpose if prompted

**Permissions Justification** (required)
- Explain why each permission is needed:
  - `identity`: For Google OAuth authentication
  - `storage`: To store OAuth tokens locally
  - `activeTab`: To interact with Google Calendar pages
  - Host permissions: To access Google Calendar API

#### Additional Information

**Homepage URL** (optional)
- GitHub repository URL or project website
- Example: `https://github.com/username/google-calendar-plugin`

**Support URL** (optional)
- GitHub Issues page or support email
- Example: `https://github.com/username/google-calendar-plugin/issues`

**Store Listing Language**
- Select your primary language
- You can add more languages later

### Step 4: Set Visibility

**Visibility Options:**
- **Unlisted**: Only accessible via direct link (good for testing)
- **Public**: Visible in Chrome Web Store search (for release)

**Recommendation**: Start with **Unlisted** to test, then change to **Public** after verification.

### Step 5: Review and Submit

1. **Review all information**
   - Check for typos
   - Verify all URLs work
   - Ensure screenshots are correct
   - Confirm privacy policy is accessible

2. **Check for warnings**
   - Address any warnings before submitting
   - Common warnings: missing screenshots, privacy policy issues

3. **Click "Submit for Review"**
   - Extension will be queued for review
   - You'll receive email confirmation

## Review Process

### Timeline
- **Initial review**: 1-3 business days
- **Updates**: 1-2 business days
- **Rejections**: Review feedback provided within review period

### Review Status

**Pending Review**
- Extension is in queue
- No action needed
- Typically takes 1-3 days

**In Review**
- Extension is being reviewed
- May take additional time
- Check email for updates

**Published**
- Extension is live in Chrome Web Store
- Users can install it
- You can update it anytime

**Rejected**
- Review feedback provided
- Address all concerns
- Resubmit after fixes

### Common Rejection Reasons

1. **Manifest Errors**
   - Invalid JSON syntax
   - Missing required fields
   - Incorrect version format

2. **Permission Issues**
   - Permissions not justified
   - Excessive permissions requested
   - Missing permission explanations

3. **Privacy Policy**
   - URL not accessible
   - Policy doesn't match functionality
   - Missing required information

4. **Screenshots**
   - Don't match extension functionality
   - Poor quality or unclear
   - Missing required screenshots

5. **Functionality**
   - Extension doesn't work as described
   - Broken features
   - Security concerns

## Post-Submission Checklist

- [ ] Monitor email for review updates
- [ ] Check Developer Dashboard for status
- [ ] Respond to reviewer questions (if any)
- [ ] Address rejection feedback (if rejected)
- [ ] Test extension after approval
- [ ] Share extension link with users
- [ ] Monitor user reviews and feedback

## Updating Your Extension

### After Initial Publication

1. **Make changes** to your extension
2. **Bump version**: `npm run version:patch|minor|major`
3. **Build package**: `npm run package`
4. **Go to Developer Dashboard**
5. **Select your extension**
6. **Click "Package" tab**
7. **Upload new ZIP file**
8. **Submit update**

### Update Review
- Updates typically review faster (1-2 days)
- Minor updates may be auto-approved
- Major changes may require full review

## Troubleshooting

### Upload Fails
- **Check file size**: Must be < 5MB
- **Verify ZIP format**: Should be standard ZIP
- **Check internet connection**: Large files need stable connection
- **Try different browser**: Some browsers have upload limits

### Manifest Validation Errors
- **Check JSON syntax**: Use JSON validator
- **Verify version format**: Must be semantic versioning (e.g., 1.2.3)
- **Check required fields**: All manifest V3 fields present

### Privacy Policy Not Accessible
- **Verify URL**: Test in incognito window
- **Check HTTPS**: Must use HTTPS, not HTTP
- **Test accessibility**: Try from different network
- **Check hosting**: Ensure hosting service is active

### Screenshot Issues
- **Verify size**: Must be exactly 1280x800 pixels
- **Check format**: Must be PNG
- **Verify file size**: Must be < 1MB
- **Test image**: Open in image viewer to verify

## Resources

- **Chrome Web Store Policies**: https://developer.chrome.com/docs/webstore/policies/
- **Manifest V3 Documentation**: https://developer.chrome.com/docs/extensions/mv3/
- **Developer Dashboard**: https://chrome.google.com/webstore/devconsole
- **Support Forum**: https://groups.google.com/a/chromium.org/forum/#!forum/chromium-apps

## Notes

- Keep this guide updated as Chrome Web Store process evolves
- Document any issues encountered during submission
- Share learnings with team (if applicable)
- Review Chrome Web Store policies regularly for updates
