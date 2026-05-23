import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

export function ProjectEditScreen({navigation}:NativeStackScreenProps<any>){
const store=useFabricatorStore();
const project=store.activeProject();
const [name,setName]=useState(project?.name ?? '');
const [category,setCategory]=useState<string>(project?.category ?? 'Metal Fabrication');
const [phase,setPhase]=useState<string>(project?.phase ?? 'Planning');
const [status,setStatus]=useState<string>(project?.status ?? 'Active');
const [progress,setProgress]=useState(String(project?.progress ?? 0));
const [hook,setHook]=useState(project?.hook ?? '');

if(!project)return <Screen><Title>No active project</Title></Screen>;

const save=()=>{
store.updateProject(project.id,{name:name.trim()||project.name,category:category as any,phase:phase as any,status:status as any,progress:Number(progress)||0,hook});
navigation.navigate('Main');
};

return <Screen>
<Label>Project setup</Label>
<Title>Edit build profile</Title>
<AppText style={{marginVertical:12}}>Tune the project details that drive dashboard context, status labels, and demo storytelling.</AppText>
<Card>
<Label>PROJECT DETAILS</Label>
<TextInput value={name} onChangeText={setName} placeholder="Project name" placeholderTextColor={colors.steel} style={inputStyle}/>
<TextInput value={category} onChangeText={(text)=>setCategory(text)} placeholder="Category" placeholderTextColor={colors.steel} style={inputStyle}/>
<TextInput value={phase} onChangeText={(text)=>setPhase(text)} placeholder="Phase" placeholderTextColor={colors.steel} style={inputStyle}/>
<TextInput value={status} onChangeText={(text)=>setStatus(text)} placeholder="Status" placeholderTextColor={colors.steel} style={inputStyle}/>
<TextInput value={progress} onChangeText={(text)=>setProgress(text)} placeholder="Progress percent" placeholderTextColor={colors.steel} keyboardType="numeric" style={inputStyle}/>
<TextInput value={hook} onChangeText={(text)=>setHook(text)} placeholder="Project hook" placeholderTextColor={colors.steel} multiline style={[inputStyle,{minHeight:90}]}/>
<Button title="Save project" onPress={save}/>
<View style={{height:10}} />
<Button title="Cancel" variant="ghost" onPress={()=>navigation.goBack()}/>
</Card>
</Screen>
}

const inputStyle={backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.line,color:colors.white,padding:spacing.md,borderRadius:radius.md,marginBottom:14};
