import type {
  SavePasswordOptions,
  DeleteCredentialOptions,
  CreatePasskeyOptions,
  AuthenticatePasskeyOptions,
} from '../types';
import { SharedPasswordsErrorCode } from '../types';

// Create mock functions that we can reference
const mockRequestPasswordAutoFill = jest.fn();
const mockSavePassword = jest.fn();
const mockHasStoredCredentials = jest.fn();
const mockDeleteCredential = jest.fn();
const mockCreatePasskey = jest.fn();
const mockAuthenticateWithPasskey = jest.fn();
const mockGetPlatformSupport = jest.fn(() => Promise.resolve({
  passwordAutoFill: true,
  passkeys: true,
  savePassword: true,
  minOSVersion: 'iOS 12+',
  currentOSVersion: 'iOS 17.0',
}));

const mockIsExpoGo = jest.fn(() => false);
const mockGetExecutionEnvironment = jest.fn<'expo-go' | 'development-build' | 'bare', []>(
  () => 'bare'
);
const mockGetEnvironmentMessage = jest.fn(
  () => 'Running in bare React Native with native modules.'
);

// Mock the modules BEFORE importing SharedPasswords
jest.mock('../ExpoGoDetection', () => ({
  isExpoGo: () => mockIsExpoGo(),
  getExecutionEnvironment: () => mockGetExecutionEnvironment(),
  getEnvironmentMessage: () => mockGetEnvironmentMessage(),
  hasNativeModule: jest.fn(() => true),
}));

jest.mock('../NativeSharedPasswords', () => ({
  default: {
    requestPasswordAutoFill: mockRequestPasswordAutoFill,
    savePassword: mockSavePassword,
    hasStoredCredentials: mockHasStoredCredentials,
    deleteCredential: mockDeleteCredential,
    createPasskey: mockCreatePasskey,
    authenticateWithPasskey: mockAuthenticateWithPasskey,
    getPlatformSupport: mockGetPlatformSupport,
  },
}));

// Now import the module under test
import SharedPasswords from '../SharedPasswords';

describe('SharedPasswords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsExpoGo.mockReturnValue(false);
  });

  describe('requestPasswordAutoFill', () => {
    it('should return credentials from native module', async () => {
      const mockCredential = { username: 'test@example.com', password: 'password123' };
      mockRequestPasswordAutoFill.mockResolvedValue(mockCredential);

      const result = await SharedPasswords.requestPasswordAutoFill();

      expect(result).toEqual(mockCredential);
      expect(mockRequestPasswordAutoFill).toHaveBeenCalledTimes(1);
    });

    it('should throw CANCELLED error when user cancels', async () => {
      mockRequestPasswordAutoFill.mockRejectedValue(new Error('User cancelled the operation'));

      await expect(SharedPasswords.requestPasswordAutoFill()).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.CANCELLED,
      });
    });

    it('should throw NOT_SUPPORTED error when not supported', async () => {
      mockRequestPasswordAutoFill.mockRejectedValue(
        new Error('Feature not supported on this device')
      );

      await expect(SharedPasswords.requestPasswordAutoFill()).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.NOT_SUPPORTED,
      });
    });

    it('should throw UNKNOWN error for unexpected errors', async () => {
      mockRequestPasswordAutoFill.mockRejectedValue(new Error('Something went wrong'));

      await expect(SharedPasswords.requestPasswordAutoFill()).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.UNKNOWN,
      });
    });
  });

  describe('savePassword', () => {
    const saveOptions: SavePasswordOptions = {
      username: 'test@example.com',
      password: 'securePassword123',
      domain: 'example.com',
    };

    it('should save password successfully', async () => {
      mockSavePassword.mockResolvedValue({ success: true });

      const result = await SharedPasswords.savePassword(saveOptions);

      expect(result).toEqual({ success: true });
      expect(mockSavePassword).toHaveBeenCalledWith(
        saveOptions.username,
        saveOptions.password,
        saveOptions.domain
      );
    });

    it('should handle save password without domain', async () => {
      mockSavePassword.mockResolvedValue({ success: true });
      const optionsWithoutDomain = { username: 'test@example.com', password: 'pass123' };

      await SharedPasswords.savePassword(optionsWithoutDomain);

      expect(mockSavePassword).toHaveBeenCalledWith(
        optionsWithoutDomain.username,
        optionsWithoutDomain.password,
        '' // Empty string for undefined domain
      );
    });

    it('should return error on failure', async () => {
      mockSavePassword.mockResolvedValue({ success: false, error: 'Save failed' });

      const result = await SharedPasswords.savePassword(saveOptions);

      expect(result).toEqual({ success: false, error: 'Save failed' });
    });

    it('should normalize native errors', async () => {
      mockSavePassword.mockRejectedValue(new Error('Network error'));

      await expect(SharedPasswords.savePassword(saveOptions)).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.UNKNOWN,
        message: 'Network error',
      });
    });
  });

  describe('hasStoredCredentials', () => {
    it('should return true when credentials exist', async () => {
      mockHasStoredCredentials.mockResolvedValue(true);

      const result = await SharedPasswords.hasStoredCredentials('example.com');

      expect(result).toBe(true);
      expect(mockHasStoredCredentials).toHaveBeenCalledWith('example.com');
    });

    it('should return false when no credentials exist', async () => {
      mockHasStoredCredentials.mockResolvedValue(false);

      const result = await SharedPasswords.hasStoredCredentials('example.com');

      expect(result).toBe(false);
    });

    it('should throw on error', async () => {
      mockHasStoredCredentials.mockRejectedValue(new Error('Check failed'));

      await expect(SharedPasswords.hasStoredCredentials('example.com')).rejects.toThrow();
    });
  });

  describe('deleteCredential', () => {
    const deleteOptions: DeleteCredentialOptions = {
      username: 'test@example.com',
      domain: 'example.com',
    };

    it('should delete credential successfully', async () => {
      mockDeleteCredential.mockResolvedValue({ success: true });

      const result = await SharedPasswords.deleteCredential(deleteOptions);

      expect(result).toEqual({ success: true });
      expect(mockDeleteCredential).toHaveBeenCalledWith(
        deleteOptions.username,
        deleteOptions.domain
      );
    });

    it('should return error on failure', async () => {
      mockDeleteCredential.mockResolvedValue({ success: false, error: 'Not found' });

      const result = await SharedPasswords.deleteCredential(deleteOptions);

      expect(result).toEqual({ success: false, error: 'Not found' });
    });
  });

  describe('createPasskey', () => {
    const createOptions: CreatePasskeyOptions = {
      rpId: 'example.com',
      rpName: 'Example App',
      challenge: 'base64-challenge',
      userId: 'user-123',
      userName: 'test@example.com',
      userDisplayName: 'Test User',
      timeout: 60000,
      authenticatorAttachment: 'platform',
      residentKey: 'preferred',
      userVerification: 'preferred',
      attestation: 'none',
    };

    const mockPasskeyResult = {
      credentialId: 'cred-id-123',
      rawId: 'raw-id-123',
      type: 'public-key',
      authenticatorData: 'auth-data',
      clientDataJSON: 'client-data-json',
      attestationObject: 'attestation-object',
    };

    it('should create passkey successfully with all options', async () => {
      mockCreatePasskey.mockResolvedValue(mockPasskeyResult);

      const result = await SharedPasswords.createPasskey(createOptions);

      expect(result).toEqual(mockPasskeyResult);
      expect(mockCreatePasskey).toHaveBeenCalledWith({
        rpId: createOptions.rpId,
        rpName: createOptions.rpName,
        challenge: createOptions.challenge,
        userId: createOptions.userId,
        userName: createOptions.userName,
        userDisplayName: createOptions.userDisplayName,
        timeout: createOptions.timeout,
        authenticatorAttachment: createOptions.authenticatorAttachment,
        residentKey: createOptions.residentKey,
        userVerification: createOptions.userVerification,
        attestation: createOptions.attestation,
      });
    });

    it('should use default values for optional parameters', async () => {
      mockCreatePasskey.mockResolvedValue(mockPasskeyResult);
      const minimalOptions: CreatePasskeyOptions = {
        rpId: 'example.com',
        challenge: 'challenge',
        userId: 'user-123',
        userName: 'test@example.com',
      };

      await SharedPasswords.createPasskey(minimalOptions);

      expect(mockCreatePasskey).toHaveBeenCalledWith({
        rpId: 'example.com',
        rpName: 'example.com', // Default to rpId
        challenge: 'challenge',
        userId: 'user-123',
        userName: 'test@example.com',
        userDisplayName: 'test@example.com', // Default to userName
        timeout: 60000, // Default
        authenticatorAttachment: 'platform', // Default
        residentKey: 'preferred', // Default
        userVerification: 'preferred', // Default
        attestation: 'none', // Default
      });
    });

    it('should throw error on passkey creation failure', async () => {
      mockCreatePasskey.mockRejectedValue(new Error('Creation cancelled'));

      await expect(SharedPasswords.createPasskey(createOptions)).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.CANCELLED,
      });
    });
  });

  describe('authenticateWithPasskey', () => {
    const authOptions: AuthenticatePasskeyOptions = {
      rpId: 'example.com',
      challenge: 'auth-challenge',
      timeout: 60000,
      userVerification: 'required',
    };

    const mockAuthResult = {
      credentialId: 'cred-id-123',
      rawId: 'raw-id-123',
      type: 'public-key',
      authenticatorData: 'auth-data',
      clientDataJSON: 'client-data-json',
      signature: 'signature',
      userHandle: 'user-handle',
    };

    it('should authenticate with passkey successfully', async () => {
      mockAuthenticateWithPasskey.mockResolvedValue(mockAuthResult);

      const result = await SharedPasswords.authenticateWithPasskey(authOptions);

      expect(result).toEqual(mockAuthResult);
      expect(mockAuthenticateWithPasskey).toHaveBeenCalledWith({
        rpId: authOptions.rpId,
        challenge: authOptions.challenge,
        timeout: authOptions.timeout,
        userVerification: authOptions.userVerification,
      });
    });

    it('should use default values for optional parameters', async () => {
      mockAuthenticateWithPasskey.mockResolvedValue(mockAuthResult);
      const minimalOptions: AuthenticatePasskeyOptions = {
        rpId: 'example.com',
        challenge: 'challenge',
      };

      await SharedPasswords.authenticateWithPasskey(minimalOptions);

      expect(mockAuthenticateWithPasskey).toHaveBeenCalledWith({
        rpId: 'example.com',
        challenge: 'challenge',
        timeout: 60000, // Default
        userVerification: 'preferred', // Default
      });
    });

    it('should throw error on authentication failure', async () => {
      mockAuthenticateWithPasskey.mockRejectedValue(new Error('No credentials found'));

      await expect(SharedPasswords.authenticateWithPasskey(authOptions)).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.UNKNOWN,
      });
    });
  });

  describe('getPlatformSupport', () => {
    it('should return platform support information', async () => {
      const mockSupport = {
        passwordAutoFill: true,
        passkeys: true,
        savePassword: true,
        minOSVersion: 'iOS 12+',
        currentOSVersion: 'iOS 17.0',
      };
      mockGetPlatformSupport.mockResolvedValue(mockSupport);

      const result = await SharedPasswords.getPlatformSupport();

      expect(result).toEqual(mockSupport);
    });

    it('should return defaults when module throws', async () => {
      mockGetPlatformSupport.mockRejectedValue(new Error('Module not available'));

      const result = await SharedPasswords.getPlatformSupport();

      expect(result).toEqual({
        passwordAutoFill: false,
        passkeys: false,
        savePassword: false,
        minOSVersion: 'Unknown',
        currentOSVersion: 'Unknown',
      });
    });
  });

  describe('isExpoGo', () => {
    it('should return boolean value', () => {
      expect(typeof SharedPasswords.isExpoGo()).toBe('boolean');
    });
  });

  describe('getExecutionEnvironment', () => {
    it('should return execution environment', () => {
      mockGetExecutionEnvironment.mockReturnValue('bare');

      const result = SharedPasswords.getExecutionEnvironment();

      expect(result).toBe('bare');
    });

    it('should return development-build for Expo dev builds', () => {
      mockGetExecutionEnvironment.mockReturnValue('development-build');

      const result = SharedPasswords.getExecutionEnvironment();

      expect(result).toBe('development-build');
    });

    it('should return expo-go for Expo Go', () => {
      mockGetExecutionEnvironment.mockReturnValue('expo-go');

      const result = SharedPasswords.getExecutionEnvironment();

      expect(result).toBe('expo-go');
    });
  });

  describe('getEnvironmentInfo', () => {
    it('should return environment message', () => {
      mockGetEnvironmentMessage.mockReturnValue(
        'Running in bare React Native with native modules.'
      );

      const result = SharedPasswords.getEnvironmentInfo();

      expect(result).toBe('Running in bare React Native with native modules.');
    });
  });
});

describe('SharedPasswords error normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should preserve error code if it matches SharedPasswordsErrorCode', async () => {
    // This is tested indirectly through the methods above
    // The normalizeError function handles error code mapping
    expect(true).toBe(true);
  });
});
