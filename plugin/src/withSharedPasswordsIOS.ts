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
  return withEntitlementsPlist(config, (innerConfig) => {
    const domains = options.domains || [];

    if (domains.length === 0) {
      return innerConfig;
    }

    const associatedDomains: string[] = [];

    for (const domain of domains) {
      // Add webcredentials for password autofill
      associatedDomains.push(`webcredentials:${domain}`);

      // Add applinks for universal links (needed for some passkey flows)
      associatedDomains.push(`applinks:${domain}`);
    }

    innerConfig.modResults['com.apple.developer.associated-domains'] = associatedDomains;

    return innerConfig;
  });
};

/**
 * Add keychain sharing capability
 */
const withKeychainSharing: ConfigPlugin<SharedPasswordsPluginOptions> = (config, options) => {
  return withEntitlementsPlist(config, (innerConfig) => {
    if (!options.keychainGroup) {
      return innerConfig;
    }

    const teamId = options.teamId || '$(AppIdentifierPrefix)';
    const fullGroup = `${teamId}${options.keychainGroup}`;

    innerConfig.modResults['keychain-access-groups'] = [fullGroup];

    return innerConfig;
  });
};

/**
 * Enable AuthenticationServices capability in Xcode project
 */
const withAuthenticationServicesCapability: ConfigPlugin = (config) => {
  return withXcodeProject(config, (innerConfig) => {
    const project = innerConfig.modResults;

    // Get the target
    const targetName = innerConfig.modRequest.projectName || 'App';
    const targetUuid = project.findTargetKey(targetName);

    if (targetUuid) {
      // Add AuthenticationServices framework
      project.addFramework('AuthenticationServices.framework', {
        target: targetUuid,
        weak: false,
      });
    }

    return innerConfig;
  });
};

/**
 * Add required Info.plist entries
 */
export const withSharedPasswordsInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (innerConfig) => {
    // No specific Info.plist entries required for basic functionality
    // But we could add custom entries here if needed
    return innerConfig;
  });
};
