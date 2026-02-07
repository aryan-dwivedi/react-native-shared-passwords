import { ConfigPlugin, withAndroidManifest, AndroidConfig } from '@expo/config-plugins';
import type { SharedPasswordsPluginOptions } from './index';

/**
 * Configure Android for shared passwords and passkeys
 */
export const withSharedPasswordsAndroid: ConfigPlugin<SharedPasswordsPluginOptions> = (
  config,
  options
) => {
  // Add necessary Android manifest configurations
  config = withCredentialManagerManifest(config, options);

  return config;
};

/**
 * Add Android manifest configurations for Credential Manager
 */
const withCredentialManagerManifest: ConfigPlugin<SharedPasswordsPluginOptions> = (
  config,
  _options
) => {
  return withAndroidManifest(config, (innerConfig) => {
    const manifest = innerConfig.modResults;
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    // Ensure meta-data array exists
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // Add asset statements for Digital Asset Links (passkeys)
    // This allows the app to be associated with web domains for passkeys
    const assetStatementsKey = 'asset_statements';
    const existingAssetStatements = application['meta-data'].find(
      (item: AndroidConfig.Manifest.ManifestMetaData) =>
        item.$?.['android:name'] === assetStatementsKey
    );

    if (!existingAssetStatements) {
      application['meta-data'].push({
        $: {
          'android:name': assetStatementsKey,
          'android:resource': '@string/asset_statements',
        },
      });
    }

    return innerConfig;
  });
};

/**
 * Generate the asset_statements string resource content
 * This should be placed in res/values/strings.xml
 *
 * For passkeys to work, you need to:
 * 1. Host a /.well-known/assetlinks.json file on your domain
 * 2. Add the asset_statements resource to your app
 *
 * Example assetlinks.json:
 * [{
 *   "relation": ["delegate_permission/common.handle_all_urls", "delegate_permission/common.get_login_creds"],
 *   "target": {
 *     "namespace": "android_app",
 *     "package_name": "com.yourapp",
 *     "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
 *   }
 * }]
 */
export function generateAssetStatements(domains: string[], _packageName: string): string {
  const statements = domains.map((domain) => ({
    include: `https://${domain}/.well-known/assetlinks.json`,
  }));

  return JSON.stringify(statements);
}

/**
 * Instructions for manual Android setup
 */
export const ANDROID_SETUP_INSTRUCTIONS = `
# Android Credential Manager Setup

## 1. Create Digital Asset Links file

Create a file at https://yourdomain.com/.well-known/assetlinks.json:

\`\`\`json
[{
  "relation": [
    "delegate_permission/common.handle_all_urls",
    "delegate_permission/common.get_login_creds"
  ],
  "target": {
    "namespace": "android_app",
    "package_name": "YOUR_PACKAGE_NAME",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
\`\`\`

## 2. Get your SHA256 fingerprint

For debug builds:
\`\`\`bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
\`\`\`

For release builds:
\`\`\`bash
keytool -list -v -keystore your-release-key.keystore -alias your-alias
\`\`\`

## 3. Add asset_statements to strings.xml

In android/app/src/main/res/values/strings.xml:

\`\`\`xml
<resources>
    <string name="asset_statements">[{"include": "https://yourdomain.com/.well-known/assetlinks.json"}]</string>
</resources>
\`\`\`

## 4. Verify your setup

Use the Digital Asset Links API to verify:
https://developers.google.com/digital-asset-links/tools/generator
`;
