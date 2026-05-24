import { useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

const quickSystems=['Today','Next Session','Fabrication','Parts','Wiring'];
const quickAdds=['Check clearance','Order hardware','Measure twice','Stage parts'];

function SwipeChecklistRow({title,system,status,onAdvance}:{title:string;system:string;status:string;onAdvance:()=>void}){
const done=status==='Done';
const active=status==='In Progress';
const pan=useRef(PanResponder.create({onMoveShouldSetPanResponder:(_,g)=>Math.abs(g.dx)>28&&Math.abs(g.dx)>Math.abs(g.dy),onPanResponderRelease:(_,g)=>{if(Math.abs(g.dx)>70)onAdvance();}})).current;
return <View style={[styles.swipeShell,active&&styles.swipeActive,done&&styles.swipeDone]} {...pan.panHandlers}><Pressable onPress={onAdvance} style={({pressed})=>[styles.rowShell,pressed&&styles.rowPressed]}><View style={[styles.bigCheckbox,done&&styles.bigCheckboxDone,active&&styles.bigCheckboxActive]}>{done?<MaterialCommunityIcons name="check-bold" size={18} color={colors.white}/>:active?<View style={styles.innerDot}/>:null}</View><View style={styles.rowText}><AppText style={[styles.rowTitle,done&&styles.doneText]}>{title}</AppText><View style={styles.rowMeta}><Label>{system}</Label><AppText style={styles.statusText}>{status}</AppText></View></View></Pressable></View>
}

export function TasksScreen(){
const store=useFabricatorStore();
const {width}=useWindowDimensions();
const wide=width>760;
const [title,setTitle]=useState('');
const [system,setSystem]=useState('Today');
const [focusMode,setFocusMode]=useState(false);
const tasks=store.tasks.filter(t=>t.projectId===store.selectedProjectId);
const todayList=tasks.filter(t=>t.status!=='Done'&&(t.system==='Today'||t.system==='Next Session'||t.status==='In Progress')).slice(0,6);
const focusItem=todayList[0]||tasks.find(t=>t.status!=='Done');
const grouped=useMemo(()=>({'Open Shop List':tasks.filter(t=>t.status==='To Do'&&t.system!=='Today'),'Working Now':tasks.filter(t=>t.status==='In Progress'),'Crossed Off':tasks.filter(t=>t.status==='Done')}),[tasks]);
const save=()=>{if(!title.trim())return;store.addTask(title.trim(),system.trim()||'General');setTitle('');setSystem('Today');};
const fastAdd=(text:string)=>{store.addTask(text,system.trim()||'Today');setSystem('Today');};

return <Screen>
<View style={styles.notebookHero}><View style={styles.heroTop}><View style={{flex:1}}><Label>GARAGE NOTEBOOK</Label><Title style={styles.heroTitle}>The Shop List</Title><AppText style={styles.heroCopy}>Fast garage task capture with swipe progression and dictation support.</AppText></View><Pressable style={[styles.focusButton,focusMode&&styles.focusButtonActive]} onPress={()=>setFocusMode(!focusMode)}><MaterialCommunityIcons name="bullseye-arrow" size={18} color={colors.white}/><AppText style={styles.focusButtonText}>{focusMode?'List':'Focus'}</AppText></Pressable></View></View>

{focusMode?<Card style={styles.focusPanel}><Label>FOCUS MODE</Label><Title style={styles.focusTitle}>{focusItem?.title||'Nothing queued up'}</Title><AppText style={styles.heroCopy}>{focusItem?'One job at a time. Tap when progress changes.':'Add a Today item to start a focused shop session.'}</AppText>{focusItem?<Button title="Advance Focus Item" onPress={()=>store.cycleTask(focusItem.id)}/>:null}</Card>:null}

<View style={wide?styles.wideLayout:undefined}><View style={wide?styles.wideColumn:undefined}><Card style={styles.quickAddCard}><View style={styles.compactHeader}><View><Label>FAST NOTE</Label><Title style={styles.smallTitle}>Tap, dictate, save</Title></View><MaterialCommunityIcons name="microphone-message" size={24} color={colors.orange}/></View>
<View style={styles.captureRow}><TextInput value={title} onChangeText={setTitle} placeholder="Use Siri or Android dictation here" placeholderTextColor={colors.steel} style={styles.compactInput} returnKeyType="done" onSubmitEditing={save}/><Pressable style={styles.saveButton} onPress={save}><MaterialCommunityIcons name="plus" size={22} color={colors.white}/></Pressable></View>
<View style={styles.chips}>{quickSystems.map(item=><Pressable key={item} onPress={()=>setSystem(item)} style={[styles.chip,system===item&&styles.chipActive]}><AppText style={[styles.chipText,system===item&&styles.chipTextActive]}>{item}</AppText></Pressable>)}</View>
<View style={styles.fastRow}>{quickAdds.map(item=><Pressable key={item} onPress={()=>fastAdd(item)} style={styles.fastChip}><MaterialCommunityIcons name="plus" size={12} color={colors.orange}/><AppText style={styles.fastText}>{item}</AppText></Pressable>)}</View></Card>
<Card style={styles.todayCard}><View style={styles.pinnedHeader}><View><Label>PINNED TODAY</Label><Title style={styles.smallTitle}>Do these first</Title></View><MaterialCommunityIcons name="pin" size={22} color={colors.orange}/></View>{todayList.length?todayList.map(t=><SwipeChecklistRow key={`today-${t.id}`} title={t.title} system={t.system} status={t.status} onAdvance={()=>store.cycleTask(t.id)} />):<AppText>No pinned items yet.</AppText>}</Card></View>
<View style={wide?styles.wideColumn:undefined}>{Object.entries(grouped).map(([section,list])=><View key={section} style={styles.section}><View style={styles.statusHeader}><Label>{section}</Label><AppText>{list.length} items</AppText></View>{list.length?list.map(t=><SwipeChecklistRow key={`${section}-${t.id}`} title={t.title} system={t.system} status={t.status} onAdvance={()=>store.cycleTask(t.id)} />):<Card><AppText>No items here yet.</AppText></Card>}</View>)}</View></View>
<View style={{height:80}} />
</Screen>
}

const styles=StyleSheet.create({notebookHero:{backgroundColor:colors.panelHigh,borderColor:colors.line,borderWidth:1,borderRadius:radius.xl,padding:spacing.lg,marginBottom:18},heroTop:{flexDirection:'row',gap:12,alignItems:'flex-start'},heroTitle:{fontSize:34,lineHeight:38},heroCopy:{color:colors.white,marginTop:8,lineHeight:20},focusButton:{flexDirection:'row',gap:6,alignItems:'center',backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:10,paddingHorizontal:12},focusButtonActive:{backgroundColor:colors.orange},focusButtonText:{fontSize:12,color:colors.white,fontWeight:'900'},focusPanel:{borderColor:'rgba(217,106,29,0.55)',backgroundColor:colors.panelHigh},focusTitle:{fontSize:28,lineHeight:34,marginVertical:12},wideLayout:{flexDirection:'row',gap:14,alignItems:'flex-start'},wideColumn:{flex:1},quickAddCard:{borderColor:'rgba(217,106,29,0.35)'},compactHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},smallTitle:{fontSize:20,lineHeight:25},captureRow:{flexDirection:'row',gap:10,alignItems:'center'},compactInput:{flex:1,color:colors.white,backgroundColor:colors.graphite,borderColor:colors.orange,borderWidth:1,borderRadius:radius.lg,paddingHorizontal:16,paddingVertical:14,fontSize:16,fontWeight:'700'},saveButton:{width:54,height:54,borderRadius:16,backgroundColor:colors.orange,alignItems:'center',justifyContent:'center'},chips:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:14},chip:{backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:8,paddingHorizontal:12},chipActive:{backgroundColor:colors.orangeSoft,borderColor:colors.orange},chipText:{fontSize:11,color:colors.muted,fontWeight:'800'},chipTextActive:{color:colors.white},fastRow:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:14},fastChip:{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:8,paddingHorizontal:10},fastText:{fontSize:11,color:colors.white,fontWeight:'800'},todayCard:{borderColor:'rgba(217,106,29,0.55)',backgroundColor:colors.panelHigh},pinnedHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14},section:{marginBottom:18},statusHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},swipeShell:{backgroundColor:colors.panel,borderColor:colors.line,borderWidth:1,borderRadius:radius.lg,marginBottom:10,overflow:'hidden'},swipeActive:{borderColor:'rgba(217,106,29,0.55)',backgroundColor:colors.panelHigh},swipeDone:{opacity:0.62},rowShell:{padding:15,flexDirection:'row',gap:14,alignItems:'center',minHeight:70},rowPressed:{opacity:0.78,transform:[{scale:0.99}]},bigCheckbox:{width:38,height:38,borderRadius:12,borderWidth:2,borderColor:colors.orange,alignItems:'center',justifyContent:'center',backgroundColor:colors.charcoal},bigCheckboxDone:{backgroundColor:colors.orange},bigCheckboxActive:{backgroundColor:colors.orangeSoft},innerDot:{width:12,height:12,borderRadius:999,backgroundColor:colors.orange},rowText:{flex:1},rowTitle:{fontSize:17,lineHeight:22,color:colors.white,fontWeight:'900'},doneText:{textDecorationLine:'line-through',color:colors.steel},rowMeta:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10,marginTop:8},statusText:{fontSize:11,color:colors.steel,fontWeight:'800'}});
