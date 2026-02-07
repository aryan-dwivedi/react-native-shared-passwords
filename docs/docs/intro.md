---
sidebar_position: 1
---

# Introduction

**React Native Shared Passwords** enables cross-platform password and credential sharing between web and mobile apps using native platform APIs.

## Features

- **Password AutoFill** - Request stored credentials via native system UI
- **Save Passwords** - Store credentials to system keychain/credential manager
- **Passkey Support** - FIDO2/WebAuthn authentication (iOS 16+, Android 9+)
- **Check Credentials** - Query if credentials exist for a domain
- **Delete Credentials** - Remove stored credentials

## Platform Support

| Feature | iOS | Android |
|---------|-----|---------|
| Password AutoFill | iOS 13+ | Android 9+ (API 28) |
| Password Modal | iOS 16+ | Android 9+ |
| Passkeys | iOS 16+ | Android 9+ (with Play Services) |
| Save Password | iOS 8+ | Android 9+ |

## Architecture Support

- React Native Old Architecture (Bridge)
- React Native New Architecture (Turbo Modules + Codegen)
- Expo development builds via config plugin
- **Expo Go graceful fallbacks** - Detects Expo Go and provides helpful error messages

## Quick Example

```typescript
import SharedPasswords from 'react-native-shared-credentials';

// Request stored credentials
const credential = await SharedPasswords.requestPasswordAutoFill();
console.log('Username:', credential.username);
console.log('Password:', credential.password);

// Save new credentials
await SharedPasswords.savePassword({
  username: 'user@example.com',
  password: 'securePassword123',
  domain: 'example.com',
});

// Authenticate with passkey
const assertion = await SharedPasswords.authenticateWithPasskey({
  rpId: 'example.com',
  challenge: 'base64-challenge-from-server',
});
```

## Next Steps

- [Installation](./installation) - Install the package
- [Expo Setup](./expo-setup) - Expo configuration and Expo Go handling
- [iOS Setup](./ios-setup) - Configure associated domains
- [Android Setup](./android-setup) - Configure asset links
- [API Reference](./api-reference) - Full API documentation
