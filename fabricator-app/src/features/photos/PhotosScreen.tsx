import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { StatusPill } from '@/components/StatusPill';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

export function PhotosScreen(){
const store=useFabricatorStore();
const [caption,setCaption]=useState('');
const [tag,setTag]=useState('Fabrication');
const [uri,setUri]=useState('');
const photos=store.photos.filter(p=>p.projectId===store.selectedProjectId);

const pickImage=async()=>{
const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
if(!permission.granted)return;
const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:.8});
if(!result.canceled && result.assets?.[0]){
setUri(result.assets[0].uri);
}
};

const save=()=>{
if(!caption.trim())return;
store.addPhoto(caption.trim(),tag.trim()||'General',uri.trim()||undefined);
setCaption('');
setTag('Fabrication');
setUri('');
};

return <Screen>
<Label>Photo gallery</Label>
<Title>Tagged progress</Title>
<Card>
<Label>ADD PHOTO NOTE</Label>
<AppText style={{marginBottom:10}}>Capture shop progress photos and organize them by fabrication system or build stage.</AppText>
<TextInput value={caption} onChangeText={setCaption} placeholder="Photo caption" placeholderTextColor={colors.steel} style={inputStyle}/>
<TextInput value={tag} onChangeText={setTag} placeholder="Tag/category" placeholderTextColor={colors.steel} style={inputStyle}/>
<Button title={uri?'Change photo':'Select photo'} variant="ghost" onPress={pickImage}/>
{uri?<Image source={{uri}} style={{height:180,borderRadius:radius.md,marginTop:12}}/>:null}
<View style={{height:12}} />
<Button title="Add photo note" onPress={save}/>
</Card>
{photos.map(p=><Card key={p.id}><Image source={{uri:p.uri}} style={{height:190,borderRadius:radius.md,marginBottom:12}}/><StatusPill label={p.tag}/><AppText style={{marginTop:8}}>{p.caption}</AppText><AppText style={{marginTop:6,color:colors.steel}}>{p.createdAt}</AppText></Card>)}
<View style={{height:40}} />
</Screen>
}

const inputStyle={color:colors.white,backgroundColor:colors.graphite,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:spacing.md,marginVertical:spacing.sm};
