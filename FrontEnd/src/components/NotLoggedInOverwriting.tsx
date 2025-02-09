import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    style: 'primary' | 'secondary';
    onPress: () => void;
  }>;
  onClose?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  buttons = [],
  onClose
}) => {
  // If no buttons provided, use default close button
  const renderButtons = buttons.length > 0 ? buttons : [
    {
      text: "Close",
      style: "secondary",
      onPress: onClose || (() => {})
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {renderButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'primary' ? styles.primaryButton : styles.secondaryButton,
                  index > 0 && styles.buttonMargin
                ]}
                onPress={button.onPress}
              >
                <Text style={[
                  styles.buttonText,
                  button.style === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
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
    backgroundColor: colors.secondaryBg,
    borderRadius: borderRadius.lg,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    ...shadows.md,
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.body.fontSize,
    color: colors.secondaryText,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  buttonMargin: {
    marginLeft: 10,
  },
  primaryButton: {
    backgroundColor: colors.neonBlue,
  },
  secondaryButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: typography.button.fontSize,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: colors.primaryText,
  },
  secondaryButtonText: {
    color: colors.primaryText,
  },
});

export default AlertModal; 