# Scripts Usage Guide

## 1. Compress Assets Script

**Purpose**: Compress PNG images to reduce APK size

### Usage

```bash
# From project root
./scripts/compress-assets.sh
```

### Requirements

Install one of these tools first:

**Linux:**
```bash
sudo apt install pngquant
# OR
sudo apt install optipng
```

**macOS:**
```bash
brew install pngquant
# OR
brew install optipng
```

### What it does

1. Shows current asset sizes
2. Compresses all PNG files in `assets/` folder
3. Shows before/after comparison
4. Asks if you want to replace originals

### Manual Alternative

If you don't want to install tools, use online compressors:
- https://tinypng.com/
- https://squoosh.app/

**Target sizes:**
- `splash.png`: <200KB (currently 2.3MB)
- `icon.png`, `adaptive-icon.png`, `splash-icon.png`: <100KB each (currently 658K each)

---

## 2. Analyze Build Size Script

**Purpose**: Analyze APK/AAB files to see what's taking up space

### Usage

```bash
# Option 1: Auto-detect build (if built locally)
./scripts/analyze-build-size.sh

# Option 2: Specify APK file
./scripts/analyze-build-size.sh path/to/app.apk

# Option 3: Specify AAB file
./scripts/analyze-build-size.sh path/to/app.aab

# Example with EAS download
./scripts/analyze-build-size.sh ~/Downloads/debit-tracker-123.apk
```

### What it shows

- Total build size
- Largest files and directories
- Assets breakdown
- Native libraries size
- JavaScript bundle size
- Saves detailed report in `build-analysis/` folder

### Example Output

```
📊 Build Size Analysis
================================

Analyzing: app-release.apk
Size: 65M (68157440 bytes)

📦 Largest files/directories:
  25M - lib/
  15M - assets/
  12M - classes.dex
  8M - index.android.bundle

🖼️  Assets breakdown:
  2.1M - assets/splash.png
  600K - assets/icon.png
  ...

📄 JavaScript Bundle:
  Location: assets/index.android.bundle
  Size: 8.2M (8601600 bytes)
```

---

## Complete Workflow

1. **Compress assets first:**
   ```bash
   ./scripts/compress-assets.sh
   ```

2. **Build your app:**
   ```bash
   npm run build:android:preview
   ```

3. **Download the APK from EAS** (or use local build)

4. **Analyze the build:**
   ```bash
   ./scripts/analyze-build-size.sh ~/Downloads/your-app.apk
   ```

5. **Check the report:**
   ```bash
   cat build-analysis/*.txt
   ```

---

## Troubleshooting

### Script not executable
```bash
chmod +x scripts/compress-assets.sh
chmod +x scripts/analyze-build-size.sh
```

### Compression tools not found
Install pngquant or optipng (see Requirements above), or use online tools.

### Build file not found
Make sure you specify the full path to your APK/AAB file, or build locally first.

