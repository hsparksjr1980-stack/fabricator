import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { mockAiService } from '@/services/ai/aiService';
import { useEffect, useState } from 'react';
import { AiSummary } from '@/types/models';
import { colors, radius, spacing } from '@/theme/theme';

export function DashboardScreen(){
const store=useFabricatorStore();
const p=store.activeProject();
const widgets=store.dashboardWidgets;
const [summary,setSummary]=useState<AiSummary>();

useEffect(()=>{
mockAiService.summarizeBuildInput({sessions:store.sessions,voiceNotes:store.voiceNotes}).then(setSummary)
},[store.sessions.length,store.voiceNotes.length]);

if(!p)return null;

return <Screen>
<LinearGradient
colors={[colors.orangeSoft,colors.graphite]}
style={styles.hero}>
<Label>{p.category}</Label>
<Title>{p.name}</Title>
<AppText style={{marginTop:10}}>{p.hook}</AppText>
<View style={styles.progressRow}>
<View style={styles.progressBar}>
<View style={[styles.progressFill,{width:`${p.progress}%`}]} />
</View>
<AppText>{p.progress}%</AppText>
</View>
</LinearGradient>

<Card>
<Label>DASHBOARD LAYOUT</Label>
<AppText style={{marginTop:8,marginBottom:14}}>Enable widgets that match your workflow.</AppText>
<View style={styles.widgetRow}>
{widgets.map(widget=><Pressable
key={widget.id}
onPress={()=>store.toggleWidget(widget.id)}
style={[
styles.widgetToggle,
widget.enabled && styles.widgetToggleActive
]}>
<AppText>{widget.title}</AppText>
</Pressable>)}
</View>
</Card>

{widgets.find(w=>w.type==='progress'&&w.enabled) &&
<Card>
<Label>PROJECT PROGRESS</Label>
<Title style={{fontSize:36}}>{p.progress}%</Title>
<AppText>Status: {p.status}</AppText>
</Card>
}

{widgets.find(w=>w.type==='stats'&&w.enabled) &&
<View style={styles.statsRow}>
<Card style={styles.statCard}>
<Label>PHASE</Label>
<Title style={{fontSize:22}}>{p.phase}</Title>
</Card>

<Card style={styles.statCard}>
<Label>UPDATED</Label>
<Title style={{fontSize:22}}>{p.updatedAt}</Title>
</Card>
</View>
}

{widgets.find(w=>w.type==='nextSession'&&w.enabled) &&
<Card>
<Label>AI NEXT SESSION</Label>
{summary?.nextSessionChecklist.map(i=><AppText key={i}>• {i}</AppText>)}
</Card>
}

{widgets.find(w=>w.type==='parts'&&w.enabled) &&
<Card>
<Label>PARTS / MATERIALS</Label>
{summary?.partsNeeded.map(i=><AppText key={i}>• {i}</AppText>)}
</Card>
}

{widgets.find(w=>w.type==='creator'&&w.enabled) &&
<Card>
<Label>CREATOR EXPORTS</Label>
<AppText>Future support for fabrication updates, before/after progress posts, reels, build summaries, and public project pages.</AppText>
</Card>
}

</Screen>
}

const styles = StyleSheet.create({
hero:{
padding:spacing.lg,
borderRadius:radius.lg,
marginBottom:16,
borderWidth:1,
borderColor:colors.line
},
progressRow:{
marginTop:18,
flexDirection:'row',
alignItems:'center',
gap:12
},
progressBar:{
flex:1,
height:10,
backgroundColor:colors.line,
borderRadius:999,
overflow:'hidden'
},
progressFill:{
height:'100%',
backgroundColor:colors.orange
},
statsRow:{
flexDirection:'row',
gap:12
},
statCard:{
flex:1
},
widgetRow:{
flexDirection:'row',
flexWrap:'wrap',
gap:10
},
widgetToggle:{
paddingVertical:10,
paddingHorizontal:14,
borderRadius:999,
backgroundColor:colors.graphite,
borderWidth:1,
borderColor:colors.line
},
widgetToggleActive:{
backgroundColor:colors.orangeSoft,
borderColor:colors.orange
}
});
