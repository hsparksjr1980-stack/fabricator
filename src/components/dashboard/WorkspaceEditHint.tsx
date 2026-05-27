import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/Text';
import { colors } from '@/theme/theme';

export function WorkspaceEditHint(){
return <View style={styles.hint}><AppText>Drag widgets vertically to reorder. Use resize controls to switch compact and expanded modes.</AppText></View>
}

const styles=StyleSheet.create({
hint:{padding:12,borderRadius:14,backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.line,marginBottom:16}
});
