import { useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { AppText, Label, Title } from '@/components/Text';
import { StatusPill } from '@/components/StatusPill';
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
<Card>
<Label>NEW ENTRY</Label>
<TextInput value={name} onChangeText={setName} placeholder="Item name" placeholderTextColor={colors.steel} style={inputStyle}/>
<TextInput value={system} onChangeText={setSystem} placeholder="Category" placeholderTextColor={colors.steel} style={inputStyle}/>
<TextInput value={vendor} onChangeText={setVendor} placeholder="Source/vendor" placeholderTextColor={colors.steel} style={inputStyle}/>
<Button title="Save item" onPress={save}/>
</Card>
{parts.map(p=><Pressable key={p.id} onPress={()=>store.cyclePart(p.id)}><Card><Label>{p.system}</Label><Title style={{fontSize:18}}>{p.name}</Title><StatusPill label={p.status}/>{p.vendor?<AppText style={{marginTop:8}}>Vendor: {p.vendor}</AppText>:null}</Card></Pressable>)}
</Screen>
}

const inputStyle={color:colors.white,backgroundColor:colors.graphite,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:spacing.md,marginVertical:spacing.sm};
