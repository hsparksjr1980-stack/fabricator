import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/theme';

export function ResizeHandle(){
return <Pressable style={styles.handle}><MaterialCommunityIcons name="resize" size={18} color={colors.orange}/></Pressable>
}

const styles=StyleSheet.create({
handle:{padding:6,justifyContent:'center',alignItems:'center'}
});
