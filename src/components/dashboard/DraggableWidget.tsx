import { ReactNode, useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

export function DraggableWidget({children,onMoveUp,onMoveDown}:{children:ReactNode;onMoveUp:()=>void;onMoveDown:()=>void}){
const pan=useRef(new Animated.ValueXY()).current;

const responder=useRef(PanResponder.create({
onMoveShouldSetPanResponder:(_,g)=>Math.abs(g.dy)>8,
onPanResponderMove:Animated.event([null,{dy:pan.y}],{useNativeDriver:false}),
onPanResponderRelease:(_,g)=>{
if(g.dy<-40)onMoveUp();
if(g.dy>40)onMoveDown();
Animated.spring(pan,{toValue:{x:0,y:0},useNativeDriver:true}).start();
}
})).current;

return <Animated.View {...responder.panHandlers} style={{transform:[{translateY:pan.y}]}}>{children}</Animated.View>
}
