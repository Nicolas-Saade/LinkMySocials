import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';

const AlertModal = ({ visible, onClose }) => {
  const popupOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show popup (set opacity to 1)
      Animated.timing(popupOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Automatically hide the popup after 5 seconds
      setTimeout(() => {
        Animated.timing(popupOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onClose();
        });
      }, 5000);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.modalContainer, { opacity: popupOpacity }]}>
      <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
        <Text style={styles.closeIconText}>×</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle}>Login Required</Text>
      <Text style={styles.modalMessage}>Please log in to add your account's credentials.</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: colors.secondaryBg,
    borderRadius: borderRadius.lg,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...shadows.md,
    maxWidth: '90%',
    width: 300,
  },
  closeIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    borderRadius: borderRadius.round,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  closeIconText: {
    color: colors.primaryText,
    fontSize: typography.h3.fontSize,
    lineHeight: 24,
    textAlign: 'center',
  },
  modalTitle: {
    color: colors.primaryText,
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    color: colors.secondaryText,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default AlertModal;