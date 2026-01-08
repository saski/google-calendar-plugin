#!/bin/bash

# macOS-specific npm permission fix
# Handles quarantine attributes and macOS security restrictions

set -e

echo "🍎 macOS npm Permission Fix"
echo "============================"
echo ""

# Check if on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is for macOS only"
    exit 1
fi

CURRENT_USER=$(whoami)
NVM_NODE_PATH="$HOME/.nvm/versions/node/v18.20.8"

echo "Current user: $CURRENT_USER"
echo "Node path: $NVM_NODE_PATH"
echo ""

# Check if directory exists
if [ ! -d "$NVM_NODE_PATH" ]; then
    echo "❌ Node directory not found: $NVM_NODE_PATH"
    echo "   Please check your nvm installation"
    exit 1
fi

echo "🔍 Checking for quarantine attributes..."
if xattr -l "$NVM_NODE_PATH/lib/node_modules/npm/node_modules/@sigstore/verify/dist/key/index.js" 2>/dev/null | grep -q "com.apple.quarantine"; then
    echo "⚠️  Found quarantine attributes"
    HAS_QUARANTINE=true
else
    echo "✅ No quarantine attributes found"
    HAS_QUARANTINE=false
fi

echo ""
echo "📋 Fix Options:"
echo "1. Remove quarantine attributes (recommended)"
echo "2. Fix file permissions"
echo "3. Both"
echo ""
read -p "Choose option (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo ""
        echo "🔨 Removing quarantine attributes..."
        if sudo xattr -dr com.apple.quarantine "$NVM_NODE_PATH" 2>/dev/null; then
            echo "✅ Quarantine removed"
        else
            echo "⚠️  Failed to remove quarantine (may need Full Disk Access)"
            echo "   Try: System Settings > Privacy & Security > Full Disk Access"
        fi
        ;;
    2)
        echo ""
        echo "🔨 Fixing file permissions..."
        sudo chown -R "$CURRENT_USER" "$NVM_NODE_PATH"
        chmod -R u+rw "$NVM_NODE_PATH"
        echo "✅ Permissions fixed"
        ;;
    3)
        echo ""
        echo "🔨 Removing quarantine attributes..."
        if sudo xattr -dr com.apple.quarantine "$NVM_NODE_PATH" 2>/dev/null; then
            echo "✅ Quarantine removed"
        else
            echo "⚠️  Failed to remove quarantine"
        fi
        
        echo ""
        echo "🔨 Fixing file permissions..."
        sudo chown -R "$CURRENT_USER" "$NVM_NODE_PATH"
        chmod -R u+rw "$NVM_NODE_PATH"
        echo "✅ Permissions fixed"
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🧪 Testing npm..."

if npm --version > /dev/null 2>&1; then
    echo "✅ npm is working!"
    npm --version
else
    echo "❌ npm still not working"
    echo ""
    echo "💡 Additional steps:"
    echo "1. Grant Full Disk Access to Terminal/Cursor:"
    echo "   System Settings > Privacy & Security > Full Disk Access"
    echo ""
    echo "2. Or reinstall npm:"
    echo "   npm install -g npm@latest"
    exit 1
fi

echo ""
echo "📦 Testing npm install..."

cd "$(dirname "$0")"

if npm install --dry-run > /dev/null 2>&1; then
    echo "✅ npm install should work now!"
    echo ""
    echo "Run: npm install"
else
    echo "⚠️  npm install test failed"
    echo "   You may need Full Disk Access or to reinstall npm"
fi

echo ""
echo "✨ Done!"

