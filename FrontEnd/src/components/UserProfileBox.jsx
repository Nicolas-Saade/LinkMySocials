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

const CustomProfileBox = ({ 
  name, 
  profilePicture, 
  instagramUrl, 
  facebookUrl, 
  twitterUrl, 
  redditUrl, 
  onAddCredential 
}) => {
  const handleSocialAction = (platform, url) => {
    if (url) {
      openUrl(url);
    } else {
      Alert.alert(
        `${platform}`,                    
        `Add your ${platform} profile:`,
        [
          { 
            text: 'Add Credential', 
            onPress: () => onAddCredential(platform)
          },
          { 
            text: 'Cancel', 
            style: 'cancel'
          },
        ],
        { cancelable: true }  
      );
    }
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
          <TouchableOpacity 
            onPress={() => handleSocialAction('Facebook', facebookUrl)}
          >
            <Image 
              source={facebookUrl ? facebookIcon : facebookIconPlaceholder} 
              style={[styles.icon, !facebookUrl && styles.placeholderIcon]} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSocialAction('Instagram', instagramUrl)}>
            <Image 
              source={instagramUrl ? instagramIcon : instagramIconPlaceholder} 
              style={[styles.icon, !instagramUrl && styles.placeholderIcon]} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSocialAction('Twitter', twitterUrl)}>
            <Image 
              source={twitterUrl ? twitterIcon : twitterIconPlaceholder} 
              style={[styles.icon, !twitterUrl && styles.placeholderIcon]} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSocialAction('Reddit', redditUrl)}>
            <Image 
              source={redditUrl ? redditIcon : redditIconPlaceholder} 
              style={[styles.icon, !redditUrl && styles.placeholderIcon]} 
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.name}>{name}</Text>
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
  placeholderIcon: {
    opacity: 0.5,
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