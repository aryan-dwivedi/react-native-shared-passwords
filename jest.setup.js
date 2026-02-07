// Jest setup file for react-native-shared-credentials

// Mock expo-constants (not installed by default)
jest.mock(
  'expo-constants',
  () => ({
    default: {
      executionEnvironment: 'bare',
      appOwnership: null,
    },
  }),
  { virtual: true }
);

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
