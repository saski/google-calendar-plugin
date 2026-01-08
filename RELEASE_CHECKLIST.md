# Release Checklist

## Pre-Release

### Code Quality
- [ ] All tests passing: `npm test`
- [ ] No console errors in extension
- [ ] Manual testing completed on Google Calendar
- [ ] Code reviewed (if applicable)
- [ ] No linting errors

### Version Management
- [ ] Version bumped: `npm run version:patch|minor|major`
- [ ] Version updated in both manifest.json and package.json
- [ ] Changelog updated (if applicable)
- [ ] Version number follows semantic versioning

### Build & Package
- [ ] Build successful: `npm run build`
- [ ] Package created: `npm run package`
- [ ] Zip file validated (opens correctly)
- [ ] Zip file size < 5MB
- [ ] Zip file contains all required files
- [ ] Zip file excludes development files (tests, node_modules, etc.)

### Store Assets
- [ ] Screenshots created and optimized (at least 1, 1280x800 PNG)
- [ ] Store listing content finalized
- [ ] Privacy policy hosted and accessible
- [ ] Privacy policy URL added to manifest.json
- [ ] Store listing description under character limits

### Documentation
- [ ] README.md updated (if needed)
- [ ] Release notes prepared
- [ ] Known issues documented (if any)

## Chrome Web Store Submission

### Developer Dashboard
1. [ ] Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. [ ] Sign in with Google account (pay $5 one-time fee if new developer)
3. [ ] Click "New Item"
4. [ ] Upload zip file: `dist/extension-v{VERSION}.zip`
5. [ ] Fill in store listing:
   - [ ] Name: "Google Calendar Full-Year View"
   - [ ] Short description (132 chars max)
   - [ ] Detailed description (16K chars max)
   - [ ] Category: Productivity
   - [ ] Language: English (en)
   - [ ] Screenshots (at least 1, 1280x800 PNG)
   - [ ] Promotional images (optional)
   - [ ] Privacy policy URL
6. [ ] Set visibility (Unlisted for testing, Public for release)
7. [ ] Review all information
8. [ ] Submit for review

### Post-Submission
- [ ] Monitor review status in Developer Dashboard
- [ ] Address any review feedback promptly
- [ ] Respond to reviewer questions (if any)
- [ ] Publish when approved
- [ ] Verify extension appears in Chrome Web Store

## Post-Release

### Monitoring
- [ ] Monitor user feedback and reviews
- [ ] Track error reports (if analytics enabled)
- [ ] Check Chrome Web Store statistics
- [ ] Respond to user questions/issues

### Maintenance
- [ ] Plan next version improvements
- [ ] Document user-requested features
- [ ] Track bug reports
- [ ] Update documentation as needed

## Quick Release Commands

```bash
# 1. Run tests
npm test

# 2. Bump version
npm run version:patch  # or :minor or :major

# 3. Build and package
npm run package

# 4. Verify zip file
ls -lh dist/extension-v*.zip

# 5. Submit to Chrome Web Store
# (Manual step - use Developer Dashboard)
```

## Version Bump Guidelines

- **Patch** (0.1.0 → 0.1.1): Bug fixes, minor improvements
- **Minor** (0.1.0 → 0.2.0): New features, non-breaking changes
- **Major** (1.0.0 → 2.0.0): Breaking changes, major rewrites

## Common Issues

### Build Fails
- Check Node.js version
- Verify all dependencies installed: `npm install`
- Check for syntax errors in scripts

### Package Too Large
- Review included files
- Remove unnecessary assets
- Optimize images
- Check for large files in src/

### Manifest Validation Errors
- Verify JSON syntax
- Check required fields present
- Ensure version format is correct (semantic versioning)
- Verify permissions are justified

### Chrome Web Store Rejection
- Review rejection reason carefully
- Address all reviewer concerns
- Update privacy policy if needed
- Ensure screenshots match functionality
- Verify all permissions are necessary

## Notes

- Keep this checklist updated as process evolves
- Add project-specific items as needed
- Review checklist before each release
- Document any deviations or learnings
