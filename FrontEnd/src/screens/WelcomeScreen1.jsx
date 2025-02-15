import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { colors, typography, spacing, shadows, borderRadius } from '../theme';
import { SafeAreaView } from 'react-native-web';

const WelcomeScreen1 = ({ navigation }) => {
  const { height } = useWindowDimensions();
  const isSmallScreen = height < 700;

  const dynamicStyles = {
    gradientHeight: isSmallScreen ? 150 : '30%',
    contentPadding: isSmallScreen ? 16 : spacing.xl,
    titleSize: isSmallScreen ? 24 : typography.h1.fontSize,
    subtitleSize: isSmallScreen ? 14 : typography.h3.fontSize,
    noteSize: isSmallScreen ? 12 : typography.body.fontSize,
    spacing: isSmallScreen ? 12 : spacing.lg,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.gradientOverlay, { height: dynamicStyles.gradientHeight }]} />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.scrollContent,
          { 
            padding: dynamicStyles.contentPadding,
            gap: dynamicStyles.spacing 
          }
        ]}
      >
        <View style={[styles.headerContainer, { marginBottom: dynamicStyles.spacing }]}>
          <Text style={[styles.title, { fontSize: dynamicStyles.titleSize }]}>
            Protect Your TikTok Faves!
          </Text>
          <Text style={[styles.subtitle, { fontSize: dynamicStyles.subtitleSize }]}>
            Migrate your TikTok preferences to a new platform seamlessly.
          </Text>
        </View>

        <View style={[styles.card, { padding: dynamicStyles.spacing }]}>
          <Text style={[styles.noteTitle, { fontSize: dynamicStyles.subtitleSize }]}>
            A Note from the Creator
          </Text>
          <Text style={[styles.note, { fontSize: dynamicStyles.noteSize }]}>
            Hey! I'm Nicolas, a college student who built this service with love and dedication. 
            I wanted to help us stay connected and preserve the personalized joy that TikTok brings 
            to our daily lives, just in case it ever gets banned.
            {'\n\n'}
            This service will always be free - if you find it helpful, please share it with your 
            network and loved ones!
          </Text>
        </View>

        <View style={[styles.buttonContainer, { gap: dynamicStyles.spacing / 2 }]}>
          <TouchableOpacity
            style={[styles.button, styles.tutorialButton]}
            onPress={() => navigation.navigate('WelcomeScreen2')}
          >
            <Text style={[styles.buttonText, { fontSize: dynamicStyles.subtitleSize }]}>
              Watch Tutorial
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.migrateButton]}
            onPress={() => navigation.navigate('HomeScreen')}
          >
            <Text style={[styles.buttonText, { fontSize: dynamicStyles.subtitleSize }]}>
              Migrate My Data
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0.1,
    backgroundColor: colors.neonBlue,
    ...(Platform.OS === 'web' && {
      backgroundImage: `linear-gradient(135deg, ${colors.neonBlue}, ${colors.neonPink}, ${colors.neonPurple})`,
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'center',
  },
  title: {
    color: colors.primaryText,
    textAlign: 'center',
    fontFamily: typography.h1.fontFamily,
  },
  subtitle: {
    color: colors.secondaryText,
    textAlign: 'center',
    fontFamily: typography.h3.fontFamily,
  },
  card: {
    backgroundColor: colors.secondaryBg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.neonPink,
  },
  noteTitle: {
    color: colors.neonPink,
    fontFamily: typography.h3.fontFamily,
    marginBottom: 8,
  },
  note: {
    color: colors.secondaryText,
    fontFamily: typography.body.fontFamily,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    ...shadows.sm,
  },
  tutorialButton: {
    backgroundColor: colors.secondaryBg,
    borderWidth: 2,
    borderColor: colors.neonBlue,
  },
  migrateButton: {
    backgroundColor: colors.neonBlue,
  },
  buttonText: {
    color: colors.primaryText,
    fontFamily: typography.button.fontFamily,
  },
});

export default WelcomeScreen1;