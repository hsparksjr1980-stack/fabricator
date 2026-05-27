import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/Text';
import { colors } from '@/theme/theme';

export function WorkspaceToolbar({onSetup}:{onSetup:()=>void}){
return <View style={styles.toolbar}>
<View><AppText style={styles.kicker}>Custom workspace</AppText><AppText>Layout, widgets, quick actions</AppText></View>
<Pressable style={styles.button} onPress={onSetup}><MaterialCommunityIcons name="tune-variant" size={22} color={colors.white}/></Pressable>
</View>
}

const styles=StyleSheet.create({
toolbar:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:colors.panel,borderColor:colors.line,borderWidth:1,borderRadius:18,padding:14,marginBottom:14},
kicker:{fontSize:12,color:colors.steel,textTransform:'uppercase',fontWeight:'800'},
button:{backgroundColor:colors.orange,borderRadius:14,padding:10}
});
