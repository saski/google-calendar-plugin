const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'manifest.json');
const PACKAGE_PATH = path.join(__dirname, '..', 'package.json');

function validateVersion(version) {
  const semverRegex = /^\d+\.\d+\.\d+$/;
  if (!semverRegex.test(version)) {
    throw new Error(`Invalid version format: ${version}. Use semantic versioning (e.g., 1.2.3)`);
  }
}

function bumpVersion(currentVersion, type) {
  validateVersion(currentVersion);
  
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch(type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid version type: ${type}. Use 'major', 'minor', or 'patch'`);
  }
}

function updateManifest(version) {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error('manifest.json not found');
  }
  
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  manifest.version = version;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
}

function updatePackage(version) {
  if (!fs.existsSync(PACKAGE_PATH)) {
    throw new Error('package.json not found');
  }
  
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  pkg.version = version;
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(pkg, null, 2) + '\n');
}

function bumpVersionCommand() {
  const type = process.argv[2];
  
  if (!type || !['major', 'minor', 'patch'].includes(type)) {
    console.error('Usage: node version.js [major|minor|patch]');
    process.exit(1);
  }
  
  // Read current version from manifest.json
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error('manifest.json not found');
  }
  
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const currentVersion = manifest.version;
  
  const newVersion = bumpVersion(currentVersion, type);
  
  // Update both files
  updateManifest(newVersion);
  updatePackage(newVersion);
  
  console.log(`Version bumped: ${currentVersion} → ${newVersion}`);
  console.log(`Updated: manifest.json, package.json`);
}

bumpVersionCommand();
