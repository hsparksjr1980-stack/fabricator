import React, { useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image, ImageBackground, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { mockAiService } from '@/services/ai/aiService';
import { AiSummary, DashboardPreset, DashboardWidget } from '@/types/models';
import { colors, radius, shadows, spacing } from '@/theme/theme';

const presets:DashboardPreset[]=['Fabricator','Woodworker','Restoration','Content Creator','Race Build','Motorcycle Build'];
const actionIcons:any={session:'garage',voice:'microphone-outline',task:'clipboard-check-outline',part:'tools',photo:'camera-outline',render:'cube-outline'};
const widgetIcons:any={focus:'target',quickActions:'lightning-bolt-outline',progress:'chart-donut',stats:'view-dashboard-outline',nextSession:'clipboard-list-outline',blockers:'alert-octagon-outline',parts:'package-variant-closed',materialsInventory:'warehouse',sessionTimer:'timer-outline',photoFeature:'image-multiple-outline',creator:'share-variant-outline'};
const heroImage='https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop';
const fallbackPhoto='https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1400&auto=format&fit=crop';

function PreviewList({items,empty}:{items:string[];empty:string}){
return <View style={styles.previewList}>{items.slice(0,5).length?items.slice(0,5).map((item,index)=><View key={`${item}-${index}`} style={styles.previewRow}><View style={styles.checkbox}/><AppText style={styles.previewText}>{item}</AppText></View>):<AppText>{empty}</AppText>}{items.length>5?<AppText style={styles.moreText}>+ {items.length-5} more</AppText>:null}</View>
}

function WidgetShell({widget,children,onPress,hint,featured,editMode,onEnterEdit}:{widget:DashboardWidget;children:React.ReactNode;onPress?:()=>void;hint?:string;featured?:boolean;editMode:boolean;onEnterEdit:()=>void}){
const store=useFabricatorStore();
const resize=(event:any)=>{event?.stopPropagation?.();store.toggleWidgetSize(widget.id)};
const hide=(event:any)=>{event?.stopPropagation?.();store.toggleWidget(widget.id)};
const moveUp=(event:any)=>{event?.stopPropagation?.();store.moveWidget(widget.id,'up')};
const moveDown=(event:any)=>{event?.stopPropagation?.();store.moveWidget(widget.id,'down')};
return <Pressable onPress={onPress} onLongPress={onEnterEdit} disabled={editMode&&!onPress} style={({pressed})=>[{transform:[{scale:pressed&&!editMode?0.985:1}]}]}>
<Card style={[widget.size==='compact'?styles.compactCard:styles.expandedCard, featured&&styles.featuredWidget, editMode&&styles.editingWidget]}>
<Pressable onPress={resize} hitSlop={10} style={styles.resizeTab}>
<MaterialCommunityIcons name={widget.size==='compact'?'arrow-expand-vertical':'arrow-collapse-vertical'} size={18} color={colors.orange}/>
</Pressable>
{editMode?<View style={styles.editRail}>
<Pressable onPress={moveUp} style={styles.editButton}><MaterialCommunityIcons name="arrow-up" size={18} color={colors.white}/></Pressable>
<Pressable onPress={moveDown} style={styles.editButton}><MaterialCommunityIcons name="arrow-down" size={18} color={colors.white}/></Pressable>
<Pressable onPress={hide} style={styles.editButton}><MaterialCommunityIcons name="eye-off-outline" size={18} color={colors.orange}/></Pressable>
</View>:null}
<View style={styles.widgetHeader}>
<View style={styles.widgetTitleRow}><View style={styles.iconBadge}><MaterialCommunityIcons name={widgetIcons[widget.type]} size={18} color={colors.orange}/></View><Label>{widget.title}</Label></View>
<View style={styles.headerRight}><AppText style={styles.sizeText}>{widget.size}</AppText>{onPress&&!editMode?<MaterialCommunityIcons name="chevron-right" size={22} color={colors.steel}/>:null}</View>
</View>
{children}
{hint?<AppText style={styles.tapHint}>{editMode?'Use edge controls to resize, move, or hide this panel.':hint}</AppText>:null}
</Card>
</Pressable>
}

export function DashboardScreen(){
const navigation=useNavigation<any>();
const store=useFabricatorStore();
const p=store.activeProject();
const enabledWidgets=store.dashboardWidgets.filter(w=>w.enabled);
const hiddenWidgets=store.dashboardWidgets.filter(w=>!w.enabled);
const [summary,setSummary]=useState<AiSummary>();
const [editorOpen,setEditorOpen]=useState(false);
const [editMode,setEditMode]=useState(false);
const [timerRunning,setTimerRunning]=useState(false);
const [timerMinutes,setTimerMinutes]=useState(0);
useEffect(()=>{ mockAiService.summarizeBuildInput({sessions:store.sessions,voiceNotes:store.voiceNotes}).then(setSummary) },[store.sessions.length,store.voiceNotes.length]);
useEffect(()=>{ if(!timerRunning)return; const interval=setInterval(()=>setTimerMinutes(m=>m+1),60000); return()=>clearInterval(interval); },[timerRunning]);

const projectTasks=useMemo(()=>store.tasks.filter(t=>t.projectId===store.selectedProjectId),[store.tasks,store.selectedProjectId]);
const openTasks=projectTasks.filter(t=>t.status!=='Done');
const inProgressTasks=projectTasks.filter(t=>t.status==='In Progress');
const doneTasks=projectTasks.filter(t=>t.status==='Done');
const neededParts=store.parts.filter(part=>part.projectId===store.selectedProjectId&&part.status==='Need to Order');
const availableMaterials=store.parts.filter(part=>part.projectId===store.selectedProjectId&&part.status!=='Need to Order');
const featurePhoto=store.photos.find(photo=>photo.projectId===store.selectedProjectId);
const blockers=[...neededParts.map(part=>`Order ${part.name}`),...openTasks.slice(0,2).map(task=>task.title)];
const nextItems=[...inProgressTasks.map(t=>t.title),...(summary?.nextSessionChecklist||[])].slice(0,5);
const goAction=(type:string)=>{ if(type==='session')navigation.navigate('Session'); if(type==='voice')navigation.navigate('Voice'); if(type==='task')navigation.navigate('Tasks'); if(type==='part')navigation.navigate('Parts'); if(type==='photo')navigation.navigate('Photos'); if(type==='render')navigation.navigate('Render'); };
const activeSession = store.activeSession();

const sessionMinutes = store.sessionStartedAt
  ? Math.max(
      1,
      Math.floor(
        (Date.now() - new Date(store.sessionStartedAt).getTime()) / 60000
      )
    )
  : 0;
if(!p){
  navigation.navigate('Welcome');
  return null;
}

const shell=(widget:DashboardWidget,children:React.ReactNode,onPress?:()=>void,hint?:string,featured?:boolean)=><WidgetShell key={widget.id} widget={widget} editMode={editMode} onEnterEdit={()=>setEditMode(true)} onPress={editMode?undefined:onPress} hint={hint} featured={featured}>{children}</WidgetShell>;
const renderWidget=(widget:DashboardWidget)=>{
if(widget.type==='focus') return shell(widget,<><View style={styles.panelRail}/><Title style={styles.widgetBig}>Today in Shop</Title><PreviewList items={nextItems} empty="No next-session items yet." /></>,()=>navigation.navigate('Tasks'),'Tap to open the full checklist.',true);
if(widget.type==='quickActions') return shell(widget,<View style={styles.quickGrid}>{store.quickActions.filter(a=>a.enabled).map(action=><Pressable key={action.id} style={({pressed})=>[styles.quickButton,pressed&&styles.pressed]} onPress={()=>goAction(action.type)}><MaterialCommunityIcons name={actionIcons[action.type]} size={25} color={colors.orange}/><AppText style={styles.quickText}>{action.title}</AppText></Pressable>)}</View>,undefined,'Direct capture tools for garage work.');
if(widget.type==='progress') return shell(widget,<View style={styles.progressInstrument}><Title style={styles.progressNumber}>{p.progress}%</Title><View style={{flex:1}}><View style={styles.progressBar}><View style={[styles.progressFill,{width:`${p.progress}%`}]} /></View><AppText style={{marginTop:8}}>{p.phase} • {p.status}</AppText></View></View>,()=>navigation.getParent()?.navigate('ProjectEdit'),'Tap to update phase and progress.',true);
if(widget.type==='stats') return shell(widget,<View style={styles.metricGrid}><View style={styles.metricBox}><Label>Open</Label><Title style={styles.metric}>{openTasks.length}</Title></View><View style={styles.metricBox}><Label>Done</Label><Title style={styles.metric}>{doneTasks.length}</Title></View><View style={styles.metricBox}><Label>Parts</Label><Title style={styles.metric}>{neededParts.length}</Title></View></View>,()=>navigation.navigate('Tasks'),'Tap to review active work.');
if(widget.type==='nextSession') return shell(widget,<PreviewList items={nextItems} empty="No next-session list yet." />,()=>navigation.navigate('Tasks'),'Tap to manage the full list.');
if(widget.type==='blockers') return shell(widget,<PreviewList items={blockers} empty="No blockers detected." />,()=>navigation.navigate('Tasks'),'Tap to clear blockers.');
if(widget.type==='parts') return shell(widget,<PreviewList items={neededParts.map(part=>part.name)} empty="No parts marked need to order." />,()=>navigation.navigate('Parts'),'Tap to manage the full parts list.');
if(widget.type==='materialsInventory') return shell(widget,<PreviewList items={availableMaterials.map(part=>`${part.name} — ${part.status}`)} empty="No inventory staged yet." />,()=>navigation.navigate('Parts'),'Tap to manage inventory.');
if(widget.type==='sessionTimer') return shell(widget,<><Title style={styles.widgetBig}>{timerMinutes} min</Title><AppText>{timerRunning?'Shop timer running':'Timer ready for next session'}</AppText><Pressable style={styles.primarySmall} onPress={()=>setTimerRunning(!timerRunning)}><AppText style={styles.primarySmallText}>{timerRunning?'Pause':'Start'} Timer</AppText></Pressable></>,()=>navigation.navigate('Session'),'Tap card to log session notes.');
if(widget.type==='photoFeature') return shell(widget,<><Image source={{uri:featurePhoto?.uri||fallbackPhoto}} style={styles.photo}/><AppText style={{marginTop:10}}>{featurePhoto?.caption||'Featured progress image placeholder for cinematic build documentation.'}</AppText></>,()=>navigation.navigate('Photos'),'Tap to add tagged progress photos.',true);
if(widget.type==='creator') return shell(widget,<><AppText>Draft a build update from recent sessions, photos, tasks, and blockers.</AppText><View style={{height:10}}/><Pressable style={styles.primarySmall}><AppText style={styles.primarySmallText}>Create Update Placeholder</AppText></Pressable></>,()=>navigation.navigate('Render'),'Tap to open concept/export placeholders.');
return null;
};

return <Screen>
<ImageBackground source={{uri:heroImage}} style={styles.hero} imageStyle={styles.heroImage}><LinearGradient colors={['rgba(9,10,11,0.05)','rgba(9,10,11,0.7)','rgba(9,10,11,0.98)']} style={styles.heroShade}/><View style={styles.gridOverlay}/><View style={styles.heroContent}><View style={styles.heroTop}><View style={{flex:1}}><Label>{store.dashboardPreset} WORKSPACE</Label><Title style={styles.heroTitle}>{p.name}</Title><AppText style={styles.heroCopy}>{p.hook}</AppText></View><Pressable style={styles.editorButton} onPress={()=>setEditorOpen(true)}><MaterialCommunityIcons name="tune-variant" size={24} color={colors.white}/></Pressable></View><View style={styles.heroMetaRow}><View style={styles.heroChip}><Label>PHASE</Label><AppText style={styles.chipValue}>{p.phase}</AppText></View><View style={styles.heroChip}><Label>OPEN</Label><AppText style={styles.chipValue}>{openTasks.length}</AppText></View><View style={styles.heroChip}><Label>FOCUS</Label><AppText style={styles.chipValue}>Top 5</AppText></View></View><View style={styles.progressRow}><View style={styles.progressBar}><View style={[styles.progressFill,{width:`${p.progress}%`}]} /></View><AppText style={styles.progressText}>{p.progress}%</AppText></View></View></ImageBackground>
<View style={{marginBottom:16}}>
<Pressable
  style={styles.startSessionBanner}
  onPress={() => store.startSession('Garage Session')}
>
  <MaterialCommunityIcons
    name="garage-open"
    size={24}
    color={colors.orange}
  />

  <View style={{ flex: 1 }}>
    <Label>READY FOR SHOP TIME</Label>

    <AppText style={styles.startSessionText}>
      Start a garage session to automatically link tasks,
      parts, and photos.
    </AppText>
  </View>
</Pressable>
</View>
<View style={styles.customBar}><View><Label>{editMode?'CUSTOMIZE DASHBOARD':'OPERATIONS'}</Label><AppText>{editMode?'Move, resize, and hide panels. Changes autosave.':'Top checklist items from each workshop section.'}</AppText></View><Pressable style={[styles.modeButton,editMode&&styles.modeButtonActive]} onPress={()=>setEditMode(!editMode)}><MaterialCommunityIcons name={editMode?'check-bold':'view-dashboard-edit'} size={18} color={colors.white}/><AppText style={styles.modeButtonText}>{editMode?'Done':'Edit'}</AppText></Pressable></View>
<View style={styles.dock}>{store.quickActions.filter(a=>a.enabled).slice(0,6).map(action=><Pressable key={action.id} style={({pressed})=>[styles.dockButton,pressed&&styles.pressed]} onPress={()=>goAction(action.type)}><MaterialCommunityIcons name={actionIcons[action.type]} size={22} color={colors.orange}/><AppText style={styles.dockText}>{action.title}</AppText></Pressable>)}</View>
{enabledWidgets.map(renderWidget)}
{editMode&&hiddenWidgets.length?<Card style={styles.hiddenCard}><Label>HIDDEN PANELS</Label><View style={styles.widgetRow}>{hiddenWidgets.map(widget=><Pressable key={widget.id} onPress={()=>store.toggleWidget(widget.id)} style={styles.widgetToggle}><AppText>{widget.title}</AppText></Pressable>)}</View></Card>:null}

<Modal visible={editorOpen} animationType="slide" transparent onRequestClose={()=>setEditorOpen(false)}><View style={styles.modalOverlay}><View style={styles.modalCard}><View style={styles.modalHeader}><Title style={{fontSize:24}}>Workspace Setup</Title><Pressable onPress={()=>setEditorOpen(false)}><MaterialCommunityIcons name="close" size={26} color={colors.white}/></Pressable></View><Label>ROLE PRESETS</Label><View style={styles.widgetRow}>{presets.map(preset=><Pressable key={preset} onPress={()=>store.applyDashboardPreset(preset)} style={[styles.widgetToggle,store.dashboardPreset===preset&&styles.widgetToggleActive]}><AppText>{preset}</AppText></Pressable>)}</View><Label style={{marginTop:18}}>QUICK ACTIONS</Label><View style={styles.widgetRow}>{store.quickActions.map(action=><Pressable key={action.id} onPress={()=>store.toggleQuickAction(action.id)} style={[styles.widgetToggle,action.enabled&&styles.widgetToggleActive]}><AppText>{action.title}</AppText></Pressable>)}</View></View></View></Modal>
</Screen>
}

const styles = StyleSheet.create({
activeSessionCard:{
  marginBottom:16,
  borderColor:'rgba(217,106,29,0.45)',
  backgroundColor:colors.panelHigh
},

activeSessionRow:{
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'space-between',
  gap:12
},

activeSessionTitle:{
  fontSize:24,
  lineHeight:30,
  marginTop:4
},

activeSessionMeta:{
  marginTop:6,
  color:colors.steel
},

activeSessionActions:{
  flexDirection:'row',
  gap:10
},

sessionAction:{
  width:48,
  height:48,
  borderRadius:14,
  backgroundColor:colors.charcoal,
  borderWidth:1,
  borderColor:colors.line,
  alignItems:'center',
  justifyContent:'center'
},

endSessionButton:{
  backgroundColor:colors.orange
},

startSessionBanner:{
  flexDirection:'row',
  alignItems:'center',
  gap:14,
  backgroundColor:colors.panelHigh,
  borderWidth:1,
  borderColor:'rgba(217,106,29,0.35)',
  borderRadius:radius.lg,
  padding:16,
  marginBottom:16
},

startSessionText:{
  marginTop:4,
  color:colors.steel,
  lineHeight:20
},  
hero:{height:430,borderRadius:radius.xl,overflow:'hidden',marginBottom:16,borderWidth:1,borderColor:colors.line,backgroundColor:colors.black,...shadows.panel},heroImage:{opacity:0.76},heroShade:{...StyleSheet.absoluteFillObject},gridOverlay:{...StyleSheet.absoluteFillObject,opacity:0.08,borderWidth:1,borderColor:colors.blueprint},heroContent:{flex:1,justifyContent:'flex-end',padding:spacing.lg},heroTop:{flexDirection:'row',alignItems:'flex-start',gap:12},heroTitle:{fontSize:38,lineHeight:42,letterSpacing:-1.4},heroCopy:{marginTop:10,color:colors.white,maxWidth:'92%'},editorButton:{backgroundColor:'rgba(217,106,29,0.92)',borderRadius:radius.md,padding:12,borderWidth:1,borderColor:'rgba(255,255,255,0.18)'},heroMetaRow:{flexDirection:'row',gap:9,marginTop:22},heroChip:{flex:1,backgroundColor:'rgba(16,18,20,0.78)',borderColor:'rgba(255,255,255,0.12)',borderWidth:1,borderRadius:radius.md,padding:10},chipValue:{color:colors.white,fontSize:12,marginTop:4,fontWeight:'800'},progressRow:{marginTop:18,flexDirection:'row',alignItems:'center',gap:12},progressBar:{flex:1,height:10,backgroundColor:'rgba(255,255,255,0.15)',borderRadius:999,overflow:'hidden'},progressFill:{height:'100%',backgroundColor:colors.orange},progressText:{color:colors.white,fontWeight:'900'},customBar:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:14},modeButton:{flexDirection:'row',gap:7,alignItems:'center',backgroundColor:colors.panelHigh,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:10,paddingHorizontal:14},modeButtonActive:{backgroundColor:colors.orange},modeButtonText:{color:colors.white,fontWeight:'900',fontSize:12},dock:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:20},dockButton:{backgroundColor:colors.panelHigh,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:10,paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:6},dockText:{fontSize:12,color:colors.white},pressed:{opacity:0.78,transform:[{scale:0.98}]},compactCard:{minHeight:120},expandedCard:{minHeight:176},featuredWidget:{borderColor:'rgba(217,106,29,0.45)'},editingWidget:{borderColor:'rgba(217,106,29,0.75)'},resizeTab:{position:'absolute',right:0,top:54,bottom:20,width:32,backgroundColor:'rgba(217,106,29,0.09)',borderLeftWidth:1,borderLeftColor:'rgba(217,106,29,0.28)',alignItems:'center',justifyContent:'center',zIndex:5},editRail:{position:'absolute',left:0,top:54,bottom:20,width:36,backgroundColor:'rgba(0,0,0,0.22)',borderRightWidth:1,borderRightColor:'rgba(255,255,255,0.08)',alignItems:'center',justifyContent:'center',gap:8,zIndex:6},editButton:{width:26,height:26,borderRadius:8,backgroundColor:colors.graphite,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.line},widgetHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12,paddingRight:26},widgetTitleRow:{flexDirection:'row',alignItems:'center',gap:8,flex:1},iconBadge:{width:34,height:34,borderRadius:12,backgroundColor:colors.orangeSoft,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'rgba(217,106,29,0.35)'},headerRight:{flexDirection:'row',alignItems:'center',gap:6},sizeText:{fontSize:10,color:colors.steel,textTransform:'uppercase',fontWeight:'900'},tapHint:{marginTop:12,color:colors.steel,fontSize:12},panelRail:{position:'absolute',left:0,top:56,bottom:20,width:3,backgroundColor:colors.orange,borderTopRightRadius:99,borderBottomRightRadius:99},widgetBig:{fontSize:30,lineHeight:35},previewList:{gap:8,paddingRight:28,paddingLeft:2},previewRow:{flexDirection:'row',alignItems:'center',gap:10},checkbox:{width:22,height:22,borderRadius:7,borderWidth:2,borderColor:colors.orange,backgroundColor:colors.charcoal},previewText:{flex:1,color:colors.white,fontWeight:'700'},moreText:{marginTop:4,color:colors.steel,fontSize:12},quickGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,paddingRight:28},quickButton:{width:'30%',minWidth:88,backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:12,alignItems:'center',gap:7},quickText:{fontSize:12,textAlign:'center',color:colors.white},progressInstrument:{flexDirection:'row',alignItems:'center',gap:18,paddingRight:28},progressNumber:{fontSize:44,lineHeight:50,color:colors.orange},metricGrid:{flexDirection:'row',gap:10,paddingRight:28},metricBox:{flex:1,backgroundColor:colors.charcoal,borderRadius:radius.md,padding:12,borderWidth:1,borderColor:colors.line},metric:{fontSize:26,lineHeight:31},photo:{width:'100%',height:220,borderRadius:radius.md,backgroundColor:colors.graphite},primarySmall:{marginTop:12,backgroundColor:colors.orange,borderRadius:radius.md,padding:12,alignItems:'center'},primarySmallText:{fontWeight:'900',color:colors.white},hiddenCard:{borderColor:'rgba(217,106,29,0.35)'},modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.72)',justifyContent:'flex-end'},modalCard:{maxHeight:'88%',backgroundColor:colors.black,borderTopLeftRadius:28,borderTopRightRadius:28,padding:spacing.lg,borderWidth:1,borderColor:colors.line},modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18},widgetRow:{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:10},widgetToggle:{paddingVertical:10,paddingHorizontal:14,borderRadius:999,backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.line},widgetToggleActive:{backgroundColor:colors.orangeSoft,borderColor:colors.orange}
});
