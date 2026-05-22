import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image, ImageBackground, Pressable, StyleSheet, TextInput, View } from 'react-native';
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
const galleryPlaceholders=[
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1200&auto=format&fit=crop'
];

export function PhotosScreen(){
const store=useFabricatorStore();
const [caption,setCaption]=useState('');
const [tag,setTag]=useState('Fabrication');
const [uri,setUri]=useState('');
const photos=store.photos.filter(p=>p.projectId===store.selectedProjectId);
const visualPhotos=photos.length?photos:galleryPlaceholders.map((image,index)=>({id:`placeholder-${index}`,uri:image,caption:['Weld prep and chassis alignment','Material staging and bench work','Workshop documentation placeholder'][index],tag:['Fabrication','Materials','Progress'][index],createdAt:'Preview'}));
const featured=visualPhotos[0];

const pickImage=async()=>{
const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
if(!permission.granted)return;
const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:.8});
if(!result.canceled && result.assets?.[0]) setUri(result.assets[0].uri);
};

const takePhoto=async()=>{
const permission=await ImagePicker.requestCameraPermissionsAsync();
if(!permission.granted)return;
const result=await ImagePicker.launchCameraAsync({quality:.8});
if(!result.canceled && result.assets?.[0]) setUri(result.assets[0].uri);
};

const save=()=>{
if(!caption.trim())return;
store.addPhoto(caption.trim(),tag.trim()||'General',uri.trim()||undefined);
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
<AppText style={styles.heroCopy}>Photo-first storytelling for fabrication details, restoration milestones, woodworking stages, and race build progress.</AppText>
<View style={styles.heroStats}>
<View style={styles.statChip}><Label>Photos</Label><AppText style={styles.statValue}>{photos.length}</AppText></View>
<View style={styles.statChip}><Label>Mode</Label><AppText style={styles.statValue}>Masonry</AppText></View>
</View>
</View>
</ImageBackground>

<Card style={styles.captureCard}>
<View style={styles.captureHeader}>
<View>
<Label>CAPTURE BAY</Label>
<Title style={styles.captureTitle}>Add shop evidence</Title>
</View>
<MaterialCommunityIcons name="camera-iris" size={30} color={colors.orange}/>
</View>
<AppText style={{marginBottom:10}}>Capture work as it happens. Tag each image by operation, material, phase, or visual proof.</AppText>
<TextInput value={caption} onChangeText={setCaption} placeholder="Photo caption" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={tag} onChangeText={setTag} placeholder="Tag/category" placeholderTextColor={colors.steel} style={styles.input}/>
<View style={styles.actionRow}>
<Button title="Camera" variant="ghost" onPress={takePhoto}/>
<Button title={uri?'Change Photo':'Gallery'} variant="ghost" onPress={pickImage}/>
</View>
{uri?<Image source={{uri}} style={styles.preview}/>:null}
<View style={{height:12}} />
<Button title="Add photo note" onPress={save}/>
</Card>

<View style={styles.sectionHeader}>
<Label>VISUAL BUILD LOG</Label>
<AppText>Cinematic masonry documentation</AppText>
</View>

<View style={styles.masonry}>
{visualPhotos.map((p,index)=><Pressable key={p.id} style={[styles.tile,index%3===0?styles.tallTile:styles.shortTile]}>
<ImageBackground source={{uri:p.uri}} style={styles.tileImage} imageStyle={styles.tileImageStyle}>
<LinearGradient colors={['transparent','rgba(0,0,0,0.82)']} style={styles.tileShade}/>
<View style={styles.tileText}>
<StatusPill label={p.tag}/>
<AppText style={styles.caption}>{p.caption}</AppText>
<AppText style={styles.date}>{p.createdAt}</AppText>
</View>
</ImageBackground>
</Pressable>)}
</View>
<View style={{height:40}} />
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
actionRow:{flexDirection:'row',gap:10},
preview:{height:190,borderRadius:radius.md,marginTop:12},
sectionHeader:{marginTop:4,marginBottom:12},
masonry:{flexDirection:'row',flexWrap:'wrap',gap:12},
tile:{width:'48%',borderRadius:radius.lg,overflow:'hidden',backgroundColor:colors.panel,borderWidth:1,borderColor:colors.line,...shadows.panel},
tallTile:{height:280},
shortTile:{height:210},
tileImage:{flex:1,justifyContent:'flex-end'},
tileImageStyle:{borderRadius:radius.lg},
tileShade:{...StyleSheet.absoluteFillObject},
tileText:{padding:12},
caption:{color:colors.white,fontWeight:'800',marginTop:8},
date:{color:colors.steel,fontSize:12,marginTop:4}
});
