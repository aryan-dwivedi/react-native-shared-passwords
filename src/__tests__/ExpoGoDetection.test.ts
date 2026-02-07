describe('ExpoGoDetection', () => {
  // Reset modules before each test to get fresh imports
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('isExpoGo', () => {
    it('should return true when executionEnvironment is storeClient', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'storeClient',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      const { isExpoGo } = require('../ExpoGoDetection');
      expect(isExpoGo()).toBe(true);
    });

    it('should return true when appOwnership is expo', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'standalone',
            appOwnership: 'expo',
          },
        }),
        { virtual: true }
      );

      const { isExpoGo } = require('../ExpoGoDetection');
      expect(isExpoGo()).toBe(true);
    });

    it('should return false when executionEnvironment is standalone and appOwnership is not expo', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'standalone',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      const { isExpoGo } = require('../ExpoGoDetection');
      expect(isExpoGo()).toBe(false);
    });

    it('should return false when executionEnvironment is bare', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'bare',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      const { isExpoGo } = require('../ExpoGoDetection');
      expect(isExpoGo()).toBe(false);
    });

    it('should return false when expo-constants is not available', () => {
      jest.doMock(
        'expo-constants',
        () => {
          throw new Error('Module not found');
        },
        { virtual: true }
      );

      const { isExpoGo } = require('../ExpoGoDetection');
      expect(isExpoGo()).toBe(false);
    });
  });

  describe('hasNativeModule', () => {
    it('should return false when in Expo Go', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'storeClient',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      const { hasNativeModule } = require('../ExpoGoDetection');
      expect(hasNativeModule()).toBe(false);
    });

    it('should return true when Turbo module is available', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'bare',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      jest.doMock('../NativeSharedPasswords', () => ({
        default: { requestPasswordAutoFill: jest.fn() },
      }));

      const { hasNativeModule } = require('../ExpoGoDetection');
      expect(hasNativeModule()).toBe(true);
    });

    it('should return true when bridge module is available', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'bare',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      // Mock Turbo module to fail
      jest.doMock('../NativeSharedPasswords', () => {
        throw new Error('Turbo module not available');
      });

      // Mock NativeModules to have SharedPasswords
      jest.doMock('react-native', () => ({
        NativeModules: {
          SharedPasswords: { requestPasswordAutoFill: jest.fn() },
        },
        Platform: { OS: 'ios', Version: '17.0', select: jest.fn() },
      }));

      const { hasNativeModule } = require('../ExpoGoDetection');
      expect(hasNativeModule()).toBe(true);
    });

    it('should return false when no native module is available', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'bare',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      // Mock Turbo module to fail
      jest.doMock('../NativeSharedPasswords', () => {
        throw new Error('Turbo module not available');
      });

      // Mock NativeModules without SharedPasswords
      jest.doMock('react-native', () => ({
        NativeModules: {},
        Platform: { OS: 'ios', Version: '17.0', select: jest.fn() },
      }));

      const { hasNativeModule } = require('../ExpoGoDetection');
      expect(hasNativeModule()).toBe(false);
    });
  });

  describe('getExecutionEnvironment', () => {
    it('should return expo-go when in Expo Go', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'storeClient',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      const { getExecutionEnvironment } = require('../ExpoGoDetection');
      expect(getExecutionEnvironment()).toBe('expo-go');
    });

    it('should return development-build when executionEnvironment is standalone', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'standalone',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      const { getExecutionEnvironment } = require('../ExpoGoDetection');
      expect(getExecutionEnvironment()).toBe('development-build');
    });

    it('should return bare when expo-constants is not available', () => {
      jest.doMock(
        'expo-constants',
        () => {
          throw new Error('Module not found');
        },
        { virtual: true }
      );

      const { getExecutionEnvironment } = require('../ExpoGoDetection');
      expect(getExecutionEnvironment()).toBe('bare');
    });

    it('should return bare when executionEnvironment is bare', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'bare',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      const { getExecutionEnvironment } = require('../ExpoGoDetection');
      expect(getExecutionEnvironment()).toBe('bare');
    });
  });

  describe('getEnvironmentMessage', () => {
    it('should return Expo Go message when in Expo Go', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'storeClient',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      const { getEnvironmentMessage } = require('../ExpoGoDetection');
      const message = getEnvironmentMessage();

      expect(message).toContain('Expo Go');
      expect(message).toContain('development build');
    });

    it('should return development build message for Expo dev builds', () => {
      jest.doMock(
        'expo-constants',
        () => ({
          default: {
            executionEnvironment: 'standalone',
            appOwnership: null,
          },
        }),
        { virtual: true }
      );

      const { getEnvironmentMessage } = require('../ExpoGoDetection');
      const message = getEnvironmentMessage();

      expect(message).toContain('development build');
      expect(message).toContain('native modules');
    });

    it('should return bare React Native message when in bare project', () => {
      jest.doMock(
        'expo-constants',
        () => {
          throw new Error('Module not found');
        },
        { virtual: true }
      );

      const { getEnvironmentMessage } = require('../ExpoGoDetection');
      const message = getEnvironmentMessage();

      expect(message).toContain('bare React Native');
      expect(message).toContain('native modules');
    });
  });
});
