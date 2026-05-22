import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY='fabricator-dashboard-layout';

export const dashboardLayoutStorage={
async save(layout:any){
await AsyncStorage.setItem(KEY,JSON.stringify(layout));
},

async load(){
const raw=await AsyncStorage.getItem(KEY);
if(!raw)return null;
return JSON.parse(raw);
}
};
