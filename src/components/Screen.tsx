import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '@/theme/theme';

export function Screen({children}:{children:ReactNode}){
  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[colors.black, colors.charcoal, colors.graphite]}
        style={styles.gradient}
      >
        <View style={styles.blueprint} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.black},
  gradient:{flex:1},
  blueprint:{
    ...StyleSheet.absoluteFillObject,
    opacity:0.04,
    backgroundColor:'transparent',
    borderColor:colors.blueprint,
    borderWidth:1
  },
  scroll:{
    padding:spacing.lg,
    paddingBottom:140
  }
})
