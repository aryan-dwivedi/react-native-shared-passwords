package com.sharedpasswords

import android.os.Build
import android.util.Base64
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CreatePasswordRequest
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPasswordOption
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.PasswordCredential
import androidx.credentials.PublicKeyCredential
import androidx.credentials.exceptions.CreateCredentialCancellationException
import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class SharedPasswordsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val credentialManager: CredentialManager by lazy {
        CredentialManager.create(reactContext)
    }

    private val gson = Gson()
    private val coroutineScope = CoroutineScope(Dispatchers.Main)

    override fun getName(): String = NAME

    @ReactMethod
    fun requestPasswordAutoFill(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("FAILED", "Activity not available")
            return
        }

        coroutineScope.launch {
            try {
                val getPasswordOption = GetPasswordOption()
                val getCredRequest = GetCredentialRequest(listOf(getPasswordOption))

                val result = credentialManager.getCredential(
                    context = activity,
                    request = getCredRequest
                )

                when (val credential = result.credential) {
                    is PasswordCredential -> {
                        val response = Arguments.createMap().apply {
                            putString("username", credential.id)
                            putString("password", credential.password)
                        }
                        promise.resolve(response)
                    }
                    else -> {
                        promise.reject("FAILED", "Unexpected credential type")
                    }
                }
            } catch (e: GetCredentialCancellationException) {
                promise.reject("CANCELLED", "User cancelled the operation", e)
            } catch (e: NoCredentialException) {
                promise.reject("NO_CREDENTIALS", "No credentials available", e)
            } catch (e: GetCredentialException) {
                promise.reject("FAILED", e.message, e)
            } catch (e: Exception) {
                promise.reject("FAILED", e.message, e)
            }
        }
    }

    @ReactMethod
    fun savePassword(username: String, password: String, domain: String, promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("FAILED", "Activity not available")
            return
        }

        coroutineScope.launch {
            try {
                val createPasswordRequest = CreatePasswordRequest(
                    id = username,
                    password = password
                )

                credentialManager.createCredential(
                    context = activity,
                    request = createPasswordRequest
                )

                val response = Arguments.createMap().apply {
                    putBoolean("success", true)
                }
                promise.resolve(response)
            } catch (e: CreateCredentialCancellationException) {
                promise.reject("CANCELLED", "User cancelled the save operation", e)
            } catch (e: CreateCredentialException) {
                promise.reject("FAILED", e.message, e)
            } catch (e: Exception) {
                promise.reject("FAILED", e.message, e)
            }
        }
    }

    @ReactMethod
    fun hasStoredCredentials(domain: String, promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.resolve(false)
            return
        }

        coroutineScope.launch {
            try {
                val getPasswordOption = GetPasswordOption()
                val getCredRequest = GetCredentialRequest(
                    credentialOptions = listOf(getPasswordOption),
                    preferImmediatelyAvailableCredentials = true
                )

                credentialManager.getCredential(
                    context = activity,
                    request = getCredRequest
                )

                promise.resolve(true)
            } catch (e: NoCredentialException) {
                promise.resolve(false)
            } catch (e: Exception) {
                promise.resolve(false)
            }
        }
    }

    @ReactMethod
    fun deleteCredential(username: String, domain: String, promise: Promise) {
        coroutineScope.launch {
            try {
                val clearRequest = ClearCredentialStateRequest()
                credentialManager.clearCredentialState(clearRequest)

                val response = Arguments.createMap().apply {
                    putBoolean("success", true)
                }
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject("FAILED", e.message, e)
            }
        }
    }

    @ReactMethod
    fun createPasskey(options: ReadableMap, promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("FAILED", "Activity not available")
            return
        }

        val rpId = options.getString("rpId") ?: run {
            promise.reject("INVALID_PARAMETERS", "Missing rpId")
            return
        }
        val rpName = options.getString("rpName") ?: rpId
        val challenge = options.getString("challenge") ?: run {
            promise.reject("INVALID_PARAMETERS", "Missing challenge")
            return
        }
        val userId = options.getString("userId") ?: run {
            promise.reject("INVALID_PARAMETERS", "Missing userId")
            return
        }
        val userName = options.getString("userName") ?: run {
            promise.reject("INVALID_PARAMETERS", "Missing userName")
            return
        }
        val userDisplayName = options.getString("userDisplayName") ?: userName
        val timeout = if (options.hasKey("timeout")) options.getInt("timeout") else 60000

        val userVerification = options.getString("userVerification") ?: "preferred"
        val residentKey = options.getString("residentKey") ?: "preferred"
        val attestation = options.getString("attestation") ?: "none"

        val userIdBase64 = Base64.encodeToString(userId.toByteArray(), Base64.NO_WRAP)

        val requestJson = JsonObject().apply {
            addProperty("challenge", challenge)

            add("rp", JsonObject().apply {
                addProperty("id", rpId)
                addProperty("name", rpName)
            })

            add("user", JsonObject().apply {
                addProperty("id", userIdBase64)
                addProperty("name", userName)
                addProperty("displayName", userDisplayName)
            })

            add("pubKeyCredParams", gson.toJsonTree(listOf(
                mapOf("type" to "public-key", "alg" to -7),
                mapOf("type" to "public-key", "alg" to -257)
            )))

            addProperty("timeout", timeout)
            addProperty("attestation", attestation)

            add("authenticatorSelection", JsonObject().apply {
                addProperty("authenticatorAttachment", "platform")
                addProperty("requireResidentKey", residentKey == "required")
                addProperty("residentKey", residentKey)
                addProperty("userVerification", userVerification)
            })
        }

        coroutineScope.launch {
            try {
                val createRequest = CreatePublicKeyCredentialRequest(
                    requestJson = requestJson.toString()
                )

                val result = credentialManager.createCredential(
                    context = activity,
                    request = createRequest
                )

                val credential = result as? androidx.credentials.CreatePublicKeyCredentialResponse
                    ?: throw Exception("Unexpected response type")

                val responseJson = gson.fromJson(credential.registrationResponseJson, JsonObject::class.java)
                val response = parseRegistrationResponse(responseJson)
                promise.resolve(response)
            } catch (e: CreateCredentialCancellationException) {
                promise.reject("CANCELLED", "User cancelled passkey creation", e)
            } catch (e: CreateCredentialException) {
                promise.reject("FAILED", e.message, e)
            } catch (e: Exception) {
                promise.reject("FAILED", e.message, e)
            }
        }
    }

    @ReactMethod
    fun authenticateWithPasskey(options: ReadableMap, promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("FAILED", "Activity not available")
            return
        }

        val rpId = options.getString("rpId") ?: run {
            promise.reject("INVALID_PARAMETERS", "Missing rpId")
            return
        }
        val challenge = options.getString("challenge") ?: run {
            promise.reject("INVALID_PARAMETERS", "Missing challenge")
            return
        }
        val timeout = if (options.hasKey("timeout")) options.getInt("timeout") else 60000
        val userVerification = options.getString("userVerification") ?: "preferred"

        val requestJson = JsonObject().apply {
            addProperty("challenge", challenge)
            addProperty("rpId", rpId)
            addProperty("timeout", timeout)
            addProperty("userVerification", userVerification)
        }

        coroutineScope.launch {
            try {
                val getCredentialOption = GetPublicKeyCredentialOption(
                    requestJson = requestJson.toString()
                )

                val getCredRequest = GetCredentialRequest(listOf(getCredentialOption))

                val result = credentialManager.getCredential(
                    context = activity,
                    request = getCredRequest
                )

                when (val credential = result.credential) {
                    is PublicKeyCredential -> {
                        val responseJson = gson.fromJson(credential.authenticationResponseJson, JsonObject::class.java)
                        val response = parseAuthenticationResponse(responseJson)
                        promise.resolve(response)
                    }
                    else -> {
                        promise.reject("FAILED", "Unexpected credential type")
                    }
                }
            } catch (e: GetCredentialCancellationException) {
                promise.reject("CANCELLED", "User cancelled passkey authentication", e)
            } catch (e: NoCredentialException) {
                promise.reject("NO_CREDENTIALS", "No passkeys available", e)
            } catch (e: GetCredentialException) {
                promise.reject("FAILED", e.message, e)
            } catch (e: Exception) {
                promise.reject("FAILED", e.message, e)
            }
        }
    }

    @ReactMethod
    fun getPlatformSupport(promise: Promise) {
        val sdkVersion = Build.VERSION.SDK_INT
        val versionString = Build.VERSION.RELEASE

        val result = Arguments.createMap().apply {
            putBoolean("passwordAutoFill", sdkVersion >= Build.VERSION_CODES.P)
            putBoolean("passkeys", sdkVersion >= Build.VERSION_CODES.P)
            putBoolean("savePassword", sdkVersion >= Build.VERSION_CODES.P)
            putString("minOSVersion", "9.0 (API 28)")
            putString("currentOSVersion", versionString)
        }
        promise.resolve(result)
    }

    private fun parseRegistrationResponse(json: JsonObject): WritableMap {
        val response = json.getAsJsonObject("response")

        return Arguments.createMap().apply {
            putString("credentialId", json.get("id")?.asString ?: "")
            putString("rawId", json.get("rawId")?.asString ?: "")
            putString("type", json.get("type")?.asString ?: "public-key")
            putString("authenticatorData", response?.get("authenticatorData")?.asString ?: "")
            putString("clientDataJSON", response?.get("clientDataJSON")?.asString ?: "")
            putString("attestationObject", response?.get("attestationObject")?.asString ?: "")
        }
    }

    private fun parseAuthenticationResponse(json: JsonObject): WritableMap {
        val response = json.getAsJsonObject("response")

        return Arguments.createMap().apply {
            putString("credentialId", json.get("id")?.asString ?: "")
            putString("rawId", json.get("rawId")?.asString ?: "")
            putString("type", json.get("type")?.asString ?: "public-key")
            putString("authenticatorData", response?.get("authenticatorData")?.asString ?: "")
            putString("clientDataJSON", response?.get("clientDataJSON")?.asString ?: "")
            putString("signature", response?.get("signature")?.asString ?: "")
            putString("userHandle", response?.get("userHandle")?.asString ?: "")
        }
    }

    companion object {
        const val NAME = "SharedPasswords"
    }
}
