import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { colors, typography, borderRadius, shadows } from '../theme';

const SearchBar = ({ onSearch, placeholder, style }) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        onChangeText={onSearch}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 400,
    marginHorizontal: 15,
  },
  input: {
    backgroundColor: colors.secondaryBg,
    color: colors.primaryText,
    fontSize: typography.body.fontSize,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadows.sm,
  },
});

export default SearchBar;