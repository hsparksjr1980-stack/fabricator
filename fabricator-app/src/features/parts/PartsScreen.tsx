import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { StatusPill } from '@/components/StatusPill';
import { buildVendorSearchLinks } from '@/services/parts/partsLookupService';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { colors, radius, spacing } from '@/theme/theme';

export function PartsScreen(){
const store=useFabricatorStore();
const [name,setName]=useState('');
const [system,setSystem]=useState('Chassis');
const [vendor,setVendor]=useState('');
const parts=store.parts.filter(p=>p.projectId===store.selectedProjectId);
const stats=useMemo(()=>({need:parts.filter(p=>p.status==='Need to Order').length,onHand:parts.filter(p=>p.status==='On Hand').length,installed:parts.filter(p=>p.status==='Installed').length}),[parts]);

const save=()=>{
if(!name.trim())return;
store.addPart(name.trim(),system.trim()||'General',vendor.trim());
setName('');
setSystem('Chassis');
setVendor('');
};

return <Screen>
<View style={styles.heroPanel}>
<Label>INVENTORY COMMAND</Label>
<Title style={styles.heroTitle}>Parts & Materials</Title>
<AppText style={styles.heroCopy}>Keep every required part, raw material, vendor note, and install state visible before the next shop session.</AppText>
<View style={styles.statsRow}>
<View style={styles.statBox}><Label>NEED</Label><Title style={styles.statValue}>{stats.need}</Title></View>
<View style={styles.statBox}><Label>READY</Label><Title style={styles.statValue}>{stats.onHand}</Title></View>
<View style={styles.statBox}><Label>DONE</Label><Title style={styles.statValue}>{stats.installed}</Title></View>
</View>
</View>

<Card style={styles.createCard}>
<View style={styles.cardTop}>
<View><Label>NEW ENTRY</Label><Title style={styles.cardTitle}>Stage the next item</Title></View>
<MaterialCommunityIcons name="warehouse" size={30} color={colors.orange}/>
</View>
<TextInput value={name} onChangeText={setName} placeholder="Item name" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={system} onChangeText={setSystem} placeholder="Category" placeholderTextColor={colors.steel} style={styles.input}/>
<TextInput value={vendor} onChangeText={setVendor} placeholder="Preferred vendor optional" placeholderTextColor={colors.steel} style={styles.input}/>
<Button title="Save item" onPress={save}/>
</Card>

<View style={styles.sectionHeader}><Label>BUILD PIPELINE</Label><AppText>Tap a card to advance its status.</AppText></View>

{parts.map(p=>{
const searches=buildVendorSearchLinks(p.name);
const needsOrder=p.status==='Need to Order';
return <Card key={p.id} style={needsOrder?styles.needCard:undefined}>
<View style={styles.partTop}>
<View style={styles.iconWrap}><MaterialCommunityIcons name={needsOrder?'cart-arrow-down':p.status==='On Hand'?'package-check':'check-decagram'} size={22} color={colors.orange}/></View>
<View style={{flex:1}}><Label>{p.system}</Label><Title style={styles.partTitle}>{p.name}</Title></View>
<StatusPill label={p.status}/>
</View>
<Pressable style={styles.statusButton} onPress={()=>store.cyclePart(p.id)}>
<AppText style={styles.statusText}>Advance Status</AppText>
<MaterialCommunityIcons name="arrow-right" size={18} color={colors.orange}/>
</Pressable>
{p.vendor?<AppText style={styles.vendorNote}>Preferred Vendor: {p.vendor}</AppText>:null}
{needsOrder ? <>
<Label style={{marginTop:16}}>SEARCH VENDORS</Label>
<View style={styles.vendorGrid}>
{searches.map(link=><Pressable key={link.name} style={styles.vendorButton} onPress={()=>Linking.openURL(link.url)}><AppText style={styles.vendorText}>{link.name}</AppText></Pressable>)}
</View>
</>:null}
</Card>})}
<View style={{height:40}} />
</Screen>
}

const styles=StyleSheet.create({
heroPanel:{backgroundColor:colors.panelHigh,borderColor:colors.line,borderWidth:1,borderRadius:radius.xl,padding:spacing.lg,marginBottom:18},
heroTitle:{fontSize:36,lineHeight:40},
heroCopy:{color:colors.white,marginTop:10,lineHeight:22},
statsRow:{flexDirection:'row',gap:10,marginTop:18},
statBox:{flex:1,backgroundColor:colors.charcoal,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:12},
statValue:{fontSize:24,lineHeight:29},
createCard:{borderColor:'rgba(217,106,29,0.35)'},
cardTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},
cardTitle:{fontSize:22,lineHeight:27},
input:{color:colors.white,backgroundColor:colors.graphite,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:spacing.md,marginVertical:spacing.sm},
sectionHeader:{marginTop:4,marginBottom:12},
needCard:{borderColor:'rgba(217,106,29,0.45)'},
partTop:{flexDirection:'row',gap:12,alignItems:'center',marginBottom:14},
iconWrap:{width:42,height:42,borderRadius:14,backgroundColor:colors.orangeSoft,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'rgba(217,106,29,0.35)'},
partTitle:{fontSize:22,lineHeight:28},
statusButton:{backgroundColor:colors.charcoal,borderWidth:1,borderColor:colors.line,borderRadius:radius.md,paddingVertical:12,paddingHorizontal:14,alignItems:'center',justifyContent:'space-between',flexDirection:'row'},
statusText:{fontWeight:'900',color:colors.white},
vendorNote:{marginTop:12,color:colors.white},
vendorGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:10},
vendorButton:{backgroundColor:colors.orangeSoft,borderColor:colors.orange,borderWidth:1,borderRadius:999,paddingVertical:10,paddingHorizontal:14},
vendorText:{fontWeight:'900',color:colors.white,fontSize:12}
});
