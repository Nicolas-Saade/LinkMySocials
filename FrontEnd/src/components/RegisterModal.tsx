import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert
} from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';
import { api } from '../utils';
import CustomAlert from './CustomAlert';

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onRegisterSuccess: (userData: { 
    first_name: string; 
    last_name: string; 
    json_file?: any 
  }) => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ 
  visible, 
  onClose, 
  onRegisterSuccess 
}) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleRegister = async () => {
    try {
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all fields.');
        return;
      }

      const formData = new FormData();
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('email', email.trim());
      formData.append('password', password.trim());

      const response = await api.post('/api/create-user-profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 201) {
        // Update parent component
        onRegisterSuccess({ 
          first_name: firstName, 
          last_name: lastName,
          json_file: response.data.json_file
        });
        
        // Clear form and error
        setError('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        
        // Close modal
        onClose();
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create account. Please try again.');
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
          <Text style={styles.modalTitle}>Create Your Account</Text>
          
          <Text style={styles.message}>
            Join us to keep track of all your social media presence in one place.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor={colors.secondaryText}
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setError('');
            }}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor={colors.secondaryText}
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              setError('');
            }}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={colors.secondaryText}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.secondaryText}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry
          />

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>
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
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.error,
    padding: 12,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  registerButton: {
    flex: 1,
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  buttonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: typography.button.fontSize,
  },
});

export default RegisterModal; 