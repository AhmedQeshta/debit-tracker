// https://docs.expo.dev/guides/using-eslint/
// ESLint configuration for React Native/Expo
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'build/*', '*.config.js'],
  },
  {
    rules: {
      // React rules optimized for React Native/Expo
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript instead
      'react/display-name': 'off', // Not needed for React Native
      'react-hooks/exhaustive-deps': 'warn', // Warn about missing dependencies

      // General code quality
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow console.warn and console.error
      'no-unused-vars': 'off', // TypeScript handles this via @typescript-eslint

      // Code style for React Native
      'prefer-const': 'warn',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'prefer-arrow-callback': 'warn',
    },
  },
]);
