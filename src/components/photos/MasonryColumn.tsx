import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export function MasonryColumn({children}:{children:ReactNode}){
return <View style={styles.column}>{children}</View>
}

const styles=StyleSheet.create({
column:{flex:1,gap:12}
});
