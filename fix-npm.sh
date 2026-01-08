#!/bin/bash

# npm Permission Fix Script
# Run this script to fix npm permission issues

set -e

echo "🔧 npm Permission Fix Script"
echo "=============================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "❌ Please don't run this script as root/sudo"
   echo "   Run it as your regular user"
   exit 1
fi

# Get current user
CURRENT_USER=$(whoami)
echo "Current user: $CURRENT_USER"
echo ""

# Check if nvm is installed
if [ ! -d "$HOME/.nvm" ]; then
    echo "❌ nvm not found at $HOME/.nvm"
    echo "   This script is for nvm installations"
    exit 1
fi

# Detect current node version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "Current Node version: $NODE_VERSION"
    
    # Try to find nvm node path
    NVM_NODE_PATH=$(which node)
    if [[ "$NVM_NODE_PATH" == *".nvm"* ]]; then
        NVM_VERSION_DIR=$(dirname $(dirname $(dirname "$NVM_NODE_PATH")))
        echo "nvm node path: $NVM_VERSION_DIR"
    else
        echo "⚠️  Node doesn't appear to be managed by nvm"
        echo "   Trying default nvm path..."
        NVM_VERSION_DIR="$HOME/.nvm/versions/node/$(node --version | sed 's/v//')"
    fi
else
    echo "❌ Node.js not found"
    exit 1
fi

if [ ! -d "$NVM_VERSION_DIR" ]; then
    echo "❌ Node version directory not found: $NVM_VERSION_DIR"
    echo "   Please check your nvm installation"
    exit 1
fi

echo ""
echo "📋 Current permissions:"
ls -ld "$NVM_VERSION_DIR"

echo ""
read -p "Fix permissions for $NVM_VERSION_DIR? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🔨 Fixing permissions..."

# Fix ownership
echo "1. Fixing ownership..."
sudo chown -R "$CURRENT_USER" "$NVM_VERSION_DIR"

# Fix permissions
echo "2. Fixing file permissions..."
chmod -R u+rw "$NVM_VERSION_DIR"

# Fix npm specifically
if [ -d "$NVM_VERSION_DIR/lib/node_modules/npm" ]; then
    echo "3. Fixing npm permissions..."
    chmod -R u+rw "$NVM_VERSION_DIR/lib/node_modules/npm"
fi

echo ""
echo "✅ Permissions fixed!"
echo ""
echo "🧪 Testing npm..."

# Test npm
if npm --version > /dev/null 2>&1; then
    echo "✅ npm is working!"
    npm --version
else
    echo "❌ npm still not working"
    echo "   Try Option 2: Reinstall npm"
    exit 1
fi

echo ""
echo "📦 Testing npm install in project..."

cd "$(dirname "$0")"

if npm install --dry-run > /dev/null 2>&1; then
    echo "✅ npm install should work now!"
    echo ""
    echo "Run: npm install"
else
    echo "⚠️  npm install test failed"
    echo "   You may need to reinstall npm: npm install -g npm@latest"
fi

echo ""
echo "✨ Done!"

