import { ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, shadows, spacing } from '@/theme/theme';

const hero='https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1400&auto=format&fit=crop';

export function TimelineScreen(){
const s=useFabricatorStore();

const items=[
...s.sessions.filter(x=>x.projectId===s.selectedProjectId).map(x=>({id:x.id,kind:'Session',title:x.title,meta:x.notes,date:x.createdAt,sort:x.createdAt,icon:'hammer-wrench'})),
...s.tasks.filter(x=>x.projectId===s.selectedProjectId).map(x=>({id:x.id,kind:'Task',title:x.title,meta:x.status,date:'Updated now',sort:'9999',icon:'clipboard-check'})),
...s.parts.filter(x=>x.projectId===s.selectedProjectId).map(x=>({id:x.id,kind:'Part',title:x.name,meta:x.status,date:'Updated now',sort:'9998',icon:'package-variant'})),
...s.photos.filter(x=>x.projectId===s.selectedProjectId).map(x=>({id:x.id,kind:'Photo',title:x.caption,meta:x.tag,date:x.createdAt,sort:x.createdAt,icon:'camera'}))
].sort((a,b)=>b.sort.localeCompare(a.sort));

return <Screen>
<ImageBackground source={{uri:hero}} style={styles.hero} imageStyle={styles.heroImage}>
<LinearGradient colors={['rgba(9,10,11,0.08)','rgba(9,10,11,0.75)','rgba(9,10,11,0.98)']} style={styles.heroShade}/>
<View style={styles.heroContent}>
<Label>BUILD CHRONOLOGY</Label>
<Title style={styles.heroTitle}>Workshop Timeline</Title>
<AppText style={styles.heroCopy}>A living fabrication archive that tracks sessions, components, photos, materials, and progress milestones.</AppText>
</View>
</ImageBackground>

<View style={styles.sectionHeader}>
<Label>DOCUMENTED HISTORY</Label>
<AppText>Operational build intelligence</AppText>
</View>

<View style={styles.timelineRail}/>

{items.map((i,index)=><View key={`${i.kind}-${i.id}`} style={styles.timelineRow}>
<View style={styles.timelineNode}>
<MaterialCommunityIcons name={i.icon as any} size={18} color={colors.orange}/>
</View>

<Card style={[styles.timelineCard,index===0&&styles.featuredCard]}>
<View style={styles.cardTop}>
<View>
<Label>{i.kind}</Label>
<Title style={styles.cardTitle}>{i.title}</Title>
</View>
<View style={styles.dateBadge}><AppText style={styles.dateText}>{i.date}</AppText></View>
</View>

<AppText style={styles.cardMeta}>{i.meta}</AppText>

<View style={styles.bottomRow}>
<View style={styles.statusPill}><AppText style={styles.statusText}>Logged</AppText></View>
<AppText style={styles.indexText}>#{String(index+1).padStart(2,'0')}</AppText>
</View>
</Card>
</View>)}

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
sectionHeader:{marginBottom:16},
timelineRail:{position:'absolute',left:31,top:430,bottom:50,width:2,backgroundColor:colors.line},
timelineRow:{flexDirection:'row',gap:14,marginBottom:16,alignItems:'flex-start'},
timelineNode:{width:34,height:34,borderRadius:999,backgroundColor:colors.orangeSoft,borderWidth:1,borderColor:'rgba(217,106,29,0.45)',alignItems:'center',justifyContent:'center',zIndex:2},
timelineCard:{flex:1},
featuredCard:{borderColor:'rgba(217,106,29,0.45)'},
cardTop:{flexDirection:'row',justifyContent:'space-between',gap:10,marginBottom:12},
cardTitle:{fontSize:22,lineHeight:28,marginTop:2},
dateBadge:{backgroundColor:colors.charcoal,borderRadius:999,paddingVertical:6,paddingHorizontal:10,borderWidth:1,borderColor:colors.line,alignSelf:'flex-start'},
dateText:{fontSize:11,color:colors.steel,fontWeight:'800'},
cardMeta:{color:colors.white,lineHeight:22},
bottomRow:{marginTop:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
statusPill:{backgroundColor:colors.orangeSoft,borderColor:'rgba(217,106,29,0.35)',borderWidth:1,paddingVertical:6,paddingHorizontal:12,borderRadius:999},
statusText:{color:colors.orange,fontWeight:'900',fontSize:11},
indexText:{color:colors.steel,fontWeight:'900'}
});
