import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { colors } from '@/theme/theme';
import { WelcomeScreen } from '@/features/projects/WelcomeScreen';
import { DashboardScreen } from '@/features/projects/DashboardScreen';
import { ProjectEditScreen } from '@/features/projects/ProjectEditScreen';
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

const tabIcons:any = {
Dashboard:'view-dashboard-outline',
Session:'hammer-wrench',
Voice:'microphone-outline',
Log:'timeline-text-outline',
Tasks:'clipboard-check-outline',
Parts:'package-variant-closed',
Photos:'image-multiple-outline',
Render:'lightbulb-on-outline',
Settings:'cog-outline'
};

function MainTabs(){
return <Tabs.Navigator
screenOptions={({route,navigation})=>({
headerStyle:{backgroundColor:colors.graphite},
headerTintColor:colors.white,
headerTitleStyle:{fontWeight:'800'},
headerShadowVisible:false,
sceneStyle:{backgroundColor:colors.black},
headerLeft:()=>route.name==='Dashboard'?null:<Pressable style={{marginLeft:10}} onPress={()=>navigation.navigate('Dashboard')}><MaterialCommunityIcons name="view-dashboard-outline" size={24} color={colors.orange} /></Pressable>,
headerRight:()=> <View style={{flexDirection:'row',gap:14,marginRight:8}}>
<Pressable onPress={()=>navigation.navigate('Dashboard')}><MaterialCommunityIcons name="home-variant-outline" size={22} color={colors.orange} /></Pressable>
<Pressable onPress={()=>navigation.navigate('Photos')}><MaterialCommunityIcons name="camera-outline" size={22} color={colors.orange} /></Pressable>
<Pressable onPress={()=>navigation.getParent()?.navigate('ProjectEdit')}><MaterialCommunityIcons name="square-edit-outline" size={22} color={colors.white} /></Pressable>
</View>,
tabBarStyle:{
backgroundColor:colors.graphite,
borderTopColor:colors.line,
height:78,
paddingBottom:10,
paddingTop:8
},
tabBarActiveTintColor:colors.orange,
tabBarInactiveTintColor:colors.steel,
tabBarHideOnKeyboard:true,
tabBarLabelStyle:{fontSize:11,fontWeight:'800'},
tabBarIcon:({color,size,focused})=><MaterialCommunityIcons name={tabIcons[route.name]} color={color} size={focused?size+6:size+3} />
})}>
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
headerTitleStyle:{fontWeight:'800'},
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
options={{title:'Fabricator Workspace',headerBackVisible:false,gestureEnabled:false}}
/>
<Stack.Screen
name="ProjectEdit"
component={ProjectEditScreen}
options={({navigation})=>({title:'Edit Project',headerRight:()=> <Pressable onPress={()=>navigation.navigate('Main',{screen:'Dashboard'})}><MaterialCommunityIcons name="view-dashboard-outline" size={24} color={colors.orange} /></Pressable>})}
/>
</Stack.Navigator>
}
