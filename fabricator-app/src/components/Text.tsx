import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme/theme';

export function AppText({style,...props}:TextProps){return <RNText {...props} style={[styles.body,style]} />}
export function Title({style,...props}:TextProps){return <RNText {...props} style={[styles.title,style]} />}
export function Label({style,...props}:TextProps){return <RNText {...props} style={[styles.label,style]} />}

const styles=StyleSheet.create({
  body:{color:colors.muted,fontSize:typography.body,lineHeight:21,fontWeight:'500'},
  title:{color:colors.white,fontSize:typography.title,fontWeight:'900',letterSpacing:-0.9,lineHeight:38},
  label:{color:colors.orange,fontSize:typography.micro,textTransform:'uppercase',fontWeight:'900',letterSpacing:1.6}
});
