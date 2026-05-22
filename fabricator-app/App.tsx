import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useFabricatorStore } from './src/state/useFabricatorStore';
import { colors } from './src/theme/theme';

export default function App() {
  const hasLoadedAppData = useFabricatorStore(state => state.hasLoadedAppData);
  const loadAppData = useFabricatorStore(state => state.loadAppData);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  if (!hasLoadedAppData) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.black }}>
        <StatusBar style="light" backgroundColor={colors.black} />
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={colors.black} />
      <AppNavigator />
    </NavigationContainer>
  );
}
