import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  Alert,
  TouchableOpacity, 
  StyleSheet,
  Image
} from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';
import { api } from '../utils';
import { handleFileSelect } from './FileSelector';

interface AddCreatorModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
}

interface CreatorForm {
  profilePicture: string;
  tiktokUsername: string;
  instagramURL: string;
  xURL: string;
  facebookURL: string;
}

const AddCreatorModal: React.FC<AddCreatorModalProps> = ({ 
  visible, 
  onClose,
  email
}) => {
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [isUrlInput, setIsUrlInput] = useState<boolean>(false);
  const [creatorForm, setCreatorForm] = useState<CreatorForm>({
    profilePicture: '',
    tiktokUsername: '',
    instagramURL: '',
    xURL: '',
    facebookURL: '',
  });

  const handleFileUpload = async () => {
    try {
      const file = await handleFileSelect();
      if (!file) return;

      // Clear URL input if it exists
      setProfileImageUrl('');
      setIsUrlInput(false);

      // TODO: Implement S3 upload here
      // For now, use a temporary URL
      const tempUrl = URL.createObjectURL(file);
      setProfileImagePreview(tempUrl);
      setCreatorForm(prev => ({
        ...prev,
        profilePicture: tempUrl
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    }
  };

  const handleUrlInput = () => {
    // Clear file upload if it exists
    setProfileImagePreview(null);
    setCreatorForm(prev => ({
        ...prev,
        profilePicture: ''
    }));
    setIsUrlInput(true);
  };

  const handleUrlChange = (text: string) => {
    setProfileImageUrl(text);
    
    // Automatically update preview and form value
    setProfileImagePreview(text);
    setCreatorForm(prev => ({
      ...prev,
      profilePicture: text
    }));
  };

  const submitCreatorData = async () => {
    try {
      // Validate required fields
      if (!creatorForm.tiktokUsername) {
        Alert.alert('Error', 'TikTok username is required');
        return;
      }

      const payload = {
        profile_picture_url: profileImagePreview,
        tiktok_username: creatorForm.tiktokUsername,
        instagram_username: creatorForm.instagramURL,
        x_username: creatorForm.xURL,
        facebook_username: creatorForm.facebookURL,
        email: email
      };

      const response = await api.post('/api/add-creator/', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Your social media profiles have been added successfully!');
        // Reset form
        setCreatorForm({
          profilePicture: '',
          tiktokUsername: '',
          instagramURL: '',
          xURL: '',
          facebookURL: '',
        });
        setProfileImagePreview(null);
        setProfileImageUrl('');
        setIsUrlInput(false);
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add your social media profiles. Please try again.');
      console.error('Error submitting creator data:', error);
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Your Social Media Profiles</Text>
          <Text style={styles.message}>
            Add your social media profiles to help others find and follow you across platforms.
          </Text>

          {/* Profile Picture Options */}
          <View style={styles.profilePictureOptions}>
            <TouchableOpacity 
              onPress={handleFileUpload} 
              style={[
                styles.uploadButton,
                !isUrlInput && styles.activeOption
              ]}
            >
              <Text style={styles.uploadButtonText}>
                Upload Picture
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleUrlInput}
              style={[
                styles.uploadButton,
                isUrlInput && styles.activeOption
              ]}
            >
              <Text style={styles.uploadButtonText}>
                Use URL
              </Text>
            </TouchableOpacity>
          </View>

          {isUrlInput && (
            <View style={styles.urlInputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter image URL"
                value={profileImageUrl}
                onChangeText={handleUrlChange}
              />
            </View>
          )}

          {profileImagePreview && (
            <Image source={{ uri: profileImagePreview }} style={styles.profileImagePreview} />
          )}

          <TextInput
            style={styles.input}
            placeholder="TikTok Username"
            value={creatorForm.tiktokUsername}
            onChangeText={(text) => setCreatorForm((prev) => ({ ...prev, tiktokUsername: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Instagram URL"
            value={creatorForm.instagramURL}
            onChangeText={(text) => setCreatorForm((prev) => ({ ...prev, instagramURL: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="X (Twitter) URL"
            value={creatorForm.xURL}
            onChangeText={(text) => setCreatorForm((prev) => ({ ...prev, xURL: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Facebook URL"
            value={creatorForm.facebookURL}
            onChangeText={(text) => setCreatorForm((prev) => ({ ...prev, facebookURL: text }))}
          />

          {/* Buttons Row */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitCreatorData}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
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
  uploadButton: {
    backgroundColor: colors.neonBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
    marginBottom: 15,
    ...shadows.sm,
  },
  uploadButtonText: {
    color: colors.primaryText,
    fontSize: typography.button.fontSize,
    fontWeight: 'bold',
  },
  profileImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
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
  submitButton: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: borderRadius.md,
    flex: 1,
    marginLeft: 10,
    ...shadows.sm,
  },
  submitButtonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: typography.button.fontSize,
  },
  profilePictureOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  activeOption: {
    backgroundColor: colors.neonPurple,
    borderColor: colors.neonBlue,
    borderWidth: 2,
  },
  urlInputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  urlSubmitButton: {
    backgroundColor: colors.neonBlue,
    padding: 8,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: 5,
    ...shadows.sm,
  },
  urlSubmitText: {
    color: colors.primaryText,
    fontSize: typography.button.fontSize,
    fontWeight: 'bold',
  },
});

export default AddCreatorModal; 