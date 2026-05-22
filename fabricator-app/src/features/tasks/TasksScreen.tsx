import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { StatusPill } from '@/components/StatusPill';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

export function TasksScreen(){
const store=useFabricatorStore();
const [title,setTitle]=useState('');
const [system,setSystem]=useState('Fabrication');
const tasks=store.tasks.filter(t=>t.projectId===store.selectedProjectId);

const save=()=>{
if(!title.trim())return;
store.addTask(title.trim(),system.trim()||'General');
setTitle('');
setSystem('Fabrication');
};

return <Screen>
<Label>Checklist</Label>
<Title>Tasks</Title>
<Card>
<Label>ADD TASK</Label>
<TextInput value={title} onChangeText={setTitle} placeholder="Task title" placeholderTextColor={colors.steel} style={inputStyle}/>
<TextInput value={system} onChangeText={setSystem} placeholder="System or category" placeholderTextColor={colors.steel} style={inputStyle}/>
<Button title="Add task" onPress={save}/>
</Card>
{tasks.map(t=><Pressable key={t.id} onPress={()=>store.cycleTask(t.id)}><Card><Label>{t.system}</Label><Title style={{fontSize:18}}>{t.title}</Title><StatusPill label={t.status}/><AppText style={{marginTop:8}}>Tap card to cycle status.</AppText></Card></Pressable>)}
<View style={{height:40}} />
</Screen>
}

const inputStyle={color:colors.white,backgroundColor:colors.graphite,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:spacing.md,marginVertical:spacing.sm};
