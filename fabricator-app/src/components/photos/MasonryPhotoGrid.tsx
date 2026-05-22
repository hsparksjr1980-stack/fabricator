import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { MasonryColumn } from './MasonryColumn';

export function MasonryPhotoGrid({left,right}:{left:ReactNode;right:ReactNode}){
return <View style={styles.grid}><MasonryColumn>{left}</MasonryColumn><MasonryColumn>{right}</MasonryColumn></View>
}

const styles=StyleSheet.create({
grid:{flexDirection:'row',gap:12,alignItems:'flex-start'}
});
