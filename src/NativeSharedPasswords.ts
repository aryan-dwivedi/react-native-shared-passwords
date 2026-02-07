import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Native module spec for Turbo Modules (Codegen)
 */
export interface Spec extends TurboModule {
  /**
   * Request password autofill - shows system UI to select credentials
   */
  requestPasswordAutoFill(): Promise<{
    username: string;
    password: string;
  }>;

  /**
   * Save a password to the system keychain/credential manager
   */
  savePassword(
    username: string,
    password: string,
    domain: string
  ): Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Check if credentials exist for a domain
   */
  hasStoredCredentials(domain: string): Promise<boolean>;

  /**
   * Delete a credential from the system
   */
  deleteCredential(
    username: string,
    domain: string
  ): Promise<{
    success: boolean;
    error?: string;
  }>;

  /**
   * Create a new passkey (registration)
   */
  createPasskey(options: {
    rpId: string;
    rpName: string;
    challenge: string;
    userId: string;
    userName: string;
    userDisplayName: string;
    timeout: number;
    authenticatorAttachment: string;
    residentKey: string;
    userVerification: string;
    attestation: string;
  }): Promise<{
    credentialId: string;
    rawId: string;
    type: string;
    authenticatorData: string;
    clientDataJSON: string;
    attestationObject: string;
  }>;

  /**
   * Authenticate with a passkey
   */
  authenticateWithPasskey(options: {
    rpId: string;
    challenge: string;
    timeout: number;
    userVerification: string;
  }): Promise<{
    credentialId: string;
    rawId: string;
    type: string;
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle: string;
  }>;

  /**
   * Get platform support information
   */
  getPlatformSupport(): Promise<{
    passwordAutoFill: boolean;
    passkeys: boolean;
    savePassword: boolean;
    minOSVersion: string;
    currentOSVersion: string;
  }>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SharedPasswords');
