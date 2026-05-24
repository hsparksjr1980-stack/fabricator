import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { StatusPill } from '@/components/StatusPill';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, shadows, spacing } from '@/theme/theme';

const fallback='https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1400&auto=format&fit=crop';
const tags=['All','Fabrication','Engine','Wiring','Paint','Interior','Suspension','Rust Repair'];

export function PhotosScreen(){
const store=useFabricatorStore();
const [caption,setCaption]=useState('');
const [tag,setTag]=useState('Fabrication');
const [uri,setUri]=useState('');
const [filter,setFilter]=useState('All');
const [selectedPhoto,setSelectedPhoto]=useState<any>(null);

const photos=store.photos.filter(p=>p.projectId===store.selectedProjectId);

const filteredPhotos=useMemo(()=>{
if(filter==='All') return photos;
return photos.filter(p=>p.tag===filter);
},[photos,filter]);

const featured=filteredPhotos[0]||photos[0];

const pickImage=async()=>{
const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
if(!permission.granted)return;

const result=await ImagePicker.launchImageLibraryAsync({
mediaTypes:['images'],
quality:.8,
allowsEditing:true
});

if(!result.canceled && result.assets?.[0]) setUri(result.assets[0].uri);
};

const takePhoto=async()=>{
const permission=await ImagePicker.requestCameraPermissionsAsync();
if(!permission.granted)return;

const result=await ImagePicker.launchCameraAsync({
quality:.8,
allowsEditing:true
});

if(!result.canceled && result.assets?.[0]) setUri(result.assets[0].uri);
};

const save=()=>{
if(!caption.trim())return;

store.addPhoto(
caption.trim(),
tag.trim()||'General',
uri.trim()||undefined
);

setCaption('');
setTag('Fabrication');
setUri('');
};

return <Screen>
<ImageBackground source={{uri:featured?.uri||fallback}} style={styles.hero} imageStyle={styles.heroImage}>
<LinearGradient colors={['rgba(9,10,11,0.05)','rgba(9,10,11,0.7)','rgba(9,10,11,0.98)']} style={styles.heroShade}/>
<View style={styles.heroContent}>
<Label>BUILD DOCUMENTATION</Label>
<Title style={styles.heroTitle}>Progress Gallery</Title>
<AppText style={styles.heroCopy}>Capture fabrication progress, teardown references, measurements, parts, and milestone documentation directly from the garage.</AppText>
<View style={styles.heroStats}>
<View style={styles.statChip}><Label>Photos</Label><AppText style={styles.statValue}>{photos.length}</AppText></View>
<View style={styles.statChip}><Label>Filter</Label><AppText style={styles.statValue}>{filter}</AppText></View>
</View>
</View>
</ImageBackground>

<Card style={styles.captureCard}>
<View style={styles.captureHeader}>
<View>
<Label>CAPTURE BAY</Label>
<Title style={styles.captureTitle}>Document the build</Title>
</View>
<MaterialCommunityIcons name="camera-iris" size={30} color={colors.orange}/>
</View>

<AppText style={{marginBottom:10}}>
Capture work as it happens and organize photos by system or fabrication stage.
</AppText>

<TextInput
value={caption}
onChangeText={setCaption}
placeholder="Photo caption"
placeholderTextColor={colors.steel}
style={styles.input}
/>

<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagRow}>
{tags.filter(t=>t!=='All').map(item=><Pressable key={item} onPress={()=>setTag(item)} style={[styles.tagChip,tag===item&&styles.tagChipActive]}><AppText style={[styles.tagText,tag===item&&styles.tagTextActive]}>{item}</AppText></Pressable>)}
</ScrollView>

<View style={styles.actionRow}>
<Button title="Camera" variant="ghost" onPress={takePhoto}/>
<Button title={uri?'Change Photo':'Gallery'} variant="ghost" onPress={pickImage}/>
</View>

{uri?<Image source={{uri}} style={styles.preview}/>:null}

<View style={{height:12}} />
<Button title="Save Build Photo" onPress={save}/>
</Card>

<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
{tags.map(item=><Pressable key={item} onPress={()=>setFilter(item)} style={[styles.filterChip,filter===item&&styles.filterChipActive]}><AppText style={[styles.filterText,filter===item&&styles.filterTextActive]}>{item}</AppText></Pressable>)}
</ScrollView>

<View style={styles.sectionHeader}>
<View>
<Label>VISUAL BUILD LOG</Label>
<Title style={styles.sectionTitle}>{filteredPhotos.length} photos</Title>
</View>
<AppText style={styles.helper}>Tap image for fullscreen view.</AppText>
</View>

{filteredPhotos.length?<View style={styles.galleryGrid}>
{filteredPhotos.map((p,index)=><Pressable key={p.id} onPress={()=>setSelectedPhoto(p)} style={[styles.tile,index%3===0?styles.tallTile:styles.shortTile]}>
<ImageBackground source={{uri:p.uri}} style={styles.tileImage} imageStyle={styles.tileImageStyle}>
<LinearGradient colors={['transparent','rgba(0,0,0,0.85)']} style={styles.tileShade}/>
<View style={styles.tileText}>
<StatusPill label={p.tag}/>
<AppText style={styles.caption}>{p.caption}</AppText>
<AppText style={styles.date}>{p.createdAt}</AppText>
</View>
</ImageBackground>
</Pressable>)}
</View>:<Card style={styles.emptyCard}><MaterialCommunityIcons name="camera-plus" size={48} color={colors.orange}/><Title style={styles.emptyTitle}>No build photos yet</Title><AppText style={styles.emptyCopy}>Capture progress from the garage to start building your visual project history.</AppText></Card>}

<Modal visible={!!selectedPhoto} transparent animationType="fade" onRequestClose={()=>setSelectedPhoto(null)}>
<View style={styles.modalOverlay}>
<Pressable style={styles.closeButton} onPress={()=>setSelectedPhoto(null)}>
<MaterialCommunityIcons name="close" size={28} color={colors.white}/>
</Pressable>

{selectedPhoto?<View style={styles.modalContent}>
<Image source={{uri:selectedPhoto.uri}} style={styles.fullscreenImage} resizeMode="contain"/>
<View style={styles.modalMeta}>
<StatusPill label={selectedPhoto.tag}/>
<Title style={styles.modalTitle}>{selectedPhoto.caption}</Title>
<AppText style={styles.modalDate}>{selectedPhoto.createdAt}</AppText>
</View>
</View>:null}
</View>
</Modal>

<View style={{height:50}} />
</Screen>
}

const styles=StyleSheet.create({
hero:{height:360,borderRadius:radius.xl,overflow:'hidden',marginBottom:16,borderWidth:1,borderColor:colors.line,backgroundColor:colors.black,...shadows.panel},
heroImage:{opacity:0.78},
heroShade:{...StyleSheet.absoluteFillObject},
heroContent:{flex:1,justifyContent:'flex-end',padding:spacing.lg},
heroTitle:{fontSize:38,lineHeight:42},
heroCopy:{color:colors.white,marginTop:10},
heroStats:{flexDirection:'row',gap:10,marginTop:18},
statChip:{flex:1,backgroundColor:'rgba(16,18,20,0.78)',borderColor:'rgba(255,255,255,0.12)',borderWidth:1,borderRadius:radius.md,padding:10},
statValue:{color:colors.white,fontWeight:'900',marginTop:4},
captureCard:{borderColor:'rgba(217,106,29,0.35)'},
captureHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10},
captureTitle:{fontSize:24,lineHeight:29},
input:{color:colors.white,backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:spacing.md,marginVertical:spacing.sm},
tagRow:{gap:8,paddingVertical:10},
tagChip:{backgroundColor:colors.charcoal,borderWidth:1,borderColor:colors.line,borderRadius:999,paddingVertical:8,paddingHorizontal:12},
tagChipActive:{backgroundColor:colors.orangeSoft,borderColor:colors.orange},
tagText:{fontSize:12,color:colors.steel,fontWeight:'800'},
tagTextActive:{color:colors.white},
actionRow:{flexDirection:'row',gap:10},
preview:{height:220,borderRadius:radius.md,marginTop:12},
filterRow:{gap:8,paddingBottom:12},
filterChip:{backgroundColor:colors.panel,borderWidth:1,borderColor:colors.line,borderRadius:999,paddingVertical:10,paddingHorizontal:14},
filterChipActive:{backgroundColor:colors.orangeSoft,borderColor:colors.orange},
filterText:{color:colors.steel,fontWeight:'800'},
filterTextActive:{color:colors.white},
sectionHeader:{marginTop:4,marginBottom:12,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end'},
sectionTitle:{fontSize:26,lineHeight:32},
helper:{fontSize:12,color:colors.steel},
galleryGrid:{flexDirection:'row',flexWrap:'wrap',gap:12},
tile:{width:'48%',borderRadius:radius.lg,overflow:'hidden',backgroundColor:colors.panel,borderWidth:1,borderColor:colors.line,...shadows.panel},
tallTile:{height:280},
shortTile:{height:210},
tileImage:{flex:1,justifyContent:'flex-end'},
tileImageStyle:{borderRadius:radius.lg},
tileShade:{...StyleSheet.absoluteFillObject},
tileText:{padding:12},
caption:{color:colors.white,fontWeight:'800',marginTop:8},
date:{color:colors.steel,fontSize:12,marginTop:4},
emptyCard:{alignItems:'center',paddingVertical:40,borderStyle:'dashed'},
emptyTitle:{fontSize:24,lineHeight:30,marginTop:14},
emptyCopy:{marginTop:10,color:colors.steel,textAlign:'center',lineHeight:22},
modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.94)',justifyContent:'center'},
closeButton:{position:'absolute',top:60,right:20,zIndex:20},
modalContent:{padding:16},
fullscreenImage:{width:'100%',height:'78%'},
modalMeta:{marginTop:16},
modalTitle:{fontSize:28,lineHeight:34,marginTop:12},
modalDate:{marginTop:8,color:colors.steel}
});
