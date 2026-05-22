import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/theme';

export function WidgetDropZone({children}:{children?:ReactNode}){
return <View style={styles.zone}>{children}</View>
}

const styles=StyleSheet.create({
zone:{borderWidth:1,borderStyle:'dashed',borderColor:colors.orange,padding:10,borderRadius:16,minHeight:40,marginBottom:10}
});
