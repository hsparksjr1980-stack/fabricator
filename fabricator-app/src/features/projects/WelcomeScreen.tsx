import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { StatusPill } from '@/components/StatusPill';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

export function WelcomeScreen({navigation}:NativeStackScreenProps<any>){
const {projects,selectProject,addProject}=useFabricatorStore();
const [loggedIn,setLoggedIn]=useState(false);
const [showCreate,setShowCreate]=useState(false);
const [email,setEmail]=useState('');
const [password,setPassword]=useState('');
const [projectName,setProjectName]=useState('');
const [category,setCategory]=useState('Metal Fabrication');
const [phase,setPhase]=useState('Planning');

const createProject=()=>{
if(!projectName.trim())return;
addProject({name:projectName.trim(),category:category as any,phase:phase as any,status:'Active'});
setProjectName('');
setCategory('Metal Fabrication');
setPhase('Planning');
setShowCreate(false);
navigation.navigate('Main');
};

if(!loggedIn){
return <Screen>
<View style={styles.hero}>
<Label>Fabricator</Label>
<Title style={styles.title}>Your build memory for the shop.</Title>
<AppText style={styles.subtitle}>Fabricator organizes fabrication projects, restorations, race builds, woodworking, and creator projects so you never lose momentum between work sessions.</AppText>
</View>
<Card>
<Label>DEMO FEATURES</Label>
<AppText style={styles.demoLine}>• Project dashboards</AppText>
<AppText style={styles.demoLine}>• Build logs and session memory</AppText>
<AppText style={styles.demoLine}>• Tasks and blockers</AppText>
<AppText style={styles.demoLine}>• Parts and materials tracking</AppText>
<AppText style={styles.demoLine}>• Tagged progress photos</AppText>
<AppText style={styles.demoLine}>• AI next-session placeholders</AppText>
</Card>
<Card>
<Label>SHOP LOGIN</Label>
<Title style={{fontSize:22}}>Enter Fabricator</Title>
<AppText style={{marginTop:10,marginBottom:18}}>Authentication is mocked for MVP feedback testing.</AppText>
<TextInput placeholder="Email" placeholderTextColor={colors.steel} value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
<TextInput placeholder="Password" placeholderTextColor={colors.steel} value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
<Button title="Open Workspace" onPress={()=>setLoggedIn(true)} />
<View style={{height:12}} />
<Button title="Launch Demo Build" variant="ghost" onPress={()=>{setLoggedIn(true);selectProject('p1')}} />
</Card>
</Screen>
}

return <Screen>
<Label>Workshop projects</Label>
<Title>Keep momentum between sessions.</Title>
<AppText style={{marginVertical:12}}>Track fabrication notes, photos, materials, unfinished work, and the next best move in the shop.</AppText>

<Card>
<Label>FEATURED DEMO BUILD</Label>
<Title style={{fontSize:22}}>Tube Chassis Shop Kart</Title>
<AppText style={{marginVertical:10}}>A seeded demo project designed to showcase dashboards, fabrication tasks, material tracking, blockers, AI planning placeholders, and photo organization.</AppText>
<Button title="Open demo build" onPress={()=>{selectProject('p1');navigation.navigate('Main')}} />
</Card>

{showCreate?<Card>
<Label>CREATE PROJECT</Label>
<TextInput placeholder="Project name" placeholderTextColor={colors.steel} value={projectName} onChangeText={setProjectName} style={styles.input}/>
<TextInput placeholder="Category" placeholderTextColor={colors.steel} value={category} onChangeText={setCategory} style={styles.input}/>
<TextInput placeholder="Phase" placeholderTextColor={colors.steel} value={phase} onChangeText={setPhase} style={styles.input}/>
<Button title="Save project" onPress={createProject}/>
<View style={{height:10}} />
<Button title="Cancel" variant="ghost" onPress={()=>setShowCreate(false)}/>
</Card>:<Button title="Create new project" variant="ghost" onPress={()=>setShowCreate(true)} />}

<View style={{height:16}} />
{projects.map(p=><Card key={p.id}><Label>{p.category}</Label><Title style={{fontSize:22}}>{p.name}</Title><StatusPill label={`${p.phase} • ${p.status}`}/><AppText style={{marginVertical:10}}>{p.progress}% complete — {p.hook}</AppText><Button title="Open project" onPress={()=>{selectProject(p.id);navigation.navigate('Main')}} /></Card>)}
</Screen>}

const styles = StyleSheet.create({
hero:{marginBottom:24},
title:{marginTop:8},
subtitle:{marginTop:14,lineHeight:22},
demoLine:{marginTop:6},
input:{backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.line,color:colors.white,padding:spacing.md,borderRadius:radius.md,marginBottom:14}
});
