import {
  ConfigPlugin,
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
} from '@expo/config-plugins';
import type { SharedPasswordsPluginOptions } from './index';

/**
 * Configure iOS for shared passwords and passkeys
 */
export const withSharedPasswordsIOS: ConfigPlugin<SharedPasswordsPluginOptions> = (
  config,
  options
) => {
  // Add associated domains entitlement
  config = withAssociatedDomains(config, options);

  // Add keychain sharing if specified
  if (options.keychainGroup) {
    config = withKeychainSharing(config, options);
  }

  // Enable AuthenticationServices capability
  config = withAuthenticationServicesCapability(config);

  return config;
};

/**
 * Add associated domains for webcredentials and passkeys
 */
const withAssociatedDomains: ConfigPlugin<SharedPasswordsPluginOptions> = (config, options) => {
  return withEntitlementsPlist(config, (config) => {
    const domains = options.domains || [];

    if (domains.length === 0) {
      return config;
    }

    const associatedDomains: string[] = [];

    for (const domain of domains) {
      // Add webcredentials for password autofill
      associatedDomains.push(`webcredentials:${domain}`);

      // Add applinks for universal links (needed for some passkey flows)
      associatedDomains.push(`applinks:${domain}`);
    }

    config.modResults['com.apple.developer.associated-domains'] = associatedDomains;

    return config;
  });
};

/**
 * Add keychain sharing capability
 */
const withKeychainSharing: ConfigPlugin<SharedPasswordsPluginOptions> = (config, options) => {
  return withEntitlementsPlist(config, (config) => {
    if (!options.keychainGroup) {
      return config;
    }

    const teamId = options.teamId || '$(AppIdentifierPrefix)';
    const fullGroup = `${teamId}${options.keychainGroup}`;

    config.modResults['keychain-access-groups'] = [fullGroup];

    return config;
  });
};

/**
 * Enable AuthenticationServices capability in Xcode project
 */
const withAuthenticationServicesCapability: ConfigPlugin = (config) => {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;

    // Get the target
    const targetName = config.modRequest.projectName || 'App';
    const targetUuid = project.findTargetKey(targetName);

    if (targetUuid) {
      // Add AuthenticationServices framework
      project.addFramework('AuthenticationServices.framework', {
        target: targetUuid,
        weak: false,
      });
    }

    return config;
  });
};

/**
 * Add required Info.plist entries
 */
export const withSharedPasswordsInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    // No specific Info.plist entries required for basic functionality
    // But we could add custom entries here if needed
    return config;
  });
};
