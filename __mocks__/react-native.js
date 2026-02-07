// React Native mock for Jest tests

const Platform = {
  OS: 'ios',
  Version: '17.0',
  select: jest.fn((obj) => obj.ios || obj.default),
};

const NativeModules = {
  SharedPasswords: {
    requestPasswordAutoFill: jest.fn(),
    savePassword: jest.fn(),
    hasStoredCredentials: jest.fn(),
    deleteCredential: jest.fn(),
    createPasskey: jest.fn(),
    authenticateWithPasskey: jest.fn(),
    getPlatformSupport: jest.fn(() => ({
      passwordAutoFill: true,
      passkeys: true,
      savePassword: true,
      minOSVersion: 'iOS 12+',
      currentOSVersion: 'iOS 17.0',
    })),
  },
};

module.exports = {
  Platform,
  NativeModules,
};
