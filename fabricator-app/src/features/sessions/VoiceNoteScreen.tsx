import { useMemo, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { mockVoiceTranscriptionService } from '@/services/voice/voiceTranscriptionService';
import { colors, radius, shadows, spacing } from '@/theme/theme';

const hero='https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1400&auto=format&fit=crop';

function extractOperationalItems(text:string){
const lower=text.toLowerCase();
const parts:string[]=[];
const next:string[]=[];
const blockers:string[]=[];

if(lower.includes('dom')) parts.push('1.75 DOM tubing');
if(lower.includes('heims')) parts.push('Front heims');
if(lower.includes('tabs')) parts.push('Brake tabs');
if(lower.includes('aluminum')) parts.push('Aluminum sheet');

if(lower.includes('next')) next.push('Continue next-session fabrication priorities');
if(lower.includes('steering')) next.push('Validate steering clearance');
if(lower.includes('crossmember')) next.push('Tack rear crossmember');
if(lower.includes('gusset')) next.push('Finish gusset reinforcement');

if(lower.includes('waiting')) blockers.push('Waiting on supplier parts');
if(lower.includes('clearance')) blockers.push('Potential clearance conflict');

return {parts,next,blockers};
}

export function VoiceNoteScreen(){
const store=useFabricatorStore();
const notes=store.voiceNotes.filter(v=>v.projectId===store.selectedProjectId);
const [recording,setRecording]=useState(false);
const latest=notes[0];
const extracted=useMemo(()=>latest?extractOperationalItems(latest.transcript):{parts:[],next:[],blockers:[]},[latest]);

const mockRecord=async()=>{
setRecording(true);
setTimeout(async()=>{
const transcript=await mockVoiceTranscriptionService.transcribe();
store.addVoiceNote(transcript);
setRecording(false);
},1800)
}

return <Screen>
<ImageBackground source={{uri:hero}} style={styles.hero} imageStyle={styles.heroImage}>
<LinearGradient colors={['rgba(9,10,11,0.05)','rgba(9,10,11,0.72)','rgba(9,10,11,0.98)']} style={styles.heroShade}/>
<View style={styles.heroContent}>
<Label>VOICE OPERATIONS</Label>
<Title style={styles.heroTitle}>Workshop Memory</Title>
<AppText style={styles.heroCopy}>Capture fabrication thinking in real time. Fabricator converts spoken shop notes into tasks, parts, blockers, and next-session intelligence.</AppText>
</View>
</ImageBackground>

<Card style={styles.captureCard}>
<View style={styles.captureHeader}>
<View>
<Label>LIVE SESSION</Label>
<Title style={styles.captureTitle}>{recording?'Recording in shop':'Ready for hands-free capture'}</Title>
</View>
<View style={[styles.statusOrb,recording&&styles.statusOrbActive]} />
</View>

<Pressable onPress={mockRecord} style={({pressed})=>[styles.recordButton,pressed&&styles.recordPressed]}>
<View style={styles.innerRecord}>
<MaterialCommunityIcons name={recording?'stop':'microphone'} size={52} color={colors.white}/>
</View>
</Pressable>

<AppText style={styles.captureText}>
Speak naturally during fabrication work. The system will later classify tasks, needed materials, measurements, blockers, and next-session priorities automatically.
</AppText>

<Button title={recording?'Recording...':'Mock Workshop Capture'} onPress={mockRecord} />
</Card>

{latest?<>
<View style={styles.sectionHeader}><Label>AI EXTRACTION</Label><AppText>Operational build intelligence</AppText></View>

<View style={styles.grid}>
<Card style={styles.gridCard}>
<View style={styles.iconRow}><MaterialCommunityIcons name="package-variant-closed" size={22} color={colors.orange}/><Label>Parts To Order</Label></View>
{extracted.parts.length?extracted.parts.map(item=><AppText key={item} style={styles.listItem}>• {item}</AppText>):<AppText>No parts detected yet.</AppText>}
</Card>

<Card style={styles.gridCard}>
<View style={styles.iconRow}><MaterialCommunityIcons name="hammer-wrench" size={22} color={colors.orange}/><Label>Next Session</Label></View>
{extracted.next.length?extracted.next.map(item=><AppText key={item} style={styles.listItem}>• {item}</AppText>):<AppText>No next-session actions extracted.</AppText>}
</Card>
</View>

<Card>
<View style={styles.iconRow}><MaterialCommunityIcons name="alert-outline" size={22} color={colors.orange}/><Label>Blockers + Risks</Label></View>
{extracted.blockers.length?extracted.blockers.map(item=><AppText key={item} style={styles.listItem}>• {item}</AppText>):<AppText>No major blockers detected.</AppText>}
</Card>

<Card style={styles.transcriptCard}>
<View style={styles.iconRow}><MaterialCommunityIcons name="waveform" size={22} color={colors.orange}/><Label>Latest Transcript</Label></View>
<AppText style={styles.transcript}>{latest.transcript}</AppText>
</Card>
</>:null}

<View style={styles.sectionHeader}><Label>VOICE HISTORY</Label><AppText>Garage session memory archive</AppText></View>

<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyRow}>
{notes.map(note=><Card key={note.id} style={styles.historyCard}><Label>{note.createdAt}</Label><AppText style={styles.historyText}>{note.transcript}</AppText></Card>)}
</ScrollView>

<View style={{height:40}} />
</Screen>
}

const styles=StyleSheet.create({
hero:{height:320,borderRadius:radius.xl,overflow:'hidden',marginBottom:18,borderWidth:1,borderColor:colors.line,backgroundColor:colors.black,...shadows.panel},
heroImage:{opacity:0.78},
heroShade:{...StyleSheet.absoluteFillObject},
heroContent:{flex:1,justifyContent:'flex-end',padding:spacing.lg},
heroTitle:{fontSize:38,lineHeight:42},
heroCopy:{color:colors.white,marginTop:10},
captureCard:{alignItems:'center',borderColor:'rgba(217,106,29,0.35)'},
captureHeader:{width:'100%',flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18},
captureTitle:{fontSize:24,lineHeight:29},
statusOrb:{width:18,height:18,borderRadius:999,backgroundColor:colors.steel},
statusOrbActive:{backgroundColor:colors.orange},
recordButton:{width:180,height:180,borderRadius:999,backgroundColor:colors.orangeSoft,borderWidth:1,borderColor:'rgba(217,106,29,0.35)',alignItems:'center',justifyContent:'center',marginBottom:20},
innerRecord:{width:130,height:130,borderRadius:999,backgroundColor:colors.orange,alignItems:'center',justifyContent:'center'},
recordPressed:{opacity:0.82,transform:[{scale:0.98}]},
captureText:{textAlign:'center',marginBottom:18,maxWidth:'90%'},
sectionHeader:{marginTop:4,marginBottom:12},
grid:{flexDirection:'row',gap:12},
gridCard:{flex:1},
iconRow:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12},
listItem:{marginBottom:6,color:colors.white},
transcriptCard:{borderColor:'rgba(217,106,29,0.28)'},
transcript:{lineHeight:24,color:colors.white},
historyRow:{paddingBottom:10,gap:12},
historyCard:{width:280},
historyText:{color:colors.white,lineHeight:22}
});
