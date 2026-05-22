import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/Text';
import { colors } from '@/theme/theme';
import { PhotoLayoutMode } from '@/features/photos/photoLayoutTypes';

export function PhotoLayoutSwitcher({layout,onChange}:{layout:PhotoLayoutMode;onChange:(layout:PhotoLayoutMode)=>void}){
return <View style={styles.row}>
<Pressable onPress={()=>onChange('timeline')} style={[styles.button,layout==='timeline'&&styles.active]}><AppText>Timeline</AppText></Pressable>
<Pressable onPress={()=>onChange('masonry')} style={[styles.button,layout==='masonry'&&styles.active]}><AppText>Masonry</AppText></Pressable>
</View>
}

const styles=StyleSheet.create({
row:{flexDirection:'row',gap:10,marginBottom:14},
button:{paddingVertical:10,paddingHorizontal:14,borderRadius:999,backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.line},
active:{backgroundColor:colors.orangeSoft,borderColor:colors.orange}
});
