import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY='fabricator:demo-data';

export const appDataStorage={
async save(data:any){
await AsyncStorage.setItem(KEY,JSON.stringify(data));
},
async load(){
const raw=await AsyncStorage.getItem(KEY);
if(!raw)return null;
return JSON.parse(raw);
},
async clear(){
await AsyncStorage.removeItem(KEY);
}
};
