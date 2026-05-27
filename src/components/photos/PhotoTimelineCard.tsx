import { Image, StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { AppText } from '@/components/Text';
import { StatusPill } from '@/components/StatusPill';
import { colors, radius, spacing } from '@/theme/theme';

export function PhotoTimelineCard({photo,height=180}:{photo:any;height?:number}){
return <Card style={styles.card}><Image source={{uri:photo.uri}} style={[styles.image,{height}]} /><View style={styles.body}><StatusPill label={photo.tag}/><AppText style={styles.title}>{photo.caption}</AppText><AppText style={styles.date}>{photo.createdAt}</AppText></View></Card>
}

const styles=StyleSheet.create({
card:{padding:0,overflow:'hidden'},
image:{width:'100%',borderTopLeftRadius:radius.lg,borderTopRightRadius:radius.lg,backgroundColor:colors.graphite},
body:{padding:spacing.md},
title:{marginTop:8,fontWeight:'700'},
date:{marginTop:6,color:colors.steel,fontSize:12}
});
