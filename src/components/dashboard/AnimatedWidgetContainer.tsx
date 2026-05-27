import { ReactNode, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function AnimatedWidgetContainer({children}:{children:ReactNode}){
const fade=useRef(new Animated.Value(0)).current;
const rise=useRef(new Animated.Value(16)).current;

useEffect(()=>{
Animated.parallel([
Animated.timing(fade,{toValue:1,duration:260,useNativeDriver:true}),
Animated.spring(rise,{toValue:0,useNativeDriver:true})
]).start();
},[]);

return <Animated.View style={{opacity:fade,transform:[{translateY:rise}]}}>{children}</Animated.View>
}
