import Foundation
import AuthenticationServices
import Security

@objc(SharedPasswords)
class SharedPasswords: NSObject {

    private var currentResolver: RCTPromiseResolveBlock?
    private var currentRejecter: RCTPromiseRejectBlock?

    // MARK: - Password AutoFill

    @objc(requestPasswordAutoFill:withRejecter:)
    func requestPasswordAutoFill(resolve: @escaping RCTPromiseResolveBlock,
                                  reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            if #available(iOS 16.0, *) {
                self.requestPasswordAutoFillModern(resolve: resolve, reject: reject)
            } else if #available(iOS 13.0, *) {
                self.requestPasswordAutoFillLegacy(resolve: resolve, reject: reject)
            } else {
                reject("NOT_SUPPORTED", "Password AutoFill requires iOS 13.0 or later", nil)
            }
        }
    }

    @available(iOS 16.0, *)
    private func requestPasswordAutoFillModern(resolve: @escaping RCTPromiseResolveBlock,
                                                reject: @escaping RCTPromiseRejectBlock) {
        self.currentResolver = resolve
        self.currentRejecter = reject

        let passwordProvider = ASAuthorizationPasswordProvider()
        let passwordRequest = passwordProvider.createRequest()

        let controller = ASAuthorizationController(authorizationRequests: [passwordRequest])
        controller.delegate = self
        controller.presentationContextProvider = self
        controller.performRequests()
    }

    @available(iOS 13.0, *)
    private func requestPasswordAutoFillLegacy(resolve: @escaping RCTPromiseResolveBlock,
                                                reject: @escaping RCTPromiseRejectBlock) {
        self.currentResolver = resolve
        self.currentRejecter = reject

        let passwordProvider = ASAuthorizationPasswordProvider()
        let passwordRequest = passwordProvider.createRequest()

        let controller = ASAuthorizationController(authorizationRequests: [passwordRequest])
        controller.delegate = self
        controller.presentationContextProvider = self
        controller.performRequests()
    }

    // MARK: - Save Password

    @objc(savePassword:password:domain:withResolver:withRejecter:)
    func savePassword(username: String,
                      password: String,
                      domain: String,
                      resolve: @escaping RCTPromiseResolveBlock,
                      reject: @escaping RCTPromiseRejectBlock) {
        let effectiveDomain = domain.isEmpty ? getAssociatedDomain() : domain

        guard !effectiveDomain.isEmpty else {
            reject("DOMAIN_NOT_CONFIGURED", "No domain provided and no associated domain configured", nil)
            return
        }

        // Use SecAddSharedWebCredential for saving shared web credentials
        SecAddSharedWebCredential(effectiveDomain as CFString,
                                   username as CFString,
                                   password as CFString?) { error in
            DispatchQueue.main.async {
                if let error = error {
                    let nsError = error as Error as NSError
                    if nsError.code == Int(errSecUserCanceled) {
                        reject("CANCELLED", "User cancelled the save operation", error)
                    } else {
                        reject("FAILED", "Failed to save password: \(error.localizedDescription)", error)
                    }
                } else {
                    resolve(["success": true])
                }
            }
        }
    }

    // MARK: - Has Stored Credentials

    @objc(hasStoredCredentials:withResolver:withRejecter:)
    func hasStoredCredentials(domain: String,
                               resolve: @escaping RCTPromiseResolveBlock,
                               reject: @escaping RCTPromiseRejectBlock) {
        let effectiveDomain = domain.isEmpty ? getAssociatedDomain() : domain

        guard !effectiveDomain.isEmpty else {
            resolve(false)
            return
        }

        SecRequestSharedWebCredential(effectiveDomain as CFString, nil) { credentials, error in
            DispatchQueue.main.async {
                if let credentials = credentials, CFArrayGetCount(credentials) > 0 {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        }
    }

    // MARK: - Delete Credential

    @objc(deleteCredential:domain:withResolver:withRejecter:)
    func deleteCredential(username: String,
                          domain: String,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
        // Setting password to nil deletes the credential
        SecAddSharedWebCredential(domain as CFString,
                                   username as CFString,
                                   nil) { error in
            DispatchQueue.main.async {
                if let error = error {
                    reject("FAILED", "Failed to delete credential: \(error.localizedDescription)", error)
                } else {
                    resolve(["success": true])
                }
            }
        }
    }

    // MARK: - Passkeys

    @objc(createPasskey:withResolver:withRejecter:)
    func createPasskey(options: NSDictionary,
                       resolve: @escaping RCTPromiseResolveBlock,
                       reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.0, *) else {
            reject("NOT_SUPPORTED", "Passkeys require iOS 16.0 or later", nil)
            return
        }

        guard let rpId = options["rpId"] as? String,
              let challenge = options["challenge"] as? String,
              let userId = options["userId"] as? String,
              let userName = options["userName"] as? String else {
            reject("INVALID_PARAMETERS", "Missing required parameters", nil)
            return
        }

        guard let challengeData = Data(base64Encoded: challenge) else {
            reject("INVALID_PARAMETERS", "Invalid challenge format", nil)
            return
        }

        guard let userIdData = userId.data(using: .utf8) else {
            reject("INVALID_PARAMETERS", "Invalid userId format", nil)
            return
        }

        DispatchQueue.main.async {
            self.currentResolver = resolve
            self.currentRejecter = reject

            let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)
            let request = provider.createCredentialRegistrationRequest(
                challenge: challengeData,
                name: userName,
                userID: userIdData
            )

            // Configure user verification
            if let userVerification = options["userVerification"] as? String {
                switch userVerification {
                case "required":
                    request.userVerificationPreference = .required
                case "discouraged":
                    request.userVerificationPreference = .discouraged
                default:
                    request.userVerificationPreference = .preferred
                }
            }

            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            controller.performRequests()
        }
    }

    @objc(authenticateWithPasskey:withResolver:withRejecter:)
    func authenticateWithPasskey(options: NSDictionary,
                                  resolve: @escaping RCTPromiseResolveBlock,
                                  reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.0, *) else {
            reject("NOT_SUPPORTED", "Passkeys require iOS 16.0 or later", nil)
            return
        }

        guard let rpId = options["rpId"] as? String,
              let challenge = options["challenge"] as? String else {
            reject("INVALID_PARAMETERS", "Missing required parameters", nil)
            return
        }

        guard let challengeData = Data(base64Encoded: challenge) else {
            reject("INVALID_PARAMETERS", "Invalid challenge format", nil)
            return
        }

        DispatchQueue.main.async {
            self.currentResolver = resolve
            self.currentRejecter = reject

            let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)
            let request = provider.createCredentialAssertionRequest(challenge: challengeData)

            // Configure user verification
            if let userVerification = options["userVerification"] as? String {
                switch userVerification {
                case "required":
                    request.userVerificationPreference = .required
                case "discouraged":
                    request.userVerificationPreference = .discouraged
                default:
                    request.userVerificationPreference = .preferred
                }
            }

            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            controller.performRequests()
        }
    }

    // MARK: - Platform Support

    @objc(getPlatformSupport)
    func getPlatformSupport() -> NSDictionary {
        let osVersion = ProcessInfo.processInfo.operatingSystemVersion
        let versionString = "\(osVersion.majorVersion).\(osVersion.minorVersion).\(osVersion.patchVersion)"

        let passwordAutoFill = osVersion.majorVersion >= 13
        let passkeys = osVersion.majorVersion >= 16
        let savePassword = osVersion.majorVersion >= 8

        return [
            "passwordAutoFill": passwordAutoFill,
            "passkeys": passkeys,
            "savePassword": savePassword,
            "minOSVersion": passkeys ? "16.0" : (passwordAutoFill ? "13.0" : "8.0"),
            "currentOSVersion": versionString
        ]
    }

    // MARK: - Helpers

    private func getAssociatedDomain() -> String {
        // Try to get the first webcredentials domain from associated domains
        if let domains = Bundle.main.object(forInfoDictionaryKey: "com.apple.developer.associated-domains") as? [String] {
            for domain in domains {
                if domain.hasPrefix("webcredentials:") {
                    return String(domain.dropFirst("webcredentials:".count))
                }
            }
        }
        return ""
    }

    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
}

// MARK: - ASAuthorizationControllerDelegate

extension SharedPasswords: ASAuthorizationControllerDelegate {

    func authorizationController(controller: ASAuthorizationController,
                                  didCompleteWithAuthorization authorization: ASAuthorization) {

        // Handle password credential
        if let passwordCredential = authorization.credential as? ASPasswordCredential {
            let result: [String: Any] = [
                "username": passwordCredential.user,
                "password": passwordCredential.password
            ]
            currentResolver?(result)
            clearCurrentHandlers()
            return
        }

        // Handle passkey registration (iOS 16+)
        if #available(iOS 16.0, *) {
            if let registration = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialRegistration {
                let result: [String: Any] = [
                    "credentialId": registration.credentialID.base64EncodedString(),
                    "rawId": registration.credentialID.base64EncodedString(),
                    "type": "public-key",
                    "authenticatorData": registration.rawAuthenticatorData?.base64EncodedString() ?? "",
                    "clientDataJSON": registration.rawClientDataJSON.base64EncodedString(),
                    "attestationObject": registration.rawAttestationObject?.base64EncodedString() ?? ""
                ]
                currentResolver?(result)
                clearCurrentHandlers()
                return
            }

            // Handle passkey assertion (iOS 16+)
            if let assertion = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion {
                let result: [String: Any] = [
                    "credentialId": assertion.credentialID.base64EncodedString(),
                    "rawId": assertion.credentialID.base64EncodedString(),
                    "type": "public-key",
                    "authenticatorData": assertion.rawAuthenticatorData.base64EncodedString(),
                    "clientDataJSON": assertion.rawClientDataJSON.base64EncodedString(),
                    "signature": assertion.signature.base64EncodedString(),
                    "userHandle": assertion.userID.base64EncodedString()
                ]
                currentResolver?(result)
                clearCurrentHandlers()
                return
            }
        }

        currentRejecter?("UNKNOWN", "Unknown credential type received", nil)
        clearCurrentHandlers()
    }

    func authorizationController(controller: ASAuthorizationController,
                                  didCompleteWithError error: Error) {
        let nsError = error as NSError

        if nsError.domain == ASAuthorizationError.errorDomain {
            switch nsError.code {
            case ASAuthorizationError.canceled.rawValue:
                currentRejecter?("CANCELLED", "User cancelled the operation", error)
            case ASAuthorizationError.failed.rawValue:
                currentRejecter?("FAILED", "Authorization failed", error)
            case ASAuthorizationError.invalidResponse.rawValue:
                currentRejecter?("FAILED", "Invalid response from authorization", error)
            case ASAuthorizationError.notHandled.rawValue:
                currentRejecter?("NO_CREDENTIALS", "No credentials available", error)
            case ASAuthorizationError.notInteractive.rawValue:
                currentRejecter?("FAILED", "Not interactive", error)
            default:
                currentRejecter?("FAILED", error.localizedDescription, error)
            }
        } else {
            currentRejecter?("FAILED", error.localizedDescription, error)
        }

        clearCurrentHandlers()
    }

    private func clearCurrentHandlers() {
        currentResolver = nil
        currentRejecter = nil
    }
}

// MARK: - ASAuthorizationControllerPresentationContextProviding

extension SharedPasswords: ASAuthorizationControllerPresentationContextProviding {

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = scene.windows.first else {
            return UIWindow()
        }
        return window
    }
}
