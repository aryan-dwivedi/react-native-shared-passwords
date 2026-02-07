---
sidebar_position: 5
---

# Expo Setup

This package includes an Expo config plugin for easy setup and graceful Expo Go support.

## Expo Go Support

This package now provides graceful handling when running in Expo Go:

```tsx
import SharedPasswords from 'react-native-shared-credentials';

// Check if running in Expo Go
if (SharedPasswords.isExpoGo()) {
  console.log('Running in Expo Go - native features unavailable');
  console.log(SharedPasswords.getEnvironmentInfo());
}

// Check platform support (returns false in Expo Go)
const support = SharedPasswords.getPlatformSupport();
if (support.passwordAutoFill) {
  // Show password autofill button
}

// Methods will throw NOT_SUPPORTED error in Expo Go
try {
  const credential = await SharedPasswords.requestPasswordAutoFill();
} catch (error) {
  if (error.code === 'NOT_SUPPORTED') {
    // Handle gracefully - show alternative login UI
  }
}
```

### Helper Functions

```tsx
import { 
  isExpoGo, 
  getExecutionEnvironment,
  getEnvironmentMessage 
} from 'react-native-shared-credentials';

// Check if running in Expo Go
const inExpoGo = isExpoGo(); // true in Expo Go

// Get environment type
const env = getExecutionEnvironment(); // 'expo-go' | 'development-build' | 'bare'

// Get user-friendly message
const message = getEnvironmentMessage();
```

## Installation

```bash
npx expo install react-native-shared-credentials
```

## Configuration

Add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-shared-credentials",
        {
          "domains": ["example.com"],
          "teamId": "YOUR_APPLE_TEAM_ID",
          "keychainGroup": "com.yourcompany.shared"
        }
      ]
    ]
  }
}
```

### Plugin Options

| Option | Type | Description |
|--------|------|-------------|
| `domains` | `string[]` | Domains for associated domains (iOS) and asset links (Android) |
| `teamId` | `string` | Apple Developer Team ID (iOS only) |
| `keychainGroup` | `string` | Keychain sharing group identifier (iOS only, optional) |

## Build

:::info Expo Go Limitations
While this package provides graceful fallbacks for Expo Go, **native features require a development build**. In Expo Go:
- `getPlatformSupport()` returns all features as `false`
- All native methods throw `NOT_SUPPORTED` errors with helpful messages
- Your app can detect this and show alternative UI
:::

### Development Build

```bash
# Regenerate native projects
npx expo prebuild

# Run iOS
npx expo run:ios

# Run Android
npx expo run:android
```

### EAS Build

```bash
# Development build
eas build --profile development --platform all

# Production build
eas build --profile production --platform all
```

## What the Plugin Does

### iOS

1. Adds Associated Domains entitlement:
   - `webcredentials:yourdomain.com`
   - `applinks:yourdomain.com`

2. Adds AuthenticationServices framework

3. Optionally configures Keychain Sharing

### Android

1. Adds asset_statements meta-data to AndroidManifest.xml

## Manual Steps Still Required

Even with the plugin, you still need to:

### iOS
- Host the Apple App Site Association file at `/.well-known/apple-app-site-association`

### Android
- Host the Digital Asset Links file at `/.well-known/assetlinks.json`
- Add the `asset_statements` string resource to `strings.xml`

See [iOS Setup](./ios-setup) and [Android Setup](./android-setup) for details.

## Example app.config.js

```javascript
export default {
  expo: {
    name: "My App",
    slug: "my-app",
    ios: {
      bundleIdentifier: "com.yourcompany.myapp",
    },
    android: {
      package: "com.yourcompany.myapp",
    },
    plugins: [
      [
        "react-native-shared-credentials",
        {
          domains: ["example.com", "auth.example.com"],
          teamId: "ABCD1234EF",
        },
      ],
    ],
  },
};
```

## Troubleshooting

### "Plugin not found"

Make sure you've installed the package:
```bash
npx expo install react-native-shared-credentials
```

### Changes not applying

Run prebuild with the clean flag:
```bash
npx expo prebuild --clean
```

### Native module not found

Rebuild your development build after adding the plugin:
```bash
npx expo run:ios
# or
npx expo run:android
```
