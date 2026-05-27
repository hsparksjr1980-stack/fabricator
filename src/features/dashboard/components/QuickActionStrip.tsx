import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/components/Text';
import { colors, radius } from '@/theme/theme';

const actionIcons:any={session:'garage',task:'clipboard-check-outline',part:'tools',photo:'camera-outline',advisor:'robot-industrial'};

export function QuickActionStrip({actions,onPress}:{actions:any[];onPress:(type:string)=>void}){
return <View style={styles.dock}>{actions.map(action=><Pressable key={action.id} style={({pressed})=>[styles.dockButton,pressed&&styles.pressed]} onPress={()=>onPress(action.type)}><MaterialCommunityIcons name={actionIcons[action.type]} size={22} color={colors.orange}/><AppText style={styles.dockText}>{action.title}</AppText></Pressable>)}</View>
}

const styles=StyleSheet.create({dock:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:20},dockButton:{backgroundColor:colors.panelHigh,borderColor:colors.line,borderWidth:1,borderRadius:999,paddingVertical:10,paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:6},dockText:{fontSize:12,color:colors.white},pressed:{opacity:0.78,transform:[{scale:0.98}]}});
