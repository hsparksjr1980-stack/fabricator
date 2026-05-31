import { create } from 'zustand';

import {
  BuildActivity,
  BuildPhoto,
  BuildTask,
  DashboardPreset,
  DashboardWidget,
  GarageSession,
  Part,
  Project,
  ProjectCategory,
  ProjectPhase,
  ProjectStatus,
  QuickAction,
  VoiceNote,
} from '../types/models';

import { appDataStorage } from '../services/storage/appDataStorage';

import * as mock from './mockData';

type ProjectInput = {
  name: string;
  category: ProjectCategory;
  phase: ProjectPhase;
  status: ProjectStatus;
  hook?: string;
  budgetTarget?: number;
};

type PersistedData = {
  selectedProjectId: string;
  projectFilter?: ProjectStatus;
  projects: Project[];
  sessions: GarageSession[];
  voiceNotes: VoiceNote[];
  tasks: BuildTask[];
  parts: Part[];
  photos: BuildPhoto[];
  activities?: BuildActivity[];
};

type Store = {
  selectedProjectId: string;
  projectFilter: 'active' | 'completed' | 'archived';
  projects: Project[];
  sessions: GarageSession[];
  voiceNotes: VoiceNote[];
  tasks: BuildTask[];
  parts: Part[];
  photos: BuildPhoto[];
  activities: BuildActivity[];
  dashboardPreset: DashboardPreset;
  dashboardWidgets: DashboardWidget[];
  quickActions: QuickAction[];
  hasLoadedAppData: boolean;
  selectProject: (id: string) => void;
  setProjectFilter: (filter: 'active' | 'completed' | 'archived') => void;
  activeProject: () => Project | undefined;
  addProject: (input: ProjectInput) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  completeProject: (id: string) => void;
  archiveProject: (id: string) => void;
  reopenProject: (id: string) => void;
  deleteProject: (id: string) => void;
  syncProjectMetrics: (projectId: string) => void;
  logActivity: (input: Omit<BuildActivity, 'id' | 'createdAt'> & { createdAt?: string }) => void;
  addTask: (title: string, system: string, createPart?: boolean) => void;
  updateTask: (id: string, updates: Partial<BuildTask>) => void;
  deleteTask: (id: string) => void;
  cycleTask: (id: string) => void;
  addPart: (
    name: string,
    system: string,
    vendor?: string,
    partNumber?: string,
    description?: string,
    estimatedCost?: number,
    actualCost?: number
  ) => void;
  updatePart: (id: string, updates: Partial<Part>) => void;
  deletePart: (id: string) => void;
  cyclePart: (id: string) => void;
  toggleWidget: (id: string) => void;
  toggleWidgetSize: (id: string) => void;
  moveWidget: (id: string, direction: 'up' | 'down') => void;
  addPhoto: (caption: string, tag: string, uri?: string) => void;
  setPhotoMilestone: (photoId: string, title: string) => void;
  removePhotoMilestone: (photoId: string) => void;
  setProjectCoverPhoto: (photoId: string) => void;
  addVoiceNote: (transcript: string) => void;
  saveAppData: () => Promise<void>;
  loadAppData: () => Promise<void>;
};

const now = () => new Date().toISOString();
const today = () => new Date().toISOString();
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;

const normalizeProjectStatus = (status: unknown): ProjectStatus => {
  if (status === 'completed' || status === 'archived') return status;
  return 'active';
};

const completedTask = (task: BuildTask) => task.status === 'Done' || task.status === 'Completed';

const phaseProgress = (phase?: string) => {
  const value = String(phase || '').toLowerCase();
  if (value.includes('complete')) return 100;
  if (value.includes('finish')) return 85;
  if (value.includes('testing')) return 75;
  if (value.includes('progress') || value.includes('fabrication') || value.includes('assembly')) return 50;
  if (value.includes('parts') || value.includes('gathering')) return 30;
  if (value.includes('design')) return 20;
  if (value.includes('planning')) return 10;
  return 0;
};

const normalizeNumber = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const getProjectMetrics = (
  project: Project,
  tasks: BuildTask[],
  parts: Part[]
): Pick<Project, 'progress' | 'actualSpend' | 'estimatedSpend'> => {
  const projectTasks = tasks.filter(task => task.projectId === project.id);
  const projectParts = parts.filter(part => part.projectId === project.id);

  const progress = project.status === 'completed'
    ? 100
    : projectTasks.length
      ? Math.round((projectTasks.filter(completedTask).length / projectTasks.length) * 100)
      : phaseProgress(project.phase);

  return {
    progress,
    estimatedSpend: projectParts.reduce((sum, part) => sum + normalizeNumber(part.estimatedCost), 0),
    actualSpend: projectParts.reduce((sum, part) => sum + normalizeNumber(part.actualCost), 0),
  };
};

let persistTimeout: ReturnType<typeof setTimeout> | null = null;

const persistSoon = (get: () => Store) => {
  if (persistTimeout) clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    get().saveAppData();
  }, 150);
};

const quickActions: QuickAction[] = [
  { id: 'qa-task', type: 'task', title: 'Task', enabled: true },
  { id: 'qa-part', type: 'part', title: 'Part', enabled: true },
  { id: 'qa-photo', type: 'photo', title: 'Photo', enabled: true },
];

const widgets: DashboardWidget[] = [
  { id: 'focus', type: 'focus', title: 'Today in Shop', enabled: true, size: 'expanded' },
];

export const useFabricatorStore = create<Store>()((set, get) => ({
  selectedProjectId: 'p1',
  projectFilter: 'active',
  projects: mock.projects,
  sessions: mock.sessions,
  voiceNotes: mock.voiceNotes,
  tasks: mock.tasks,
  parts: mock.parts,
  photos: mock.photos,
  activities: [],
  dashboardPreset: 'Fabricator',
  dashboardWidgets: widgets,
  quickActions,
  hasLoadedAppData: false,

  selectProject: id => {
    set({ selectedProjectId: id });
    persistSoon(get);
  },

  setProjectFilter: filter => {
    set({ projectFilter: filter });
    persistSoon(get);
  },

  activeProject: () => get().projects.find(p => p.id === get().selectedProjectId),

  logActivity: input => {
    set(state => ({
      activities: [
        {
          id: nextId('a'),
          createdAt: input.createdAt || now(),
          ...input,
        },
        ...state.activities,
      ].slice(0, 300),
    }));
    persistSoon(get);
  },

  syncProjectMetrics: projectId => {
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId
          ? {
              ...project,
              ...getProjectMetrics(project, state.tasks, state.parts),
              updatedAt: today(),
            }
          : project
      ),
    }));
    persistSoon(get);
  },

  addProject: input =>
    set(state => {
      const id = nextId('p');
      const timestamp = now();
      persistSoon(get);
      return {
        selectedProjectId: id,
        projects: [
          {
            id,
            name: input.name,
            category: input.category,
            phase: input.phase,
            status: normalizeProjectStatus(input.status),
            progress: 0,
            hook: input.hook || 'Keep momentum in the shop.',
            budgetTarget: input.budgetTarget || 0,
            actualSpend: 0,
            estimatedSpend: 0,
            updatedAt: timestamp,
          },
          ...state.projects,
        ],
        activities: [
          {
            id: nextId('a'),
            projectId: id,
            kind: 'project',
            title: `Created project: ${input.name}`,
            detail: input.category,
            createdAt: timestamp,
          },
          ...state.activities,
        ],
      };
    }),

  updateProject: (id, updates) =>
    set(state => {
      const timestamp = now();
      const original = state.projects.find(project => project.id === id);
      persistSoon(get);
      return {
        projects: state.projects.map(project =>
          project.id === id
            ? {
                ...project,
                ...updates,
                status: updates.status ? normalizeProjectStatus(updates.status) : project.status,
                updatedAt: timestamp,
              }
            : project
        ),
        activities: original
          ? [
              {
                id: nextId('a'),
                projectId: id,
                kind: updates.budgetTarget !== undefined ? 'budget' : 'project',
                title: updates.budgetTarget !== undefined ? 'Updated budget target' : `Updated project: ${original.name}`,
                detail: updates.budgetTarget !== undefined ? `$${updates.budgetTarget}` : undefined,
                createdAt: timestamp,
              },
              ...state.activities,
            ].slice(0, 300)
          : state.activities,
      };
    }),

  completeProject: id =>
    set(state => {
      const timestamp = now();
      persistSoon(get);
      return {
        projects: state.projects.map(project =>
          project.id === id
            ? {
                ...project,
                status: 'completed',
                completedAt: timestamp,
                archivedAt: undefined,
                progress: 100,
                phase: 'Complete',
                updatedAt: timestamp,
              }
            : project
        ),
        activities: [
          { id: nextId('a'), projectId: id, kind: 'project', title: 'Marked project complete', createdAt: timestamp },
          ...state.activities,
        ].slice(0, 300),
      };
    }),

  archiveProject: id =>
    set(state => {
      const timestamp = now();
      persistSoon(get);
      return {
        projects: state.projects.map(project =>
          project.id === id
            ? { ...project, status: 'archived', archivedAt: timestamp, updatedAt: timestamp }
            : project
        ),
        activities: [
          { id: nextId('a'), projectId: id, kind: 'project', title: 'Archived project', createdAt: timestamp },
          ...state.activities,
        ].slice(0, 300),
      };
    }),

  reopenProject: id =>
    set(state => {
      const timestamp = now();
      persistSoon(get);
      return {
        projects: state.projects.map(project =>
          project.id === id
            ? { ...project, status: 'active', completedAt: undefined, archivedAt: undefined, updatedAt: timestamp }
            : project
        ),
        activities: [
          { id: nextId('a'), projectId: id, kind: 'project', title: 'Reopened project', createdAt: timestamp },
          ...state.activities,
        ].slice(0, 300),
      };
    }),

  deleteProject: id =>
    set(state => {
      persistSoon(get);
      const remainingProjects = state.projects.filter(project => project.id !== id);
      const selectedProjectExists = remainingProjects.some(project => project.id === state.selectedProjectId);
      const nextSelectedProject = selectedProjectExists
        ? state.selectedProjectId
        : remainingProjects.find(project => project.status === 'active')?.id || remainingProjects[0]?.id || '';

      return {
        selectedProjectId: nextSelectedProject,
        projects: remainingProjects,
        sessions: state.sessions.filter(session => session.projectId !== id),
        voiceNotes: state.voiceNotes.filter(note => note.projectId !== id),
        tasks: state.tasks.filter(task => task.projectId !== id),
        parts: state.parts.filter(part => part.projectId !== id),
        photos: state.photos.filter(photo => photo.projectId !== id),
        activities: state.activities.filter(activity => activity.projectId !== id),
      };
    }),

  addTask: (title, system, createPart) =>
    set(state => {
      const timestamp = now();
      const projectId = state.selectedProjectId;
      const taskId = nextId('t');
      const newParts: Part[] = createPart
        ? [
            {
              id: nextId('pa'),
              projectId,
              name: title,
              system,
              status: 'Need to Order',
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ]
        : [];

      const tasks: BuildTask[] = [
        { id: taskId, projectId, title, system, status: 'To Do', createdAt: timestamp, updatedAt: timestamp },
        ...state.tasks,
      ];
      const parts = [...newParts, ...state.parts];
      persistSoon(get);
      return {
        tasks,
        parts,
        projects: state.projects.map(project =>
          project.id === projectId
            ? { ...project, ...getProjectMetrics(project, tasks, parts), updatedAt: timestamp }
            : project
        ),
        activities: [
          { id: nextId('a'), projectId, kind: 'task', title: `Added task: ${title}`, detail: system, refId: taskId, createdAt: timestamp },
          ...(createPart
            ? [{ id: nextId('a'), projectId, kind: 'part' as const, title: `Added matching part: ${title}`, detail: system, createdAt: timestamp }]
            : []),
          ...state.activities,
        ].slice(0, 300),
      };
    }),

  updateTask: (id, updates) =>
    set(state => {
      const timestamp = now();
      const existing = state.tasks.find(task => task.id === id);
      const projectId = existing?.projectId || state.selectedProjectId;
      const tasks = state.tasks.map(task => (task.id === id ? { ...task, ...updates, updatedAt: timestamp } : task));
      persistSoon(get);
      return {
        tasks,
        projects: state.projects.map(project =>
          project.id === projectId ? { ...project, ...getProjectMetrics(project, tasks, state.parts), updatedAt: timestamp } : project
        ),
        activities: existing
          ? [
              {
                id: nextId('a'),
                projectId,
                kind: 'task',
                title: updates.status ? `Task status: ${existing.title}` : `Updated task: ${existing.title}`,
                detail: updates.status || updates.system || undefined,
                refId: id,
                createdAt: timestamp,
              },
              ...state.activities,
            ].slice(0, 300)
          : state.activities,
      };
    }),

  deleteTask: id =>
    set(state => {
      const existing = state.tasks.find(task => task.id === id);
      const projectId = existing?.projectId || state.selectedProjectId;
      const tasks = state.tasks.filter(task => task.id !== id);
      persistSoon(get);
      return {
        tasks,
        projects: state.projects.map(project =>
          project.id === projectId ? { ...project, ...getProjectMetrics(project, tasks, state.parts), updatedAt: now() } : project
        ),
        activities: existing
          ? [
              { id: nextId('a'), projectId, kind: 'task', title: `Deleted task: ${existing.title}`, refId: id, createdAt: now() },
              ...state.activities,
            ].slice(0, 300)
          : state.activities,
      };
    }),

  cycleTask: id =>
    set(state => {
      const timestamp = now();
      const existing = state.tasks.find(task => task.id === id);
      const projectId = existing?.projectId || state.selectedProjectId;
      const nextStatus = (status: BuildTask['status']): BuildTask['status'] =>
        status === 'To Do' ? 'In Progress' : status === 'In Progress' ? 'Done' : 'To Do';
      const tasks = state.tasks.map(task =>
        task.id === id ? { ...task, status: nextStatus(task.status), updatedAt: timestamp } : task
      );
      const updated = tasks.find(task => task.id === id);
      persistSoon(get);
      return {
        tasks,
        projects: state.projects.map(project =>
          project.id === projectId ? { ...project, ...getProjectMetrics(project, tasks, state.parts), updatedAt: timestamp } : project
        ),
        activities: existing
          ? [
              { id: nextId('a'), projectId, kind: 'task', title: `Task status: ${existing.title}`, detail: updated?.status, refId: id, createdAt: timestamp },
              ...state.activities,
            ].slice(0, 300)
          : state.activities,
      };
    }),

  addPart: (name, system, vendor, partNumber, description, estimatedCost, actualCost) =>
    set(state => {
      const timestamp = now();
      const projectId = state.selectedProjectId;
      const partId = nextId('pa');
      const parts: Part[] = [
        {
          id: partId,
          projectId,
          name,
          system,
          status: 'Need to Order',
          vendor: vendor || undefined,
          partNumber: partNumber || undefined,
          description: description || undefined,
          estimatedCost,
          actualCost,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        ...state.parts,
      ];
      persistSoon(get);
      return {
        parts,
        projects: state.projects.map(project =>
          project.id === projectId ? { ...project, ...getProjectMetrics(project, state.tasks, parts), updatedAt: timestamp } : project
        ),
        activities: [
          { id: nextId('a'), projectId, kind: 'part', title: `Added part: ${name}`, detail: system, refId: partId, createdAt: timestamp },
          ...state.activities,
        ].slice(0, 300),
      };
    }),

  updatePart: (id, updates) =>
    set(state => {
      const timestamp = now();
      const existing = state.parts.find(part => part.id === id);
      const projectId = existing?.projectId || state.selectedProjectId;
      const parts = state.parts.map(part => (part.id === id ? { ...part, ...updates, updatedAt: timestamp } : part));
      persistSoon(get);
      return {
        parts,
        projects: state.projects.map(project =>
          project.id === projectId ? { ...project, ...getProjectMetrics(project, state.tasks, parts), updatedAt: timestamp } : project
        ),
        activities: existing
          ? [
              {
                id: nextId('a'),
                projectId,
                kind: updates.actualCost !== undefined || updates.estimatedCost !== undefined ? 'budget' : 'part',
                title: updates.status ? `Part status: ${existing.name}` : `Updated part: ${existing.name}`,
                detail: updates.status || updates.system || undefined,
                refId: id,
                createdAt: timestamp,
              },
              ...state.activities,
            ].slice(0, 300)
          : state.activities,
      };
    }),

  deletePart: id =>
    set(state => {
      const existing = state.parts.find(part => part.id === id);
      const projectId = existing?.projectId || state.selectedProjectId;
      const parts = state.parts.filter(part => part.id !== id);
      persistSoon(get);
      return {
        parts,
        projects: state.projects.map(project =>
          project.id === projectId ? { ...project, ...getProjectMetrics(project, state.tasks, parts), updatedAt: now() } : project
        ),
        activities: existing
          ? [
              { id: nextId('a'), projectId, kind: 'part', title: `Deleted part: ${existing.name}`, refId: id, createdAt: now() },
              ...state.activities,
            ].slice(0, 300)
          : state.activities,
      };
    }),

  cyclePart: id =>
    set(state => {
      const timestamp = now();
      const existing = state.parts.find(part => part.id === id);
      const projectId = existing?.projectId || state.selectedProjectId;
      const nextStatus = (status: Part['status']): Part['status'] =>
        status === 'Need to Order' ? 'Ordered' : status === 'Ordered' ? 'On Hand' : status === 'On Hand' ? 'Installed' : 'Need to Order';
      const parts = state.parts.map(part =>
        part.id === id ? { ...part, status: nextStatus(part.status), updatedAt: timestamp } : part
      );
      const updated = parts.find(part => part.id === id);
      persistSoon(get);
      return {
        parts,
        projects: state.projects.map(project =>
          project.id === projectId ? { ...project, ...getProjectMetrics(project, state.tasks, parts), updatedAt: timestamp } : project
        ),
        activities: existing
          ? [
              { id: nextId('a'), projectId, kind: 'part', title: `Part status: ${existing.name}`, detail: updated?.status, refId: id, createdAt: timestamp },
              ...state.activities,
            ].slice(0, 300)
          : state.activities,
      };
    }),

  toggleWidget: id =>
    set(state => ({
      dashboardWidgets: state.dashboardWidgets.map(widget =>
        widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
      ),
    })),

  toggleWidgetSize: id =>
    set(state => ({
      dashboardWidgets: state.dashboardWidgets.map(widget =>
        widget.id === id ? { ...widget, size: widget.size === 'compact' ? 'expanded' : 'compact' } : widget
      ),
    })),

  moveWidget: (id, direction) =>
    set(state => {
      const dashboardWidgets = [...state.dashboardWidgets];
      const index = dashboardWidgets.findIndex(widget => widget.id === id);
      if (index < 0) return state;
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= dashboardWidgets.length) return state;
      [dashboardWidgets[index], dashboardWidgets[target]] = [dashboardWidgets[target], dashboardWidgets[index]];
      return { dashboardWidgets };
    }),

  addPhoto: (caption, tag, uri) =>
    set(state => {
      const timestamp = now();
      const photoId = nextId('ph');
      const projectId = state.selectedProjectId;
      persistSoon(get);
      return {
        photos: [
          {
            id: photoId,
            projectId,
            caption,
            tag,
            uri: uri || 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=900',
            createdAt: timestamp,
          },
          ...state.photos,
        ],
        activities: [
          { id: nextId('a'), projectId, kind: 'photo', title: `📷 Added photo: ${caption || tag}`, detail: tag, refId: photoId, createdAt: timestamp },
          ...state.activities,
        ].slice(0, 300),
      };
    }),

  setPhotoMilestone: (photoId, title) =>
    set(state => {
      const photo = state.photos.find(item => item.id === photoId);
      const projectId = photo?.projectId || state.selectedProjectId;
      persistSoon(get);
      return {
        photos: state.photos.map(item => (item.id === photoId ? { ...item, isMilestone: true, milestoneTitle: title } : item)),
        activities: photo
          ? [
              { id: nextId('a'), projectId, kind: 'milestone', title: `Milestone photo: ${title}`, detail: photo.caption, refId: photoId, createdAt: now() },
              ...state.activities,
            ].slice(0, 300)
          : state.activities,
      };
    }),

  removePhotoMilestone: photoId =>
    set(state => {
      persistSoon(get);
      return {
        photos: state.photos.map(photo =>
          photo.id === photoId ? { ...photo, isMilestone: false, milestoneTitle: undefined } : photo
        ),
      };
    }),

  setProjectCoverPhoto: photoId =>
    set(state => {
      const projectId = state.selectedProjectId;
      persistSoon(get);
      return {
        projects: state.projects.map(project =>
          project.id === projectId ? { ...project, coverPhotoId: photoId, updatedAt: now() } : project
        ),
        activities: [
          { id: nextId('a'), projectId, kind: 'photo', title: 'Set project cover photo', refId: photoId, createdAt: now() },
          ...state.activities,
        ].slice(0, 300),
      };
    }),

  addVoiceNote: transcript =>
    set(state => {
      const timestamp = now();
      const projectId = state.selectedProjectId;
      const noteId = nextId('v');
      persistSoon(get);
      return {
        voiceNotes: [
          { id: noteId, projectId, transcript, createdAt: timestamp },
          ...state.voiceNotes,
        ],
        activities: [
          { id: nextId('a'), projectId, kind: 'voice', title: 'Added voice note', detail: transcript.slice(0, 120), refId: noteId, createdAt: timestamp },
          ...state.activities,
        ].slice(0, 300),
      };
    }),

  saveAppData: async () => {
    const state = get();
    const data: PersistedData = {
      selectedProjectId: state.selectedProjectId,
      projectFilter: state.projectFilter,
      projects: state.projects,
      sessions: state.sessions,
      voiceNotes: state.voiceNotes,
      tasks: state.tasks,
      parts: state.parts,
      photos: state.photos,
      activities: state.activities,
    };
    await appDataStorage.save(data);
  },

  loadAppData: async () => {
    const saved = await appDataStorage.load();

    if (saved) {
      const savedProjects = saved.projects.map((project: Project) => ({
        ...project,
        status: normalizeProjectStatus(project.status),
      }));
      const selectedProjectExists = savedProjects.some((project: Project) => project.id === saved.selectedProjectId);
      set({
        ...saved,
        activities: saved.activities || [],
        projectFilter: normalizeProjectStatus(saved.projectFilter),
        projects: savedProjects.map((project: Project) => ({
          ...project,
          ...getProjectMetrics(project, saved.tasks || [], saved.parts || []),
        })),
        selectedProjectId: selectedProjectExists
          ? saved.selectedProjectId
          : savedProjects.find((project: Project) => project.status === 'active')?.id || savedProjects[0]?.id || '',
        hasLoadedAppData: true,
      });
    } else {
      set({ hasLoadedAppData: true });
    }
  },
}));
