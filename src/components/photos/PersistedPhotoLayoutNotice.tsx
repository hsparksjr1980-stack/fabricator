import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/Text';
import { colors } from '@/theme/theme';

export function PersistedPhotoLayoutNotice(){
return <View style={styles.notice}><AppText>Your photo layout preference is saved per project workspace.</AppText></View>
}

const styles=StyleSheet.create({
notice:{padding:12,borderRadius:14,backgroundColor:colors.graphite,borderWidth:1,borderColor:colors.line,marginBottom:14}
});
