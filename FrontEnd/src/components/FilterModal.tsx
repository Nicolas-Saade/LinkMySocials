import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ImageSourcePropType,
  ScrollView 
} from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';
import FacebookLogo from '../assets/Facebook-logo-reg.png';
import InstaLogo from '../assets/Insta-logo-reg.png';
import XLogo from '../assets/X-logo-reg.webp';
import RedditLogo from '../assets/reddit-logo-reg.png';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlatform: (platforms: string[]) => void;
}

interface PlatformOption {
  id: string;
  name: string;
  icon: ImageSourcePropType;
}

const platforms: PlatformOption[] = [
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: FacebookLogo as ImageSourcePropType
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: InstaLogo as ImageSourcePropType
  },
  {
    id: 'x', 
    name: 'X', 
    icon: XLogo as ImageSourcePropType
  },
  { 
    id: 'reddit', 
    name: 'Reddit', 
    icon: RedditLogo as ImageSourcePropType
  },
];

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onSelectPlatform }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        return prev.filter((item) => item !== platform);
      }
      return [...prev, platform];
    });
  };

  const isPlatformSelected = (platform: string): boolean => 
    selectedPlatforms.includes(platform);

  const handleApply = () => {
    onSelectPlatform(selectedPlatforms);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Filter by Platform</Text>

          <ScrollView style={styles.scrollView}>
            {platforms.map((platform) => (
              <View key={platform.id} style={styles.optionContainer}>
                <TouchableOpacity
                  onPress={() => togglePlatform(platform.id)}
                  style={styles.optionButton}
                >
                  <Image source={platform.icon} style={styles.platformIcon} />
                  <Text style={styles.optionText}>{platform.name}</Text>
                  <View style={[
                    styles.checkbox,
                    isPlatformSelected(platform.id) && styles.checkboxActive
                  ]}>
                    {isPlatformSelected(platform.id) && (
                      <View style={styles.checkboxSelected} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: colors.secondaryBg,
    borderRadius: borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    ...shadows.md,
  },
  modalTitle: {
    color: colors.primaryText,
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    width: '100%',
    maxHeight: 300,
  },
  optionContainer: {
    width: '100%',
    marginBottom: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryBg,
    overflow: 'hidden',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
  },
  platformIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    color: colors.primaryText,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.divider,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: colors.neonBlue,
  },
  checkboxSelected: {
    width: 14,
    height: 14,
    backgroundColor: colors.neonBlue,
    borderRadius: 2,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  applyButton: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
    ...shadows.sm,
  },
  applyButtonText: {
    color: colors.primaryText,
    fontSize: typography.button.fontSize,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: colors.error,
    padding: 12,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
    ...shadows.sm,
  },
  closeButtonText: {
    color: colors.primaryText,
    fontSize: typography.button.fontSize,
    fontWeight: 'bold',
  },
});

export default FilterModal; 