---
sidebar_position: 3
---

# iOS Setup

For password autofill and passkeys to work on iOS, you need to configure Associated Domains and host a verification file on your server.

## 1. Enable Associated Domains

### Using Xcode

1. Open your iOS project in Xcode
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability" and add "Associated Domains"
5. Add your domains:
   - `webcredentials:example.com` (for password autofill)
   - `applinks:example.com` (for universal links/passkeys)

### Using Expo Config Plugin

The plugin automatically adds associated domains:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-shared-passwords",
        {
          "domains": ["example.com", "login.example.com"]
        }
      ]
    ]
  }
}
```

## 2. Host Apple App Site Association (AASA) File

Create a file at `https://example.com/.well-known/apple-app-site-association`:

```json
{
  "webcredentials": {
    "apps": ["TEAMID.com.yourcompany.yourapp"]
  },
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.yourcompany.yourapp",
        "paths": ["*"]
      }
    ]
  }
}
```

Replace:
- `TEAMID` with your Apple Developer Team ID
- `com.yourcompany.yourapp` with your app's bundle identifier

### AASA File Requirements

- Must be served from the root domain (not a subdomain path)
- Must be served over HTTPS
- Content-Type should be `application/json`
- No redirects allowed
- File must be accessible without authentication

### Verify AASA File

Test your AASA file using Apple's validator:
```
https://app-site-association.cdn-apple.com/a/v1/example.com
```

Or use the Branch.io validator:
```
https://branch.io/resources/aasa-validator/
```

## 3. Keychain Sharing (Optional)

If you need to share credentials between multiple apps:

### Using Xcode

1. Add "Keychain Sharing" capability
2. Add a keychain group identifier

### Using Expo Config Plugin

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-shared-passwords",
        {
          "domains": ["example.com"],
          "keychainGroup": "com.yourcompany.shared",
          "teamId": "YOURTEAMID"
        }
      ]
    ]
  }
}
```

## 4. Entitlements File

Your entitlements file should look like:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.associated-domains</key>
    <array>
        <string>webcredentials:example.com</string>
        <string>applinks:example.com</string>
    </array>
</dict>
</plist>
```

## Testing on Simulator

:::note
Password autofill works on the iOS Simulator, but some features (like biometrics) require a physical device.
:::

To test on the simulator:

1. Make sure your AASA file is publicly accessible
2. The simulator will download and cache the AASA file
3. You may need to restart the app after making changes

## Troubleshooting

### "No credentials found"

- Verify your AASA file is accessible
- Check that the Team ID matches exactly
- Ensure the bundle ID in AASA matches your app

### Credentials not appearing

- Wait a few minutes after deploying AASA file (Apple caches it)
- Try deleting and reinstalling the app
- Check Console.app for swcd (Shared Web Credentials daemon) logs
