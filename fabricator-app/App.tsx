import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/theme';
export default function App() { return <NavigationContainer><StatusBar style="light" backgroundColor={colors.black} /><AppNavigator /></NavigationContainer>; }
