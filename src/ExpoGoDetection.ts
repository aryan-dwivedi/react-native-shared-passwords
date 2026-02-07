import { NativeModules } from 'react-native';

/**
 * Detects if the app is running in Expo Go
 *
 * Expo Go doesn't support custom native modules, so we need to detect
 * this and provide fallback behavior.
 */
export function isExpoGo(): boolean {
  // Check for Expo constants module (available in Expo projects)
  try {
    const Constants = require('expo-constants').default;

    // In Expo Go, executionEnvironment is 'storeClient'
    // In development builds, it's 'standalone' or 'bare'
    if (Constants.executionEnvironment === 'storeClient') {
      return true;
    }

    // Also check appOwnership for older Expo versions
    if (Constants.appOwnership === 'expo') {
      return true;
    }

    return false;
  } catch {
    // expo-constants not available, not running in Expo
    return false;
  }
}

/**
 * Checks if native modules are available
 */
export function hasNativeModule(): boolean {
  // Check if we're in Expo Go first
  if (isExpoGo()) {
    return false;
  }

  // Try to access the native module
  try {
    const NativeSharedPasswords = require('./NativeSharedPasswords').default;
    if (NativeSharedPasswords) {
      return true;
    }
  } catch {
    // Turbo module not available, try bridge
  }

  // Check bridge module
  const { SharedPasswords } = NativeModules;
  return !!SharedPasswords;
}

/**
 * Get execution environment description
 */
export function getExecutionEnvironment(): 'expo-go' | 'development-build' | 'bare' {
  if (isExpoGo()) {
    return 'expo-go';
  }

  try {
    const Constants = require('expo-constants').default;
    if (Constants.executionEnvironment === 'standalone') {
      return 'development-build';
    }
  } catch {
    // Not an Expo project
  }

  return 'bare';
}

/**
 * Get a user-friendly message about the current environment
 */
export function getEnvironmentMessage(): string {
  const env = getExecutionEnvironment();

  switch (env) {
    case 'expo-go':
      return (
        'Running in Expo Go. Native password/passkey features require a development build. ' +
        'Run `npx expo run:ios` or `npx expo run:android` to use native features.'
      );
    case 'development-build':
      return 'Running in Expo development build with native modules.';
    case 'bare':
      return 'Running in bare React Native with native modules.';
  }
}
