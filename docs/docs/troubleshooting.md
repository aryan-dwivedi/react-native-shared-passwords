---
sidebar_position: 8
---

# Troubleshooting

## Common Issues

### "Module not found" or "Linking error"

**Symptoms:**
- Error: `The package 'react-native-shared-passwords' doesn't seem to be linked`
- Native module is undefined

**Solutions:**

1. **iOS**: Run pod install
   ```bash
   cd ios && pod install
   ```

2. **Android**: Clean and rebuild
   ```bash
   cd android && ./gradlew clean
   ```

3. **Expo**: Rebuild development build
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```

---

### Expo Go: "NOT_SUPPORTED" errors

**Symptoms:**
- Error code: `NOT_SUPPORTED`
- Error message mentions "Expo Go"
- All password/passkey features fail

**Cause:** Expo Go doesn't support custom native modules. This is a fundamental limitation of Expo Go.

**Solutions:**

1. **Use a development build instead of Expo Go:**
   ```bash
   npx expo run:ios
   # or
   npx expo run:android
   ```

2. **Or create an EAS development build:**
   ```bash
   eas build --profile development --platform all
   ```

3. **Detect Expo Go and show alternative UI:**
   ```typescript
   import SharedPasswords, { isExpoGo } from 'react-native-shared-passwords';

   if (isExpoGo()) {
     // Show manual login form or message
     Alert.alert(
       'Development Build Required',
       'Password autofill requires a development build. ' +
       'Please use manual login for now.'
     );
   } else {
     // Use native password features
     const credential = await SharedPasswords.requestPasswordAutoFill();
   }
   ```

4. **Check platform support before using features:**
   ```typescript
   const support = SharedPasswords.getPlatformSupport();
   // In Expo Go, all values will be false
   if (support.passwordAutoFill) {
     // Safe to use
   }
   ```

---

### "Not supported" errors

**Symptoms:**
- Error code: `NOT_SUPPORTED`
- Features not working on certain devices

**Cause:** Device/OS version doesn't support the feature.

**Solution:** Check platform support before using features:

```typescript
const support = SharedPasswords.getPlatformSupport();
if (support.passwordAutoFill) {
  // Use password autofill
}
if (support.passkeys) {
  // Use passkeys
}
```

**Minimum versions:**
- Password AutoFill: iOS 13+, Android 9+
- Passkeys: iOS 16+, Android 9+ with Play Services

---

### Credentials not appearing

**iOS Symptoms:**
- No credentials shown in picker
- `NO_CREDENTIALS` error

**Solutions:**

1. **Verify AASA file:**
   ```
   curl https://yourdomain.com/.well-known/apple-app-site-association
   ```

2. **Check Team ID matches:**
   - AASA file format: `TEAMID.com.yourapp.bundleid`
   - Find Team ID in Apple Developer Portal

3. **Wait for cache refresh:**
   - Apple caches AASA files
   - Wait 24-48 hours after changes
   - Or reinstall the app

4. **Check entitlements:**
   - Ensure Associated Domains capability is added
   - Domains start with `webcredentials:`

**Android Symptoms:**
- No credential picker appears
- Authentication silently fails

**Solutions:**

1. **Verify assetlinks.json:**
   ```
   curl https://yourdomain.com/.well-known/assetlinks.json
   ```

2. **Check SHA256 fingerprint:**
   ```bash
   keytool -list -v -keystore your.keystore -alias your-alias
   ```

3. **Verify using Google's tool:**
   ```
   https://developers.google.com/digital-asset-links/tools/generator
   ```

4. **Check Play Services:**
   - Ensure Google Play Services is installed and updated
   - Some emulators don't have Play Services

---

### Passkey creation fails

**Symptoms:**
- `createPasskey` throws error
- User can't complete biometric verification

**Solutions:**

1. **Check challenge format:**
   - Challenge must be Base64-encoded
   - Must be at least 16 bytes

2. **Verify rpId matches domain:**
   - rpId must match your associated domain exactly
   - Don't include protocol (use `example.com` not `https://example.com`)

3. **iOS specific:**
   - Ensure device has biometrics set up
   - Check Associated Domains include the rpId

4. **Android specific:**
   - Ensure screen lock is configured
   - Check Google Play Services is available

---

### Save password fails

**iOS Symptoms:**
- `savePassword` throws `DOMAIN_NOT_CONFIGURED`

**Solution:**
- Add the domain to Associated Domains in Xcode
- Pass the `domain` parameter to `savePassword`

**Android Symptoms:**
- Save operation shows no UI
- Returns success but password not saved

**Solution:**
- Credential Manager requires user interaction
- Ensure `currentActivity` is available

---

### User cancelled errors

**Symptoms:**
- Error code: `CANCELLED`
- Operations failing without user seeing UI

**This is expected behavior when:**
- User dismisses the credential picker
- User cancels biometric verification
- User taps outside the modal

**Handle gracefully:**
```typescript
try {
  await SharedPasswords.requestPasswordAutoFill();
} catch (error) {
  if (error.code === 'CANCELLED') {
    // User cancelled - don't show error message
    return;
  }
  // Handle other errors
}
```

---

## Debugging Tips

### Enable verbose logging

**iOS:**
1. Open Console.app
2. Filter by your app or "swcd" (Shared Web Credentials daemon)
3. Look for credential-related messages

**Android:**
```bash
adb logcat | grep -i credential
```

### Verify associated domains

**iOS:**
```bash
# Check Apple's CDN for your AASA file
curl https://app-site-association.cdn-apple.com/a/v1/yourdomain.com
```

**Android:**
```bash
# Use Google's verification API
curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://yourdomain.com&relation=delegate_permission/common.get_login_creds"
```

### Test on real devices

Some features don't work correctly on simulators/emulators:
- Biometric authentication
- Keychain sync (iOS)
- Google Password Manager sync (Android)

---

## Getting Help

If you're still having issues:

1. **Check existing issues:** Search the GitHub repository
2. **Open a new issue:** Include:
   - Platform and OS version
   - React Native version
   - Full error message
   - Steps to reproduce
3. **Include logs:** Attach relevant console/logcat output
