import { Pressable } from 'react-native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '@/theme/theme';

import { WelcomeScreen } from '@/features/projects/WelcomeScreen';
import { ProjectEditScreen } from '@/features/projects/ProjectEditScreen';
import { DashboardScreen } from '@/features/projects/DashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: colors.black,
          borderTopColor: '#222',
        },

        tabBarActiveTintColor: colors.orange,

        tabBarInactiveTintColor: colors.steel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.black,
        },

        headerTintColor: colors.white,

        headerTitleStyle: {
          fontWeight: '900',
        },

        headerShadowVisible: false,

        contentStyle: {
          backgroundColor: colors.black,
        },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{
          title: 'Fabricator OS',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="ProjectEdit"
        component={ProjectEditScreen}
        options={({ navigation }) => ({
          title: 'Project Configuration',

          headerRight: () => (
            <Pressable
              onPress={() =>
                navigation.navigate('Main', {
                  screen: 'Dashboard',
                } as never)
              }
            >
              <MaterialCommunityIcons
                name="view-dashboard"
                size={24}
                color={colors.orange}
              />
            </Pressable>
          ),
        })}
      />
    </Stack.Navigator>
  );
}