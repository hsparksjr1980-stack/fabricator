import { Text as RNText, TextProps, StyleSheet } from 'react-native';import { colors, typography } from '@/theme/theme';
export function AppText({style,...props}:TextProps){return <RNText {...props} style={[styles.body,style]} />}
export function Title({style,...props}:TextProps){return <RNText {...props} style={[styles.title,style]} />}
export function Label({style,...props}:TextProps){return <RNText {...props} style={[styles.label,style]} />}
const styles=StyleSheet.create({body:{color:colors.white,fontSize:typography.body},title:{color:colors.white,fontSize:typography.title,fontWeight:'800'},label:{color:colors.steel,fontSize:typography.small,textTransform:'uppercase',fontWeight:'700',letterSpacing:.8}});
