import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/theme';

export function WidgetResizeControls({onExpand,onCollapse}:{onExpand:()=>void;onCollapse:()=>void}){
return <View style={styles.row}>
<Pressable onPress={onCollapse} style={styles.button}><MaterialCommunityIcons name="arrow-collapse-vertical" size={18} color={colors.white}/></Pressable>
<Pressable onPress={onExpand} style={styles.button}><MaterialCommunityIcons name="arrow-expand-vertical" size={18} color={colors.orange}/></Pressable>
</View>
}

const styles=StyleSheet.create({
row:{flexDirection:'row',gap:6},
button:{padding:6,borderRadius:999,backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.line}
});
