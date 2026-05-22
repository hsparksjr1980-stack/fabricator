import { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, shadows } from '@/theme/theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient
      colors={[colors.panelHigh, colors.panel]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.shell, style]}
    >
      <View style={styles.overlay} />
      <View style={styles.inner}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shell:{
    borderColor:colors.line,
    borderWidth:1,
    borderRadius:radius.lg,
    overflow:'hidden',
    marginBottom:spacing.md,
    position:'relative',
    ...shadows.panel
  },
  overlay:{
    ...StyleSheet.absoluteFillObject,
    backgroundColor:'rgba(255,255,255,0.02)'
  },
  inner:{
    padding:spacing.lg
  }
});
