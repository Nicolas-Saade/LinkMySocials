import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';
import { api } from '../utils';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: { first_name: string; last_name: string; json_file?: any }) => void;
  onRegisterClick: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  visible, 
  onClose, 
  onLoginSuccess,
  onRegisterClick 
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        return;
      }

      //! Very bad naming, this checks email AND returns user data from DB
      const response = await api.post('/api/check-email/', { 
        email: email.trim(), 
        password: password.trim() 
      });

      if (response.status === 200) {
        setError('');
        onLoginSuccess(response.data);
        setPassword(''); // Clear password for security
        onClose();
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Email not found. Please register first.');
      } else {
        setError('Incorrect password or email. Please try again.');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Login</Text>
          
          <Text style={styles.message}>
            With an account, we can take care of your data, so you can focus on the fun part.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.secondaryText}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(''); // Clear error when user types
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.secondaryText}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(''); // Clear error when user types
            }}
            secureTextEntry
          />

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={onRegisterClick}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: colors.secondaryBg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  modalTitle: {
    color: colors.primaryText,
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    color: colors.secondaryText,
    fontSize: typography.body.fontSize,
    marginBottom: 15,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.body.fontSize,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: colors.primaryBg,
    color: colors.primaryText,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: borderRadius.md,
    marginBottom: 15,
    fontSize: typography.body.fontSize,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: colors.error,
    padding: 12,
    borderRadius: borderRadius.md,
    flex: 1,
    marginRight: 10,
    ...shadows.sm,
  },
  closeButtonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: typography.button.fontSize,
  },
  loginButton: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: borderRadius.md,
    flex: 1,
    marginLeft: 10,
    ...shadows.sm,
  },
  loginButtonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: typography.button.fontSize,
  },
  signUpButton: {
    marginTop: 20,
    backgroundColor: colors.neonBlue,
    padding: 12,
    borderRadius: borderRadius.md,
    width: '100%',
    ...shadows.sm,
  },
  signUpButtonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: typography.button.fontSize,
  },
});

export default LoginModal;
