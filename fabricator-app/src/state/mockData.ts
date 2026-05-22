import { BuildPhoto, BuildTask, GarageSession, Part, Project, VoiceNote } from '@/types/models';

export const projects: Project[] = [
{
id:'p1',
name:'Tube Chassis Shop Kart',
category:'Metal Fabrication',
phase:'Fabrication',
status:'Active',
progress:38,
hook:'A polished demo build showing how Fabricator remembers sessions, parts, photos, blockers, and the next shop plan.',
updatedAt:'2026-05-22'
},
{
id:'p2',
name:'Walnut Workbench',
category:'Woodworking',
phase:'Assembly',
status:'Active',
progress:64,
hook:'Track cuts, hardware, finish schedule, and photos.',
updatedAt:'2026-05-20'
},
{
id:'p3',
name:'1968 C10 Shop Truck',
category:'Vehicle Build',
phase:'Fabrication',
status:'Paused',
progress:42,
hook:'Keep restoration notes, parts, and next steps in one place.',
updatedAt:'2026-05-21'
},
{
id:'p4',
name:'Forge & Anvil Stand',
category:'Blacksmithing',
phase:'Planning',
status:'Active',
progress:14,
hook:'Organize steel inventory, dimensions, and fabrication steps.',
updatedAt:'2026-05-18'
}
];

export const sessions: GarageSession[] = [
{ id:'s1', projectId:'p1', title:'Main hoop and base rail mockup', durationMinutes:135, notes:'Cut base rails, tacked main hoop, confirmed seat position, and marked steering shaft clearance. Need to re-check left rear diagonal before final weld.', createdAt:'2026-05-22' },
{ id:'s2', projectId:'p1', title:'Material prep and bend layout', durationMinutes:80, notes:'Cleaned tube stock, labeled bends, measured rear axle centerline, and staged tabs for pedal box mockup.', createdAt:'2026-05-21' }
];

export const voiceNotes: VoiceNote[] = [
{ id:'v1', projectId:'p1', transcript:'Placeholder transcript: order two more 3/4 inch heims, finish left rear diagonal, photograph steering clearance, add gussets after pedal box mockup.', createdAt:'2026-05-22' }
];

export const tasks: BuildTask[] = [
{ id:'t1', projectId:'p1', title:'Re-check left rear diagonal fitment', system:'Chassis', status:'In Progress' },
{ id:'t2', projectId:'p1', title:'Mock up pedal box and steering shaft', system:'Controls', status:'To Do' },
{ id:'t3', projectId:'p1', title:'Deburr and clean base rails', system:'Fabrication Prep', status:'Done' },
{ id:'t4', projectId:'p1', title:'Add gusset layout marks after pedal test fit', system:'Chassis', status:'To Do' }
];

export const parts: Part[] = [
{ id:'pa1', projectId:'p1', name:'3/4 inch heims', system:'Steering', status:'Need to Order', vendor:'Speedway Motors' },
{ id:'pa2', projectId:'p1', name:'1 inch DOM tube stock', system:'Chassis', status:'On Hand' },
{ id:'pa3', projectId:'p1', name:'Pedal box tabs', system:'Controls', status:'On Hand' },
{ id:'pa4', projectId:'p1', name:'Rear axle bearing hangers', system:'Driveline', status:'Installed' }
];

export const photos: BuildPhoto[] = [
{ id:'ph1', projectId:'p1', uri:'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=900', tag:'Chassis', caption:'Tube stock staged and marked for base rail layout.', createdAt:'2026-05-21' },
{ id:'ph2', projectId:'p1', uri:'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900', tag:'Mockup', caption:'Main hoop tacked in place before diagonal fitment check.', createdAt:'2026-05-22' }
];
