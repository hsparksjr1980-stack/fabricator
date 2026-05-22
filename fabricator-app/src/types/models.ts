export type ProjectCategory = 'Vehicle Build' | 'Fabrication' | 'Woodworking' | 'Restoration' | 'Creator Build';
export type ProjectPhase = 'Planning' | 'Teardown' | 'Fabrication' | 'Assembly' | 'Finishing' | 'Complete';
export type ProjectStatus = 'Active' | 'Paused' | 'Blocked' | 'Done';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type PartStatus = 'Installed' | 'On Hand' | 'Need to Order';
export interface Project { id: string; name: string; category: ProjectCategory; phase: ProjectPhase; status: ProjectStatus; progress: number; hook: string; updatedAt: string; }
export interface GarageSession { id: string; projectId: string; title: string; notes: string; durationMinutes: number; createdAt: string; }
export interface VoiceNote { id: string; projectId: string; transcript: string; createdAt: string; }
export interface BuildTask { id: string; projectId: string; title: string; system: string; status: TaskStatus; }
export interface Part { id: string; projectId: string; name: string; system: string; status: PartStatus; vendor?: string; notes?: string; }
export interface BuildPhoto { id: string; projectId: string; uri: string; tag: string; caption: string; createdAt: string; }
export interface AiSummary { completedWork: string[]; remainingWork: string[]; nextSessionChecklist: string[]; partsNeeded: string[]; }
export type TimelineItem = { id: string; kind: 'session'|'task'|'part'|'photo'; title: string; meta: string; date: string; };
