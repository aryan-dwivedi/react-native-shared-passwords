# react-native-shared-credentials

Cross-platform password and credential sharing between web and mobile apps using native platform APIs.

[![npm version](https://img.shields.io/npm/v/react-native-shared-credentials.svg)](https://www.npmjs.com/package/react-native-shared-credentials)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/aryan-dwivedi/react-native-shared-credentials/blob/main/LICENSE)

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
- Expo support via config plugin

## Installation

```bash
npm install react-native-shared-credentials
# or
yarn add react-native-shared-credentials
```

### iOS

```bash
cd ios && pod install
```

### Expo

```bash
npx expo install react-native-shared-credentials
```

Add to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-shared-credentials",
        {
          "domains": ["example.com"],
          "teamId": "YOUR_TEAM_ID"
        }
      ]
    ]
  }
}
```

## Quick Start

```typescript
import SharedPasswords from 'react-native-shared-credentials';

// Request stored credentials (shows system UI)
const credential = await SharedPasswords.requestPasswordAutoFill();
console.log('Username:', credential.username);
console.log('Password:', credential.password);

// Save credentials
await SharedPasswords.savePassword({
  username: 'user@example.com',
  password: 'securePassword123',
  domain: 'example.com',
});

// Check if credentials exist
const hasCredentials = await SharedPasswords.hasStoredCredentials('example.com');

// Delete credentials
await SharedPasswords.deleteCredential({
  username: 'user@example.com',
  domain: 'example.com',
});
```

## Passkeys

```typescript
// Create a passkey (registration)
const passkey = await SharedPasswords.createPasskey({
  rpId: 'example.com',
  challenge: 'base64-challenge-from-server',
  userId: 'user-id-123',
  userName: 'user@example.com',
});

// Authenticate with passkey
const assertion = await SharedPasswords.authenticateWithPasskey({
  rpId: 'example.com',
  challenge: 'base64-challenge-from-server',
});

// Check platform support
const support = SharedPasswords.getPlatformSupport();
if (support.passkeys) {
  // Show passkey option
}
```

## Platform Setup

### iOS

1. Add Associated Domains capability in Xcode
2. Add `webcredentials:yourdomain.com` to associated domains
3. Host an Apple App Site Association file at `/.well-known/apple-app-site-association`

```json
{
  "webcredentials": {
    "apps": ["TEAMID.com.yourcompany.yourapp"]
  }
}
```

### Android

1. Host a Digital Asset Links file at `/.well-known/assetlinks.json`
2. Add asset_statements to your strings.xml

```json
[{
  "relation": ["delegate_permission/common.get_login_creds"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.yourcompany.yourapp",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

## Error Handling

```typescript
import { SharedPasswordsError, SharedPasswordsErrorCode } from 'react-native-shared-credentials';

try {
  await SharedPasswords.requestPasswordAutoFill();
} catch (error) {
  if (error instanceof SharedPasswordsError) {
    switch (error.code) {
      case SharedPasswordsErrorCode.CANCELLED:
        // User cancelled
        break;
      case SharedPasswordsErrorCode.NO_CREDENTIALS:
        // No saved credentials
        break;
      case SharedPasswordsErrorCode.NOT_SUPPORTED:
        // Not supported on this device
        break;
    }
  }
}
```

## Documentation

Full documentation available at [docs site](https://aryan-dwivedi.github.io/react-native-shared-credentials/) or in the `/docs` directory.

## Example

See the `/example` directory for a complete working example.

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

## License

MIT
