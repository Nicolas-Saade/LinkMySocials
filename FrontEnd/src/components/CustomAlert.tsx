import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal 
} from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onClose
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    backgroundColor: colors.secondaryBg,
    borderRadius: borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    maxWidth: '80%',
    width: 300,
    ...shadows.md,
  },
  title: {
    color: colors.primaryText,
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    color: colors.secondaryText,
    fontSize: typography.body.fontSize,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.neonBlue,
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: typography.button.fontSize,
    fontWeight: 'bold',
  },
});

export default CustomAlert; 