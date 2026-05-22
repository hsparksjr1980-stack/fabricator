import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

const quickSystems=['Next Session','Fabrication','Parts','Wiring','Paint Prep','Final Assembly'];

function ChecklistRow({title,system,status,onPress}:{title:string;system:string;status:string;onPress:()=>void}){
const done=status==='Done';
const active=status==='In Progress';
return <Pressable onPress={onPress} style={({pressed})=>[styles.rowShell,active&&styles.rowActive,done&&styles.rowDone,pressed&&styles.rowPressed]}>
<View style={[styles.bigCheckbox,done&&styles.bigCheckboxDone,active&&styles.bigCheckboxActive]}>{done?<MaterialCommunityIcons name="check-bold" size={20} color={colors.white}/>:active?<View style={styles.innerDot}/>:null}</View>
<View style={styles.rowText}>
<AppText style={[styles.rowTitle,done&&styles.doneText]}>{title}</AppText>
<View style={styles.rowMeta}><Label>{system}</Label><AppText style={styles.statusText}>{status}</AppText></View>
</View>
</Pressable>
}

export function TasksScreen(){
const store=useFabricatorStore();
const [title,setTitle]=useState('');
const [system,setSystem]=useState('Next Session');
const tasks=store.tasks.filter(t=>t.projectId===store.selectedProjectId);

const grouped=useMemo(()=>({
'Next Session':tasks.filter(t=>t.status!=='Done'&&(t.system==='Next Session'||t.status==='In Progress')).slice(0,8),
'Open List':tasks.filter(t=>t.status==='To Do'),
'In Progress':tasks.filter(t=>t.status==='In Progress'),
'Crossed Off':tasks.filter(t=>t.status==='Done')
}),[tasks]);

const save=()=>{
if(!title.trim())return;
store.addTask(title.trim(),system.trim()||'General');
setTitle('');
setSystem('Next Session');
};

return <Screen>
<View style={styles.heroPanel}>
<Label>SHOP CHECKLIST</Label>
<Title style={styles.heroTitle}>The List</Title>
<AppText style={styles.heroCopy}>A fast workshop list for what needs attention before the build can move forward.</AppText>
<View style={styles.statsRow}>
<View style={styles.statBox}><Label>Open</Label><Title style={styles.statValue}>{tasks.filter(t=>t.status!=='Done').length}</Title></View>
<View style={styles.statBox}><Label>Active</Label><Title style={styles.statValue}>{tasks.filter(t=>t.status==='In Progress').length}</Title></View>
<View style={styles.statBox}><Label>Done</Label><Title style={styles.statValue}>{tasks.filter(t=>t.status==='Done').length}</Title></View>
</View>
</View>

<Card style={styles.quickAddCard}>
<View style={styles.headerRow}><View><Label>QUICK ADD</Label><Title style={styles.smallTitle}>Write it down before you forget</Title></View><MaterialCommunityIcons name="pencil-box-outline" size={30} color={colors.orange}/></View>
<TextInput value={title} onChangeText={setTitle} placeholder="Add a checklist item" placeholderTextColor={colors.steel} style={styles.input}/>
<View style={styles.chips}>{quickSystems.map(item=><Pressable key={item} onPress={()=>setSystem(item)} style={[styles.chip,system===item&&styles.chipActive]}><AppText style={[styles.chipText,system===item&&styles.chipTextActive]}>{item}</AppText></Pressable>)}</View>
<Button title="Add to list" onPress={save}/>
</Card>

{Object.entries(grouped).map(([section,list])=><View key={section} style={styles.section}>
<View style={styles.statusHeader}><Label>{section}</Label><AppText>{list.length} items</AppText></View>
{list.length?list.map(t=><ChecklistRow key={`${section}-${t.id}`} title={t.title} system={t.system} status={t.status} onPress={()=>store.cycleTask(t.id)} />):<Card><AppText>No items here yet.</AppText></Card>}
</View>)}
<View style={{height:40}} />
</Screen>
}

const styles=StyleSheet.create({
heroPanel:{backgroundColor:colors.panelHigh,borderColor:colors.line,borderWidth:1,borderRadius:radius.xl,padding:spacing.lg,marginBottom:18},
heroTitle:{fontSize:38,lineHeight:42},
heroCopy:{color:colors.white,marginTop:10,lineHeight:22},
statsRow:{flexDirection:'row',gap:10,marginTop:18},
statBox:{flex:1,backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:12},
statValue:{fontSize:24,lineHeight:29},
quickAddCard:{borderColor:'rgba(217,106,29,0.35)'},
headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12,gap:12},
smallTitle:{fontSize:22,lineHeight:27},
input:{color:colors.white,backgroundColor:colors.graphite,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:spacing.md,marginVertical:spacing.sm,fontSize:16},
chips:{flexDirection:'row',flexWrap:'wrap',gap:8,marginVertical:12},
chip:{backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:9,paddingHorizontal:12},
chipActive:{backgroundColor:colors.orangeSoft,borderColor:colors.orange},
chipText:{fontSize:12,color:colors.muted,fontWeight:'800'},
chipTextActive:{color:colors.white},
section:{marginBottom:18},
statusHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},
rowShell:{backgroundColor:colors.panel,borderColor:colors.line,borderWidth:1,borderRadius:radius.lg,padding:16,marginBottom:10,flexDirection:'row',gap:14,alignItems:'center'},
rowActive:{borderColor:'rgba(217,106,29,0.55)',backgroundColor:colors.panelHigh},
rowDone:{opacity:0.62},
rowPressed:{opacity:0.78,transform:[{scale:0.99}]},
bigCheckbox:{width:34,height:34,borderRadius:10,borderWidth:2,borderColor:colors.orange,alignItems:'center',justifyContent:'center',backgroundColor:colors.charcoal},
bigCheckboxDone:{backgroundColor:colors.orange},
bigCheckboxActive:{backgroundColor:colors.orangeSoft},
innerDot:{width:12,height:12,borderRadius:999,backgroundColor:colors.orange},
rowText:{flex:1},
rowTitle:{fontSize:17,lineHeight:23,color:colors.white,fontWeight:'900'},
doneText:{textDecorationLine:'line-through',color:colors.steel},
rowMeta:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:8},
statusText:{fontSize:12,color:colors.steel,fontWeight:'800'}
});
