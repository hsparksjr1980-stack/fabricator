import { View, StyleSheet } from 'react-native';
import { AppText, Label, Title } from '@/components/Text';

export function PhotoWorkspaceHeader(){
return <View style={styles.wrap}><Label>Photo workspace</Label><Title>Build photo wall</Title><AppText>Switch between timeline and masonry layouts while preserving your preferred workspace style.</AppText></View>
}

const styles=StyleSheet.create({
wrap:{marginBottom:14}
});
