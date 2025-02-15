import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';
import facebookIcon from '../assets/Facebook-logo-reg.png'; // Regular Facebook icon
import facebookIconPlaceholder from '../assets/facebook-logo-not.png'; // Placeholder for missing URL
import instagramIcon from '../assets/Insta-logo-reg.png'; // Regular Instagram icon
import instagramIconPlaceholder from '../assets/Insta-logo-not.png'; // Placeholder for missing URL
import twitterIcon from '../assets/X-logo-reg.webp'; // Regular X (Twitter) icon
import twitterIconPlaceholder from '../assets/X-logo-not.png'; // Placeholder for missing URL
import redditIcon from '../assets/reddit-logo-reg.png'; // Regular Reddit icon
import redditIconPlaceholder from '../assets/reddit-logo-not.png'; // Placeholder for missing URL
import placeHolder from '../assets/Neutral-placeholder-profile.jpg';
import plusPhoto from '../assets/Custom-placeholder-profile.png'

const CustomProfileBox = ({ name, profilePicture }) => {
  const handleSocialAction = (platform) => {
    Alert.alert(
      `${platform}`,
      `Choose an action for ${platform}:`,
      [
        { text: 'Redirect', onPress: () => console.log(`Redirecting to ${platform}...`) },
        { text: 'Add Credential', onPress: () => console.log(`Adding credential for ${platform}...`) },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.box}>
      <View style={styles.contentContainer}>
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: profilePicture || placeHolder }}
              style={styles.image} 
            />
            <View style={styles.plusOverlay}>
              <Text style={styles.plusText}>+</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.iconsSection}>
          <TouchableOpacity onPress={() => handleSocialAction('Facebook')}>
            <Image 
              source={facebookIconPlaceholder} 
              style={styles.icon} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSocialAction('Instagram')}>
            <Image 
              source={instagramIconPlaceholder} 
              style={styles.icon} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSocialAction('Twitter')}>
            <Image 
              source={twitterIconPlaceholder} 
              style={styles.icon} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSocialAction('Reddit')}>
            <Image 
              source={redditIconPlaceholder} 
              style={styles.icon} 
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text 
        style={styles.name}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.secondaryBg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neonBlue,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    width: '100%',
    minHeight: 160,
    ...shadows.md,
  },
  contentContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageSection: {
    flex: 0.7,
    alignItems: 'flex-start',
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginRight: 15,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondaryBg,
  },
  plusOverlay: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neonBlue,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  plusText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: 80,
    paddingVertical: 5,
    marginRight: 10,
  },
  icon: {
    width: 20,
    height: 20,
    marginBottom: 3,
    backgroundColor: 'transparent',
  },
  name: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    maxWidth: '90%',
  },
});

export default CustomProfileBox;