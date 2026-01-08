#!/bin/bash

# Simple script to create placeholder icons using ImageMagick or sips
# If neither is available, provides instructions

ICON_DIR="assets/icons"
SIZES=(16 48 128)

echo "🎨 Creating Extension Icons"
echo "============================"
echo ""

# Check if directory exists
if [ ! -d "$ICON_DIR" ]; then
    echo "Creating $ICON_DIR directory..."
    mkdir -p "$ICON_DIR"
fi

# Try ImageMagick first
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    for size in "${SIZES[@]}"; do
        convert -size ${size}x${size} xc:"#4285f4" \
                -fill white \
                -gravity center \
                -pointsize $((size/3)) \
                -annotate +0+0 "YR" \
                "$ICON_DIR/icon-${size}.png"
        echo "✅ Created icon-${size}.png"
    done
    echo ""
    echo "✨ Icons created successfully!"
    exit 0
fi

# Try sips (macOS built-in)
if command -v sips &> /dev/null; then
    echo "Using macOS sips..."
    # Create a temporary colored image first
    TEMP_IMG=$(mktemp).png
    
    for size in "${SIZES[@]}"; do
        # Create solid color image
        sips -s format png --setProperty formatOptions low \
             -z $size $size \
             -c "#4285f4" \
             "$TEMP_IMG" \
             --out "$ICON_DIR/icon-${size}.png" 2>/dev/null || \
        # Fallback: create simple colored square
        python3 -c "
from PIL import Image, ImageDraw, ImageFont
img = Image.new('RGB', ($size, $size), color='#4285f4')
draw = ImageDraw.Draw(img)
font_size = max(8, $size // 3)
try:
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
except:
    font = ImageFont.load_default()
text = 'YR'
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
position = (($size - text_width) // 2, ($size - text_height) // 2)
draw.text(position, text, fill='white', font=font)
img.save('$ICON_DIR/icon-${size}.png')
" 2>/dev/null
        
        if [ -f "$ICON_DIR/icon-${size}.png" ]; then
            echo "✅ Created icon-${size}.png"
        fi
    done
    
    rm -f "$TEMP_IMG" 2>/dev/null
    echo ""
    echo "✨ Icons created successfully!"
    exit 0
fi

# Try Python with PIL
if command -v python3 &> /dev/null; then
    python3 -c "
from PIL import Image, ImageDraw, ImageFont
import os

icon_dir = '$ICON_DIR'
os.makedirs(icon_dir, exist_ok=True)

sizes = [16, 48, 128]
for size in sizes:
    img = Image.new('RGB', (size, size), color='#4285f4')
    draw = ImageDraw.Draw(img)
    
    # Try to use a nice font, fallback to default
    font_size = max(8, size // 3)
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
    except:
        try:
            font = ImageFont.truetype('/System/Library/Fonts/Arial.ttf', font_size)
        except:
            font = ImageFont.load_default()
    
    text = 'YR'
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size - text_width) // 2, (size - text_height) // 2)
    draw.text(position, text, fill='white', font=font)
    
    img.save(f'{icon_dir}/icon-{size}.png')
    print(f'✅ Created icon-{size}.png')
" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✨ Icons created successfully using Python!"
        exit 0
    fi
fi

# Fallback: Instructions
echo "❌ No suitable tool found to create icons automatically"
echo ""
echo "Please use one of these options:"
echo ""
echo "1. Use the HTML generator (recommended):"
echo "   - Open generate-icons.html in your browser"
echo "   - Click 'Generate Icons' and download each icon"
echo "   - Save to $ICON_DIR/"
echo ""
echo "2. Install ImageMagick:"
echo "   brew install imagemagick"
echo "   Then run this script again"
echo ""
echo "3. Use online tool:"
echo "   https://www.favicon-generator.org/"
echo "   Upload a 128x128 image and download all sizes"
echo ""
exit 1

