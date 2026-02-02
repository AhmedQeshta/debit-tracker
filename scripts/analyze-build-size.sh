#!/bin/bash
# Build size analysis script for APK/AAB optimization tracking
# Usage: ./scripts/analyze-build-size.sh [path-to-apk-or-aab]

set -e

BUILD_FILE="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="$PROJECT_DIR/build-analysis"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Build Size Analysis${NC}"
echo "================================"
echo ""

# If no file provided, look for recent builds
if [ -z "$BUILD_FILE" ]; then
    echo -e "${YELLOW}No build file specified. Looking for recent builds...${NC}"
    
    # Check for local build artifacts
    if [ -d "android/app/build/outputs" ]; then
        APK_FILE=$(find android/app/build/outputs/apk -name "*.apk" -type f | head -1)
        AAB_FILE=$(find android/app/build/outputs/bundle -name "*.aab" -type f | head -1)
        
        if [ -n "$APK_FILE" ]; then
            BUILD_FILE="$APK_FILE"
            echo -e "${GREEN}Found APK: $BUILD_FILE${NC}"
        elif [ -n "$AAB_FILE" ]; then
            BUILD_FILE="$AAB_FILE"
            echo -e "${GREEN}Found AAB: $AAB_FILE${NC}"
        fi
    fi
    
    if [ -z "$BUILD_FILE" ]; then
        echo -e "${RED}No build file found.${NC}"
        echo ""
        echo "Usage: $0 [path-to-apk-or-aab]"
        echo "Or run from project root after building with EAS"
        exit 1
    fi
fi

if [ ! -f "$BUILD_FILE" ]; then
    echo -e "${RED}Error: Build file not found: $BUILD_FILE${NC}"
    exit 1
fi

# Get file info
FILE_SIZE=$(du -h "$BUILD_FILE" | cut -f1)
FILE_SIZE_BYTES=$(stat -f%z "$BUILD_FILE" 2>/dev/null || stat -c%s "$BUILD_FILE" 2>/dev/null)
FILE_NAME=$(basename "$BUILD_FILE")
FILE_EXT="${FILE_NAME##*.}"

echo -e "${BLUE}Analyzing: $FILE_NAME${NC}"
echo -e "Size: ${GREEN}$FILE_SIZE${NC} ($FILE_SIZE_BYTES bytes)"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Extract and analyze if it's an APK or AAB
if [ "$FILE_EXT" = "apk" ] || [ "$FILE_EXT" = "aab" ]; then
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf $TEMP_DIR" EXIT
    
    echo -e "${BLUE}Extracting build contents...${NC}"
    
    if [ "$FILE_EXT" = "apk" ]; then
        # APK is a ZIP file
        unzip -q "$BUILD_FILE" -d "$TEMP_DIR" 2>/dev/null || {
            echo -e "${YELLOW}Note: Could not extract APK (may need unzip tool)${NC}"
        }
    elif [ "$FILE_EXT" = "aab" ]; then
        # AAB is also a ZIP file
        unzip -q "$BUILD_FILE" -d "$TEMP_DIR" 2>/dev/null || {
            echo -e "${YELLOW}Note: Could not extract AAB (may need unzip tool)${NC}"
        }
    fi
    
    if [ -d "$TEMP_DIR" ] && [ "$(ls -A $TEMP_DIR 2>/dev/null)" ]; then
        echo ""
        echo -e "${BLUE}📦 Largest files/directories:${NC}"
        echo "--------------------------------"
        du -sh "$TEMP_DIR"/* 2>/dev/null | sort -hr | head -20 | while read size path; do
            rel_path=${path#$TEMP_DIR/}
            echo -e "  ${GREEN}$size${NC} - $rel_path"
        done
        
        # Analyze assets
        if [ -d "$TEMP_DIR/assets" ]; then
            echo ""
            echo -e "${BLUE}🖼️  Assets breakdown:${NC}"
            echo "--------------------------------"
            du -sh "$TEMP_DIR/assets"/* 2>/dev/null | sort -hr | head -10 | while read size path; do
                rel_path=${path#$TEMP_DIR/}
                echo -e "  ${GREEN}$size${NC} - $rel_path"
            done
        fi
        
        # Analyze native libraries
        if [ -d "$TEMP_DIR/lib" ]; then
            echo ""
            echo -e "${BLUE}📚 Native libraries:${NC}"
            echo "--------------------------------"
            du -sh "$TEMP_DIR/lib"/* 2>/dev/null | sort -hr | head -10 | while read size path; do
                rel_path=${path#$TEMP_DIR/}
                echo -e "  ${GREEN}$size${NC} - $rel_path"
            done
        fi
        
        # Find JS bundle
        JS_BUNDLE=$(find "$TEMP_DIR" -name "index.android.bundle" -o -name "*.bundle" 2>/dev/null | head -1)
        if [ -n "$JS_BUNDLE" ]; then
            BUNDLE_SIZE=$(du -h "$JS_BUNDLE" | cut -f1)
            BUNDLE_SIZE_BYTES=$(stat -f%z "$JS_BUNDLE" 2>/dev/null || stat -c%s "$JS_BUNDLE" 2>/dev/null)
            echo ""
            echo -e "${BLUE}📄 JavaScript Bundle:${NC}"
            echo "--------------------------------"
            echo -e "  Location: ${GREEN}$JS_BUNDLE${NC}"
            echo -e "  Size: ${GREEN}$BUNDLE_SIZE${NC} ($BUNDLE_SIZE_BYTES bytes)"
        fi
    fi
fi

# Generate report
REPORT_FILE="$OUTPUT_DIR/$(date +%Y%m%d-%H%M%S)-build-analysis.txt"
{
    echo "Build Size Analysis Report"
    echo "=========================="
    echo "Date: $(date)"
    echo "Build File: $FILE_NAME"
    echo "Size: $FILE_SIZE ($FILE_SIZE_BYTES bytes)"
    echo ""
    echo "File Type: $FILE_EXT"
    echo ""
} > "$REPORT_FILE"

echo ""
echo -e "${GREEN}✅ Analysis complete!${NC}"
echo -e "Report saved to: ${BLUE}$REPORT_FILE${NC}"
echo ""
echo -e "${YELLOW}💡 Tips for size reduction:${NC}"
echo "  - Compress PNG assets (use scripts/compress-assets.sh)"
echo "  - Remove unused dependencies"
echo "  - Enable Hermes (already configured)"
echo "  - Use AAB for Play Store (smaller downloads)"
echo "  - Check for duplicate assets"

