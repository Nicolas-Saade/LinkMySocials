import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

// Importing images
import FacebookLogo from '../assets/Facebook-logo-reg.png';
import InstagramLogo from '../assets/Insta-logo-reg.png';
import RedditLogo from '../assets/reddit-logo-reg.png';
import XLogo from '../assets/X-logo-reg.webp';
import { ScrollView } from 'react-native-web';

const FilterModal = ({ visible, onClose, onSelectPlatform }) => {
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    console.log("selectedPlatforms", onSelectPlatform);
  
    // Toggle selection of a platform
    const togglePlatform = (platform) => {
      setSelectedPlatforms((prev) => {
        if (prev.includes(platform)) {
          return prev.filter((item) => item !== platform); // Remove if already selected
        }
        return [...prev, platform]; // Add if not already selected
      });
    };
  
    // Check if a platform is selected
    const isPlatformSelected = (platform) => selectedPlatforms.includes(platform);
  
    return (
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Filter by Platform</Text>
    
                <View style={styles.optionContainer}>
                <TouchableOpacity
                    onPress={() => togglePlatform('facebook')}
                    style={styles.optionButton}
                >
                    <Image source={FacebookLogo} style={styles.platformIcon} />
                    <Text style={styles.optionText}>Facebook</Text>
                    <View style={styles.checkbox}>
                    {isPlatformSelected('facebook') && <View style={styles.checkboxSelected} />}
                    </View>
                </TouchableOpacity>
                </View>
    
                <View style={styles.optionContainer}>
                <TouchableOpacity
                    onPress={() => togglePlatform('instagram')}
                    style={styles.optionButton}
                >
                    <Image source={InstagramLogo} style={styles.platformIcon} />
                    <Text style={styles.optionText}>Instagram</Text>
                    <View style={styles.checkbox}>
                    {isPlatformSelected('instagram') && <View style={styles.checkboxSelected} />}
                    </View>
                </TouchableOpacity>
                </View>
    
                <View style={styles.optionContainer}>
                <TouchableOpacity
                    onPress={() => togglePlatform('x')}
                    style={styles.optionButton}
                >
                    <Image source={XLogo} style={styles.platformIcon} />
                    <Text style={styles.optionText}>X</Text>
                    <View style={styles.checkbox}>
                    {isPlatformSelected('x') && <View style={styles.checkboxSelected} />}
                    </View>
                </TouchableOpacity>
                </View>
    
                <View style={styles.optionContainer}>
                <TouchableOpacity
                    onPress={() => togglePlatform('reddit')}
                    style={styles.optionButton}
                >
                    <Image source={RedditLogo} style={styles.platformIcon} />
                    <Text style={styles.optionText}>Reddit</Text>
                    <View style={styles.checkbox}>
                    {isPlatformSelected('reddit') && <View style={styles.checkboxSelected} />}
                    </View>
                </TouchableOpacity>
                </View>
    
                <TouchableOpacity
                    onPress={() => {
                    console.log('selectedPlatforms in FilterModal:', selectedPlatforms); // Debug here
                    onSelectPlatform(selectedPlatforms); // Pass the selected platforms to the parent
                    onClose(); // Close the modal
                    }}
                    style={styles.applyButton}
                >
                <Text style={styles.modalApplyButtonText}>Apply Filter</Text>
                </TouchableOpacity>
    
                <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
            </View>
        </Modal>
    </ScrollView>
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
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1, // Add this for debugging
        borderColor: 'red', // Add this for debugging
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    optionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 5,
      backgroundColor: '#f9f9f9',
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    platformIcon: {
      width: 30,
      height: 30,
      resizeMode: 'contain',
      marginRight: 10,
    },
    optionText: {
      fontSize: 16,
      color: '#333',
      flex: 1,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: '#333',
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      width: 14,
      height: 14,
      backgroundColor: '#007bff',
      borderRadius: 3,
    },
    applyButton: {
        backgroundColor: '#00ff00', // Bright green background
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    modalApplyButtonText: {
      color: '#000',
      fontSize: 16,
    },
    modalCloseButton: {
      backgroundColor: '#f44336',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginTop: 10,
      width: '100%',
      alignItems: 'center',
    },
    modalCloseButtonText: {
      color: '#fff',
      fontSize: 16,
    },
  });
  
  export default FilterModal;