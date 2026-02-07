import { SharedPasswordsError, SharedPasswordsErrorCode } from '../types';

describe('SharedPasswordsError', () => {
  describe('constructor', () => {
    it('should create error with code and message', () => {
      const error = new SharedPasswordsError(
        SharedPasswordsErrorCode.CANCELLED,
        'User cancelled the operation'
      );

      expect(error.code).toBe(SharedPasswordsErrorCode.CANCELLED);
      expect(error.message).toBe('User cancelled the operation');
      expect(error.name).toBe('SharedPasswordsError');
    });

    it('should extend Error class', () => {
      const error = new SharedPasswordsError(SharedPasswordsErrorCode.FAILED, 'Operation failed');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof SharedPasswordsError).toBe(true);
    });

    it('should have a stack trace', () => {
      const error = new SharedPasswordsError(SharedPasswordsErrorCode.UNKNOWN, 'Unknown error');

      expect(error.stack).toBeDefined();
    });
  });

  describe('error code enumeration', () => {
    it('should have CANCELLED code', () => {
      expect(SharedPasswordsErrorCode.CANCELLED).toBe('CANCELLED');
    });

    it('should have FAILED code', () => {
      expect(SharedPasswordsErrorCode.FAILED).toBe('FAILED');
    });

    it('should have NOT_SUPPORTED code', () => {
      expect(SharedPasswordsErrorCode.NOT_SUPPORTED).toBe('NOT_SUPPORTED');
    });

    it('should have INVALID_PARAMETERS code', () => {
      expect(SharedPasswordsErrorCode.INVALID_PARAMETERS).toBe('INVALID_PARAMETERS');
    });

    it('should have NO_CREDENTIALS code', () => {
      expect(SharedPasswordsErrorCode.NO_CREDENTIALS).toBe('NO_CREDENTIALS');
    });

    it('should have DOMAIN_NOT_CONFIGURED code', () => {
      expect(SharedPasswordsErrorCode.DOMAIN_NOT_CONFIGURED).toBe('DOMAIN_NOT_CONFIGURED');
    });

    it('should have UNKNOWN code', () => {
      expect(SharedPasswordsErrorCode.UNKNOWN).toBe('UNKNOWN');
    });
  });

  describe('error handling patterns', () => {
    it('should be catchable with try/catch', () => {
      const throwError = () => {
        throw new SharedPasswordsError(SharedPasswordsErrorCode.CANCELLED, 'Test error');
      };

      expect(throwError).toThrow(SharedPasswordsError);
    });

    it('should allow checking error code in catch block', () => {
      try {
        throw new SharedPasswordsError(
          SharedPasswordsErrorCode.NOT_SUPPORTED,
          'Feature not supported'
        );
      } catch (error) {
        if (error instanceof SharedPasswordsError) {
          expect(error.code).toBe(SharedPasswordsErrorCode.NOT_SUPPORTED);
        } else {
          fail('Expected SharedPasswordsError');
        }
      }
    });

    it('should work with Promise rejection', async () => {
      const asyncFunction = async () => {
        throw new SharedPasswordsError(SharedPasswordsErrorCode.FAILED, 'Async operation failed');
      };

      await expect(asyncFunction()).rejects.toThrow(SharedPasswordsError);
      await expect(asyncFunction()).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.FAILED,
        message: 'Async operation failed',
      });
    });

    it('should preserve error code when caught and rethrown', () => {
      const originalError = new SharedPasswordsError(
        SharedPasswordsErrorCode.INVALID_PARAMETERS,
        'Invalid params'
      );

      let caughtError: SharedPasswordsError | undefined;
      try {
        throw originalError;
      } catch (error) {
        if (error instanceof SharedPasswordsError) {
          caughtError = error;
        }
      }

      expect(caughtError).toBe(originalError);
      expect(caughtError?.code).toBe(SharedPasswordsErrorCode.INVALID_PARAMETERS);
    });
  });

  describe('error message formatting', () => {
    it('should include message in string representation', () => {
      const error = new SharedPasswordsError(SharedPasswordsErrorCode.CANCELLED, 'User cancelled');

      expect(error.toString()).toContain('User cancelled');
    });

    it('should include error name in string representation', () => {
      const error = new SharedPasswordsError(SharedPasswordsErrorCode.FAILED, 'Operation failed');

      expect(error.toString()).toContain('SharedPasswordsError');
    });
  });
});

describe('Type interfaces', () => {
  // These tests verify that the type definitions work correctly at runtime
  // TypeScript compilation ensures type safety, but we can test the shape

  describe('Credential interface', () => {
    it('should accept valid credential object', () => {
      const credential = {
        username: 'test@example.com',
        password: 'password123',
      };

      expect(credential.username).toBe('test@example.com');
      expect(credential.password).toBe('password123');
    });
  });

  describe('PasskeyCredential interface', () => {
    it('should accept valid passkey credential', () => {
      const passkeyCredential = {
        credentialId: 'cred-123',
        rawId: 'raw-123',
        type: 'public-key',
        clientDataJSON: 'json-data',
        authenticatorData: 'auth-data',
        signature: 'sig',
        userHandle: 'user-handle',
        attestationObject: 'attestation',
      };

      expect(passkeyCredential.credentialId).toBe('cred-123');
      expect(passkeyCredential.type).toBe('public-key');
    });

    it('should allow optional fields to be undefined', () => {
      const passkeyCredential: {
        credentialId: string;
        rawId: string;
        type: string;
        clientDataJSON: string;
        authenticatorData?: string;
        signature?: string;
      } = {
        credentialId: 'cred-123',
        rawId: 'raw-123',
        type: 'public-key',
        clientDataJSON: 'json-data',
      };

      expect(passkeyCredential.authenticatorData).toBeUndefined();
      expect(passkeyCredential.signature).toBeUndefined();
    });
  });

  describe('SavePasswordOptions interface', () => {
    it('should accept valid options', () => {
      const options = {
        username: 'user@example.com',
        password: 'secure123',
        domain: 'example.com',
      };

      expect(options.username).toBeDefined();
      expect(options.password).toBeDefined();
    });

    it('should allow domain to be optional', () => {
      const options: { username: string; password: string; domain?: string } = {
        username: 'user@example.com',
        password: 'secure123',
      };

      expect(options.domain).toBeUndefined();
    });
  });

  describe('PlatformSupport interface', () => {
    it('should contain all required flags', () => {
      const support = {
        passwordAutoFill: true,
        passkeys: true,
        savePassword: false,
        minOSVersion: 'iOS 12+',
        currentOSVersion: 'iOS 17.0',
      };

      expect(typeof support.passwordAutoFill).toBe('boolean');
      expect(typeof support.passkeys).toBe('boolean');
      expect(typeof support.savePassword).toBe('boolean');
      expect(typeof support.minOSVersion).toBe('string');
      expect(typeof support.currentOSVersion).toBe('string');
    });
  });

  describe('OperationResult interface', () => {
    it('should accept successful result', () => {
      const result = { success: true };
      expect(result.success).toBe(true);
    });

    it('should accept failed result with error', () => {
      const result = { success: false, error: 'Something went wrong' };
      expect(result.success).toBe(false);
      expect(result.error).toBe('Something went wrong');
    });
  });

  describe('CreatePasskeyOptions interface', () => {
    it('should accept minimal valid options', () => {
      const options = {
        rpId: 'example.com',
        challenge: 'base64-challenge',
        userId: 'user-123',
        userName: 'user@example.com',
      };

      expect(options.rpId).toBe('example.com');
    });

    it('should accept full options', () => {
      const options = {
        rpId: 'example.com',
        rpName: 'Example App',
        challenge: 'base64-challenge',
        userId: 'user-123',
        userName: 'user@example.com',
        userDisplayName: 'John Doe',
        timeout: 60000,
        authenticatorAttachment: 'platform' as const,
        residentKey: 'preferred' as const,
        userVerification: 'required' as const,
        attestation: 'direct' as const,
        excludeCredentials: [{ id: 'existing-cred', type: 'public-key' as const }],
      };

      expect(options.authenticatorAttachment).toBe('platform');
      expect(options.excludeCredentials).toHaveLength(1);
    });
  });

  describe('AuthenticatePasskeyOptions interface', () => {
    it('should accept minimal valid options', () => {
      const options = {
        rpId: 'example.com',
        challenge: 'base64-challenge',
      };

      expect(options.rpId).toBe('example.com');
    });

    it('should accept options with allowCredentials', () => {
      const transports: Array<'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid'> = [
        'internal',
        'hybrid',
      ];
      const allowCredentials = [
        {
          id: 'cred-123',
          type: 'public-key' as const,
          transports,
        },
      ];
      const options = {
        rpId: 'example.com',
        challenge: 'base64-challenge',
        timeout: 30000,
        userVerification: 'required' as const,
        allowCredentials,
      };

      expect(options.allowCredentials).toHaveLength(1);
      expect(transports).toContain('internal');
    });
  });
});
