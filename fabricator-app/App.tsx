import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppNavigator } from './src/navigation/AppNavigator';
import { useFabricatorStore } from './src/state/useFabricatorStore';
import { colors } from './src/theme/theme';

export default function App() {
  const hasLoadedAppData = useFabricatorStore(state => state.hasLoadedAppData);
  const loadAppData = useFabricatorStore(state => state.loadAppData);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.black} />
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
          <AppNavigator />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
