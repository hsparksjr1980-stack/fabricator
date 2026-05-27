import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/theme';

export function PhotoWorkspaceSurface({children}:{children:ReactNode}){
return <View style={styles.surface}>{children}</View>
}

const styles=StyleSheet.create({
surface:{backgroundColor:colors.panel,borderColor:colors.line,borderWidth:1,borderRadius:22,padding:14,marginBottom:18}
});
