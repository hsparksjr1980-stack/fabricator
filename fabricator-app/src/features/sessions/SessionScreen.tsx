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
const next:string[]=[];
const needed:string[]=[];

if(lower.includes('tacked')||lower.includes('weld')) completed.push('Fabrication work completed');
if(lower.includes('checked')||lower.includes('fit')) completed.push('Fitment or clearance checked');
if(lower.includes('need')) needed.push(notes.split('.').find(x=>x.toLowerCase().includes('need'))?.trim()||'Additional materials needed');
if(lower.includes('mount')) next.push('Finish mount prep or reinforcement');
if(lower.includes('clearance')) next.push('Verify final steering or panel clearance');
if(lower.includes('brake')) next.push('Finalize brake setup before next session');

return {completed,next,needed};
}

function Checklist({items,empty}:{items:string[];empty:string}){
return items.length?<View style={styles.checklist}>{items.map((item,index)=><View key={`${item}-${index}`} style={styles.checkRow}><View style={styles.checkbox}/><AppText style={styles.checkText}>{item}</AppText></View>)}</View>:<AppText>{empty}</AppText>
}

export function SessionScreen(){
const [notes,setNotes]=useState('Tacked panel, checked door gap, need seam sealer.');
const [active,setActive]=useState(false);
const store=useFabricatorStore();
const list=store.sessions.filter(s=>s.projectId===store.selectedProjectId);
const parsed=useMemo(()=>parseSession(notes),[notes]);

const save=()=>{ if(!notes.trim())return; store.addSession(notes.trim()); };

return <Screen>
<ImageBackground source={{uri:hero}} style={styles.hero} imageStyle={styles.heroImage}>
<LinearGradient colors={['rgba(9,10,11,0.08)','rgba(9,10,11,0.78)','rgba(9,10,11,0.98)']} style={styles.heroShade}/>
<View style={styles.heroContent}>
<Label>NEXT TIME IN THE SHOP</Label>
<Title style={styles.heroTitle}>Session Planner</Title>
<AppText style={styles.heroCopy}>Write down what happened, what is unfinished, what still needs parts, and what should happen the next time you are back in the garage.</AppText>
</View>
</ImageBackground>

<Card style={styles.sessionCard}>
<View style={styles.sessionHeader}><View><Label>SESSION NOTES</Label><Title style={styles.cardTitle}>{active?'Shop session active':'Ready for next work session'}</Title></View><Pressable style={[styles.timerButton,active&&styles.timerButtonActive]} onPress={()=>setActive(!active)}><MaterialCommunityIcons name={active?'pause':'play'} size={24} color={colors.white}/></Pressable></View>
<TextInput multiline value={notes} onChangeText={setNotes} placeholder="What got done? What still needs attention? What needs ordered before the next session?" placeholderTextColor={colors.steel} style={styles.input}/>
<Button title="Save workshop note" onPress={save}/>
</Card>

<View style={styles.sectionHeader}><Label>SHOP CHECKLISTS</Label><AppText>Operational notes pulled from the latest session</AppText></View>

<Card style={styles.listCard}><View style={styles.iconRow}><MaterialCommunityIcons name="check-decagram" size={22} color={colors.orange}/><Label>Finished This Session</Label></View><Checklist items={parsed.completed} empty="No completed work logged yet." /></Card>

<Card style={styles.listCard}><View style={styles.iconRow}><MaterialCommunityIcons name="clipboard-list-outline" size={22} color={colors.orange}/><Label>Next Time in the Shop</Label></View><Checklist items={parsed.next} empty="No next-session actions detected yet." /></Card>

<Card style={styles.listCard}><View style={styles.iconRow}><MaterialCommunityIcons name="cart-arrow-down" size={22} color={colors.orange}/><Label>Need Before Next Session</Label></View><Checklist items={parsed.needed} empty="No parts or materials detected yet." /></Card>

<View style={styles.sectionHeader}><Label>SESSION HISTORY</Label><AppText>Previous workshop notes</AppText></View>
{list.map(s=><Card key={s.id}><View style={styles.archiveTop}><Label>{s.createdAt} • {s.durationMinutes} min</Label><MaterialCommunityIcons name="notebook-outline" size={20} color={colors.orange}/></View><Title style={styles.archiveTitle}>{s.title}</Title><AppText style={styles.archiveNotes}>{s.notes}</AppText></Card>)}
</Screen>
}

const styles=StyleSheet.create({
hero:{height:310,borderRadius:radius.xl,overflow:'hidden',marginBottom:18,borderWidth:1,borderColor:colors.line,backgroundColor:colors.black,...shadows.panel},heroImage:{opacity:0.78},heroShade:{...StyleSheet.absoluteFillObject},heroContent:{flex:1,justifyContent:'flex-end',padding:spacing.lg},heroTitle:{fontSize:38,lineHeight:42},heroCopy:{color:colors.white,marginTop:10},sessionCard:{borderColor:'rgba(217,106,29,0.38)'},sessionHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14},cardTitle:{fontSize:24,lineHeight:29},timerButton:{width:52,height:52,borderRadius:999,backgroundColor:colors.panelHigh,borderWidth:1,borderColor:colors.line,alignItems:'center',justifyContent:'center'},timerButtonActive:{backgroundColor:colors.orange,borderColor:colors.orange},input:{minHeight:170,color:colors.white,backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:radius.lg,padding:spacing.lg,marginBottom:spacing.md,textAlignVertical:'top'},sectionHeader:{marginTop:4,marginBottom:12},listCard:{marginBottom:12},iconRow:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12},checklist:{gap:10},checkRow:{flexDirection:'row',gap:12,alignItems:'center'},checkbox:{width:22,height:22,borderRadius:7,borderWidth:2,borderColor:colors.orange,backgroundColor:colors.charcoal},checkText:{flex:1,color:colors.white,fontWeight:'700'},archiveTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},archiveTitle:{fontSize:21,lineHeight:27,marginTop:6},archiveNotes:{color:colors.white,lineHeight:22,marginTop:8}
});
