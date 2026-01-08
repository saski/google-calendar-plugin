const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'dist');
const SRC_DIR = path.join(__dirname, '..');

// Files/directories to include
const INCLUDED_PATTERNS = [
  'manifest.json',
  'src',
  'assets',
  'LICENSE'
];

// Files/directories to exclude
const EXCLUDED_PATTERNS = [
  'node_modules',
  'tests',
  'thoughts',
  '.test.js',
  '.log',
  '.DS_Store',
  'dist',
  'build',
  '.zip',
  '.env',
  '.pem',
  'package.json',
  'package-lock.json',
  'jest.config.js',
  'jest.setup.js',
  '.git',
  '.gitignore',
  'README.md',
  'create-icons.sh',
  'fix-',
  'generate-icons.html'
];

function shouldExclude(filePath, relativePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName);
  
  // Check exact matches
  if (EXCLUDED_PATTERNS.includes(fileName)) {
    return true;
  }
  
  // Check patterns
  for (const pattern of EXCLUDED_PATTERNS) {
    if (fileName.includes(pattern)) {
      return true;
    }
    if (relativePath.includes(pattern)) {
      return true;
    }
  }
  
  // Exclude test files
  if (fileName.endsWith('.test.js')) {
    return true;
  }
  
  return false;
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function copyDirectory(src, dest, relativePath = '') {
  if (!fs.existsSync(src)) {
    return;
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const newRelativePath = path.join(relativePath, entry.name);
    
    if (shouldExclude(srcPath, newRelativePath)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, newRelativePath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function validateManifest(manifestPath) {
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    if (!manifest.manifest_version) {
      throw new Error('Missing manifest_version');
    }
    if (!manifest.name) {
      throw new Error('Missing name');
    }
    if (!manifest.version) {
      throw new Error('Missing version');
    }
    
    return true;
  } catch (error) {
    throw new Error(`Manifest validation failed: ${error.message}`);
  }
}

function build() {
  console.log('Building extension for Chrome Web Store...');
  
  // Clean dist directory
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  
  // Copy manifest.json
  const manifestSrc = path.join(SRC_DIR, 'manifest.json');
  const manifestDest = path.join(BUILD_DIR, 'manifest.json');
  copyFile(manifestSrc, manifestDest);
  
  // Copy src directory
  const srcDir = path.join(SRC_DIR, 'src');
  const destSrcDir = path.join(BUILD_DIR, 'src');
  copyDirectory(srcDir, destSrcDir, 'src');
  
  // Copy assets directory
  const assetsDir = path.join(SRC_DIR, 'assets');
  const destAssetsDir = path.join(BUILD_DIR, 'assets');
  copyDirectory(assetsDir, destAssetsDir, 'assets');
  
  // Copy LICENSE
  const licenseSrc = path.join(SRC_DIR, 'LICENSE');
  if (fs.existsSync(licenseSrc)) {
    const licenseDest = path.join(BUILD_DIR, 'LICENSE');
    copyFile(licenseSrc, licenseDest);
  }
  
  // Validate manifest
  validateManifest(manifestDest);
  
  console.log('✓ Build complete');
  console.log(`✓ Output directory: ${BUILD_DIR}`);
}

build();
