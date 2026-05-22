import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/theme/theme';
import { WelcomeScreen } from '@/features/projects/WelcomeScreen';
import { DashboardScreen } from '@/features/projects/DashboardScreen';
import { SessionScreen } from '@/features/sessions/SessionScreen';
import { VoiceNoteScreen } from '@/features/sessions/VoiceNoteScreen';
import { TimelineScreen } from '@/features/buildLog/TimelineScreen';
import { TasksScreen } from '@/features/tasks/TasksScreen';
import { PartsScreen } from '@/features/parts/PartsScreen';
import { PhotosScreen } from '@/features/photos/PhotosScreen';
import { RenderScreen } from '@/features/rendering/RenderScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';

const Tabs=createBottomTabNavigator();
const Stack=createNativeStackNavigator();

function MainTabs(){
return <Tabs.Navigator
screenOptions={{
headerStyle:{backgroundColor:colors.graphite},
headerTintColor:colors.white,
headerTitleStyle:{fontWeight:'700'},
headerShadowVisible:false,
sceneStyle:{backgroundColor:colors.black},
tabBarStyle:{backgroundColor:colors.graphite,borderTopColor:colors.line},
tabBarActiveTintColor:colors.orange,
tabBarInactiveTintColor:colors.steel
}}>
<Tabs.Screen name="Dashboard" component={DashboardScreen}/>
<Tabs.Screen name="Session" component={SessionScreen}/>
<Tabs.Screen name="Voice" component={VoiceNoteScreen}/>
<Tabs.Screen name="Log" component={TimelineScreen}/>
<Tabs.Screen name="Tasks" component={TasksScreen}/>
<Tabs.Screen name="Parts" component={PartsScreen}/>
<Tabs.Screen name="Photos" component={PhotosScreen}/>
<Tabs.Screen name="Render" component={RenderScreen}/>
<Tabs.Screen name="Settings" component={SettingsScreen}/>
</Tabs.Navigator>
}

export function AppNavigator(){
return <Stack.Navigator
screenOptions={{
headerStyle:{backgroundColor:colors.graphite},
headerTintColor:colors.white,
headerTitleStyle:{fontWeight:'700'},
headerShadowVisible:false,
contentStyle:{backgroundColor:colors.black}
}}>
<Stack.Screen
name="Welcome"
component={WelcomeScreen}
options={{headerShown:false}}
/>
<Stack.Screen
name="Main"
component={MainTabs}
options={{title:'Fabricator'}}
/>
</Stack.Navigator>
}
