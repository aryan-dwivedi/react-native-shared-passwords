import { ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';
import { withSharedPasswordsIOS } from './withSharedPasswordsIOS';
import { withSharedPasswordsAndroid } from './withSharedPasswordsAndroid';

const pkg = require('../../package.json');

export interface SharedPasswordsPluginOptions {
  /**
   * The domain(s) for associated domains (iOS) and asset links (Android)
   * Example: ['example.com', 'login.example.com']
   */
  domains?: string[];

  /**
   * Enable keychain sharing group (iOS only)
   * Example: 'com.yourcompany.shared'
   */
  keychainGroup?: string;

  /**
   * Team ID for iOS entitlements
   */
  teamId?: string;
}

const withSharedPasswords: ConfigPlugin<SharedPasswordsPluginOptions | void> = (
  config,
  options = {}
) => {
  const pluginOptions: SharedPasswordsPluginOptions = options || {};

  // Apply iOS configuration
  config = withSharedPasswordsIOS(config, pluginOptions);

  // Apply Android configuration
  config = withSharedPasswordsAndroid(config, pluginOptions);

  return config;
};

export default createRunOncePlugin(withSharedPasswords, pkg.name, pkg.version);

export { withSharedPasswordsIOS } from './withSharedPasswordsIOS';
export { withSharedPasswordsAndroid } from './withSharedPasswordsAndroid';
