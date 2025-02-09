import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';
import { openUrl } from '../utils';
import facebookIcon from '../assets/Facebook-logo-reg.png'; // Regular Facebook icon
import facebookIconPlaceholder from '../assets/facebook-logo-not.png'; // Placeholder for missing URL
import instagramIcon from '../assets/Insta-logo-reg.png'; // Regular Instagram icon
import instagramIconPlaceholder from '../assets/Insta-logo-not.png'; // Placeholder for missing URL
import twitterIcon from '../assets/X-logo-reg.webp'; // Regular X (Twitter) icon
import twitterIconPlaceholder from '../assets/X-logo-not.png'; // Placeholder for missing URL
import redditIcon from '../assets/reddit-logo-reg.png'; // Regular Reddit icon
import redditIconPlaceholder from '../assets/reddit-logo-not.png'; // Placeholder for missing URL
import placeHolder from '../assets/Neutral-placeholder-profile.jpg';


const ProfileBox = ({ name, profilePicture, instagramUrl, facebookUrl, twitterUrl, redditUrl }) => {
  return (
    <View style={styles.box}>
      <View style={styles.row}>
        {/* Profile Picture */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: profilePicture || placeHolder }} // Placeholder for profile picture
            style={styles.image} 
          />
        </View>
        {/* Social Media Icons */}
        <View style={styles.iconsContainer}>
          <TouchableOpacity 
            onPress={() => facebookUrl && openUrl(facebookUrl)} 
            disabled={!facebookUrl} // Disable button if URL is null
          >
            <Image 
              source={facebookUrl ? facebookIcon : facebookIconPlaceholder} 
              style={[styles.icon, !facebookUrl && styles.placeholderIcon]} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => instagramUrl && openUrl(instagramUrl)} 
            disabled={!instagramUrl} // Disable button if URL is null
          >
            <Image 
              source={instagramUrl ? instagramIcon : instagramIconPlaceholder} 
              style={[styles.icon, !instagramUrl && styles.placeholderIcon, { resizeMode: 'contain' }]} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => twitterUrl && openUrl(twitterUrl)} 
            disabled={!twitterUrl} // Disable button if URL is null
          >
            <Image 
              source={twitterUrl ? twitterIcon : twitterIconPlaceholder} 
              style={[styles.icon, !twitterUrl && styles.placeholderIcon]} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => redditUrl && openUrl(redditUrl)} 
            disabled={!redditUrl} // Disable button if URL is null
          >
            <Image 
              source={redditUrl ? redditIcon : redditIconPlaceholder} 
              style={[styles.icon, !redditUrl && styles.placeholderIcon]} 
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Username */}
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
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    width: '100%',
    minHeight: 160,
    ...shadows.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
  },
  imageContainer: {
    marginRight: 15,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondaryBg,
  },
  name: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    maxWidth: '90%',
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
    opacity: 0.7,
  },
});

export default ProfileBox;