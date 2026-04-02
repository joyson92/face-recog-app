import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from './src/screens/CameraScreen';
import AttendanceListScreen from './src/screens/AttendanceListScreen';
import Toast from 'react-native-toast-message';
import HomePage from './src/HomePage';

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  AttendanceList: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Camera">

          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{ headerShown: false }}
          />

          {/* NEW SCREEN */}
          <Stack.Screen
            name="AttendanceList"
            component={AttendanceListScreen}
            options={{ title: 'Attendance' }}
          />

        </Stack.Navigator>
      </NavigationContainer>

      <Toast />
    </SafeAreaProvider>
  );
};

export default App;
