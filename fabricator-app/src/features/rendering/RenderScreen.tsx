import { useMemo, useState } from 'react';
import { Image, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { estimateRoughMaterial, MaterialKind } from '@/services/materials/materialEstimateService';
import { colors, radius, spacing } from '@/theme/theme';

export function RenderScreen(){
const [image,setImage]=useState('');
const [material,setMaterial]=useState<MaterialKind>('steel');
const [lengthFeet,setLengthFeet]=useState('8');
const [widthInches,setWidthInches]=useState('4');
const [thicknessInches,setThicknessInches]=useState('0.125');
const [quantity,setQuantity]=useState('4');
const [waste,setWaste]=useState('12');

const estimate=useMemo(()=>estimateRoughMaterial({
materialKind:material,
lengthFeet:Number(lengthFeet)||0,
widthInches:Number(widthInches)||0,
thicknessInches:Number(thicknessInches)||0,
quantity:Number(quantity)||1,
wastePercent:Number(waste)||0
}),[material,lengthFeet,widthInches,thicknessInches,quantity,waste]);

const pickImage=async()=>{
const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
if(!permission.granted)return;
const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:.8});
if(!result.canceled && result.assets?.[0]){
setImage(result.assets[0].uri);
}
};

return <Screen>
<Label>Material estimator</Label>
<Title>Visual planning, not CAD</Title>
<AppText style={{marginVertical:12}}>Upload a reference image or sketch and enter rough dimensions to estimate fabrication or woodworking materials.</AppText>

<Card>
<Label>REFERENCE IMAGE</Label>
<Button title={image?'Change image':'Upload sketch or reference'} variant="ghost" onPress={pickImage}/>
{image?<Image source={{uri:image}} style={{height:220,borderRadius:radius.md,marginTop:14}}/>:null}
</Card>

<Card>
<Label>MATERIAL TYPE</Label>
<View style={styles.row}>
{(['steel','aluminum','wood'] as MaterialKind[]).map(type=><Button key={type} title={type} variant={material===type?'primary':'ghost'} onPress={()=>setMaterial(type)} />)}
</View>

<TextInput value={lengthFeet} onChangeText={setLengthFeet} placeholder="Length feet" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={widthInches} onChangeText={setWidthInches} placeholder="Width inches" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={thicknessInches} onChangeText={setThicknessInches} placeholder="Thickness inches" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={quantity} onChangeText={setQuantity} placeholder="Quantity" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={waste} onChangeText={setWaste} placeholder="Waste percent" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input}/>
</Card>

<Card>
<Label>ROUGH ESTIMATE</Label>
<Title style={{fontSize:20}}>Estimated Materials</Title>
<AppText style={{marginTop:12}}>Linear Feet: {estimate.linearFeet}</AppText>
<AppText>Volume: {estimate.volumeCubicInches} cubic inches</AppText>
<AppText>Estimated Weight: {estimate.estimatedWeightLb} lb</AppText>
{material==='wood'?<AppText>Board Feet: {estimate.boardFeet}</AppText>:null}
<AppText style={{marginTop:12}}>This is an early-stage planning estimate only and not a fabrication-grade engineering calculation.</AppText>
</Card>
</Screen>
}

const styles={
row:{flexDirection:'row',flexWrap:'wrap',gap:10,marginVertical:14},
input:{backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.line,color:colors.white,padding:spacing.md,borderRadius:radius.md,marginBottom:12}
};
