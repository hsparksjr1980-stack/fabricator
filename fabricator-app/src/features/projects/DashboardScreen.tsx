import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, Image } from 'react-native';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { mockAiService } from '@/services/ai/aiService';
import { AiSummary, DashboardPreset, DashboardWidget } from '@/types/models';
import { colors, radius, spacing } from '@/theme/theme';

const presets:DashboardPreset[]=['Fabricator','Woodworker','Restoration','Content Creator','Race Build','Motorcycle Build'];
const actionIcons:any={session:'garage',voice:'microphone-outline',task:'clipboard-check-outline',part:'tools',photo:'camera-outline',render:'cube-outline'};
const widgetIcons:any={focus:'target',quickActions:'lightning-bolt-outline',progress:'chart-donut',stats:'view-dashboard-outline',nextSession:'robot-outline',blockers:'alert-octagon-outline',parts:'package-variant-closed',materialsInventory:'warehouse',sessionTimer:'timer-outline',photoFeature:'image-multiple-outline',creator:'share-variant-outline'};

function WidgetShell({widget,children}:{widget:DashboardWidget;children:React.ReactNode}){
return <Card style={widget.size==='compact'?styles.compactCard:styles.expandedCard}>
<View style={styles.widgetHeader}>
<View style={styles.widgetTitleRow}>
<MaterialCommunityIcons name={widgetIcons[widget.type]} size={20} color={colors.orange}/>
<Label>{widget.title.toUpperCase()}</Label>
</View>
<View style={styles.sizePill}><AppText style={styles.sizeText}>{widget.size}</AppText></View>
</View>
{children}
</Card>
}

export function DashboardScreen(){
const store=useFabricatorStore();
const p=store.activeProject();
const widgets=store.dashboardWidgets;
const enabledWidgets=widgets.filter(w=>w.enabled);
const [summary,setSummary]=useState<AiSummary>();
const [editorOpen,setEditorOpen]=useState(false);
const [timerRunning,setTimerRunning]=useState(false);
const [timerMinutes,setTimerMinutes]=useState(0);

useEffect(()=>{
mockAiService.summarizeBuildInput({sessions:store.sessions,voiceNotes:store.voiceNotes}).then(setSummary)
},[store.sessions.length,store.voiceNotes.length]);

useEffect(()=>{
if(!timerRunning)return;
const interval=setInterval(()=>setTimerMinutes(m=>m+1),60000);
return()=>clearInterval(interval);
},[timerRunning]);

const projectTasks=useMemo(()=>store.tasks.filter(t=>t.projectId===store.selectedProjectId),[store.tasks,store.selectedProjectId]);
const openTasks=projectTasks.filter(t=>t.status!=='Done');
const neededParts=store.parts.filter(part=>part.projectId===store.selectedProjectId&&part.status==='Need to Order');
const availableMaterials=store.parts.filter(part=>part.projectId===store.selectedProjectId&&part.status!=='Need to Order');
const featurePhoto=store.photos.find(photo=>photo.projectId===store.selectedProjectId);
const blockers=[...neededParts.map(part=>`Waiting on ${part.name}`),...openTasks.slice(0,2).map(task=>`Open task: ${task.title}`)];

if(!p)return null;

const renderWidget=(widget:DashboardWidget)=>{
if(widget.type==='focus') return <WidgetShell key={widget.id} widget={widget}><Title style={styles.widgetBig}>Today in Shop</Title><AppText>Focus on the next useful move, not the whole build.</AppText><View style={{height:10}} />{summary?.nextSessionChecklist.slice(0,3).map(item=><AppText key={item}>• {item}</AppText>)}</WidgetShell>;
if(widget.type==='quickActions') return <WidgetShell key={widget.id} widget={widget}><View style={styles.quickGrid}>{store.quickActions.filter(a=>a.enabled).map(action=><Pressable key={action.id} style={styles.quickButton}><MaterialCommunityIcons name={actionIcons[action.type]} size={24} color={colors.orange}/><AppText>{action.title}</AppText></Pressable>)}</View></WidgetShell>;
if(widget.type==='progress') return <WidgetShell key={widget.id} widget={widget}><Title style={{fontSize:38}}>{p.progress}%</Title><View style={styles.progressBar}><View style={[styles.progressFill,{width:`${p.progress}%`}]} /></View><AppText style={{marginTop:8}}>{p.phase} • {p.status}</AppText></WidgetShell>;
if(widget.type==='stats') return <WidgetShell key={widget.id} widget={widget}><View style={styles.statLine}><Label>OPEN TASKS</Label><Title style={styles.metric}>{openTasks.length}</Title></View><View style={styles.statLine}><Label>PARTS NEEDED</Label><Title style={styles.metric}>{neededParts.length}</Title></View><View style={styles.statLine}><Label>UPDATED</Label><AppText>{p.updatedAt}</AppText></View></WidgetShell>;
if(widget.type==='nextSession') return <WidgetShell key={widget.id} widget={widget}>{summary?.nextSessionChecklist.map(i=><AppText key={i}>• {i}</AppText>)}</WidgetShell>;
if(widget.type==='blockers') return <WidgetShell key={widget.id} widget={widget}>{blockers.length?blockers.map(i=><AppText key={i}>• {i}</AppText>):<AppText>No major blockers detected in mock data.</AppText>}<View style={{height:8}}/><AppText>AI blocker analysis placeholder for supplier delays, unfinished prep, missing photos, or stale tasks.</AppText></WidgetShell>;
if(widget.type==='parts') return <WidgetShell key={widget.id} widget={widget}>{neededParts.length?neededParts.map(part=><AppText key={part.id}>• {part.name}</AppText>):<AppText>No parts marked need to order.</AppText>}</WidgetShell>;
if(widget.type==='materialsInventory') return <WidgetShell key={widget.id} widget={widget}>{availableMaterials.map(part=><AppText key={part.id}>• {part.name} — {part.status}</AppText>)}</WidgetShell>;
if(widget.type==='sessionTimer') return <WidgetShell key={widget.id} widget={widget}><Title style={styles.widgetBig}>{timerMinutes} min</Title><AppText>{timerRunning?'Shop timer running':'Timer ready for next session'}</AppText><Pressable style={styles.primarySmall} onPress={()=>setTimerRunning(!timerRunning)}><AppText style={styles.primarySmallText}>{timerRunning?'Pause':'Start'} Timer</AppText></Pressable></WidgetShell>;
if(widget.type==='photoFeature') return <WidgetShell key={widget.id} widget={widget}>{featurePhoto?<><Image source={{uri:featurePhoto.uri}} style={styles.photo}/><AppText style={{marginTop:10}}>{featurePhoto.caption}</AppText></>:<AppText>No project photos yet.</AppText>}</WidgetShell>;
if(widget.type==='creator') return <WidgetShell key={widget.id} widget={widget}><AppText>Draft a build update from recent sessions, photos, tasks, and blockers.</AppText><View style={{height:10}}/><Pressable style={styles.primarySmall}><AppText style={styles.primarySmallText}>Create Update Placeholder</AppText></Pressable></WidgetShell>;
return null;
};

return <Screen>
<LinearGradient colors={[colors.orangeSoft,colors.graphite]} style={styles.hero}>
<View style={styles.heroTop}>
<View style={{flex:1}}>
<Label>{store.dashboardPreset} WORKSPACE</Label>
<Title>{p.name}</Title>
<AppText style={{marginTop:10}}>{p.hook}</AppText>
</View>
<Pressable style={styles.editorButton} onPress={()=>setEditorOpen(true)}>
<MaterialCommunityIcons name="tune-variant" size={24} color={colors.white}/>
</Pressable>
</View>
<View style={styles.progressRow}><View style={styles.progressBar}><View style={[styles.progressFill,{width:`${p.progress}%`}]} /></View><AppText>{p.progress}%</AppText></View>
</LinearGradient>

<View style={styles.dock}>{store.quickActions.filter(a=>a.enabled).map(action=><Pressable key={action.id} style={styles.dockButton}><MaterialCommunityIcons name={actionIcons[action.type]} size={22} color={colors.orange}/><AppText style={styles.dockText}>{action.title}</AppText></Pressable>)}</View>

{enabledWidgets.map(renderWidget)}

<Modal visible={editorOpen} animationType="slide" transparent onRequestClose={()=>setEditorOpen(false)}>
<View style={styles.modalOverlay}>
<View style={styles.modalCard}>
<View style={styles.modalHeader}><Title style={{fontSize:24}}>Workspace Setup</Title><Pressable onPress={()=>setEditorOpen(false)}><MaterialCommunityIcons name="close" size={26} color={colors.white}/></Pressable></View>
<Label>ROLE PRESETS</Label>
<View style={styles.widgetRow}>{presets.map(preset=><Pressable key={preset} onPress={()=>store.applyDashboardPreset(preset)} style={[styles.widgetToggle,store.dashboardPreset===preset&&styles.widgetToggleActive]}><AppText>{preset}</AppText></Pressable>)}</View>
<Label style={{marginTop:18}}>WIDGET ORDER / SIZE</Label>
{widgets.map(widget=><View key={widget.id} style={styles.editorRow}>
<Pressable onPress={()=>store.toggleWidget(widget.id)} style={[styles.enabledDot,widget.enabled&&styles.enabledDotActive]} />
<View style={{flex:1}}><AppText>{widget.title}</AppText><Label>{widget.size}</Label></View>
<Pressable onPress={()=>store.moveWidget(widget.id,'up')} style={styles.editorIcon}><MaterialCommunityIcons name="arrow-up" size={20} color={colors.white}/></Pressable>
<Pressable onPress={()=>store.moveWidget(widget.id,'down')} style={styles.editorIcon}><MaterialCommunityIcons name="arrow-down" size={20} color={colors.white}/></Pressable>
<Pressable onPress={()=>store.toggleWidgetSize(widget.id)} style={styles.editorIcon}><MaterialCommunityIcons name="arrow-expand-vertical" size={20} color={colors.orange}/></Pressable>
</View>)}
<Label style={{marginTop:18}}>QUICK ACTIONS</Label>
<View style={styles.widgetRow}>{store.quickActions.map(action=><Pressable key={action.id} onPress={()=>store.toggleQuickAction(action.id)} style={[styles.widgetToggle,action.enabled&&styles.widgetToggleActive]}><AppText>{action.title}</AppText></Pressable>)}</View>
</View>
</View>
</Modal>
</Screen>
}

const styles = StyleSheet.create({
hero:{padding:spacing.lg,borderRadius:radius.lg,marginBottom:16,borderWidth:1,borderColor:colors.line},
heroTop:{flexDirection:'row',alignItems:'flex-start',gap:12},
editorButton:{backgroundColor:colors.orange,borderRadius:radius.md,padding:12},
progressRow:{marginTop:18,flexDirection:'row',alignItems:'center',gap:12},
progressBar:{flex:1,height:10,backgroundColor:colors.line,borderRadius:999,overflow:'hidden'},
progressFill:{height:'100%',backgroundColor:colors.orange},
dock:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:14},
dockButton:{backgroundColor:colors.panel,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:10,paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:6},
dockText:{fontSize:12},
compactCard:{minHeight:116},
expandedCard:{minHeight:170},
widgetHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},
widgetTitleRow:{flexDirection:'row',alignItems:'center',gap:8},
sizePill:{backgroundColor:colors.graphite,borderRadius:999,paddingVertical:4,paddingHorizontal:8},
sizeText:{fontSize:11,color:colors.steel},
widgetBig:{fontSize:28},
quickGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},
quickButton:{width:'30%',minWidth:86,backgroundColor:colors.graphite,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:10,alignItems:'center',gap:6},
statLine:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:8,borderBottomWidth:1,borderBottomColor:colors.line},
metric:{fontSize:22},
photo:{width:'100%',height:190,borderRadius:radius.md,backgroundColor:colors.graphite},
primarySmall:{marginTop:12,backgroundColor:colors.orange,borderRadius:radius.md,padding:12,alignItems:'center'},
primarySmallText:{fontWeight:'800',color:colors.white},
modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.72)',justifyContent:'flex-end'},
modalCard:{maxHeight:'88%',backgroundColor:colors.black,borderTopLeftRadius:28,borderTopRightRadius:28,padding:spacing.lg,borderWidth:1,borderColor:colors.line},
modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18},
widgetRow:{flexDirection:'row',flexWrap:'wrap',gap:10},
widgetToggle:{paddingVertical:10,paddingHorizontal:14,borderRadius:999,backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.line},
widgetToggleActive:{backgroundColor:colors.orangeSoft,borderColor:colors.orange},
editorRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.line},
enabledDot:{width:18,height:18,borderRadius:999,borderWidth:2,borderColor:colors.steel},
enabledDotActive:{backgroundColor:colors.orange,borderColor:colors.orange},
editorIcon:{backgroundColor:colors.graphite,borderRadius:radius.sm,padding:8}
});
