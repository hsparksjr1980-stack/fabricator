import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors } from '@/theme/theme';

export function AnimatedDropIndicator(){
const pulse=useRef(new Animated.Value(.5)).current;

useEffect(()=>{
Animated.loop(
Animated.sequence([
Animated.timing(pulse,{toValue:1,duration:700,useNativeDriver:true}),
Animated.timing(pulse,{toValue:.4,duration:700,useNativeDriver:true})
])
).start();
},[]);

return <Animated.View style={[styles.line,{opacity:pulse}]} />
}

const styles=StyleSheet.create({
line:{height:3,borderRadius:999,backgroundColor:colors.orange,marginVertical:8}
});
