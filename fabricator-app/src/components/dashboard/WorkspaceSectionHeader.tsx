import { StyleSheet, View } from 'react-native';
import { AppText, Label, Title } from '@/components/Text';

export function WorkspaceSectionHeader({label,title,description}:{label:string;title:string;description:string}){
return <View style={styles.wrap}><Label>{label}</Label><Title>{title}</Title><AppText>{description}</AppText></View>
}

const styles=StyleSheet.create({
wrap:{marginBottom:14}
});
