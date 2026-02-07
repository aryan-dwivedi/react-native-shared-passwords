#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(SharedPasswords, NSObject)

RCT_EXTERN_METHOD(requestPasswordAutoFill:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(savePassword:(NSString *)username
                  password:(NSString *)password
                  domain:(NSString *)domain
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(hasStoredCredentials:(NSString *)domain
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(deleteCredential:(NSString *)username
                  domain:(NSString *)domain
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(createPasskey:(NSDictionary *)options
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(authenticateWithPasskey:(NSDictionary *)options
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getPlatformSupport)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end

// New Architecture support
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNSharedPasswordsSpec.h"

@interface SharedPasswords () <NativeSharedPasswordsSpec>
@end
#endif
