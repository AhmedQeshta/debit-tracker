#!/bin/bash
# Asset compression script for APK size optimization
# This script compresses PNG assets to reduce APK size

set -e

ASSETS_DIR="./assets"
TEMP_DIR="./assets-compressed"

echo "🔍 Analyzing current asset sizes..."
du -sh "$ASSETS_DIR"/*.png 2>/dev/null | sort -hr

echo ""
echo "📦 Compressing assets..."

# Create temp directory
mkdir -p "$TEMP_DIR"

# Check for compression tools
if command -v pngquant &> /dev/null; then
    echo "Using pngquant for compression..."
    for file in "$ASSETS_DIR"/*.png; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "  Compressing $filename..."
            pngquant --quality=65-80 --ext .png --force "$file" --output "$TEMP_DIR/$filename"
        fi
    done
elif command -v optipng &> /dev/null; then
    echo "Using optipng for compression..."
    for file in "$ASSETS_DIR"/*.png; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "  Compressing $filename..."
            cp "$file" "$TEMP_DIR/$filename"
            optipng -o7 "$TEMP_DIR/$filename"
        fi
    done
else
    echo "⚠️  No compression tools found (pngquant or optipng)"
    echo ""
    echo "Install one of these tools:"
    echo "  - pngquant: sudo apt install pngquant (or brew install pngquant on macOS)"
    echo "  - optipng: sudo apt install optipng (or brew install optipng on macOS)"
    echo ""
    echo "Or use online tools:"
    echo "  - https://tinypng.com/"
    echo "  - https://squoosh.app/"
    echo ""
    echo "Target sizes:"
    echo "  - splash.png: <200KB (currently 2.3MB)"
    echo "  - icon.png, adaptive-icon.png, splash-icon.png: <100KB each (currently 658K each)"
    exit 1
fi

echo ""
echo "📊 Comparing sizes:"
echo "Before:"
du -sh "$ASSETS_DIR"/*.png 2>/dev/null | sort -hr
echo ""
echo "After:"
du -sh "$TEMP_DIR"/*.png 2>/dev/null | sort -hr

echo ""
read -p "Replace original files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cp "$TEMP_DIR"/*.png "$ASSETS_DIR/"
    echo "✅ Assets replaced!"
else
    echo "⚠️  Original files kept. Compressed versions in $TEMP_DIR"
fi

rm -rf "$TEMP_DIR"

