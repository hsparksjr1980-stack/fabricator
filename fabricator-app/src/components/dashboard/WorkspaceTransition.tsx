import { ReactNode, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function WorkspaceTransition({children}:{children:ReactNode}){
const opacity=useRef(new Animated.Value(0)).current;
const scale=useRef(new Animated.Value(.98)).current;

useEffect(()=>{
Animated.parallel([
Animated.timing(opacity,{toValue:1,duration:260,useNativeDriver:true}),
Animated.spring(scale,{toValue:1,useNativeDriver:true})
]).start();
},[]);

return <Animated.View style={{opacity,transform:[{scale}]}}>{children}</Animated.View>
}
