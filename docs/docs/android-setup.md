---
sidebar_position: 4
---

# Android Setup

For password autofill and passkeys to work on Android, you need to configure Digital Asset Links.

## Requirements

- Android 9.0 (API 28) or higher
- Google Play Services installed (for Credential Manager)

## 1. Create Digital Asset Links File

Host a file at `https://example.com/.well-known/assetlinks.json`:

```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls",
      "delegate_permission/common.get_login_creds"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "com.yourcompany.yourapp",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

## 2. Get Your SHA256 Fingerprint

### Debug Build

```bash
keytool -list -v \
  -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android
```

### Release Build

```bash
keytool -list -v \
  -keystore your-release-key.keystore \
  -alias your-alias
```

### From Google Play Console

1. Go to Google Play Console
2. Select your app
3. Go to Setup > App integrity
4. Find the SHA-256 certificate fingerprint

## 3. Add Asset Statements to Your App

In `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">Your App</string>
    <string name="asset_statements">
        [{"include": "https://example.com/.well-known/assetlinks.json"}]
    </string>
</resources>
```

In `android/app/src/main/AndroidManifest.xml`, add inside `<application>`:

```xml
<meta-data
    android:name="asset_statements"
    android:resource="@string/asset_statements" />
```

## 4. Verify Your Setup

Use Google's Digital Asset Links validator:

```
https://developers.google.com/digital-asset-links/tools/generator
```

Enter your domain and package name to verify the configuration.

## Testing

### On Emulator

1. Use an emulator with Google Play Services
2. Sign in with a Google account
3. The emulator will download and cache the assetlinks.json file

### On Device

1. Ensure the device has Google Play Services
2. The device needs internet access to verify the asset links

## Expo Configuration

The Expo plugin adds the necessary manifest configurations automatically. You still need to:

1. Host the assetlinks.json file on your domain
2. Add the asset_statements string resource

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-shared-passwords",
        {
          "domains": ["example.com"]
        }
      ]
    ]
  }
}
```

## Common Issues

### "No credentials found"

- Verify assetlinks.json is accessible via HTTPS
- Check the SHA256 fingerprint matches your signing key
- Ensure package name matches exactly

### Google Play Services errors

- Update Google Play Services on the device
- Some emulators don't have Play Services installed

### Credential Manager not available

- Check the device is running Android 9+
- Verify Google Play Services is up to date
- The Credential Manager library may need updating
