import { NativeModules, Platform } from 'react-native';
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

const LINKING_ERROR =
  `The package 'react-native-shared-passwords' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go (use a development build instead)';

// Try to get the Turbo Module, fall back to bridge module
let SharedPasswordsModule: any;

try {
  // Try Turbo Module first (new architecture)
  SharedPasswordsModule = require('./NativeSharedPasswords').default;
} catch {
  // Fall back to bridge module (old architecture)
  SharedPasswordsModule = NativeModules.SharedPasswords;
}

if (!SharedPasswordsModule) {
  SharedPasswordsModule = new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );
}

/**
 * Normalize error from native module to SharedPasswordsError
 */
function normalizeError(error: any): SharedPasswordsError {
  const message = error?.message || 'Unknown error occurred';
  const code = error?.code as SharedPasswordsErrorCode;

  if (Object.values(SharedPasswordsErrorCode).includes(code)) {
    return new SharedPasswordsError(code, message);
  }

  // Map common error patterns
  if (message.includes('cancel') || message.includes('Cancel')) {
    return new SharedPasswordsError(SharedPasswordsErrorCode.CANCELLED, message);
  }
  if (message.includes('not supported') || message.includes('Not supported')) {
    return new SharedPasswordsError(SharedPasswordsErrorCode.NOT_SUPPORTED, message);
  }

  return new SharedPasswordsError(SharedPasswordsErrorCode.UNKNOWN, message);
}

/**
 * SharedPasswords - Cross-platform password and passkey management
 */
const SharedPasswords = {
  /**
   * Request password autofill - displays the system UI for selecting stored credentials
   *
   * @returns Promise resolving to the selected credential
   * @throws SharedPasswordsError if cancelled or failed
   *
   * @example
   * ```typescript
   * try {
   *   const credential = await SharedPasswords.requestPasswordAutoFill();
   *   console.log('Username:', credential.username);
   *   console.log('Password:', credential.password);
   * } catch (error) {
   *   if (error.code === 'CANCELLED') {
   *     console.log('User cancelled');
   *   }
   * }
   * ```
   */
  async requestPasswordAutoFill(): Promise<Credential> {
    try {
      const result = await SharedPasswordsModule.requestPasswordAutoFill();
      return {
        username: result.username,
        password: result.password,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Save a password to the system keychain/credential manager
   *
   * @param options - The credentials to save
   * @returns Promise resolving to operation result
   *
   * @example
   * ```typescript
   * await SharedPasswords.savePassword({
   *   username: 'user@example.com',
   *   password: 'securePassword123',
   *   domain: 'example.com',
   * });
   * ```
   */
  async savePassword(options: SavePasswordOptions): Promise<OperationResult> {
    try {
      const domain = options.domain || '';
      const result = await SharedPasswordsModule.savePassword(
        options.username,
        options.password,
        domain
      );
      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Check if credentials exist for a domain
   *
   * @param domain - The domain to check
   * @returns Promise resolving to boolean
   *
   * @example
   * ```typescript
   * const hasCredentials = await SharedPasswords.hasStoredCredentials('example.com');
   * if (hasCredentials) {
   *   // Show "Sign in with saved password" button
   * }
   * ```
   */
  async hasStoredCredentials(domain: string): Promise<boolean> {
    try {
      return await SharedPasswordsModule.hasStoredCredentials(domain);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Delete a credential from the system
   *
   * @param options - The credential to delete
   * @returns Promise resolving to operation result
   *
   * @example
   * ```typescript
   * await SharedPasswords.deleteCredential({
   *   username: 'user@example.com',
   *   domain: 'example.com',
   * });
   * ```
   */
  async deleteCredential(options: DeleteCredentialOptions): Promise<OperationResult> {
    try {
      const result = await SharedPasswordsModule.deleteCredential(options.username, options.domain);
      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Create a new passkey (registration)
   *
   * @param options - Passkey creation options
   * @returns Promise resolving to the created passkey credential
   *
   * @example
   * ```typescript
   * const passkey = await SharedPasswords.createPasskey({
   *   rpId: 'example.com',
   *   challenge: 'base64-challenge-from-server',
   *   userId: 'user-123',
   *   userName: 'user@example.com',
   * });
   * // Send passkey.attestationObject to server for verification
   * ```
   */
  async createPasskey(options: CreatePasskeyOptions): Promise<PasskeyCredential> {
    try {
      const nativeOptions = {
        rpId: options.rpId,
        rpName: options.rpName || options.rpId,
        challenge: options.challenge,
        userId: options.userId,
        userName: options.userName,
        userDisplayName: options.userDisplayName || options.userName,
        timeout: options.timeout || 60000,
        authenticatorAttachment: options.authenticatorAttachment || 'platform',
        residentKey: options.residentKey || 'preferred',
        userVerification: options.userVerification || 'preferred',
        attestation: options.attestation || 'none',
      };

      const result = await SharedPasswordsModule.createPasskey(nativeOptions);
      return {
        credentialId: result.credentialId,
        rawId: result.rawId,
        type: result.type,
        authenticatorData: result.authenticatorData,
        clientDataJSON: result.clientDataJSON,
        attestationObject: result.attestationObject,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Authenticate with a passkey
   *
   * @param options - Passkey authentication options
   * @returns Promise resolving to the passkey assertion
   *
   * @example
   * ```typescript
   * const assertion = await SharedPasswords.authenticateWithPasskey({
   *   rpId: 'example.com',
   *   challenge: 'base64-challenge-from-server',
   * });
   * // Send assertion to server for verification
   * ```
   */
  async authenticateWithPasskey(options: AuthenticatePasskeyOptions): Promise<PasskeyCredential> {
    try {
      const nativeOptions = {
        rpId: options.rpId,
        challenge: options.challenge,
        timeout: options.timeout || 60000,
        userVerification: options.userVerification || 'preferred',
      };

      const result = await SharedPasswordsModule.authenticateWithPasskey(nativeOptions);
      return {
        credentialId: result.credentialId,
        rawId: result.rawId,
        type: result.type,
        authenticatorData: result.authenticatorData,
        clientDataJSON: result.clientDataJSON,
        signature: result.signature,
        userHandle: result.userHandle,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  },

  /**
   * Get platform support information
   *
   * @returns Object with support flags for each feature
   *
   * @example
   * ```typescript
   * const support = SharedPasswords.getPlatformSupport();
   * if (support.passkeys) {
   *   // Show passkey registration option
   * }
   * ```
   */
  getPlatformSupport(): PlatformSupport {
    try {
      return SharedPasswordsModule.getPlatformSupport();
    } catch {
      // Return defaults if module not available
      return {
        passwordAutoFill: false,
        passkeys: false,
        savePassword: false,
        minOSVersion: 'Unknown',
        currentOSVersion: 'Unknown',
      };
    }
  },
};

export default SharedPasswords;
