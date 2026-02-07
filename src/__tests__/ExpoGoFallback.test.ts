import { Platform } from 'react-native';
import ExpoGoFallback from '../ExpoGoFallback';
import { SharedPasswordsErrorCode } from '../types';

// Mock ExpoGoDetection
jest.mock('../ExpoGoDetection', () => ({
  getEnvironmentMessage: jest.fn(() => 'Running in Expo Go'),
}));

describe('ExpoGoFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPasswordAutoFill', () => {
    it('should throw NOT_SUPPORTED error', async () => {
      await expect(ExpoGoFallback.requestPasswordAutoFill()).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.NOT_SUPPORTED,
      });
    });

    it('should include helpful message about Expo Go', async () => {
      try {
        await ExpoGoFallback.requestPasswordAutoFill();
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Expo Go');
        expect(error.message).toContain('Password autofill');
      }
    });
  });

  describe('savePassword', () => {
    it('should throw NOT_SUPPORTED error', async () => {
      const options = {
        username: 'test@example.com',
        password: 'password123',
      };

      await expect(ExpoGoFallback.savePassword(options)).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.NOT_SUPPORTED,
      });
    });

    it('should include helpful message about development build', async () => {
      try {
        await ExpoGoFallback.savePassword({
          username: 'test@example.com',
          password: 'password123',
        });
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Password saving');
        expect(error.message).toContain('development build');
      }
    });
  });

  describe('hasStoredCredentials', () => {
    it('should return false instead of throwing', async () => {
      const result = await ExpoGoFallback.hasStoredCredentials('example.com');
      expect(result).toBe(false);
    });

    it('should return false for any domain', async () => {
      expect(await ExpoGoFallback.hasStoredCredentials('google.com')).toBe(false);
      expect(await ExpoGoFallback.hasStoredCredentials('facebook.com')).toBe(false);
      expect(await ExpoGoFallback.hasStoredCredentials('')).toBe(false);
    });
  });

  describe('deleteCredential', () => {
    it('should throw NOT_SUPPORTED error', async () => {
      const options = {
        username: 'test@example.com',
        domain: 'example.com',
      };

      await expect(ExpoGoFallback.deleteCredential(options)).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.NOT_SUPPORTED,
      });
    });

    it('should include helpful message', async () => {
      try {
        await ExpoGoFallback.deleteCredential({
          username: 'test@example.com',
          domain: 'example.com',
        });
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Credential deletion');
      }
    });
  });

  describe('createPasskey', () => {
    it('should throw NOT_SUPPORTED error', async () => {
      const options = {
        rpId: 'example.com',
        challenge: 'challenge',
        userId: 'user-123',
        userName: 'test@example.com',
      };

      await expect(ExpoGoFallback.createPasskey(options)).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.NOT_SUPPORTED,
      });
    });

    it('should include helpful message about passkey creation', async () => {
      try {
        await ExpoGoFallback.createPasskey({
          rpId: 'example.com',
          challenge: 'challenge',
          userId: 'user-123',
          userName: 'test@example.com',
        });
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Passkey creation');
        expect(error.message).toContain('Expo Go');
      }
    });
  });

  describe('authenticateWithPasskey', () => {
    it('should throw NOT_SUPPORTED error', async () => {
      const options = {
        rpId: 'example.com',
        challenge: 'challenge',
      };

      await expect(ExpoGoFallback.authenticateWithPasskey(options)).rejects.toMatchObject({
        code: SharedPasswordsErrorCode.NOT_SUPPORTED,
      });
    });

    it('should include helpful message about passkey authentication', async () => {
      try {
        await ExpoGoFallback.authenticateWithPasskey({
          rpId: 'example.com',
          challenge: 'challenge',
        });
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Passkey authentication');
      }
    });
  });

  describe('getPlatformSupport', () => {
    it('should return all features as not supported', async () => {
      const support = await ExpoGoFallback.getPlatformSupport();

      expect(support.passwordAutoFill).toBe(false);
      expect(support.passkeys).toBe(false);
      expect(support.savePassword).toBe(false);
    });

    it('should include OS version information', async () => {
      const support = await ExpoGoFallback.getPlatformSupport();

      expect(support.minOSVersion).toBeDefined();
      expect(support.currentOSVersion).toBeDefined();
      expect(support.currentOSVersion).toContain(Platform.OS);
    });

    it('should return correct minOSVersion based on platform', async () => {
      const support = await ExpoGoFallback.getPlatformSupport();

      // Since we mock Platform.OS as 'ios' in jest.setup.js
      expect(support.minOSVersion).toMatch(/iOS|Android/);
    });
  });

  describe('isExpoGo', () => {
    it('should always return true', () => {
      expect(ExpoGoFallback.isExpoGo()).toBe(true);
    });
  });

  describe('getEnvironmentInfo', () => {
    it('should call getEnvironmentMessage from ExpoGoDetection', () => {
      const { getEnvironmentMessage } = require('../ExpoGoDetection');

      const info = ExpoGoFallback.getEnvironmentInfo();

      expect(getEnvironmentMessage).toHaveBeenCalled();
      expect(info).toBe('Running in Expo Go');
    });
  });
});

describe('ExpoGoFallback error messages', () => {
  it('should provide instructions to create development build', async () => {
    try {
      await ExpoGoFallback.requestPasswordAutoFill();
    } catch (error: any) {
      expect(error.message).toMatch(/npx expo run:ios|npx expo run:android/);
    }
  });

  it('should mention EAS Build as an option', async () => {
    try {
      await ExpoGoFallback.createPasskey({
        rpId: 'example.com',
        challenge: 'challenge',
        userId: 'user-123',
        userName: 'test@example.com',
      });
    } catch (error: any) {
      expect(error.message).toContain('EAS Build');
    }
  });
});
