import { create } from 'zustand';
import { BuildPhoto, BuildTask, DashboardWidget, GarageSession, Part, Project, VoiceNote } from '@/types/models';
import * as mock from './mockData';

type Store = {
selectedProjectId:string;
projects:Project[];
sessions:GarageSession[];
voiceNotes:VoiceNote[];
tasks:BuildTask[];
parts:Part[];
photos:BuildPhoto[];
dashboardWidgets:DashboardWidget[];
selectProject:(id:string)=>void;
activeProject:()=>Project|undefined;
addSession:(notes:string)=>void;
addVoiceNote:(transcript:string)=>void;
cycleTask:(id:string)=>void;
cyclePart:(id:string)=>void;
toggleWidget:(id:string)=>void;
};

const nextId = (p:string) => `${p}-${Date.now()}`;

const defaultWidgets:DashboardWidget[] = [
{id:'w1',type:'progress',title:'Project Progress',enabled:true},
{id:'w2',type:'stats',title:'Build Stats',enabled:true},
{id:'w3',type:'nextSession',title:'Next Session AI',enabled:true},
{id:'w4',type:'parts',title:'Parts & Materials',enabled:true},
{id:'w5',type:'creator',title:'Creator Export',enabled:false},
];

export const useFabricatorStore = create<Store>()((set,get)=>(
{
selectedProjectId:'p1',
projects:mock.projects,
sessions:mock.sessions,
voiceNotes:mock.voiceNotes,
tasks:mock.tasks,
parts:mock.parts,
photos:mock.photos,
dashboardWidgets:defaultWidgets,

selectProject:(id)=>set({selectedProjectId:id}),

activeProject:()=>get().projects.find(p=>p.id===get().selectedProjectId),

addSession:(notes)=>set(s=>({
sessions:[{
id:nextId('s'),
projectId:s.selectedProjectId,
title:'Garage session',
notes,
durationMinutes:60,
createdAt:new Date().toISOString().slice(0,10)
},...s.sessions]
})),

addVoiceNote:(transcript)=>set(s=>({
voiceNotes:[{
id:nextId('v'),
projectId:s.selectedProjectId,
transcript,
createdAt:new Date().toISOString().slice(0,10)
},...s.voiceNotes]
})),

cycleTask:(id)=>set(s=>({
tasks:s.tasks.map(t=>t.id===id?{...t,status:t.status==='To Do'?'In Progress':t.status==='In Progress'?'Done':'To Do'}:t)
})),

cyclePart:(id)=>set(s=>({
parts:s.parts.map(p=>p.id===id?{...p,status:p.status==='Need to Order'?'On Hand':p.status==='On Hand'?'Installed':'Need to Order'}:p)
})),

toggleWidget:(id)=>set(s=>({
dashboardWidgets:s.dashboardWidgets.map(w=>w.id===id?{...w,enabled:!w.enabled}:w)
}))

}));
