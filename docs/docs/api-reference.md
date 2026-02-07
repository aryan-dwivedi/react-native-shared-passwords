---
sidebar_position: 6
---

# API Reference

## Import

```typescript
import SharedPasswords from 'react-native-shared-credentials';

// Or named import
import { SharedPasswords } from 'react-native-shared-credentials';
```

## Methods

### requestPasswordAutoFill()

Shows the system credential picker UI, allowing users to select from their saved passwords.

```typescript
const credential = await SharedPasswords.requestPasswordAutoFill();
```

**Returns:** `Promise<Credential>`

```typescript
interface Credential {
  username: string;
  password: string;
}
```

**Throws:** `SharedPasswordsError`
- `CANCELLED` - User dismissed the picker
- `NO_CREDENTIALS` - No credentials available for this app
- `NOT_SUPPORTED` - Feature not supported on this OS version

---

### savePassword(options)

Saves credentials to the system keychain/credential manager.

```typescript
await SharedPasswords.savePassword({
  username: 'user@example.com',
  password: 'securePassword123',
  domain: 'example.com', // optional
});
```

**Parameters:**

```typescript
interface SavePasswordOptions {
  username: string;
  password: string;
  domain?: string; // Uses app's associated domain if not provided
}
```

**Returns:** `Promise<OperationResult>`

```typescript
interface OperationResult {
  success: boolean;
  error?: string;
}
```

---

### hasStoredCredentials(domain)

Checks if credentials exist for a domain.

```typescript
const hasCredentials = await SharedPasswords.hasStoredCredentials('example.com');
```

**Parameters:**
- `domain: string` - The domain to check

**Returns:** `Promise<boolean>`

---

### deleteCredential(options)

Deletes a stored credential.

```typescript
await SharedPasswords.deleteCredential({
  username: 'user@example.com',
  domain: 'example.com',
});
```

**Parameters:**

```typescript
interface DeleteCredentialOptions {
  username: string;
  domain: string;
}
```

**Returns:** `Promise<OperationResult>`

---

### createPasskey(options)

Creates a new passkey for registration.

```typescript
const passkey = await SharedPasswords.createPasskey({
  rpId: 'example.com',
  rpName: 'Example App',
  challenge: 'base64-encoded-challenge',
  userId: 'user-123',
  userName: 'user@example.com',
  userDisplayName: 'John Doe',
});
```

**Parameters:**

```typescript
interface CreatePasskeyOptions {
  rpId: string;                    // Relying party ID (your domain)
  rpName?: string;                 // Relying party name
  challenge: string;               // Base64-encoded challenge from server
  userId: string;                  // User identifier
  userName: string;                // Username/email
  userDisplayName?: string;        // Display name
  timeout?: number;                // Timeout in ms (default: 60000)
  authenticatorAttachment?: 'platform' | 'cross-platform';
  residentKey?: 'required' | 'preferred' | 'discouraged';
  userVerification?: 'required' | 'preferred' | 'discouraged';
  attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
  excludeCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: Array<'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid'>;
  }>;
}
```

**Returns:** `Promise<PasskeyCredential>`

```typescript
interface PasskeyCredential {
  credentialId: string;      // Base64-encoded credential ID
  rawId: string;             // Base64-encoded raw ID
  type: string;              // Usually 'public-key'
  authenticatorData?: string;
  clientDataJSON: string;
  attestationObject?: string; // Present for registration
  signature?: string;         // Present for authentication
  userHandle?: string;        // Present for authentication
}
```

---

### authenticateWithPasskey(options)

Authenticates with an existing passkey.

```typescript
const assertion = await SharedPasswords.authenticateWithPasskey({
  rpId: 'example.com',
  challenge: 'base64-encoded-challenge',
});
```

**Parameters:**

```typescript
interface AuthenticatePasskeyOptions {
  rpId: string;              // Relying party ID
  challenge: string;         // Base64-encoded challenge from server
  timeout?: number;          // Timeout in ms (default: 60000)
  userVerification?: 'required' | 'preferred' | 'discouraged';
  allowCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: Array<'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid'>;
  }>;
}
```

**Returns:** `Promise<PasskeyCredential>`

---

### getPlatformSupport()

Returns information about platform capabilities.

```typescript
const support = SharedPasswords.getPlatformSupport();
```

**Returns:** `PlatformSupport`

```typescript
interface PlatformSupport {
  passwordAutoFill: boolean;
  passkeys: boolean;
  savePassword: boolean;
  minOSVersion: string;
  currentOSVersion: string;
}
```

---

## Error Handling

All async methods can throw `SharedPasswordsError`:

```typescript
import { SharedPasswordsError, SharedPasswordsErrorCode } from 'react-native-shared-credentials';

try {
  const credential = await SharedPasswords.requestPasswordAutoFill();
} catch (error) {
  if (error instanceof SharedPasswordsError) {
    switch (error.code) {
      case SharedPasswordsErrorCode.CANCELLED:
        console.log('User cancelled');
        break;
      case SharedPasswordsErrorCode.NO_CREDENTIALS:
        console.log('No saved credentials');
        break;
      case SharedPasswordsErrorCode.NOT_SUPPORTED:
        console.log('Not supported on this device');
        break;
      default:
        console.log('Error:', error.message);
    }
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `CANCELLED` | User cancelled the operation |
| `FAILED` | Operation failed |
| `NOT_SUPPORTED` | Feature not supported on this platform/version |
| `INVALID_PARAMETERS` | Invalid parameters provided |
| `NO_CREDENTIALS` | No credentials found |
| `DOMAIN_NOT_CONFIGURED` | Domain not in associated domains |
| `UNKNOWN` | Unknown error |

---

## Expo Go Utilities

Helper functions for detecting and handling Expo Go environments.

### isExpoGo()

Checks if the app is running in Expo Go.

```typescript
import { isExpoGo } from 'react-native-shared-credentials';

if (isExpoGo()) {
  console.log('Running in Expo Go - native features unavailable');
}
```

**Returns:** `boolean`

---

### hasNativeModule()

Checks if the native module is available.

```typescript
import { hasNativeModule } from 'react-native-shared-credentials';

if (hasNativeModule()) {
  // Native features available
}
```

**Returns:** `boolean`

---

### getExecutionEnvironment()

Returns the current execution environment.

```typescript
import { getExecutionEnvironment } from 'react-native-shared-credentials';

const env = getExecutionEnvironment();
// Returns: 'expo-go' | 'development-build' | 'bare'
```

**Returns:** `'expo-go' | 'development-build' | 'bare'`

---

### getEnvironmentMessage()

Returns a user-friendly message about the current environment and available features.

```typescript
import { getEnvironmentMessage } from 'react-native-shared-credentials';

const message = getEnvironmentMessage();
console.log(message);
// Example: "Running in Expo Go. Native password features require a development build."
```

**Returns:** `string`
