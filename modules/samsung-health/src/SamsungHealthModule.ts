import { NativeModulesProxy } from 'expo-modules-core';

// Debug logging to help identify the issue
if (__DEV__) {
  console.log('NativeModulesProxy keys:', Object.keys(NativeModulesProxy));
  console.log('SamsungHealth module:', NativeModulesProxy.SamsungHealth);
}

// Export the native module proxy with error checking
const SamsungHealthModule = NativeModulesProxy.SamsungHealth;

if (!SamsungHealthModule) {
  console.error('Samsung Health native module not found. Available modules:', Object.keys(NativeModulesProxy));
  throw new Error('Samsung Health native module not available. Make sure you are using a development build and not Expo Go.');
}

export default SamsungHealthModule;