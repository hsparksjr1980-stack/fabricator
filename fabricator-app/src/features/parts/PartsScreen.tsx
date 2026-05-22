import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { buildVendorSearchLinks } from '@/services/parts/partsLookupService';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

const systems=['Chassis','Engine','Electrical','Body','Interior','Shop Supplies'];

function PartRow({name,system,status,vendor,onPress,onSearch}:{name:string;system:string;status:string;vendor?:string;onPress:()=>void;onSearch?:()=>void}){
const done=status==='Installed';
const staged=status==='On Hand';
const needs=status==='Need to Order';
return <Pressable onPress={onPress} style={({pressed})=>[styles.partRow,needs&&styles.needRow,done&&styles.doneRow,pressed&&styles.pressed]}>
<View style={[styles.checkbox,done&&styles.checkboxDone,staged&&styles.checkboxStaged]}>{done?<MaterialCommunityIcons name="check-bold" size={20} color={colors.white}/>:staged?<MaterialCommunityIcons name="package-check" size={18} color={colors.orange}/>:null}</View>
<View style={{flex:1}}>
<AppText style={[styles.partTitle,done&&styles.doneText]}>{name}</AppText>
<View style={styles.metaRow}><Label>{system}</Label><AppText style={styles.statusText}>{status}</AppText></View>
{vendor?<AppText style={styles.vendorNote}>Vendor: {vendor}</AppText>:null}
{needs?<AppText style={styles.needText}>Needed before the next shop session.</AppText>:null}
</View>
{needs&&onSearch?<Pressable onPress={onSearch} style={styles.searchButton}><MaterialCommunityIcons name="magnify" size={19} color={colors.orange}/></Pressable>:null}
</Pressable>
}

export function PartsScreen(){
const store=useFabricatorStore();
const [name,setName]=useState('');
const [system,setSystem]=useState('Chassis');
const [vendor,setVendor]=useState('');
const parts=store.parts.filter(p=>p.projectId===store.selectedProjectId);
const grouped=useMemo(()=>({
'To Buy':parts.filter(p=>p.status==='Need to Order'),
'On Shelf':parts.filter(p=>p.status==='On Hand'||p.status==='Ordered'),
Installed:parts.filter(p=>p.status==='Installed')
}),[parts]);

const save=()=>{
if(!name.trim())return;
store.addPart(name.trim(),system.trim()||'General',vendor.trim());
setName('');
setSystem('Chassis');
setVendor('');
};

return <Screen>
<View style={styles.heroPanel}>
<Label>PARTS LIST</Label>
<Title style={styles.heroTitle}>To Buy / On Shelf / Installed</Title>
<AppText style={styles.heroCopy}>A simple parts checklist for what needs ordering, what is staged in the shop, and what is already on the build.</AppText>
<View style={styles.statsRow}>
<View style={styles.statBox}><Label>Buy</Label><Title style={styles.statValue}>{grouped['To Buy'].length}</Title></View>
<View style={styles.statBox}><Label>Shelf</Label><Title style={styles.statValue}>{grouped['On Shelf'].length}</Title></View>
<View style={styles.statBox}><Label>Done</Label><Title style={styles.statValue}>{grouped.Installed.length}</Title></View>
</View>
</View>

<Card style={styles.createCard}>
<View style={styles.cardTop}><View><Label>QUICK ADD</Label><Title style={styles.cardTitle}>Add to parts list</Title></View><MaterialCommunityIcons name="clipboard-plus-outline" size={30} color={colors.orange}/></View>
<TextInput value={name} onChangeText={setName} placeholder="Part, material, supply, or hardware" placeholderTextColor={colors.steel} style={styles.input}/>
<View style={styles.chips}>{systems.map(item=><Pressable key={item} onPress={()=>setSystem(item)} style={[styles.chip,system===item&&styles.chipActive]}><AppText style={[styles.chipText,system===item&&styles.chipTextActive]}>{item}</AppText></Pressable>)}</View>
<TextInput value={vendor} onChangeText={setVendor} placeholder="Vendor note optional" placeholderTextColor={colors.steel} style={styles.input}/>
<Button title="Add to parts list" onPress={save}/>
</Card>

{Object.entries(grouped).map(([section,list])=><View key={section} style={styles.section}>
<View style={styles.sectionHeader}><Label>{section}</Label><AppText>{list.length} items</AppText></View>
{list.length?list.map(p=>{
const firstSearch=buildVendorSearchLinks(p.name)[0];
return <PartRow key={p.id} name={p.name} system={p.system} status={p.status} vendor={p.vendor} onPress={()=>store.cyclePart(p.id)} onSearch={firstSearch?()=>Linking.openURL(firstSearch.url):undefined}/>
}):<Card><AppText>No items here yet.</AppText></Card>}
</View>)}
<View style={{height:40}} />
</Screen>
}

const styles=StyleSheet.create({
heroPanel:{backgroundColor:colors.panelHigh,borderColor:colors.line,borderWidth:1,borderRadius:radius.xl,padding:spacing.lg,marginBottom:18},
heroTitle:{fontSize:34,lineHeight:39},
heroCopy:{color:colors.white,marginTop:10,lineHeight:22},
statsRow:{flexDirection:'row',gap:10,marginTop:18},
statBox:{flex:1,backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:12},
statValue:{fontSize:24,lineHeight:29},
createCard:{borderColor:'rgba(217,106,29,0.35)'},
cardTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:12},
cardTitle:{fontSize:22,lineHeight:27},
input:{color:colors.white,backgroundColor:colors.graphite,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:spacing.md,marginVertical:spacing.sm},
chips:{flexDirection:'row',flexWrap:'wrap',gap:8,marginVertical:10},
chip:{backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:9,paddingHorizontal:12},
chipActive:{backgroundColor:colors.orangeSoft,borderColor:colors.orange},
chipText:{fontSize:12,color:colors.muted,fontWeight:'800'},
chipTextActive:{color:colors.white},
section:{marginBottom:18},
sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},
partRow:{backgroundColor:colors.panel,borderColor:colors.line,borderWidth:1,borderRadius:radius.lg,padding:16,marginBottom:10,flexDirection:'row',gap:14,alignItems:'center'},
needRow:{borderColor:'rgba(217,106,29,0.45)',backgroundColor:colors.panelHigh},
doneRow:{opacity:0.62},
pressed:{opacity:0.78,transform:[{scale:0.99}]},
checkbox:{width:34,height:34,borderRadius:10,borderWidth:2,borderColor:colors.orange,alignItems:'center',justifyContent:'center',backgroundColor:colors.charcoal},
checkboxDone:{backgroundColor:colors.orange},
checkboxStaged:{backgroundColor:colors.orangeSoft},
partTitle:{fontSize:17,lineHeight:23,color:colors.white,fontWeight:'900'},
doneText:{textDecorationLine:'line-through',color:colors.steel},
metaRow:{flexDirection:'row',justifyContent:'space-between',gap:10,marginTop:8},
statusText:{fontSize:12,color:colors.steel,fontWeight:'800'},
vendorNote:{marginTop:8,color:colors.white},
needText:{marginTop:8,color:colors.orange,fontSize:12,fontWeight:'800'},
searchButton:{width:40,height:40,borderRadius:12,backgroundColor:colors.orangeSoft,borderWidth:1,borderColor:'rgba(217,106,29,0.35)',alignItems:'center',justifyContent:'center'}
});
