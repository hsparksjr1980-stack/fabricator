import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme/theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card:{
    backgroundColor:colors.panel,
    borderColor:colors.line,
    borderWidth:1,
    borderRadius:radius.lg,
    padding:spacing.lg,
    marginBottom:spacing.md
  }
});
