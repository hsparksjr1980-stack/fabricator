import { Image, Pressable, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius } from '@/theme/theme';
import { WelcomeScreen } from '@/features/projects/WelcomeScreen';
import { DashboardScreen } from '@/features/projects/DashboardScreen';
import { ProjectEditScreen } from '@/features/projects/ProjectEditScreen';
import { SessionScreen } from '@/features/sessions/SessionScreen';
import { TimelineScreen } from '@/features/buildLog/TimelineScreen';
import { TasksScreen } from '@/features/tasks/TasksScreen';
import { PartsScreen } from '@/features/parts/PartsScreen';
import { PhotosScreen } from '@/features/photos/PhotosScreen';
import { RenderScreen } from '@/features/rendering/RenderScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { AppText } from '@/components/Text';

const Tabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Dashboard: 'view-dashboard',
  Tasks: 'clipboard-check',
  Parts: 'package-variant',
  Session: 'calendar-check',
  Photos: 'image-multiple',
  Advisor: 'robot-industrial',
  Log: 'timeline-text',
  Settings: 'cog'
};

const HeaderBrand=()=> (
  <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
    <Image
      source={require('../../assets/fabricator-logo.png')}
      style={{width:38,height:38,resizeMode:'contain'}}
    />

    <View>
      <AppText style={{color:colors.white,fontSize:18,fontWeight:'900',letterSpacing:0.5}}>
        Fabricator
      </AppText>

      <AppText style={{color:colors.steel,fontSize:10,fontWeight:'700',marginTop:-2}}>
        Garage Workflow OS
      </AppText>
    </View>
  </View>
);

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route, navigation }) => ({
        headerStyle: { backgroundColor: colors.black },
        headerTintColor: colors.white,
        headerTitle: () => <HeaderBrand />,
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.black },
        headerLeft: () => route.name === 'Dashboard' ? null : (
          <Pressable style={{ marginLeft: 14 }} onPress={() => navigation.navigate('Dashboard')}>
            <MaterialCommunityIcons name="view-dashboard" size={24} color={colors.orange} />
          </Pressable>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 14, marginRight: 12 }}>
            <Pressable onPress={() => navigation.getParent()?.navigate('Welcome')}>
              <MaterialCommunityIcons name="folder-multiple-outline" size={22} color={colors.orange} />
            </Pressable>
            <Pressable onPress={() => navigation.getParent()?.navigate('ProjectEdit')}>
              <MaterialCommunityIcons name="square-edit-outline" size={22} color={colors.white} />
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
          borderRadius: radius.xl
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.steel,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
        tabBarIcon: ({ color, size, focused }) => (
          <MaterialCommunityIcons name={tabIcons[route.name]} color={color} size={focused ? size + 7 : size + 2} />
        )
      })}
    >
      <Tabs.Screen name="Dashboard" component={DashboardScreen} />
      <Tabs.Screen name="Tasks" component={TasksScreen} />
      <Tabs.Screen name="Parts" component={PartsScreen} />
      <Tabs.Screen name="Session" component={SessionScreen} options={{ title: 'Sessions' }} />
      <Tabs.Screen name="Photos" component={PhotosScreen} />
      <Tabs.Screen name="Advisor" component={RenderScreen} options={{ title: 'Shop Assistant' }} />
      <Tabs.Screen name="Log" component={TimelineScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: { backgroundColor: colors.black },
        headerTintColor: colors.white,
        headerTitle: () => <HeaderBrand />,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.black }
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ title: 'Fabricator OS', headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="ProjectEdit"
        component={ProjectEditScreen}
        options={({ navigation }) => ({
          title: 'Project Configuration',
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('Main', { screen: 'Dashboard' } as never)}>
              <MaterialCommunityIcons name="view-dashboard" size={24} color={colors.orange} />
            </Pressable>
          )
        })}
      />
    </Stack.Navigator>
  );
}
