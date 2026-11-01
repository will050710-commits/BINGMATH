import {Platform} from 'react-native';

// Change this single host to your computer's LAN IP when testing on a phone.
const developmentHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = __DEV__
  ? `http://${developmentHost}:8000`
  : 'https://duomath.onrender.com';

export const WEB_BASE_URL = __DEV__
  ? `http://${developmentHost}:3000`
  : 'https://duomath.vercel.app';
