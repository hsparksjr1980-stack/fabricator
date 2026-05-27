import AsyncStorage from '@react-native-async-storage/async-storage';

export const dashboardLayoutStorage={
async save(key:string,layout:any){
await AsyncStorage.setItem(`fabricator:${key}`,JSON.stringify(layout));
},

async load(key:string){
const raw=await AsyncStorage.getItem(`fabricator:${key}`);
if(!raw)return null;
return JSON.parse(raw);
}
};
