// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable minification for production builds
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      keep_classnames: false,
      keep_fnames: false,
    },
  },
  // Enable inline requires for better tree-shaking
  inlineRequires: true,
};

// Optimize asset resolution
config.resolver = {
  ...config.resolver,
  // Only resolve platform-specific extensions
  sourceExts: [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'],
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
};

// Enable Hermes optimizations
config.serializer = {
  ...config.serializer,
  // Optimize bundle output
  getModulesRunBeforeMainModule: () => [],
};

module.exports = config;

