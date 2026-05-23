import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

const quickSystems=['Today','Next Session','Fabrication','Parts','Wiring','Paint Prep','Final Assembly'];
const quickAdds=['Check clearance','Order hardware','Measure twice','Clean up notes','Stage parts','Take progress photo'];

function ChecklistRow({title,system,status,onPress}:{title:string;system:string;status:string;onPress:()=>void}){
const done=status==='Done';
const active=status==='In Progress';
return <View style={[styles.swipeShell,active&&styles.swipeActive,done&&styles.swipeDone]}>
<View style={styles.swipeCue}><MaterialCommunityIcons name="gesture-swipe-horizontal" size={16} color={colors.orange}/><AppText style={styles.swipeCueText}>tap to move</AppText></View>
<Pressable onPress={onPress} style={({pressed})=>[styles.rowShell,pressed&&styles.rowPressed]}>
<View style={[styles.bigCheckbox,done&&styles.bigCheckboxDone,active&&styles.bigCheckboxActive]}>{done?<MaterialCommunityIcons name="check-bold" size={22} color={colors.white}/>:active?<View style={styles.innerDot}/>:null}</View>
<View style={styles.rowText}>
<AppText style={[styles.rowTitle,done&&styles.doneText]}>{title}</AppText>
<View style={styles.rowMeta}><Label>{system}</Label><AppText style={styles.statusText}>{status}</AppText></View>
</View>
</Pressable>
</View>
}

export function TasksScreen(){
const store=useFabricatorStore();
const [title,setTitle]=useState('');
const [system,setSystem]=useState('Today');
const tasks=store.tasks.filter(t=>t.projectId===store.selectedProjectId);

const todayList=tasks.filter(t=>t.status!=='Done'&&(t.system==='Today'||t.system==='Next Session'||t.status==='In Progress')).slice(0,6);
const grouped=useMemo(()=>({
'Today':todayList,
'Open Shop List':tasks.filter(t=>t.status==='To Do'&&t.system!=='Today'),
'Working Now':tasks.filter(t=>t.status==='In Progress'),
'Crossed Off':tasks.filter(t=>t.status==='Done')
}),[tasks,todayList]);

const save=()=>{
if(!title.trim())return;
store.addTask(title.trim(),system.trim()||'General');
setTitle('');
setSystem('Today');
};

const fastAdd=(text:string)=>{
store.addTask(text,system.trim()||'Today');
setSystem('Today');
};

return <Screen>
<View style={styles.notebookHero}>
<View style={styles.paperLine}/>
<Label>GARAGE NOTEBOOK</Label>
<Title style={styles.heroTitle}>The Shop List</Title>
<AppText style={styles.heroCopy}>Big rows, quick taps, and a pinned Today section for dirty-hands garage use.</AppText>
<View style={styles.statsRow}>
<View style={styles.statBox}><Label>Today</Label><Title style={styles.statValue}>{todayList.length}</Title></View>
<View style={styles.statBox}><Label>Open</Label><Title style={styles.statValue}>{tasks.filter(t=>t.status!=='Done').length}</Title></View>
<View style={styles.statBox}><Label>Done</Label><Title style={styles.statValue}>{tasks.filter(t=>t.status==='Done').length}</Title></View>
</View>
</View>

<Card style={styles.quickAddCard}>
<View style={styles.headerRow}><View><Label>FAST NOTE</Label><Title style={styles.smallTitle}>Tap, dictate, save</Title></View><MaterialCommunityIcons name="microphone-message" size={30} color={colors.orange}/></View>
<TextInput value={title} onChangeText={setTitle} placeholder="Use Siri or Android dictation here" placeholderTextColor={colors.steel} style={styles.input} returnKeyType="done" onSubmitEditing={save}/>
<View style={styles.chips}>{quickSystems.map(item=><Pressable key={item} onPress={()=>setSystem(item)} style={[styles.chip,system===item&&styles.chipActive]}><AppText style={[styles.chipText,system===item&&styles.chipTextActive]}>{item}</AppText></Pressable>)}</View>
<Button title="Add to shop list" onPress={save}/>
<View style={styles.fastRow}>{quickAdds.map(item=><Pressable key={item} onPress={()=>fastAdd(item)} style={styles.fastChip}><MaterialCommunityIcons name="plus" size={14} color={colors.orange}/><AppText style={styles.fastText}>{item}</AppText></Pressable>)}</View>
</Card>

<Card style={styles.todayCard}>
<View style={styles.pinnedHeader}><View><Label>PINNED TODAY</Label><Title style={styles.smallTitle}>Do these first</Title></View><MaterialCommunityIcons name="pin" size={26} color={colors.orange}/></View>
{todayList.length?todayList.map(t=><ChecklistRow key={`today-${t.id}`} title={t.title} system={t.system} status={t.status} onPress={()=>store.cycleTask(t.id)} />):<AppText>No pinned items yet. Add one with the Today chip.</AppText>}
</Card>

{Object.entries(grouped).filter(([section])=>section!=='Today').map(([section,list])=><View key={section} style={styles.section}>
<View style={styles.statusHeader}><Label>{section}</Label><AppText>{list.length} items</AppText></View>
{list.length?list.map(t=><ChecklistRow key={`${section}-${t.id}`} title={t.title} system={t.system} status={t.status} onPress={()=>store.cycleTask(t.id)} />):<Card><AppText>No items here yet.</AppText></Card>}
</View>)}
<View style={{height:40}} />
</Screen>
}

const styles=StyleSheet.create({
notebookHero:{backgroundColor:colors.panelHigh,borderColor:colors.line,borderWidth:1,borderRadius:radius.xl,padding:spacing.lg,marginBottom:18,overflow:'hidden'},
paperLine:{position:'absolute',left:18,top:0,bottom:0,width:2,backgroundColor:'rgba(217,106,29,0.28)'},
heroTitle:{fontSize:38,lineHeight:42},
heroCopy:{color:colors.white,marginTop:10,lineHeight:22},
statsRow:{flexDirection:'row',gap:10,marginTop:18},
statBox:{flex:1,backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:12},
statValue:{fontSize:24,lineHeight:29},
quickAddCard:{borderColor:'rgba(217,106,29,0.35)'},
headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12,gap:12},
smallTitle:{fontSize:22,lineHeight:27},
input:{color:colors.white,backgroundColor:colors.graphite,borderColor:colors.orange,borderWidth:1,borderRadius:radius.lg,padding:18,marginVertical:spacing.sm,fontSize:18,fontWeight:'800'},
chips:{flexDirection:'row',flexWrap:'wrap',gap:8,marginVertical:12},
chip:{backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:10,paddingHorizontal:13},
chipActive:{backgroundColor:colors.orangeSoft,borderColor:colors.orange},
chipText:{fontSize:12,color:colors.muted,fontWeight:'800'},
chipTextActive:{color:colors.white},
fastRow:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:14},
fastChip:{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:9,paddingHorizontal:11},
fastText:{fontSize:12,color:colors.white,fontWeight:'800'},
todayCard:{borderColor:'rgba(217,106,29,0.55)',backgroundColor:colors.panelHigh},
pinnedHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},
section:{marginBottom:18},
statusHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},
swipeShell:{backgroundColor:colors.panel,borderColor:colors.line,borderWidth:1,borderRadius:radius.lg,marginBottom:10,overflow:'hidden'},
swipeActive:{borderColor:'rgba(217,106,29,0.55)',backgroundColor:colors.panelHigh},
swipeDone:{opacity:0.62},
swipeCue:{height:24,backgroundColor:'rgba(217,106,29,0.08)',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},
swipeCueText:{fontSize:10,color:colors.steel,fontWeight:'900',textTransform:'uppercase'},
rowShell:{padding:17,flexDirection:'row',gap:14,alignItems:'center',minHeight:78},
rowPressed:{opacity:0.78,transform:[{scale:0.99}]},
bigCheckbox:{width:42,height:42,borderRadius:12,borderWidth:2,borderColor:colors.orange,alignItems:'center',justifyContent:'center',backgroundColor:colors.charcoal},
bigCheckboxDone:{backgroundColor:colors.orange},
bigCheckboxActive:{backgroundColor:colors.orangeSoft},
innerDot:{width:14,height:14,borderRadius:999,backgroundColor:colors.orange},
rowText:{flex:1},
rowTitle:{fontSize:18,lineHeight:24,color:colors.white,fontWeight:'900'},
doneText:{textDecorationLine:'line-through',color:colors.steel},
rowMeta:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:8},
statusText:{fontSize:12,color:colors.steel,fontWeight:'800'}
});
