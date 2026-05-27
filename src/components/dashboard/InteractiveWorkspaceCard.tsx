import { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { DragHandle } from './DragHandle';
import { ResizeHandle } from './ResizeHandle';

export function InteractiveWorkspaceCard({children}:{children:ReactNode}){
return <Card><View style={styles.top}><DragHandle /><ResizeHandle /></View>{children}</Card>
}

const styles=StyleSheet.create({
top:{flexDirection:'row',justifyContent:'space-between',marginBottom:10}
});
