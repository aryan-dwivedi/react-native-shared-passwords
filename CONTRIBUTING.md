# Contributing to react-native-shared-passwords

Thank you for your interest in contributing!

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/aryan-dwivedi/react-native-shared-passwords.git
   cd react-native-shared-passwords
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the package:
   ```bash
   npm run build
   ```

4. Run the example app:
   ```bash
   cd example
   npm install
   cd ios && pod install && cd ..
   npm run ios
   # or
   npm run android
   ```

## Project Structure

```
├── src/                    # TypeScript source
├── ios/                    # iOS native code (Swift)
├── android/                # Android native code (Kotlin)
├── plugin/                 # Expo config plugin
├── docs/                   # Docusaurus documentation
├── example/                # Example React Native app
```

## Making Changes

1. Create a new branch for your changes
2. Make your changes
3. Run `npm run typescript` to check types
4. Run `npm run lint` to check linting
5. Test your changes in the example app
6. Submit a pull request

## Testing

### iOS

- Test on iOS 13+ for password autofill
- Test on iOS 16+ for passkeys
- Use a real device for biometric testing

### Android

- Test on Android 9+ (API 28+)
- Ensure Google Play Services is available
- Test with both debug and release builds

## Code Style

- Use TypeScript for all JavaScript code
- Use Swift for iOS native code
- Use Kotlin for Android native code
- Run prettier before committing

## Commit Messages

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `chore:` for maintenance tasks

## Questions?

Open an issue for any questions or concerns.
