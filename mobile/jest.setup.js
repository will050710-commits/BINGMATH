import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('@react-native-firebase/auth', () => {
  const instance = {
    currentUser: null,
    onAuthStateChanged: jest.fn(callback => {
      callback(null);
      return jest.fn();
    }),
  };
  return () => instance;
});
jest.mock('react-native-linear-gradient', () => require('react-native').View);
jest.mock('react-native-webview', () => ({WebView: require('react-native').View}));
