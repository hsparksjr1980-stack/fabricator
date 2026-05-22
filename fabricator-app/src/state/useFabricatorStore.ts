import { create } from 'zustand';
import { BuildPhoto, BuildTask, DashboardPreset, DashboardWidget, GarageSession, Part, Project, QuickAction, VoiceNote } from '@/types/models';
import * as mock from './mockData';

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
selectProject:(id:string)=>void;
activeProject:()=>Project|undefined;
addSession:(notes:string)=>void;
addVoiceNote:(transcript:string)=>void;
cycleTask:(id:string)=>void;
cyclePart:(id:string)=>void;
toggleWidget:(id:string)=>void;
toggleWidgetSize:(id:string)=>void;
moveWidget:(id:string,direction:'up'|'down')=>void;
applyDashboardPreset:(preset:DashboardPreset)=>void;
toggleQuickAction:(id:string)=>void;
};

const nextId = (p:string) => `${p}-${Date.now()}`;

const quickActions:QuickAction[] = [
{id:'qa-session',type:'session',title:'Session',enabled:true},
{id:'qa-voice',type:'voice',title:'Voice',enabled:true},
{id:'qa-task',type:'task',title:'Task',enabled:true},
{id:'qa-part',type:'part',title:'Part',enabled:true},
{id:'qa-photo',type:'photo',title:'Photo',enabled:true},
{id:'qa-render',type:'render',title:'Concept',enabled:false}
];

const baseWidgets:DashboardWidget[] = [
{id:'focus',type:'focus',title:'Today in Shop',enabled:true,size:'expanded'},
{id:'quick',type:'quickActions',title:'Quick Actions',enabled:true,size:'compact'},
{id:'progress',type:'progress',title:'Project Progress',enabled:true,size:'compact'},
{id:'stats',type:'stats',title:'Build Stats',enabled:true,size:'compact'},
{id:'next',type:'nextSession',title:'Next Session AI',enabled:true,size:'expanded'},
{id:'blockers',type:'blockers',title:"What's Blocking Progress",enabled:true,size:'expanded'},
{id:'parts',type:'parts',title:'Parts Needed',enabled:true,size:'compact'},
{id:'materials',type:'materialsInventory',title:'Materials Inventory',enabled:true,size:'compact'},
{id:'timer',type:'sessionTimer',title:'Session Timer',enabled:true,size:'compact'},
{id:'photo',type:'photoFeature',title:'Photo Feature',enabled:true,size:'expanded'},
{id:'creator',type:'creator',title:'Creator Export',enabled:false,size:'compact'}
];

const presetWidgets:Record<DashboardPreset,DashboardWidget[]> = {
Fabricator: baseWidgets,
Woodworker: baseWidgets.map(w=>({...w,enabled:['focus','quick','progress','next','materials','photo','timer'].includes(w.id)})),
Restoration: baseWidgets.map(w=>({...w,enabled:['focus','quick','progress','stats','next','parts','photo','blockers'].includes(w.id)})),
'Content Creator': baseWidgets.map(w=>({...w,enabled:['focus','quick','photo','creator','progress','next'].includes(w.id),size:w.id==='photo'?'expanded':w.size})),
'Race Build': baseWidgets.map(w=>({...w,enabled:['focus','quick','progress','stats','next','parts','blockers','timer'].includes(w.id)})),
'Motorcycle Build': baseWidgets.map(w=>({...w,enabled:['focus','quick','progress','next','parts','materials','photo','timer'].includes(w.id)}))
};

const reorder = (items:DashboardWidget[], id:string, direction:'up'|'down') => {
const index = items.findIndex(w=>w.id===id);
const target = direction==='up' ? index-1 : index+1;
if(index<0 || target<0 || target>=items.length) return items;
const copy=[...items];
[copy[index],copy[target]]=[copy[target],copy[index]];
return copy;
};

export const useFabricatorStore = create<Store>()((set,get)=>(
{
selectedProjectId:'p1',
projects:mock.projects,
sessions:mock.sessions,
voiceNotes:mock.voiceNotes,
tasks:mock.tasks,
parts:mock.parts,
photos:mock.photos,
dashboardPreset:'Fabricator',
dashboardWidgets:presetWidgets.Fabricator,
quickActions,

selectProject:(id)=>set({selectedProjectId:id}),
activeProject:()=>get().projects.find(p=>p.id===get().selectedProjectId),

addSession:(notes)=>set(s=>({sessions:[{id:nextId('s'),projectId:s.selectedProjectId,title:'Garage session',notes,durationMinutes:60,createdAt:new Date().toISOString().slice(0,10)},...s.sessions]})),
addVoiceNote:(transcript)=>set(s=>({voiceNotes:[{id:nextId('v'),projectId:s.selectedProjectId,transcript,createdAt:new Date().toISOString().slice(0,10)},...s.voiceNotes]})),
cycleTask:(id)=>set(s=>({tasks:s.tasks.map(t=>t.id===id?{...t,status:t.status==='To Do'?'In Progress':t.status==='In Progress'?'Done':'To Do'}:t)})),
cyclePart:(id)=>set(s=>({parts:s.parts.map(p=>p.id===id?{...p,status:p.status==='Need to Order'?'On Hand':p.status==='On Hand'?'Installed':'Need to Order'}:p)})),
toggleWidget:(id)=>set(s=>({dashboardWidgets:s.dashboardWidgets.map(w=>w.id===id?{...w,enabled:!w.enabled}:w)})),
toggleWidgetSize:(id)=>set(s=>({dashboardWidgets:s.dashboardWidgets.map(w=>w.id===id?{...w,size:w.size==='compact'?'expanded':'compact'}:w)})),
moveWidget:(id,direction)=>set(s=>({dashboardWidgets:reorder(s.dashboardWidgets,id,direction)})),
applyDashboardPreset:(preset)=>set({dashboardPreset:preset,dashboardWidgets:presetWidgets[preset]}),
toggleQuickAction:(id)=>set(s=>({quickActions:s.quickActions.map(a=>a.id===id?{...a,enabled:!a.enabled}:a)}))
}));
