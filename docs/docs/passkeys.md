---
sidebar_position: 7
---

# Passkeys Guide

Passkeys are a modern, passwordless authentication method using FIDO2/WebAuthn standards. They're more secure than passwords and provide a seamless user experience.

## Platform Requirements

| Platform | Minimum Version |
|----------|----------------|
| iOS | 16.0+ |
| Android | 9.0+ (API 28) with Play Services |

## How Passkeys Work

1. **Registration**: Create a passkey linked to your user account
2. **Authentication**: Use the passkey to sign in (biometric/PIN verification)
3. **Server Verification**: Server validates the cryptographic signature

## Registration Flow

```typescript
import SharedPasswords from 'react-native-shared-passwords';

async function registerPasskey(serverChallenge: string, userId: string, userEmail: string) {
  try {
    // 1. Create the passkey
    const credential = await SharedPasswords.createPasskey({
      rpId: 'example.com',
      rpName: 'My App',
      challenge: serverChallenge, // Base64-encoded challenge from your server
      userId: userId,
      userName: userEmail,
      userDisplayName: userEmail,
      userVerification: 'required',
    });

    // 2. Send to server for verification
    const response = await fetch('https://example.com/webauthn/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentialId: credential.credentialId,
        rawId: credential.rawId,
        type: credential.type,
        response: {
          attestationObject: credential.attestationObject,
          clientDataJSON: credential.clientDataJSON,
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Passkey registration failed:', error);
    throw error;
  }
}
```

## Authentication Flow

```typescript
async function authenticateWithPasskey(serverChallenge: string) {
  try {
    // 1. Get the assertion
    const assertion = await SharedPasswords.authenticateWithPasskey({
      rpId: 'example.com',
      challenge: serverChallenge, // Base64-encoded challenge from your server
      userVerification: 'required',
    });

    // 2. Send to server for verification
    const response = await fetch('https://example.com/webauthn/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credentialId: assertion.credentialId,
        rawId: assertion.rawId,
        type: assertion.type,
        response: {
          authenticatorData: assertion.authenticatorData,
          clientDataJSON: assertion.clientDataJSON,
          signature: assertion.signature,
          userHandle: assertion.userHandle,
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Passkey authentication failed:', error);
    throw error;
  }
}
```

## Server-Side Implementation

### Generate Challenge

Your server needs to generate a cryptographically secure challenge:

```javascript
// Node.js example
const crypto = require('crypto');

function generateChallenge() {
  const challenge = crypto.randomBytes(32);
  return challenge.toString('base64');
}
```

### Verify Registration

Use a WebAuthn library to verify the attestation:

```javascript
// Using @simplewebauthn/server
const { verifyRegistrationResponse } = require('@simplewebauthn/server');

const verification = await verifyRegistrationResponse({
  response: clientResponse,
  expectedChallenge: storedChallenge,
  expectedOrigin: 'https://example.com',
  expectedRPID: 'example.com',
});
```

### Verify Authentication

```javascript
const { verifyAuthenticationResponse } = require('@simplewebauthn/server');

const verification = await verifyAuthenticationResponse({
  response: clientResponse,
  expectedChallenge: storedChallenge,
  expectedOrigin: 'https://example.com',
  expectedRPID: 'example.com',
  authenticator: storedCredential,
});
```

## Best Practices

### Check Platform Support

```typescript
const support = SharedPasswords.getPlatformSupport();
if (!support.passkeys) {
  // Fall back to password authentication
  showPasswordLogin();
}
```

### Handle Errors Gracefully

```typescript
import { SharedPasswordsError, SharedPasswordsErrorCode } from 'react-native-shared-passwords';

try {
  await SharedPasswords.authenticateWithPasskey({...});
} catch (error) {
  if (error instanceof SharedPasswordsError) {
    switch (error.code) {
      case SharedPasswordsErrorCode.CANCELLED:
        // User cancelled - don't show error
        break;
      case SharedPasswordsErrorCode.NO_CREDENTIALS:
        // No passkeys registered - offer password login
        showPasswordLogin();
        break;
      case SharedPasswordsErrorCode.NOT_SUPPORTED:
        // Device doesn't support passkeys
        showPasswordLogin();
        break;
      default:
        showErrorMessage(error.message);
    }
  }
}
```

### Exclude Existing Credentials

When registering, exclude already-registered credentials:

```typescript
await SharedPasswords.createPasskey({
  // ...other options
  excludeCredentials: existingCredentialIds.map(id => ({
    id: id,
    type: 'public-key',
  })),
});
```

## Security Considerations

1. **Always verify on the server** - Never trust client-side verification alone
2. **Use secure challenges** - Generate cryptographically random challenges
3. **Store credentials securely** - Keep credential public keys in your database
4. **Implement proper session management** - Create secure sessions after verification
5. **Consider attestation** - For high-security apps, verify device attestation

## Cross-Platform Sync

- **iOS**: Passkeys sync via iCloud Keychain across Apple devices
- **Android**: Passkeys sync via Google Password Manager across Android devices
- Cross-platform sync between iOS and Android is not currently supported by the platforms
