import axios from 'axios';
import { Platform, Linking } from 'react-native';

const AWS_BASE_URL = 'https://link-my-socials.com/' ; /*'https://link-my-socials.com/'; 'http://127.0.0.1:8000/; */

// Determine the base URL
const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000' // Android Emulator (local backend)
    : Platform.OS === 'ios'
    ? 'http://127.0.0.1:8000' // iOS Simulator (local backend)
    : AWS_BASE_URL; // Default to AWS when running in production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const openUrl = async (url) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error("Don't know how to open URL: ", url);
    }
  } catch (error) {
    console.error('An error occurred', error);
  }
};

export { api, openUrl };
