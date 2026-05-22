import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

const grouped=useMemo(()=>({
'To Do':tasks.filter(t=>t.status==='To Do'),
'In Progress':tasks.filter(t=>t.status==='In Progress'),
Done:tasks.filter(t=>t.status==='Done')
}),[tasks]);

const save=()=>{
if(!title.trim())return;
store.addTask(title.trim(),system.trim()||'General');
setTitle('');
setSystem('Fabrication');
};

return <Screen>
<Label>OPERATIONS BOARD</Label>
<Title>Build Tasks</Title>
<AppText style={{marginTop:10,marginBottom:16}}>Track fabrication progress, blockers, prep work, and next-session actions across the build lifecycle.</AppText>

<Card style={styles.createCard}>
<View style={styles.headerRow}><View><Label>NEW WORK ITEM</Label><Title style={styles.smallTitle}>Add fabrication task</Title></View><MaterialCommunityIcons name="clipboard-plus-outline" size={28} color={colors.orange}/></View>
<TextInput value={title} onChangeText={setTitle} placeholder="Task title" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={system} onChangeText={setSystem} placeholder="System or category" placeholderTextColor={colors.steel} style={styles.input}/>
<Button title="Add task" onPress={save}/>
</Card>

{Object.entries(grouped).map(([status,list])=><View key={status} style={{marginBottom:16}}>
<View style={styles.statusHeader}><Label>{status}</Label><AppText>{list.length} items</AppText></View>
{list.map(t=><Pressable key={t.id} onPress={()=>store.cycleTask(t.id)}>
<Card style={status==='In Progress'?styles.activeCard:undefined}>
<View style={styles.taskTop}><View style={styles.iconWrap}><MaterialCommunityIcons name={status==='Done'?'check-bold':status==='In Progress'?'progress-wrench':'hammer-wrench'} size={20} color={colors.orange}/></View><StatusPill label={t.status}/></View>
<Title style={styles.taskTitle}>{t.title}</Title>
<AppText style={styles.system}>{t.system}</AppText>
<AppText style={styles.tap}>Tap card to cycle workflow status.</AppText>
</Card>
</Pressable>)}
</View>)}
<View style={{height:40}} />
</Screen>
}

const styles=StyleSheet.create({
createCard:{borderColor:'rgba(217,106,29,0.35)'},
headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},
smallTitle:{fontSize:22,lineHeight:27},
input:{color:colors.white,backgroundColor:colors.graphite,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:spacing.md,marginVertical:spacing.sm},
statusHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},
activeCard:{borderColor:'rgba(217,106,29,0.45)'},
taskTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},
iconWrap:{width:38,height:38,borderRadius:12,backgroundColor:colors.orangeSoft,alignItems:'center',justifyContent:'center'},
taskTitle:{fontSize:22,lineHeight:28},
system:{marginTop:6,color:colors.white},
tap:{marginTop:10,color:colors.steel,fontSize:12}
});
