import { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
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
const [showCreate,setShowCreate]=useState(true);
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

return <Screen>
<Image source={require('../../../assets/fabricator-logo.png')} style={styles.logo}/>

<Label>Workshop projects</Label>
<Title>Start your build.</Title>
<AppText style={{marginVertical:12}}>Create a project to track fabrication notes, photos, materials, unfinished work, and the next best move in the shop.</AppText>

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

{projects.map(p=><Card key={p.id}>
<Label>{p.category}</Label>
<Title style={{fontSize:22}}>{p.name}</Title>
<StatusPill label={`${p.phase} • ${p.status}`}/>
<AppText style={{marginVertical:10}}>{p.progress}% complete — {p.hook}</AppText>
<Button title="Open project" onPress={()=>{selectProject(p.id);navigation.navigate('Main')}} />
</Card>)}
</Screen>
}

const styles = StyleSheet.create({
logo:{
  width:180,
  height:180,
  resizeMode:'contain',
  alignSelf:'center',
  marginBottom:12
},
input:{backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.line,color:colors.white,padding:spacing.md,borderRadius:radius.md,marginBottom:14}
});