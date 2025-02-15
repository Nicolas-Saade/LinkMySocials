import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Platform } from 'react-native';
import { colors, typography, spacing, shadows, borderRadius } from '../theme';

const WelcomeScreen2 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.gradientOverlay} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Let's Get Started! 🎉</Text>
        <Text style={styles.subtitle}>
          Follow these simple steps to migrate your TikTok data
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4 Easy Steps to Freedom 🚀</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Open your TikTok Profile and tap the menu button (≡) in the top right
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Navigate to Settings and Privacy → Account → Download your data
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Select "Profiles and posts + Activity" and choose JSON format
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Request data, wait a moment, then download from the Download Data tab
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.videoSection}>
          <Text style={styles.videoTitle}>Need a Visual Guide? 🎥</Text>
          <TouchableOpacity
            style={styles.watchButton}
            onPress={() => Linking.openURL('https://example.com/tutorial')}
          >
            <Text style={styles.watchButtonText}>Watch Tutorial Video</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.migrateButton}
          onPress={() => navigation.navigate('HomeScreen')}
        >
          <Text style={styles.migrateButtonText}>Start Migration</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    height: '30%',
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
    padding: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.primaryText,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.h3,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.secondaryBg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.neonBlue,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  stepsContainer: {
    gap: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    backgroundColor: colors.neonPink,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  stepNumberText: {
    ...typography.bodyBold,
    color: colors.primaryText,
  },
  stepText: {
    flex: 1,
    ...typography.body,
    color: colors.secondaryText,
  },
  videoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  videoTitle: {
    ...typography.h3,
    color: colors.neonPurple,
    marginBottom: spacing.md,
  },
  watchButton: {
    backgroundColor: colors.secondaryBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.neonPurple,
    ...shadows.sm,
  },
  watchButtonText: {
    ...typography.button,
    color: colors.primaryText,
  },
  migrateButton: {
    backgroundColor: colors.neonBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.md,
  },
  migrateButtonText: {
    ...typography.button,
    color: colors.primaryText,
  },
});

export default WelcomeScreen2;