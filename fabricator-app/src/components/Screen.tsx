import { ReactNode } from 'react';import { ScrollView, StyleSheet } from 'react-native';import { SafeAreaView } from 'react-native-safe-area-context';import { colors, spacing } from '@/theme/theme';
export function Screen({children}:{children:ReactNode}){return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView></SafeAreaView>}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.black},scroll:{padding:spacing.lg,paddingBottom:100}})
