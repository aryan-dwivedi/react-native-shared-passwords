# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of `react-native-shared-passwords` seriously. If you discover a security vulnerability, please report it responsibly.

### Private Vulnerability Reporting

**Preferred:** Use [GitHub's private vulnerability reporting](https://github.com/aryan-dwivedi/react-native-shared-passwords/security/advisories/new) to submit a report directly through GitHub. This ensures the issue is handled confidentially.

### Email

Alternatively, you can email security concerns to the maintainers via the contact information on the [GitHub profile](https://github.com/aryan-dwivedi).

### What to Include

- A description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Any potential impact assessment
- Suggested fix (if available)

### What to Expect

- **Acknowledgment:** Within 48 hours of your report
- **Assessment:** We will evaluate the severity and impact within 7 days
- **Resolution:** Critical vulnerabilities will be patched as soon as possible, typically within 30 days
- **Disclosure:** We will coordinate disclosure timing with you

### Scope

This security policy covers:

- The `react-native-shared-passwords` npm package
- Native iOS and Android modules included in this repository
- The Expo config plugin

### Out of Scope

- Vulnerabilities in dependencies (report these to the respective maintainers)
- Issues in the example app that don't affect the library itself
- The documentation website

## Security Best Practices for Users

Since this library handles sensitive credential data:

- Always use HTTPS for your Associated Domains and Digital Asset Links
- Validate and sanitize all inputs before passing them to library methods
- Keep the library updated to the latest version
- Follow platform-specific security guidelines for [iOS](https://developer.apple.com/documentation/security) and [Android](https://developer.android.com/privacy-and-security/security-tips)
