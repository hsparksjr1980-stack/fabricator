import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { NavigationContainer } from '@react-navigation/native';

import { AppNavigator } from './src/navigation/AppNavigator';

import { useFabricatorStore } from './src/state/useFabricatorStore';

import { colors } from './src/theme/theme';

import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import { AuthScreen } from './src/auth/AuthScreen';

function RootApp() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.black,
        }}
      >
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={colors.black} />

      {session ? <AppNavigator /> : <AuthScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  const hasLoadedAppData = useFabricatorStore(
    state => state.hasLoadedAppData
  );

  const loadAppData = useFabricatorStore(
    state => state.loadAppData
  );

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  if (!hasLoadedAppData) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.black,
        }}
      >
        <StatusBar style="light" backgroundColor={colors.black} />
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
}