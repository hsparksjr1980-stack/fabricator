import { ReactNode } from 'react';import { View, StyleSheet } from 'react-native';import { colors, radius, spacing } from '@/theme/theme';
export function Card({ children }: { children: ReactNode }) { return <View style={styles.card}>{children}</View>; }
const styles = StyleSheet.create({ card:{ backgroundColor:colors.panel, borderColor:colors.line, borderWidth:1, borderRadius:radius.lg, padding:spacing.lg, marginBottom:spacing.md } });
