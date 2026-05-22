import { useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';
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

const save=()=>{
if(!name.trim())return;
store.addPart(name.trim(),system.trim()||'General',vendor.trim());
setName('');
setSystem('Chassis');
setVendor('');
};

return <Screen>
<Label>Materials tracker</Label>
<Title>Parts inventory</Title>
<AppText style={{marginBottom:14}}>Track parts, fabrication materials, sourcing, and install status.</AppText>
<Card>
<Label>NEW ENTRY</Label>
<TextInput value={name} onChangeText={setName} placeholder="Item name" placeholderTextColor={colors.steel} style={inputStyle}/>
<TextInput value={system} onChangeText={setSystem} placeholder="Category" placeholderTextColor={colors.steel} style={inputStyle}/>
<TextInput value={vendor} onChangeText={setVendor} placeholder="Preferred vendor optional" placeholderTextColor={colors.steel} style={inputStyle}/>
<Button title="Save item" onPress={save}/>
</Card>

{parts.map(p=>{
const searches=buildVendorSearchLinks(p.name);
return <Card key={p.id}>
<Label>{p.system}</Label>
<Title style={{fontSize:18}}>{p.name}</Title>
<View style={{marginVertical:10}}>
<StatusPill label={p.status}/>
</View>

<Pressable style={styles.statusButton} onPress={()=>store.cyclePart(p.id)}>
<AppText style={styles.statusText}>Update Status</AppText>
</Pressable>

{p.vendor?<AppText style={{marginTop:12}}>Preferred Vendor: {p.vendor}</AppText>:null}

{p.status==='Need to Order' ? <>
<Label style={{marginTop:16}}>SEARCH VENDORS</Label>
<View style={styles.vendorGrid}>
{searches.map(link=><Pressable key={link.name} style={styles.vendorButton} onPress={()=>Linking.openURL(link.url)}>
<AppText style={styles.vendorText}>{link.name}</AppText>
</Pressable>)}
</View>
</>:null}
</Card>})}
<View style={{height:40}} />
</Screen>
}

const inputStyle={color:colors.white,backgroundColor:colors.graphite,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:spacing.md,marginVertical:spacing.sm};

const styles={
statusButton:{backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.orange,borderRadius:radius.md,paddingVertical:10,paddingHorizontal:14,alignItems:'center'},
statusText:{fontWeight:'700'},
vendorGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:10},
vendorButton:{backgroundColor:colors.orangeSoft,borderColor:colors.orange,borderWidth:1,borderRadius:999,paddingVertical:10,paddingHorizontal:14},
vendorText:{fontWeight:'700'}
};
