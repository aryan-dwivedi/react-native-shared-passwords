import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import SharedPasswords, {
  SharedPasswordsError,
  SharedPasswordsErrorCode,
  PlatformSupport,
} from 'react-native-shared-passwords';

const DOMAIN = 'example.com';

function App(): React.JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [platformSupport, setPlatformSupport] = useState<PlatformSupport | null>(null);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    const support = SharedPasswords.getPlatformSupport();
    setPlatformSupport(support);
  }, []);

  const showResult = (message: string) => {
    setResult(message);
    console.log(message);
  };

  const handleRequestAutoFill = async () => {
    try {
      showResult('Requesting credentials...');
      const credential = await SharedPasswords.requestPasswordAutoFill();
      setUsername(credential.username);
      setPassword(credential.password);
      showResult(`Received credential for: ${credential.username}`);
    } catch (error) {
      handleError(error);
    }
  };

  const handleSavePassword = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      showResult('Saving password...');
      const result = await SharedPasswords.savePassword({
        username,
        password,
        domain: DOMAIN,
      });

      if (result.success) {
        showResult('Password saved successfully!');
      } else {
        showResult(`Failed to save: ${result.error}`);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleCheckCredentials = async () => {
    try {
      showResult('Checking for stored credentials...');
      const hasCredentials = await SharedPasswords.hasStoredCredentials(DOMAIN);
      showResult(`Credentials exist: ${hasCredentials}`);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeleteCredential = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter username to delete');
      return;
    }

    try {
      showResult('Deleting credential...');
      const result = await SharedPasswords.deleteCredential({
        username,
        domain: DOMAIN,
      });

      if (result.success) {
        showResult('Credential deleted successfully!');
        setUsername('');
        setPassword('');
      } else {
        showResult(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleCreatePasskey = async () => {
    if (!platformSupport?.passkeys) {
      Alert.alert('Not Supported', 'Passkeys are not supported on this device');
      return;
    }

    try {
      showResult('Creating passkey...');

      // In a real app, get the challenge from your server
      const challenge = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));

      const credential = await SharedPasswords.createPasskey({
        rpId: DOMAIN,
        rpName: 'Example App',
        challenge,
        userId: 'user-123',
        userName: username || 'test@example.com',
        userDisplayName: username || 'Test User',
      });

      showResult(`Passkey created!\nCredential ID: ${credential.credentialId.substring(0, 20)}...`);
    } catch (error) {
      handleError(error);
    }
  };

  const handleAuthenticatePasskey = async () => {
    if (!platformSupport?.passkeys) {
      Alert.alert('Not Supported', 'Passkeys are not supported on this device');
      return;
    }

    try {
      showResult('Authenticating with passkey...');

      // In a real app, get the challenge from your server
      const challenge = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));

      const assertion = await SharedPasswords.authenticateWithPasskey({
        rpId: DOMAIN,
        challenge,
      });

      showResult(
        `Authenticated!\nCredential ID: ${assertion.credentialId.substring(0, 20)}...\nUser Handle: ${assertion.userHandle}`
      );
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof SharedPasswordsError) {
      switch (error.code) {
        case SharedPasswordsErrorCode.CANCELLED:
          showResult('Operation cancelled by user');
          break;
        case SharedPasswordsErrorCode.NO_CREDENTIALS:
          showResult('No credentials found');
          break;
        case SharedPasswordsErrorCode.NOT_SUPPORTED:
          showResult('Feature not supported on this device');
          break;
        default:
          showResult(`Error: ${error.message}`);
      }
    } else if (error instanceof Error) {
      showResult(`Error: ${error.message}`);
    } else {
      showResult('An unknown error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Shared Passwords Demo</Text>

        {platformSupport && (
          <View style={styles.supportInfo}>
            <Text style={styles.supportTitle}>Platform Support</Text>
            <Text style={styles.supportText}>OS Version: {platformSupport.currentOSVersion}</Text>
            <Text style={styles.supportText}>
              Password AutoFill: {platformSupport.passwordAutoFill ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.supportText}>
              Passkeys: {platformSupport.passkeys ? 'Yes' : 'No'}
            </Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username / Email"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password Actions</Text>
          <TouchableOpacity style={styles.button} onPress={handleRequestAutoFill}>
            <Text style={styles.buttonText}>Request AutoFill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSavePassword}>
            <Text style={styles.buttonText}>Save Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleCheckCredentials}>
            <Text style={styles.buttonText}>Check Credentials</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleDeleteCredential}
          >
            <Text style={styles.buttonText}>Delete Credential</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passkey Actions</Text>
          <TouchableOpacity
            style={[styles.button, !platformSupport?.passkeys && styles.disabledButton]}
            onPress={handleCreatePasskey}
            disabled={!platformSupport?.passkeys}
          >
            <Text style={styles.buttonText}>Create Passkey</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, !platformSupport?.passkeys && styles.disabledButton]}
            onPress={handleAuthenticatePasskey}
            disabled={!platformSupport?.passkeys}
          >
            <Text style={styles.buttonText}>Authenticate with Passkey</Text>
          </TouchableOpacity>
        </View>

        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Result:</Text>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  supportInfo: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1565c0',
  },
  supportText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
});

export default App;
