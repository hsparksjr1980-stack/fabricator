import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

const systems=['Chassis','Engine','Electrical','Body','Interior','Shop Supplies'];

function buildSearchQuery(part:any){
return [part.name,part.partNumber,part.vendor].filter(Boolean).join(' ')
}

function PartRow({part,onPress}:{part:any;onPress:()=>void}){
const search=()=>{
const query=buildSearchQuery(part);
Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(query)}`)
};

return <Pressable onPress={onPress} style={({pressed})=>[styles.partRow,pressed&&styles.pressed]}>
<View style={{flex:1}}>
<AppText style={styles.partTitle}>{part.name}</AppText>
{part.partNumber?<AppText style={styles.partNumber}>{part.partNumber}</AppText>:null}
{part.vendor?<AppText style={styles.vendorText}>{part.vendor}</AppText>:null}
{part.description?<AppText style={styles.description}>{part.description}</AppText>:null}
<View style={styles.metaRow}><Label>{part.system}</Label><AppText style={styles.status}>{part.status}</AppText></View>
</View>
<Pressable style={styles.searchButton} onPress={search}>
<MaterialCommunityIcons name="magnify" size={20} color={colors.orange}/>
</Pressable>
</Pressable>
}

export function PartsScreen(){
const store=useFabricatorStore();
const [name,setName]=useState('');
const [partNumber,setPartNumber]=useState('');
const [vendor,setVendor]=useState('');
const [description,setDescription]=useState('');
const [system,setSystem]=useState('Chassis');

const parts=store.parts.filter(p=>p.projectId===store.selectedProjectId);

const grouped=useMemo(()=>({
'To Buy':parts.filter(p=>p.status==='Need to Order'),
'On Shelf':parts.filter(p=>p.status==='On Hand'||p.status==='Ordered'),
Installed:parts.filter(p=>p.status==='Installed')
}),[parts]);

const save=()=>{
if(!name.trim())return;
store.addPart(name.trim(),system,vendor.trim(),partNumber.trim(),description.trim());
setName('');
setPartNumber('');
setVendor('');
setDescription('');
};

return <Screen>
<View style={styles.hero}>
<Label>PARTS WORKFLOW</Label>
<Title style={styles.heroTitle}>Shop Parts + Materials</Title>
<AppText style={styles.heroCopy}>Quick capture for fabrication parts, hardware, materials, and supplies.</AppText>
</View>

<Card style={styles.createCard}>
<View style={styles.headerRow}><View><Label>QUICK CAPTURE</Label><Title style={styles.cardTitle}>Type or dictate</Title></View><MaterialCommunityIcons name="microphone-message" size={30} color={colors.orange}/></View>
<TextInput value={name} onChangeText={setName} placeholder="Part name" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={partNumber} onChangeText={setPartNumber} placeholder="Part number" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={vendor} onChangeText={setVendor} placeholder="Vendor" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={description} onChangeText={setDescription} placeholder="Description or notes" placeholderTextColor={colors.steel} multiline style={[styles.input,{minHeight:90}]}/>
<View style={styles.chips}>{systems.map(item=><Pressable key={item} onPress={()=>setSystem(item)} style={[styles.chip,system===item&&styles.chipActive]}><AppText style={[styles.chipText,system===item&&styles.chipTextActive]}>{item}</AppText></Pressable>)}</View>
<Button title="Save Part" onPress={save}/>
</Card>

{Object.entries(grouped).map(([section,list])=><View key={section} style={styles.section}><View style={styles.sectionHeader}><Label>{section}</Label><AppText>{list.length} items</AppText></View>{list.length?list.map(p=><PartRow key={p.id} part={p} onPress={()=>store.cyclePart(p.id)} />):<Card><AppText>No items here yet.</AppText></Card>}</View>)}
<View style={{height:60}} />
</Screen>
}

const styles=StyleSheet.create({
hero:{backgroundColor:colors.panelHigh,borderColor:colors.line,borderWidth:1,borderRadius:radius.xl,padding:spacing.lg,marginBottom:18},
heroTitle:{fontSize:34,lineHeight:38},
heroCopy:{marginTop:10,lineHeight:22,color:colors.white},
createCard:{borderColor:'rgba(217,106,29,0.35)'},
headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},
cardTitle:{fontSize:22,lineHeight:28},
input:{color:colors.white,backgroundColor:colors.graphite,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:spacing.md,marginBottom:12},
chips:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:14},
chip:{backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:9,paddingHorizontal:12},
chipActive:{backgroundColor:colors.orangeSoft,borderColor:colors.orange},
chipText:{fontSize:12,color:colors.muted,fontWeight:'800'},
chipTextActive:{color:colors.white},
section:{marginBottom:18},
sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},
partRow:{backgroundColor:colors.panel,borderColor:colors.line,borderWidth:1,borderRadius:radius.lg,padding:16,marginBottom:10,flexDirection:'row',gap:12,alignItems:'center'},
partTitle:{fontSize:18,color:colors.white,fontWeight:'900'},
partNumber:{marginTop:4,color:colors.orange,fontWeight:'800'},
vendorText:{marginTop:6,color:colors.white},
description:{marginTop:8,color:colors.steel,lineHeight:20},
metaRow:{flexDirection:'row',justifyContent:'space-between',marginTop:10},
status:{fontSize:12,color:colors.steel,fontWeight:'800'},
searchButton:{width:44,height:44,borderRadius:12,backgroundColor:colors.orangeSoft,alignItems:'center',justifyContent:'center'},
pressed:{opacity:0.8,transform:[{scale:0.99}]}
});