const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const MANIFEST_PATH = path.join(DIST_DIR, 'manifest.json');

function getVersion() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error('Manifest not found. Run "npm run build" first.');
  }
  
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  return manifest.version;
}

function createZip() {
  console.log('Creating package for Chrome Web Store...');
  
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('Dist directory not found. Run "npm run build" first.');
  }
  
  const version = getVersion();
  const zipFileName = `extension-v${version}.zip`;
  const zipPath = path.join(DIST_DIR, zipFileName);
  
  // Remove existing zip if it exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  
  // Create zip file
  // Using zip command (available on macOS/Linux)
  const cwd = DIST_DIR;
  const filesToZip = fs.readdirSync(cwd)
    .filter(file => file !== zipFileName)
    .join(' ');
  
  try {
    execSync(`cd "${cwd}" && zip -r "${zipFileName}" ${filesToZip}`, {
      stdio: 'inherit'
    });
    
    // Verify zip was created
    if (!fs.existsSync(zipPath)) {
      throw new Error('Zip file was not created');
    }
    
    const stats = fs.statSync(zipPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✓ Package created successfully');
    console.log(`✓ File: ${zipPath}`);
    console.log(`✓ Size: ${sizeInMB} MB`);
    
    if (stats.size > 5 * 1024 * 1024) {
      console.warn('⚠ Warning: Zip file exceeds 5MB (Chrome Web Store limit)');
    }
    
    return zipPath;
  } catch (error) {
    if (error.message.includes('zip: command not found')) {
      throw new Error('zip command not found. Please install zip utility or use alternative packaging method.');
    }
    throw error;
  }
}

createZip();
