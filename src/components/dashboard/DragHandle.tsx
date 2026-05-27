import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/theme';

export function DragHandle(){
return <Pressable style={styles.handle}><MaterialCommunityIcons name="drag-horizontal-variant" size={20} color={colors.steel}/></Pressable>
}

const styles=StyleSheet.create({
handle:{padding:6,justifyContent:'center',alignItems:'center'}
});
