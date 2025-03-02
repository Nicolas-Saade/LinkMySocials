import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  Alert,
  TouchableOpacity, 
  StyleSheet,
  Image,
  ScrollView,
  Switch,
  Linking,
  ActivityIndicator
} from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';
import { api } from '../utils';
import { handleFileSelect } from './FileSelector';

interface AddCreatorModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  onSubmitSuccess?: () => void;
  initialData?: {
    profilePicture: string;
    tiktokUsername: string;
    instagramURL: string;
    xURL: string;
    facebookURL: string;
  } | null;
}

interface CreatorForm {
  profilePicture: string;
  tiktokUsername: string;
  instagramURL: string;
  xURL: string;
  facebookURL: string;
}

interface PlatformStatus {
  tiktok: boolean;
  instagram: boolean;
  twitter: boolean;
  facebook: boolean;
}

const AddCreatorModal: React.FC<AddCreatorModalProps> = ({ 
  visible, 
  onClose,
  email,
  onSubmitSuccess,
  initialData = null
}) => {
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(initialData?.profilePicture || null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>(initialData?.profilePicture || '');
  const [isUrlInput, setIsUrlInput] = useState<boolean>(!!initialData?.profilePicture);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [creatorForm, setCreatorForm] = useState<CreatorForm>({
    profilePicture: initialData?.profilePicture || '',
    tiktokUsername: initialData?.tiktokUsername || '',
    instagramURL: initialData?.instagramURL || '',
    xURL: initialData?.xURL || '',
    facebookURL: initialData?.facebookURL || '',
  });

  // Track which platforms are enabled/disabled
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus>({
    tiktok: !!initialData?.tiktokUsername,
    instagram: !!initialData?.instagramURL,
    twitter: !!initialData?.xURL,
    facebook: !!initialData?.facebookURL,
  });

  // Store original values for comparison and reset
  const [originalValues, setOriginalValues] = useState<CreatorForm>({
    profilePicture: initialData?.profilePicture || '',
    tiktokUsername: initialData?.tiktokUsername || '',
    instagramURL: initialData?.instagramURL || '',
    xURL: initialData?.xURL || '',
    facebookURL: initialData?.facebookURL || '',
  });

  // Update form when initialData changes
  useEffect(() => {
    console.log('AddCreatorModal: initialData changed', { 
      hasData: !!initialData,
      email
    });
    
    // Reset to default/empty state when initialData is null or undefined
    if (!initialData) {
      console.log('Resetting form to empty state');
      const emptyForm = {
        profilePicture: '',
        tiktokUsername: '',
        instagramURL: '',
        xURL: '',
        facebookURL: '',
      };
      
      setProfileImagePreview(null);
      setProfileImageUrl('');
      setIsUrlInput(false);
      setCreatorForm(emptyForm);
      setOriginalValues(emptyForm);
      
      // Default TikTok to enabled, others to disabled
      setPlatformStatus({
        tiktok: true,
        instagram: false,
        twitter: false,
        facebook: false,
      });
      return;
    }
    
    // Handle case when initialData is provided
    setProfileImagePreview(initialData.profilePicture);
    setProfileImageUrl(initialData.profilePicture);
    setIsUrlInput(!!initialData.profilePicture);
    
    const formData = {
      profilePicture: initialData.profilePicture || '',
      tiktokUsername: initialData.tiktokUsername || '',
      instagramURL: initialData.instagramURL || '',
      xURL: initialData.xURL || '',
      facebookURL: initialData.facebookURL || '',
    };
    
    setCreatorForm(formData);
    setOriginalValues(formData);
    
    setPlatformStatus({
      tiktok: !!initialData.tiktokUsername,
      instagram: !!initialData.instagramURL,
      twitter: !!initialData.xURL,
      facebook: !!initialData.facebookURL,
    });
  }, [initialData, email]);

  const handleFileUpload = async () => {
    let file;
    try {
      // Set loading state and select file
      setUploadingImage(true);
      file = await handleFileSelect('image');
      
      if (!file) {
        console.error('Error', 'No file selected');
        setUploadingImage(false);
        return;
      }

      // Clear URL input if it exists
      setProfileImageUrl('');
      setIsUrlInput(false);

      // Create a preview of the image immediately
      const imagePreviewUrl = URL.createObjectURL(file);
      setProfileImagePreview(imagePreviewUrl);

      // Get file extension for content type determination
      const getFileExtension = (file: File) => {
        const parts = file.name.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
      }

      const fileExtension = getFileExtension(file);
      console.log('File selected:', { name: file.name, type: file.type, extension: fileExtension }); //TODO can we jsut File.type?

      // Request presigned URLs from the backend
      const s3Response = await api.post(`/aws/generate_presigned_url/${email}/${fileExtension}/`);

      if (!s3Response.data) {
        throw new Error('Failed to generate presigned URLs');
      }

      const { user_presigned_url, general_presigned_url } = s3Response.data;
      console.log('Received presigned URLs');

      // Determine the correct content type based on file extension
      // This must exactly match what the backend expects
      let contentType;
      switch (fileExtension) {
        case 'png':
          contentType = 'image/png';
          break;
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        default:
          // Default to jpeg if unknown
          contentType = 'image/jpeg';
      }
      console.log('Using content type:', contentType);

      // Upload file to user-specific folder
      console.log('Uploading to user folder...');
      const userUploadResponse = await fetch(user_presigned_url, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file
      });

      if (!userUploadResponse.ok) {
        console.error('User folder upload failed:', userUploadResponse.status, userUploadResponse.statusText);
        throw new Error(`Failed to upload to user folder: ${userUploadResponse.statusText}`);
      }

      // Upload file to general folder
      console.log('Uploading to general folder...');
      const generalUploadResponse = await fetch(general_presigned_url, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file
      });
      
      if (!generalUploadResponse.ok) {
        console.error('General folder upload failed:', generalUploadResponse.status, generalUploadResponse.statusText);
        throw new Error(`Failed to upload to general folder: ${generalUploadResponse.statusText}`);
      }

      // Extract the base URL (removing the query parameters)
      const s3BaseUrl = general_presigned_url.split('?')[0];
      console.log('S3 URL for profile picture:', s3BaseUrl);
      
      // Update the form with the S3 URL
      setCreatorForm(prev => ({
        ...prev,
        profilePicture: s3BaseUrl
      }));

      // Also update the preview to show the uploaded image
      setProfileImagePreview(s3BaseUrl);

      Alert.alert('Success', 'Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Error Uploading PP to AWS:', error);
      // Clean up the preview if there was an error
      if (profileImagePreview && !profileImagePreview.startsWith('http')) {
        URL.revokeObjectURL(profileImagePreview);
        setProfileImagePreview(null);
      }
      Alert.alert('Error', `Failed to upload profile picture: ${error.message}`);
    } finally {
      setUploadingImage(false);
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

  const handlePlatformToggle = (platform: keyof PlatformStatus) => {
    setPlatformStatus(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));

    let fieldName: keyof CreatorForm;

    switch(platform) {
      case 'tiktok': 
        fieldName = 'tiktokUsername';
        break;
      case 'instagram':
        fieldName = 'instagramURL';
        break;
      case 'twitter':
        fieldName = 'xURL';
        break;
      case 'facebook':
        fieldName = 'facebookURL';
        break;
      default:
        return;
    }

    // If toggling off, clear the field
    if (platformStatus[platform]) {
      setCreatorForm(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    } else {
      // If toggling on, restore the original value if available
      if (originalValues[fieldName]) {
        setCreatorForm(prev => ({
          ...prev,
          [fieldName]: originalValues[fieldName]
        }));
      }
    }
  };

  const openPreview = (url: string) => {
    if (!url) return;
    
    let fullUrl = url;
    if (!url.startsWith('http')) {
      fullUrl = `https://${url}`;
    }

    try {
      Linking.openURL(fullUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not open the URL');
    }
  };

  const submitCreatorData = async () => {
    try {
      // Validate required fields - at minimum TikTok username
      if (!platformStatus.tiktok && !creatorForm.tiktokUsername) {
        Alert.alert('Error', 'TikTok username is required');
        return;
      }
      console.log("Submitting creator data");
      
      // Prepare payload with only enabled platforms
      const payload = {
        profile_picture_url: profileImagePreview,
        tiktok_username: creatorForm.tiktokUsername,
        instagram_username: platformStatus.instagram ? creatorForm.instagramURL : '',
        x_username: platformStatus.twitter ? creatorForm.xURL : '',
        facebook_username: platformStatus.facebook ? creatorForm.facebookURL : '',
        email: email
      };

      const response = await api.post('/api/add-creator/', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          response.status === 201 ? 'Creator Profile Created!' : 'Profile Updated!', 
          `Your creator profile has been ${response.status === 201 ? 'added' : 'updated'} successfully!`
        );
        
        // Update original values to match current form values
        setOriginalValues({...creatorForm});
        
        // Call the success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
        
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update your creator profile. Please try again.');
      console.error('Error submitting creator data:', error);
    }
  };

  const getFieldValueDisplay = (value: string) => {
    if (!value) return 'Not set';

    // Try to extract platform and username using regex
    const urlPattern = /^https?:\/\/(?:www\.)?([^.]+)\.com\/([^\/\s]+)/;
    const match = value.match(urlPattern);

    if (match) {
      const [_, platform, username] = match;
      return `@${username} (${platform})`;
    }
    
    // If not a URL or doesn't match pattern, truncate if too long
    if (value.length > 25) {
      return value.substring(0, 22) + '...';
    }
    
    return value;
  };

  const resetForm = () => {
    // Reset to original values
    setCreatorForm({...originalValues});
    setProfileImagePreview(originalValues.profilePicture);
    setProfileImageUrl(originalValues.profilePicture);
    setIsUrlInput(!!originalValues.profilePicture);
    
    // Reset platform status based on original values
    setPlatformStatus({
      tiktok: !!originalValues.tiktokUsername,
      instagram: !!originalValues.instagramURL,
      twitter: !!originalValues.xURL,
      facebook: !!originalValues.facebookURL,
    });
  };

  const hasChanges = () => {
    return (
      creatorForm.profilePicture !== originalValues.profilePicture ||
      creatorForm.tiktokUsername !== originalValues.tiktokUsername ||
      creatorForm.instagramURL !== originalValues.instagramURL ||
      creatorForm.xURL !== originalValues.xURL ||
      creatorForm.facebookURL !== originalValues.facebookURL
    );
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
          <View style={styles.modalContent}>
            <View style={styles.headerSection}>
              <Text style={styles.modalTitle}>Creator Dashboard</Text>
              <Text style={styles.subtitle}>
                Manage your social media presence across platforms
              </Text>
            </View>
            
            {/* Profile Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Picture</Text>
              <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                  {profileImagePreview ? (
                    <Image source={{ uri: profileImagePreview }} style={styles.profileImagePreview} />
                  ) : (
                    <View style={styles.noImageContainer}>
                      <Text style={styles.noImageText}>No Image</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.profileActions}>
                  <TouchableOpacity 
                    onPress={handleFileUpload} 
                    style={[styles.actionButton, !isUrlInput && styles.activeOption, uploadingImage && styles.disabledButton]}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <ActivityIndicator size="small" color={colors.primaryText} />
                    ) : (
                      <Text style={styles.actionButtonText}>Upload Picture</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={handleUrlInput}
                    style={[styles.actionButton, isUrlInput && styles.activeOption, uploadingImage && styles.disabledButton]}
                    disabled={uploadingImage}
                  >
                    <Text style={styles.actionButtonText}>Use URL</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {isUrlInput && (
                <View style={styles.urlInputContainer}>
                  <TextInput
                    style={[styles.input, uploadingImage && styles.disabledInput]}
                    placeholder="Enter image URL"
                    value={profileImageUrl}
                    onChangeText={handleUrlChange}
                    editable={!uploadingImage}
                  />
                </View>
              )}
            </View>
            
            {/* Platforms Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Connected Platforms</Text>
              
              {/* TikTok - Required Platform */}
              <View style={styles.platformContainer}>
                <View style={styles.platformHeader}>
                  <View style={styles.platformInfo}>
                    <Text style={styles.platformName}>TikTok</Text>
                    <View style={[
                      styles.statusIndicator, 
                      platformStatus.tiktok ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={styles.statusText}>
                        {platformStatus.tiktok ? 'Available' : 'Required'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.platformContent}>
                  {!!originalValues.tiktokUsername && (
                    <Text style={styles.currentValue}>
                      Current: {getFieldValueDisplay(originalValues.tiktokUsername)}
                    </Text>
                  )}
                  <TextInput
                    style={[
                      styles.input, 
                      !platformStatus.tiktok && styles.disabledInput
                    ]}
                    placeholder="TikTok Username (required)"
                    value={creatorForm.tiktokUsername}
                    onChangeText={(text) => setCreatorForm((prev) => ({ ...prev, tiktokUsername: text }))}
                  />
                </View>
              </View>
              
              {/* Instagram */}
              <View style={styles.platformContainer}>
                <View style={styles.platformHeader}>
                  <View style={styles.platformInfo}>
                    <Text style={styles.platformName}>Instagram</Text>
                    <View style={[
                      styles.statusIndicator, 
                      platformStatus.instagram ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={styles.statusText}>
                        {platformStatus.instagram ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={platformStatus.instagram}
                    onValueChange={() => handlePlatformToggle('instagram')}
                    trackColor={{ false: colors.divider, true: colors.neonBlue }}
                    thumbColor={platformStatus.instagram ? colors.neonPurple : '#f4f3f4'}
                  />
                </View>
                
                <View style={styles.platformContent}>
                  {!!originalValues.instagramURL && (
                    <View style={styles.valueWithPreview}>
                      <Text style={styles.currentValue}>
                        Current: {getFieldValueDisplay(originalValues.instagramURL)}
                      </Text>
                      {creatorForm.instagramURL && (
                        <TouchableOpacity 
                          onPress={() => openPreview(creatorForm.instagramURL)}
                          style={styles.previewButton}
                        >
                          <Text style={styles.previewText}>View</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  <TextInput
                    style={[
                      styles.input, 
                      !platformStatus.instagram && styles.disabledInput
                    ]}
                    placeholder="Instagram URL"
                    value={creatorForm.instagramURL}
                    onChangeText={(text) => setCreatorForm((prev) => ({ ...prev, instagramURL: text }))}
                    editable={platformStatus.instagram}
                  />
                </View>
              </View>
              
              {/* X (Twitter) */}
              <View style={styles.platformContainer}>
                <View style={styles.platformHeader}>
                  <View style={styles.platformInfo}>
                    <Text style={styles.platformName}>X (Twitter)</Text>
                    <View style={[
                      styles.statusIndicator, 
                      platformStatus.twitter ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={styles.statusText}>
                        {platformStatus.twitter ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={platformStatus.twitter}
                    onValueChange={() => handlePlatformToggle('twitter')}
                    trackColor={{ false: colors.divider, true: colors.neonBlue }}
                    thumbColor={platformStatus.twitter ? colors.neonPurple : '#f4f3f4'}
                  />
                </View>
                
                <View style={styles.platformContent}>
                  {!!originalValues.xURL && (
                    <View style={styles.valueWithPreview}>
                      <Text style={styles.currentValue}>
                        Current: {getFieldValueDisplay(originalValues.xURL)}
                      </Text>
                      {creatorForm.xURL && (
                        <TouchableOpacity 
                          onPress={() => openPreview(creatorForm.xURL)}
                          style={styles.previewButton}
                        >
                          <Text style={styles.previewText}>View</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  <TextInput
                    style={[
                      styles.input, 
                      !platformStatus.twitter && styles.disabledInput
                    ]}
                    placeholder="X (Twitter) URL"
                    value={creatorForm.xURL}
                    onChangeText={(text) => setCreatorForm((prev) => ({ ...prev, xURL: text }))}
                    editable={platformStatus.twitter}
                  />
                </View>
              </View>
              
              {/* Facebook */}
              <View style={styles.platformContainer}>
                <View style={styles.platformHeader}>
                  <View style={styles.platformInfo}>
                    <Text style={styles.platformName}>Facebook</Text>
                    <View style={[
                      styles.statusIndicator, 
                      platformStatus.facebook ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={styles.statusText}>
                        {platformStatus.facebook ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={platformStatus.facebook}
                    onValueChange={() => handlePlatformToggle('facebook')}
                    trackColor={{ false: colors.divider, true: colors.neonBlue }}
                    thumbColor={platformStatus.facebook ? colors.neonPurple : '#f4f3f4'}
                  />
                </View>
                
                <View style={styles.platformContent}>
                  {!!originalValues.facebookURL && (
                    <View style={styles.valueWithPreview}>
                      <Text style={styles.currentValue}>
                        Current: {getFieldValueDisplay(originalValues.facebookURL)}
                      </Text>
                      {creatorForm.facebookURL && (
                        <TouchableOpacity 
                          onPress={() => openPreview(creatorForm.facebookURL)}
                          style={styles.previewButton}
                        >
                          <Text style={styles.previewText}>View</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  <TextInput
                    style={[
                      styles.input, 
                      !platformStatus.facebook && styles.disabledInput
                    ]}
                    placeholder="Facebook URL"
                    value={creatorForm.facebookURL}
                    onChangeText={(text) => setCreatorForm((prev) => ({ ...prev, facebookURL: text }))}
                    editable={platformStatus.facebook}
                  />
                </View>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              {hasChanges() && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetForm}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.submitButton, !hasChanges() && styles.disabledButton]}
                onPress={submitCreatorData}
                disabled={!hasChanges()}
              >
                <Text style={styles.submitButtonText}>
                  {originalValues.tiktokUsername ? 'Update Profile' : 'Create Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 600,
    padding: 20,
    backgroundColor: colors.secondaryBg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
    maxHeight: '90%',
  },
  headerSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize * 1.5,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: typography.body.fontSize,
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 25,
  },
  sectionTitle: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize * 1.3,
    fontWeight: '600',
    marginBottom: 15,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginRight: 15,
    ...shadows.sm,
  },
  profileImagePreview: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: colors.secondaryText,
    fontSize: typography.body.fontSize,
  },
  profileActions: {
    flex: 1,
  },
  actionButton: {
    backgroundColor: colors.neonBlue,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: borderRadius.md,
    marginBottom: 10,
    ...shadows.sm,
  },
  actionButtonText: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activeOption: {
    backgroundColor: colors.neonPurple,
    borderColor: colors.neonBlue,
    borderWidth: 2,
  },
  disabledButton: {
    backgroundColor: colors.disabledBg || '#444444',
    opacity: 0.7,
  },
  urlInputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  platformContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: colors.darkBg,
    borderRadius: borderRadius.md,
    padding: 15,
    ...shadows.sm,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformName: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize * 1.2,
    fontWeight: 'bold',
    marginRight: 10,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusActive: {
    backgroundColor: colors.success,
  },
  statusInactive: {
    backgroundColor: colors.divider,
  },
  statusText: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize * 0.8,
    fontWeight: 'bold',
  },
  platformContent: {
    width: '100%',
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: colors.primaryBg,
    color: colors.primaryText,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: borderRadius.md,
    fontSize: typography.body.fontSize,
  },
  disabledInput: {
    backgroundColor: colors.disabledBg,
    color: colors.secondaryText,
  },
  currentValue: {
    color: colors.secondaryText,
    fontSize: typography.body.fontSize * 0.8,
    marginBottom: 5,
  },
  valueWithPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  previewButton: {
    backgroundColor: colors.neonBlue,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  previewText: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize * 0.8,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
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
    fontSize: typography.body.fontSize,
  },
  resetButton: {
    backgroundColor: colors.warning,
    padding: 12,
    borderRadius: borderRadius.md,
    flex: 1,
    marginRight: 10,
    ...shadows.sm,
  },
  resetButtonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: typography.body.fontSize,
  },
  submitButton: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: borderRadius.md,
    flex: 1.5,
    ...shadows.sm,
  },
  submitButtonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: typography.body.fontSize,
  },
  message: {
    color: colors.secondaryText,
    fontSize: typography.body.fontSize,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default AddCreatorModal; 