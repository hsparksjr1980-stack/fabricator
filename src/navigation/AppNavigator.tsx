import { Alert, Image, Pressable, View } from 'react-native';
import React from 'react';
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
import { ProjectManagementModal } from '@/components/modals/ProjectManagementModal';
import { useFabricatorStore } from '@/state/useFabricatorStore';

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

const Stack =
  createNativeStackNavigator<
    RootStackParamList,
    'RootStack'
  >();
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

const [
  projectModalVisible,
  setProjectModalVisible,
] = React.useState(false);

const store =
  useFabricatorStore();

const activeProject =
  store.activeProject();

  return (
    <>
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
              onPress={() => setProjectModalVisible(true)}
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
              onPress={() => setProjectModalVisible(true)}
            >
              <MaterialCommunityIcons
                name="folder-multiple-outline"
                size={22}
                color={colors.orange}
              />
            </Pressable>

            <Pressable
            onPress={() => navigation.navigate('ProjectEdit' as never)}


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
          height: 86,
          paddingBottom: 16,
          paddingTop: 8,
          borderRadius: radius.xl,
        },

        tabBarActiveTintColor: colors.orange,

        tabBarInactiveTintColor: colors.steel,

        tabBarHideOnKeyboard: true,

        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '900',
          letterSpacing: 0,
          lineHeight: 12,
        },

        tabBarIcon: ({ color, size, focused }) => (
          <MaterialCommunityIcons
            name={tabIcons[route.name]}
            color={color}
            size={focused ? size + 4 : size}
          />
        ),
      })}
    >
      <Tabs.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: '',
          tabBarLabel: 'Home',
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
          title: 'Shop Help',
          tabBarLabel: 'Help',
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

    <ProjectManagementModal
      visible={projectModalVisible}
      projectStatus={activeProject?.status}
      onClose={() => setProjectModalVisible(false)}
      onComplete={() => {
        if (activeProject) {
          Alert.alert(
            'Complete project?',
            'This moves the project to Completed. It remains viewable and can be archived later.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Complete Project',
                onPress: () => {
                  store.completeProject(activeProject.id);
                  setProjectModalVisible(false);
                },
              },
            ]
          );
          return;
        }
        setProjectModalVisible(false);
      }}
      onArchive={() => {
        if (activeProject) {
          Alert.alert(
            'Archive project?',
            'This moves the project to Archived. It remains viewable and can be reopened later.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Archive Project',
                onPress: () => {
                  store.archiveProject(activeProject.id);
                  setProjectModalVisible(false);
                },
              },
            ]
          );
          return;
        }
        setProjectModalVisible(false);
      }}
      onReopen={() => {
        if (activeProject) {
          Alert.alert(
            'Reopen project?',
            'This returns the project to Active and clears completed/archive timestamps.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Reopen Project',
                onPress: () => {
                  store.reopenProject(activeProject.id);
                  setProjectModalVisible(false);
                },
              },
            ]
          );
          return;
        }
        setProjectModalVisible(false);
      }}
    />
  </>
  );
}
export function AppNavigator() {
  return (
    <Stack.Navigator
      id="RootStack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
      />

      <Stack.Screen
        name="ProjectEdit"
        component={ProjectEditScreen}
      />

      <Stack.Screen
        name="Main"
        component={MainTabs}
      />
    </Stack.Navigator>
  );
}
