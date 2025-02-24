import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';
import { api, openUrl } from '../utils';
import facebookIcon from '../assets/Facebook-logo-reg.png'; // Regular Facebook icon
import facebookIconPlaceholder from '../assets/facebook-logo-not.png'; // Placeholder for missing URL
import instagramIcon from '../assets/Insta-logo-reg.png'; // Regular Instagram icon
import instagramIconPlaceholder from '../assets/Insta-logo-not.png'; // Placeholder for missing URL
import twitterIcon from '../assets/X-logo-reg.webp'; // Regular X (Twitter) icon
import twitterIconPlaceholder from '../assets/X-logo-not.png'; // Placeholder for missing URL
import redditIcon from '../assets/reddit-logo-reg.png'; // Regular Reddit icon
import redditIconPlaceholder from '../assets/reddit-logo-not.png'; // Placeholder for missing URL
import placeHolder from '../assets/Neutral-placeholder-profile.jpg';

const CustomProfileBox = ({ 
  name, 
  profilePicture,
  initialData = null,
  email
}) => {
  const [socials_username, setSocialsUsername] = useState(null);
  const [userData, setUserData] = useState(initialData || {
    facebook_username: '',
    instagram_username: '',
    x_username: '',
    reddit_username: '',
    profile_picture_url: ''
  });
  const [loading, setLoading] = useState(!(!email || email === ''));
  const [error, setError] = useState(null);

  const fetchUserData = async (userEmail) => {
    // Only fetch if email is NOT empty
    if (!userEmail || userEmail === '') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("FETCHING USER DATA FOR", userEmail);
      const response = await api.get(`/api/get-single-data/${userEmail}/`);

      if (response.status === 200 && response.data.message === "No data found!") {
        setUserData({
          facebook_username: '',
          instagram_username: '',
          x_username: '',
          reddit_username: '',
          profile_picture_url: ''
        });
      }
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        setUserData(response.data.data[0]);
        console.log('Fetched user data:', response.data.data[0]);
        setSocialsUsername(response.data.data[0].tiktok_username);
      } else {
        setUserData({
          facebook_username: '',
          instagram_username: '',
          x_username: '',
          reddit_username: '',
          profile_picture_url: ''
        });
      }

      console.log("FETCHED RESPONSE", response.data.data[0]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.message);
      setUserData({
        facebook_username: '',
        instagram_username: '',
        x_username: '',
        reddit_username: '',
        profile_picture_url: ''
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData(email);
  }, [email]);

  // Helper function to determine which icon to use
  const getSocialIcon = (platform) => {

    switch (platform) {
      case 'facebook':
        return userData.facebook_username ? facebookIcon : facebookIconPlaceholder;
      case 'instagram':
        return userData.instagram_username ? instagramIcon : instagramIconPlaceholder;
      case 'twitter':
        return userData.x_username ? twitterIcon : twitterIconPlaceholder;
      case 'reddit':
        return userData.reddit_username ? redditIcon : redditIconPlaceholder;
      default:
        return null;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.box, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <View style={styles.contentContainer}>
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ 
                uri: userData?.profile_picture_url || profilePicture || placeHolder 
              }}
              style={styles.image}
              onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            />
            <View style={styles.plusOverlay}>
              <Text style={styles.plusText}>+</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.iconsSection}>
          <TouchableOpacity 
            onPress={() => userData.facebook_username && openUrl(userData.facebook_username)}
            disabled={!userData.facebook_username}
          >
            <Image 
              source={getSocialIcon('facebook')} 
              style={[styles.icon, !userData.facebook_username && styles.placeholderIcon]} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => userData.instagram_username && openUrl(userData.instagram_username)}
            disabled={!userData.instagram_username}
          >
            <Image 
              source={getSocialIcon('instagram')} 
              style={[styles.icon, !userData.instagram_username && styles.placeholderIcon]} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => userData.x_username && openUrl(userData.x_username)}
            disabled={!userData.x_username}
          >
            <Image 
              source={getSocialIcon('twitter')} 
              style={[styles.icon, !userData.x_username && styles.placeholderIcon]} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => userData.reddit_username && openUrl(userData.reddit_username)}
            disabled={!userData.reddit_username}
          >
            <Image 
              source={getSocialIcon('reddit')} 
              style={[styles.icon, !userData.reddit_username && styles.placeholderIcon]} 
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text 
        style={styles.name}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {socials_username ? socials_username : name}
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    opacity: 0.7,
  },
  name: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    maxWidth: '90%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.secondaryText,
    fontSize: typography.body.fontSize,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default CustomProfileBox;