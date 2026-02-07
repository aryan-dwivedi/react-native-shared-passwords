---
sidebar_position: 2
---

# Installation

## React Native CLI

```bash
npm install react-native-shared-passwords
# or
yarn add react-native-shared-passwords
```

### iOS

```bash
cd ios && pod install
```

### Android

No additional steps required. The package auto-links on Android.

## Expo

```bash
npx expo install react-native-shared-passwords
```

Add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-shared-passwords",
        {
          "domains": ["example.com"],
          "teamId": "YOUR_TEAM_ID"
        }
      ]
    ]
  }
}
```

Then rebuild your development build:

```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

:::warning Expo Go Not Supported
This package requires native code and will not work with Expo Go. You must use a [development build](https://docs.expo.dev/develop/development-builds/introduction/).
:::

## Verify Installation

```typescript
import SharedPasswords from 'react-native-shared-passwords';

const support = SharedPasswords.getPlatformSupport();
console.log('Password AutoFill supported:', support.passwordAutoFill);
console.log('Passkeys supported:', support.passkeys);
console.log('OS Version:', support.currentOSVersion);
```
