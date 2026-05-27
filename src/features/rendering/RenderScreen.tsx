import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { estimateRoughMaterial, MaterialKind } from '@/services/materials/materialEstimateService';
import { colors, radius, spacing } from '@/theme/theme';

const advisorModes=[
{key:'priority',title:'Priority List',icon:'format-list-numbered',copy:'Help decide what to work on first.'},
{key:'photo',title:'Analyze Photo',icon:'image-search-outline',copy:'Use a build photo to spot missing pieces or concerns.'},
{key:'materials',title:'Material Estimate',icon:'ruler-square',copy:'Rough planning calculator for shop materials.'},
{key:'trouble',title:'Troubleshoot',icon:'wrench-clock',copy:'Ask for help when a build problem has you stuck.'}
];

export function RenderScreen(){
const [mode,setMode]=useState('priority');
const [question,setQuestion]=useState('What should I do first before the next shop session?');
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
if(!result.canceled && result.assets?.[0]) setImage(result.assets[0].uri);
};

return <Screen>
<View style={styles.heroPanel}>
<Label>WORKSHOP ADVISOR</Label>
<Title style={styles.heroTitle}>When You Need a Second Set of Eyes</Title>
<AppText style={styles.heroCopy}>Keep the main app simple. Use Advisor only when you need prioritization, troubleshooting, photo review, or build planning help.</AppText>
<View style={styles.advisorBadge}><MaterialCommunityIcons name="star-four-points" size={16} color={colors.orange}/><AppText style={styles.badgeText}>Future Pro workspace</AppText></View>
</View>

<View style={styles.modeGrid}>
{advisorModes.map(item=><Pressable key={item.key} onPress={()=>setMode(item.key)} style={[styles.modeCard,mode===item.key&&styles.modeCardActive]}>
<MaterialCommunityIcons name={item.icon as any} size={26} color={colors.orange}/>
<AppText style={styles.modeTitle}>{item.title}</AppText>
<AppText style={styles.modeCopy}>{item.copy}</AppText>
</Pressable>)}
</View>

{mode==='priority'?<Card style={styles.focusCard}>
<View style={styles.cardTop}><View><Label>AI PRIORITY LIST</Label><Title style={styles.cardTitle}>What should happen first?</Title></View><MaterialCommunityIcons name="format-list-checks" size={28} color={colors.orange}/></View>
<TextInput value={question} onChangeText={setQuestion} multiline placeholder="Describe what you are stuck on or what is left to do." placeholderTextColor={colors.steel} style={styles.textArea}/>
<Card style={styles.mockResult}>
<Label>PREVIEW OUTPUT</Label>
<AppText style={styles.listItem}>1. Clear blockers that stop other work.</AppText>
<AppText style={styles.listItem}>2. Stage parts before starting fabrication.</AppText>
<AppText style={styles.listItem}>3. Finish fitment checks before final weld/assembly.</AppText>
<AppText style={styles.listItem}>4. Save cosmetic work until structure and function are stable.</AppText>
</Card>
<Button title="Generate Priority List Placeholder" />
</Card>:null}

{mode==='photo'?<Card style={styles.focusCard}>
<View style={styles.cardTop}><View><Label>PHOTO ADVISOR</Label><Title style={styles.cardTitle}>Analyze a build photo</Title></View><MaterialCommunityIcons name="image-search-outline" size={28} color={colors.orange}/></View>
<AppText style={{marginBottom:12}}>Upload a photo or sketch later for missing parts, fitment concerns, safety checks, or sequencing advice.</AppText>
<Button title={image?'Change image':'Upload reference photo'} variant="ghost" onPress={pickImage}/>
{image?<Image source={{uri:image}} style={styles.image}/>:null}
<Card style={styles.mockResult}><Label>FUTURE ANALYSIS</Label><AppText>Potential missing fasteners, clearance issues, unsupported brackets, routing concerns, or parts to add to the checklist.</AppText></Card>
</Card>:null}

{mode==='materials'?<Card style={styles.focusCard}>
<View style={styles.cardTop}><View><Label>MATERIAL PLANNER</Label><Title style={styles.cardTitle}>Rough estimate</Title></View><MaterialCommunityIcons name="ruler-square" size={28} color={colors.orange}/></View>
<View style={styles.row}>{(['steel','aluminum','wood'] as MaterialKind[]).map(type=><Button key={type} title={type} variant={material===type?'primary':'ghost'} onPress={()=>setMaterial(type)} />)}</View>
<TextInput value={lengthFeet} onChangeText={setLengthFeet} placeholder="Length feet" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={widthInches} onChangeText={setWidthInches} placeholder="Width inches" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={thicknessInches} onChangeText={setThicknessInches} placeholder="Thickness inches" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={quantity} onChangeText={setQuantity} placeholder="Quantity" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={waste} onChangeText={setWaste} placeholder="Waste percent" keyboardType="numeric" placeholderTextColor={colors.steel} style={styles.input}/>
<Card style={styles.mockResult}><Label>ROUGH ESTIMATE</Label><AppText>Linear Feet: {estimate.linearFeet}</AppText><AppText>Volume: {estimate.volumeCubicInches} cubic inches</AppText><AppText>Estimated Weight: {estimate.estimatedWeightLb} lb</AppText>{material==='wood'?<AppText>Board Feet: {estimate.boardFeet}</AppText>:null}</Card>
</Card>:null}

{mode==='trouble'?<Card style={styles.focusCard}>
<View style={styles.cardTop}><View><Label>TROUBLESHOOTING</Label><Title style={styles.cardTitle}>Describe the problem</Title></View><MaterialCommunityIcons name="wrench-clock" size={28} color={colors.orange}/></View>
<TextInput value={question} onChangeText={setQuestion} multiline placeholder="Example: steering shaft clearance is tight near the header." placeholderTextColor={colors.steel} style={styles.textArea}/>
<Card style={styles.mockResult}><Label>ADVISOR SHOULD HELP WITH</Label><AppText>Cause, options, safety concerns, parts/tools needed, and a practical step-by-step next move.</AppText></Card>
<Button title="Ask Advisor Placeholder" />
</Card>:null}
<View style={{height:40}} />
</Screen>
}

const styles=StyleSheet.create({
heroPanel:{backgroundColor:colors.panelHigh,borderColor:colors.line,borderWidth:1,borderRadius:radius.xl,padding:spacing.lg,marginBottom:18},
heroTitle:{fontSize:34,lineHeight:39},
heroCopy:{color:colors.white,marginTop:10,lineHeight:22},
advisorBadge:{alignSelf:'flex-start',flexDirection:'row',gap:7,alignItems:'center',backgroundColor:colors.orangeSoft,borderColor:'rgba(217,106,29,0.35)',borderWidth:1,borderRadius:999,paddingVertical:8,paddingHorizontal:12,marginTop:16},
badgeText:{fontSize:12,color:colors.white,fontWeight:'900'},
modeGrid:{flexDirection:'row',flexWrap:'wrap',gap:12,marginBottom:18},
modeCard:{width:'48%',backgroundColor:colors.panel,borderColor:colors.line,borderWidth:1,borderRadius:radius.lg,padding:14,minHeight:132},
modeCardActive:{borderColor:colors.orange,backgroundColor:colors.panelHigh},
modeTitle:{color:colors.white,fontWeight:'900',fontSize:15,marginTop:8},
modeCopy:{fontSize:12,color:colors.muted,marginTop:6,lineHeight:17},
focusCard:{borderColor:'rgba(217,106,29,0.35)'},
cardTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:14},
cardTitle:{fontSize:23,lineHeight:29},
textArea:{minHeight:130,backgroundColor:colors.charcoal,borderWidth:1,borderColor:colors.line,color:colors.white,padding:spacing.md,borderRadius:radius.md,marginBottom:12,textAlignVertical:'top'},
mockResult:{backgroundColor:colors.charcoal,borderColor:colors.line},
listItem:{color:colors.white,marginTop:8},
image:{height:220,borderRadius:radius.md,marginTop:14},
row:{flexDirection:'row',flexWrap:'wrap',gap:10,marginVertical:14},
input:{backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.line,color:colors.white,padding:spacing.md,borderRadius:radius.md,marginBottom:12}
});
