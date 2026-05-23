import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { AppText, Label } from '@/components/Text';
import { useFabricatorStore } from '@/state/useFabricatorStore';
import { DashboardWidget } from '@/types/models';
import { colors } from '@/theme/theme';

const widgetIcons:any={focus:'target',quickActions:'lightning-bolt-outline',progress:'chart-donut',stats:'view-dashboard-outline',nextSession:'clipboard-list-outline',blockers:'alert-octagon-outline',parts:'package-variant-closed',materialsInventory:'warehouse',sessionTimer:'timer-outline',photoFeature:'image-multiple-outline',creator:'share-variant-outline'};

export function WidgetShell({widget,children,onPress,hint,featured,editMode,onEnterEdit}:{widget:DashboardWidget;children:React.ReactNode;onPress?:()=>void;hint?:string;featured?:boolean;editMode:boolean;onEnterEdit:()=>void}){
const store=useFabricatorStore();
const resize=(event:any)=>{event?.stopPropagation?.();store.toggleWidgetSize(widget.id)};
const hide=(event:any)=>{event?.stopPropagation?.();store.toggleWidget(widget.id)};
const moveUp=(event:any)=>{event?.stopPropagation?.();store.moveWidget(widget.id,'up')};
const moveDown=(event:any)=>{event?.stopPropagation?.();store.moveWidget(widget.id,'down')};
return <Pressable onPress={onPress} onLongPress={onEnterEdit} disabled={editMode&&!onPress} style={({pressed})=>[{transform:[{scale:pressed&&!editMode?0.985:1}]}]}>
<Card style={[widget.size==='compact'?styles.compactCard:styles.expandedCard, featured&&styles.featuredWidget, editMode&&styles.editingWidget]}>
<Pressable onPress={resize} hitSlop={10} style={styles.resizeTab}><MaterialCommunityIcons name={widget.size==='compact'?'arrow-expand-vertical':'arrow-collapse-vertical'} size={18} color={colors.orange}/></Pressable>
{editMode?<View style={styles.editRail}><Pressable onPress={moveUp} style={styles.editButton}><MaterialCommunityIcons name="arrow-up" size={18} color={colors.white}/></Pressable><Pressable onPress={moveDown} style={styles.editButton}><MaterialCommunityIcons name="arrow-down" size={18} color={colors.white}/></Pressable><Pressable onPress={hide} style={styles.editButton}><MaterialCommunityIcons name="eye-off-outline" size={18} color={colors.orange}/></Pressable></View>:null}
<View style={styles.widgetHeader}><View style={styles.widgetTitleRow}><View style={styles.iconBadge}><MaterialCommunityIcons name={widgetIcons[widget.type]} size={18} color={colors.orange}/></View><Label>{widget.title}</Label></View><View style={styles.headerRight}><AppText style={styles.sizeText}>{widget.size}</AppText>{onPress&&!editMode?<MaterialCommunityIcons name="chevron-right" size={22} color={colors.steel}/>:null}</View></View>
{children}
{hint?<AppText style={styles.tapHint}>{editMode?'Use edge controls to resize, move, or hide this panel.':hint}</AppText>:null}
</Card>
</Pressable>
}

const styles=StyleSheet.create({compactCard:{minHeight:120},expandedCard:{minHeight:176},featuredWidget:{borderColor:'rgba(217,106,29,0.45)'},editingWidget:{borderColor:'rgba(217,106,29,0.75)'},resizeTab:{position:'absolute',right:0,top:54,bottom:20,width:32,backgroundColor:'rgba(217,106,29,0.09)',borderLeftWidth:1,borderLeftColor:'rgba(217,106,29,0.28)',alignItems:'center',justifyContent:'center',zIndex:5},editRail:{position:'absolute',left:0,top:54,bottom:20,width:36,backgroundColor:'rgba(0,0,0,0.22)',borderRightWidth:1,borderRightColor:'rgba(255,255,255,0.08)',alignItems:'center',justifyContent:'center',gap:8,zIndex:6},editButton:{width:26,height:26,borderRadius:8,backgroundColor:colors.graphite,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.line},widgetHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12,paddingRight:26},widgetTitleRow:{flexDirection:'row',alignItems:'center',gap:8,flex:1},iconBadge:{width:34,height:34,borderRadius:12,backgroundColor:colors.orangeSoft,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'rgba(217,106,29,0.35)'},headerRight:{flexDirection:'row',alignItems:'center',gap:6},sizeText:{fontSize:10,color:colors.steel,textTransform:'uppercase',fontWeight:'900'},tapHint:{marginTop:12,color:colors.steel,fontSize:12}});
