import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from './src/screens/CameraScreen'
import Toast from 'react-native-toast-message';
import HomePage from './src/HomePage';

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <CameraScreen />
      </NavigationContainer>
      <Toast />
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;
