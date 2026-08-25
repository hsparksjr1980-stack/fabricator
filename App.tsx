import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import {
  AuthProvider,
  useAuth,
} from './src/auth/AuthProvider';

import { AuthScreen } from './src/auth/AuthScreen';

import { AppNavigator } from './src/navigation/AppNavigator';

import { useFabricatorStore } from './src/state/useFabricatorStore';

import { AppErrorBoundary } from './src/components/AppErrorBoundary';

import { colors } from './src/theme/theme';

function RootNavigation() {
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

  return session ? <AppNavigator /> : <AuthScreen />;
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

  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <StatusBar
          style="light"
          backgroundColor={colors.black}
        />

        <AuthProvider>
          <NavigationContainer>
            {!hasLoadedAppData ? (
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
            ) : (
              <RootNavigation />
            )}
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
