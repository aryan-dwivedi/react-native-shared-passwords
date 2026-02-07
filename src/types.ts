/**
 * Credential returned from password autofill
 */
export interface Credential {
  /** The username or email */
  username: string;
  /** The password */
  password: string;
}

/**
 * Passkey credential returned from registration or authentication
 */
export interface PasskeyCredential {
  /** Base64-encoded credential ID */
  credentialId: string;
  /** Base64-encoded raw ID */
  rawId: string;
  /** The type of credential (usually 'public-key') */
  type: string;
  /** Base64-encoded authenticator data */
  authenticatorData?: string;
  /** Base64-encoded client data JSON */
  clientDataJSON: string;
  /** Base64-encoded signature (for authentication) */
  signature?: string;
  /** Base64-encoded user handle (for authentication) */
  userHandle?: string;
  /** Base64-encoded attestation object (for registration) */
  attestationObject?: string;
}

/**
 * Options for saving a password
 */
export interface SavePasswordOptions {
  /** The username or email to save */
  username: string;
  /** The password to save */
  password: string;
  /** The domain to associate with the credentials (optional, uses app's associated domain) */
  domain?: string;
}

/**
 * Options for deleting a credential
 */
export interface DeleteCredentialOptions {
  /** The username of the credential to delete */
  username: string;
  /** The domain of the credential */
  domain: string;
}

/**
 * Options for creating a passkey (registration)
 */
export interface CreatePasskeyOptions {
  /** The Relying Party ID (usually your domain) */
  rpId: string;
  /** The Relying Party name */
  rpName?: string;
  /** Base64-encoded challenge from the server */
  challenge: string;
  /** User ID (opaque identifier for the user) */
  userId: string;
  /** User name (email or username) */
  userName: string;
  /** User display name */
  userDisplayName?: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Preferred authenticator attachment */
  authenticatorAttachment?: 'platform' | 'cross-platform';
  /** Resident key requirement */
  residentKey?: 'required' | 'preferred' | 'discouraged';
  /** User verification requirement */
  userVerification?: 'required' | 'preferred' | 'discouraged';
  /** Attestation preference */
  attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
  /** Existing credential IDs to exclude */
  excludeCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: Array<'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid'>;
  }>;
}

/**
 * Options for authenticating with a passkey
 */
export interface AuthenticatePasskeyOptions {
  /** The Relying Party ID (usually your domain) */
  rpId: string;
  /** Base64-encoded challenge from the server */
  challenge: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** User verification requirement */
  userVerification?: 'required' | 'preferred' | 'discouraged';
  /** Allowed credential IDs (if empty, allows any) */
  allowCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: Array<'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid'>;
  }>;
}

/**
 * Platform support information
 */
export interface PlatformSupport {
  /** Whether password autofill is supported */
  passwordAutoFill: boolean;
  /** Whether passkeys are supported */
  passkeys: boolean;
  /** Whether saving passwords is supported */
  savePassword: boolean;
  /** Minimum OS version for full support */
  minOSVersion: string;
  /** Current OS version */
  currentOSVersion: string;
}

/**
 * Result of a save or delete operation
 */
export interface OperationResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if unsuccessful */
  error?: string;
}

/**
 * Error codes for SharedPasswords operations
 */
export enum SharedPasswordsErrorCode {
  /** User cancelled the operation */
  CANCELLED = 'CANCELLED',
  /** The operation failed */
  FAILED = 'FAILED',
  /** The operation is not supported on this platform/version */
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  /** Invalid parameters were provided */
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  /** No credentials found */
  NO_CREDENTIALS = 'NO_CREDENTIALS',
  /** Domain not configured in associated domains */
  DOMAIN_NOT_CONFIGURED = 'DOMAIN_NOT_CONFIGURED',
  /** Unknown error */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error thrown by SharedPasswords operations
 */
export class SharedPasswordsError extends Error {
  code: SharedPasswordsErrorCode;

  constructor(code: SharedPasswordsErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'SharedPasswordsError';
  }
}
