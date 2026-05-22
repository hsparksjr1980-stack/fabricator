import { useMemo, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { colors, radius, shadows, spacing } from '@/theme/theme';
import { useFabricatorStore } from '@/state/useFabricatorStore';

const hero='https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1400&auto=format&fit=crop';

function parseSession(notes:string){
const lower=notes.toLowerCase();
const completed:string[]=[];
const remaining:string[]=[];
const needed:string[]=[];

if(lower.includes('tacked')||lower.includes('weld')) completed.push('Fabrication work logged');
if(lower.includes('checked')||lower.includes('fit')) completed.push('Fitment / clearance checked');
if(lower.includes('need')) needed.push(notes.split('.').find(x=>x.toLowerCase().includes('need'))?.trim()||'Parts or materials needed');
if(lower.includes('sealer')) needed.push('Seam sealer');
if(lower.includes('gap')||lower.includes('clearance')) remaining.push('Verify final gaps and clearances');
if(lower.includes('mount')) remaining.push('Finish mount prep or reinforcement');

return {completed,remaining,needed};
}

export function SessionScreen(){
const [notes,setNotes]=useState('Tacked panel, checked door gap, need seam sealer.');
const [active,setActive]=useState(false);
const store=useFabricatorStore();
const list=store.sessions.filter(s=>s.projectId===store.selectedProjectId);
const parsed=useMemo(()=>parseSession(notes),[notes]);

const save=()=>{
if(!notes.trim())return;
store.addSession(notes.trim());
};

return <Screen>
<ImageBackground source={{uri:hero}} style={styles.hero} imageStyle={styles.heroImage}>
<LinearGradient colors={['rgba(9,10,11,0.08)','rgba(9,10,11,0.78)','rgba(9,10,11,0.98)']} style={styles.heroShade}/>
<View style={styles.heroContent}>
<Label>GARAGE SESSION</Label>
<Title style={styles.heroTitle}>Shop Briefing</Title>
<AppText style={styles.heroCopy}>Log what happened, what changed, what still needs work, and what should be ready before the next session.</AppText>
</View>
</ImageBackground>

<Card style={styles.sessionCard}>
<View style={styles.sessionHeader}>
<View>
<Label>ACTIVE BAY</Label>
<Title style={styles.cardTitle}>{active?'Session running':'Ready to log work'}</Title>
</View>
<Pressable style={[styles.timerButton,active&&styles.timerButtonActive]} onPress={()=>setActive(!active)}>
<MaterialCommunityIcons name={active?'pause':'play'} size={24} color={colors.white}/>
</Pressable>
</View>

<TextInput multiline value={notes} onChangeText={setNotes} placeholder="What did you do? What blocked you? What do you need to order?" placeholderTextColor={colors.steel} style={styles.input}/>
<Button title="Save session note" onPress={save}/>
</Card>

<View style={styles.sectionHeader}><Label>SESSION INTELLIGENCE</Label><AppText>Preview of extracted operational work</AppText></View>
<View style={styles.grid}>
<Card style={styles.gridCard}><View style={styles.iconRow}><MaterialCommunityIcons name="check-decagram" size={22} color={colors.orange}/><Label>Completed</Label></View>{parsed.completed.length?parsed.completed.map(i=><AppText key={i} style={styles.listItem}>• {i}</AppText>):<AppText>Nothing detected yet.</AppText>}</Card>
<Card style={styles.gridCard}><View style={styles.iconRow}><MaterialCommunityIcons name="clipboard-text-clock" size={22} color={colors.orange}/><Label>Remaining</Label></View>{parsed.remaining.length?parsed.remaining.map(i=><AppText key={i} style={styles.listItem}>• {i}</AppText>):<AppText>No remaining work detected.</AppText>}</Card>
</View>
<Card><View style={styles.iconRow}><MaterialCommunityIcons name="cart-arrow-down" size={22} color={colors.orange}/><Label>Parts / Materials Needed</Label></View>{parsed.needed.length?parsed.needed.map(i=><AppText key={i} style={styles.listItem}>• {i}</AppText>):<AppText>No material needs detected.</AppText>}</Card>

<View style={styles.sectionHeader}><Label>SESSION ARCHIVE</Label><AppText>Recent shop memory</AppText></View>
{list.map(s=><Card key={s.id}>
<View style={styles.archiveTop}><Label>{s.createdAt} • {s.durationMinutes} min</Label><MaterialCommunityIcons name="file-document-edit" size={20} color={colors.orange}/></View>
<Title style={styles.archiveTitle}>{s.title}</Title>
<AppText style={styles.archiveNotes}>{s.notes}</AppText>
</Card>)}
</Screen>
}

const styles=StyleSheet.create({
hero:{height:310,borderRadius:radius.xl,overflow:'hidden',marginBottom:18,borderWidth:1,borderColor:colors.line,backgroundColor:colors.black,...shadows.panel},
heroImage:{opacity:0.78},
heroShade:{...StyleSheet.absoluteFillObject},
heroContent:{flex:1,justifyContent:'flex-end',padding:spacing.lg},
heroTitle:{fontSize:38,lineHeight:42},
heroCopy:{color:colors.white,marginTop:10},
sessionCard:{borderColor:'rgba(217,106,29,0.38)'},
sessionHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14},
cardTitle:{fontSize:24,lineHeight:29},
timerButton:{width:52,height:52,borderRadius:999,backgroundColor:colors.panelHigh,borderWidth:1,borderColor:colors.line,alignItems:'center',justifyContent:'center'},
timerButtonActive:{backgroundColor:colors.orange,borderColor:colors.orange},
input:{minHeight:170,color:colors.white,backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:radius.lg,padding:spacing.lg,marginBottom:spacing.md,textAlignVertical:'top'},
sectionHeader:{marginTop:4,marginBottom:12},
grid:{flexDirection:'row',gap:12},
gridCard:{flex:1},
iconRow:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12},
listItem:{color:colors.white,marginBottom:6},
archiveTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
archiveTitle:{fontSize:21,lineHeight:27,marginTop:6},
archiveNotes:{color:colors.white,lineHeight:22,marginTop:8}
});
