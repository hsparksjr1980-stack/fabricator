import { Image, Pressable, View } from 'react-native';
import {
  
  NavigatorScreenParams,
  useNavigation,
} from '@react-navigation/native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, radius } from '@/theme/theme';

import { WelcomeScreen } from '@/features/projects/WelcomeScreen';
import { DashboardScreen } from '@/features/projects/DashboardScreen';
import { ProjectEditScreen } from '@/features/projects/ProjectEditScreen';

import { TimelineScreen } from '@/features/buildLog/TimelineScreen';
import { TasksScreen } from '@/features/tasks/TasksScreen';
import { PartsScreen } from '@/features/parts/PartsScreen';
import { PhotosScreen } from '@/features/photos/PhotosScreen';
import { RenderScreen } from '@/features/rendering/RenderScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';

import { AppText } from '@/components/Text';

type MainTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Parts: undefined;
  Photos: undefined;
  Advisor: undefined;
  Log: undefined;
  Settings: undefined;
};

type RootStackParamList = {
  Welcome: undefined;
  ProjectEdit: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<
  string,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  Dashboard: 'view-dashboard',
  Tasks: 'clipboard-check',
  Parts: 'package-variant',
  Photos: 'image-multiple',
  Advisor: 'robot-industrial',
  Log: 'timeline-text',
  Settings: 'cog',
};

const HeaderBrand = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Image
        source={require('../../assets/fabricator-logo.png')}
        style={{
          width: 38,
          height: 38,
          resizeMode: 'contain',
        }}
      />

      <View>
        <AppText
          style={{
            color: colors.white,
            fontSize: 18,
            fontWeight: '900',
            letterSpacing: 0.5,
          }}
        >
          Fabricator
        </AppText>

        <AppText
          style={{
            color: colors.steel,
            fontSize: 10,
            fontWeight: '700',
            marginTop: -2,
          }}
        >
          Garage Workflow OS
        </AppText>
      </View>
    </View>
  );
};

function MainTabs() {
  const navigation = useNavigation();

  return (
    <Tabs.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.black,
        },

        headerTintColor: colors.white,

        headerTitleAlign: 'left',

        headerTitle: () => <HeaderBrand />,

        headerShadowVisible: false,

        sceneStyle: {
          backgroundColor: colors.black,
        },

        headerLeft: () =>
          route.name === 'Dashboard' ? null : (
            <Pressable
              style={{ marginLeft: 14 }}
              onPress={() => navigation.navigate('Main' as never)}
            >
              <MaterialCommunityIcons
                name="view-dashboard"
                size={24}
                color={colors.orange}
              />
            </Pressable>
          ),

        headerRight: () => (
          <View
            style={{
              flexDirection: 'row',
              gap: 14,
              marginRight: 12,
            }}
          >
            <Pressable
              onPress={() =>
                navigation.getParent()?.navigate('Welcome' as never)
              }
            >
              <MaterialCommunityIcons
                name="folder-multiple-outline"
                size={22}
                color={colors.orange}
              />
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.getParent()?.navigate(
                  'ProjectEdit' as never
                )
              }
            >
              <MaterialCommunityIcons
                name="square-edit-outline"
                size={22}
                color={colors.white}
              />
            </Pressable>
          </View>
        ),

        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 18,
          backgroundColor: colors.panelHigh,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.line,
          height: 78,
          paddingBottom: 12,
          paddingTop: 10,
          borderRadius: radius.xl,
        },

        tabBarActiveTintColor: colors.orange,

        tabBarInactiveTintColor: colors.steel,

        tabBarHideOnKeyboard: true,

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          letterSpacing: 0.5,
        },

        tabBarIcon: ({ color, size, focused }) => (
          <MaterialCommunityIcons
            name={tabIcons[route.name]}
            color={color}
            size={focused ? size + 7 : size + 2}
          />
        ),
      })}
    >
      <Tabs.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: '',
        }}
      />

      <Tabs.Screen
        name="Tasks"
        component={TasksScreen}
      />

      <Tabs.Screen
        name="Parts"
        component={PartsScreen}
      />

      <Tabs.Screen
        name="Photos"
        component={PhotosScreen}
      />

      <Tabs.Screen
        name="Advisor"
        component={RenderScreen}
        options={{
          title: 'Shop Assistant',
        }}
      />

      <Tabs.Screen
        name="Log"
        component={TimelineScreen}
      />

      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  return (
    
      <Stack.Navigator
        id="RootStack"
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.black,
          },

          headerTintColor: colors.white,

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
            headerShown: false,
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
                  navigation.navigate('Main' as never)
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