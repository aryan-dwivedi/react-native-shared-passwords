/**
 * Expo Go Fallback Module
 *
 * Provides stub implementations for when running in Expo Go,
 * where native modules are not available.
 */

import { Platform } from 'react-native';
import type {
  Credential,
  PasskeyCredential,
  SavePasswordOptions,
  DeleteCredentialOptions,
  CreatePasskeyOptions,
  AuthenticatePasskeyOptions,
  PlatformSupport,
  OperationResult,
} from './types';
import { SharedPasswordsError, SharedPasswordsErrorCode } from './types';
import { getEnvironmentMessage } from './ExpoGoDetection';

const EXPO_GO_ERROR =
  'Native password/passkey features are not available in Expo Go. ' +
  'To use this feature, please create a development build:\n\n' +
  '  npx expo run:ios\n' +
  '  npx expo run:android\n\n' +
  'Or create a production build with EAS Build.';

/**
 * Throws a user-friendly error for Expo Go
 */
function throwExpoGoError(feature: string): never {
  throw new SharedPasswordsError(
    SharedPasswordsErrorCode.NOT_SUPPORTED,
    `${feature} is not available in Expo Go. ${EXPO_GO_ERROR}`
  );
}

/**
 * Expo Go fallback implementation of SharedPasswords
 *
 * All methods throw NOT_SUPPORTED errors with helpful messages.
 * Use getPlatformSupport() to check availability before calling methods.
 */
export const ExpoGoFallback = {
  async requestPasswordAutoFill(): Promise<Credential> {
    throwExpoGoError('Password autofill');
  },

  async savePassword(_options: SavePasswordOptions): Promise<OperationResult> {
    throwExpoGoError('Password saving');
  },

  async hasStoredCredentials(_domain: string): Promise<boolean> {
    // Return false instead of throwing - this allows UI to gracefully hide password features
    return false;
  },

  async deleteCredential(_options: DeleteCredentialOptions): Promise<OperationResult> {
    throwExpoGoError('Credential deletion');
  },

  async createPasskey(_options: CreatePasskeyOptions): Promise<PasskeyCredential> {
    throwExpoGoError('Passkey creation');
  },

  async authenticateWithPasskey(_options: AuthenticatePasskeyOptions): Promise<PasskeyCredential> {
    throwExpoGoError('Passkey authentication');
  },

  getPlatformSupport(): PlatformSupport {
    return {
      passwordAutoFill: false,
      passkeys: false,
      savePassword: false,
      minOSVersion: Platform.OS === 'ios' ? 'iOS 12+' : 'Android 9+',
      currentOSVersion: `${Platform.OS} ${Platform.Version}`,
    };
  },

  /**
   * Check if running in Expo Go
   */
  isExpoGo(): boolean {
    return true;
  },

  /**
   * Get environment information
   */
  getEnvironmentInfo(): string {
    return getEnvironmentMessage();
  },
};

export default ExpoGoFallback;
