import { create } from 'zustand';
import { BuildPhoto, BuildTask, DashboardPreset, DashboardWidget, GarageSession, Part, Project, ProjectCategory, ProjectPhase, ProjectStatus, QuickAction, VoiceNote } from '@/types/models';
import { dashboardLayoutStorage } from '@/services/storage/dashboardLayoutStorage';
import { appDataStorage } from '@/services/storage/appDataStorage';
import * as mock from './mockData';

type LegacyDashboardWidget = Omit<DashboardWidget,'type'> & { type:DashboardWidget['type']|'sessionTimer' };
type LegacyQuickAction = Omit<QuickAction,'type'> & { type:QuickAction['type']|'session' };
type SavedLayout = { preset:DashboardPreset; widgets:LegacyDashboardWidget[]; quickActions:LegacyQuickAction[] };
type ProjectInput = { name:string; category:ProjectCategory; phase:ProjectPhase; status:ProjectStatus; hook?:string };
type PersistedData = {
selectedProjectId:string;
projects:Project[];
sessions:GarageSession[];
voiceNotes:VoiceNote[];
tasks:BuildTask[];
parts:Part[];
photos:BuildPhoto[];
};

type Store = {
selectedProjectId:string;
projects:Project[];
sessions:GarageSession[];
voiceNotes:VoiceNote[];
tasks:BuildTask[];
parts:Part[];
photos:BuildPhoto[];
dashboardPreset:DashboardPreset;
dashboardWidgets:DashboardWidget[];
quickActions:QuickAction[];
hasLoadedAppData:boolean;
selectProject:(id:string)=>void;
activeProject:()=>Project|undefined;
addProject:(input:ProjectInput)=>void;
updateProject:(id:string,input:Partial<ProjectInput & {progress:number}>)=>void;
addVoiceNote:(transcript:string)=>void;
addTask:(title:string,system:string,createPart?:boolean)=>void;
addPart:(name:string,system:string,vendor?:string,partNumber?:string,description?:string)=>void;
addPhoto:(caption:string,tag:string,uri?:string)=>void;
cycleTask:(id:string)=>void;
cyclePart:(id:string)=>void;
toggleWidget:(id:string)=>void;
toggleWidgetSize:(id:string)=>void;
moveWidget:(id:string,direction:'up'|'down')=>void;
applyDashboardPreset:(preset:DashboardPreset)=>void;
toggleQuickAction:(id:string)=>void;
saveDashboardLayout:()=>Promise<void>;
loadDashboardLayout:()=>Promise<void>;
saveAppData:()=>Promise<void>;
loadAppData:()=>Promise<void>;
resetDemoData:()=>Promise<void>;
};

const nextId = (p:string) => `${p}-${Date.now()}`;
const today = () => new Date().toISOString().slice(0,10);
const now = () => new Date().toISOString();
const storageKey=(projectId:string)=>`dashboard:${projectId}`;

const quickActions:QuickAction[] = [
{id:'qa-task',type:'task',title:'Task',enabled:true},
{id:'qa-part',type:'part',title:'Part',enabled:true},
{id:'qa-photo',type:'photo',title:'Photo',enabled:true},
{id:'qa-render',type:'render',title:'Advisor',enabled:true}
];

const baseWidgets:DashboardWidget[] = [
{id:'focus',type:'focus',title:'Today in Shop',enabled:true,size:'expanded'},
{id:'quick',type:'quickActions',title:'Quick Actions',enabled:false,size:'compact'},
{id:'progress',type:'progress',title:'Project Progress',enabled:true,size:'compact'},
{id:'stats',type:'stats',title:'Build Stats',enabled:true,size:'compact'},
{id:'next',type:'nextSession',title:'Next Session',enabled:true,size:'expanded'},
{id:'blockers',type:'blockers',title:'Progress Blockers',enabled:true,size:'expanded'},
{id:'parts',type:'parts',title:'Parts Needed',enabled:true,size:'compact'},
{id:'materials',type:'materialsInventory',title:'Materials Inventory',enabled:true,size:'compact'},
{id:'activity',type:'recentActivity',title:'Recent Shop Activity',enabled:true,size:'expanded'},
{id:'photo',type:'photoFeature',title:'Photo Feature',enabled:true,size:'expanded'},
{id:'creator',type:'creator',title:'Creator Export',enabled:false,size:'compact'}
];

const presetWidgets:Record<DashboardPreset,DashboardWidget[]> = {
Fabricator: baseWidgets,
Woodworker: baseWidgets.map(w=>({...w,enabled:['focus','progress','next','materials','photo','activity'].includes(w.id)})),
Restoration: baseWidgets.map(w=>({...w,enabled:['focus','progress','stats','next','parts','photo','blockers'].includes(w.id)})),
'Content Creator': baseWidgets.map(w=>({...w,enabled:['focus','photo','creator','progress','next'].includes(w.id),size:w.id==='photo'?'expanded':w.size})),
'Race Build': baseWidgets.map(w=>({...w,enabled:['focus','progress','stats','next','parts','blockers','activity'].includes(w.id)})),
'Motorcycle Build': baseWidgets.map(w=>({...w,enabled:['focus','progress','next','parts','materials','photo','activity'].includes(w.id)}))
};

const reorder = (items:DashboardWidget[], id:string, direction:'up'|'down') => {
const index = items.findIndex(w=>w.id===id);
const target = direction==='up' ? index-1 : index+1;
if(index<0 || target<0 || target>=items.length) return items;
const copy=[...items];
[copy[index],copy[target]]=[copy[target],copy[index]];
return copy;
};

const currentLayout=(s:Store)=>({preset:s.dashboardPreset,widgets:s.dashboardWidgets,quickActions:s.quickActions});
const currentData=(s:Store):PersistedData=>({selectedProjectId:s.selectedProjectId,projects:s.projects,sessions:s.sessions,voiceNotes:s.voiceNotes,tasks:s.tasks,parts:s.parts,photos:s.photos});
const persistSoon=(get:()=>Store)=>setTimeout(()=>get().saveAppData(),0);
const persistLayoutSoon=(get:()=>Store)=>setTimeout(()=>get().saveDashboardLayout(),0);
const migrateWidgets=(widgets:LegacyDashboardWidget[]):DashboardWidget[]=>{
const hasActivity=widgets.some(w=>w.type==='recentActivity');
const migrated=widgets
.filter((w):w is DashboardWidget=>w.type!=='sessionTimer')
.map(w=>w.id==='timer'?{...w,id:'activity',type:'recentActivity' as const,title:'Recent Shop Activity',size:'expanded' as const}:w);
return hasActivity?migrated:[...migrated,{id:'activity',type:'recentActivity',title:'Recent Shop Activity',enabled:true,size:'expanded'}];
};
const migrateQuickActions=(actions:LegacyQuickAction[]):QuickAction[]=>actions.filter((action):action is QuickAction=>action.type!=='session');

export const useFabricatorStore = create<Store>()((set,get)=>(
{
selectedProjectId:'p1',projects:mock.projects,sessions:mock.sessions,voiceNotes:mock.voiceNotes,tasks:mock.tasks,parts:mock.parts,photos:mock.photos,
dashboardPreset:'Fabricator',dashboardWidgets:presetWidgets.Fabricator,quickActions,hasLoadedAppData:false,
selectProject:(id)=>{set({selectedProjectId:id}); setTimeout(()=>{get().loadDashboardLayout();get().saveAppData();},0);},
activeProject:()=>get().projects.find(p=>p.id===get().selectedProjectId),
addProject:(input)=>set(s=>{const id=nextId('p');persistSoon(get);return {selectedProjectId:id,projects:[{id,name:input.name,category:input.category,phase:input.phase,status:input.status,progress:0,hook:input.hook||'Keep momentum by capturing tasks, parts, photos, and shop activity.',updatedAt:today()},...s.projects]}}),
updateProject:(id,input)=>set(s=>{persistSoon(get);return {projects:s.projects.map(p=>p.id===id?{...p,...input,updatedAt:today()}:p)}}),
addVoiceNote:(transcript)=>set(s=>{persistSoon(get);return {voiceNotes:[{id:nextId('v'),projectId:s.selectedProjectId,transcript,createdAt:today()},...s.voiceNotes]}}),
addTask:(title,system,createPart)=>set(s=>{
persistSoon(get);
const taskId=nextId('t');
const timestamp=now();
const newTask={id:taskId,projectId:s.selectedProjectId,title,system,status:'To Do' as const,createdAt:timestamp,updatedAt:timestamp};
const shouldCreatePart=createPart;
const newParts=shouldCreatePart?[{id:nextId('pa'),projectId:s.selectedProjectId,name:title,system,status:'Need to Order' as const,createdAt:timestamp,updatedAt:timestamp}]:[];
return {
tasks:[newTask,...s.tasks],
parts:[...newParts,...s.parts]
}
}),
addPart:(name,system,vendor,partNumber,description)=>set(s=>{
persistSoon(get);
const partId=nextId('pa');
const timestamp=now();
return {
parts:[{id:partId,projectId:s.selectedProjectId,name,system,status:'Need to Order',vendor,partNumber,description,createdAt:timestamp,updatedAt:timestamp},...s.parts]
}
}),
addPhoto:(caption,tag,uri)=>set(s=>{
persistSoon(get);
const photoId=nextId('ph');
const timestamp=now();
return {
photos:[{id:photoId,projectId:s.selectedProjectId,caption,tag,uri:uri||'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=900',createdAt:timestamp},...s.photos]
}
}),
cycleTask:(id)=>set(s=>{persistSoon(get);return {tasks:s.tasks.map(t=>t.id===id?{...t,status:t.status==='To Do'?'In Progress':t.status==='In Progress'?'Done':'To Do',updatedAt:now()}:t)}}),
cyclePart:(id)=>set(s=>{persistSoon(get);return {parts:s.parts.map(p=>p.id===id?{...p,status:p.status==='Need to Order'?'On Hand':p.status==='On Hand'?'Installed':'Need to Order',updatedAt:now()}:p)}}),
toggleWidget:(id)=>set(s=>{persistLayoutSoon(get);return {dashboardWidgets:s.dashboardWidgets.map(w=>w.id===id?{...w,enabled:!w.enabled}:w)}}),
toggleWidgetSize:(id)=>set(s=>{persistLayoutSoon(get);return {dashboardWidgets:s.dashboardWidgets.map(w=>w.id===id?{...w,size:w.size==='compact'?'expanded':'compact'}:w)}}),
moveWidget:(id,direction)=>set(s=>{persistLayoutSoon(get);return {dashboardWidgets:reorder(s.dashboardWidgets,id,direction)}}),
applyDashboardPreset:(preset)=>{set({dashboardPreset:preset,dashboardWidgets:presetWidgets[preset]});persistLayoutSoon(get);},
toggleQuickAction:(id)=>set(s=>{persistLayoutSoon(get);return {quickActions:s.quickActions.map(a=>a.id===id?{...a,enabled:!a.enabled}:a)}}),
saveDashboardLayout:async()=>{const s=get(); await dashboardLayoutStorage.save(storageKey(s.selectedProjectId),currentLayout(s));},
loadDashboardLayout:async()=>{const s=get(); const saved=await dashboardLayoutStorage.load(storageKey(s.selectedProjectId)); if(saved){set({dashboardPreset:saved.preset,dashboardWidgets:migrateWidgets(saved.widgets),quickActions:migrateQuickActions(saved.quickActions)});}},
saveAppData:async()=>{await appDataStorage.save(currentData(get()));},
loadAppData:async()=>{const saved=await appDataStorage.load(); if(saved){set({...saved,hasLoadedAppData:true});}else{set({hasLoadedAppData:true});}},
resetDemoData:async()=>{await appDataStorage.clear();set({selectedProjectId:'p1',projects:mock.projects,sessions:mock.sessions,voiceNotes:mock.voiceNotes,tasks:mock.tasks,parts:mock.parts,photos:mock.photos});}
}));
