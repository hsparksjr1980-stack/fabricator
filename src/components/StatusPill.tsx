import { Text, StyleSheet, View } from 'react-native';import { colors, radius, spacing } from '@/theme/theme';
export function StatusPill({label}:{label:string}){return <View style={styles.pill}><Text style={styles.text}>{label}</Text></View>}
const styles=StyleSheet.create({pill:{alignSelf:'flex-start',backgroundColor:colors.orangeSoft,borderColor:colors.orange,borderWidth:1,paddingHorizontal:spacing.md,paddingVertical:spacing.xs,borderRadius:radius.md},text:{color:colors.orange,fontWeight:'800',fontSize:12}})
