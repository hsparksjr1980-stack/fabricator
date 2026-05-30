import { create } from 'zustand';

import {
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
};

type Store = {
  selectedProjectId: string;

  projectFilter:
    | 'active'
    | 'completed'
    | 'archived';

  projects: Project[];

  sessions: GarageSession[];

  voiceNotes: VoiceNote[];

  tasks: BuildTask[];

  parts: Part[];

  photos: BuildPhoto[];

  dashboardPreset: DashboardPreset;

  dashboardWidgets: DashboardWidget[];

  quickActions: QuickAction[];

  hasLoadedAppData: boolean;

  selectProject: (id: string) => void;

  setProjectFilter: (
    filter:
      | 'active'
      | 'completed'
      | 'archived'
  ) => void;

  activeProject: () =>
    | Project
    | undefined;

  addProject: (
    input: ProjectInput
  ) => void;

  updateProject: (
    id: string,
    updates: Partial<Project>
  ) => void;

  completeProject: (
    id: string
  ) => void;

  archiveProject: (
    id: string
  ) => void;

  reopenProject: (
    id: string
  ) => void;

  deleteProject: (
    id: string
  ) => void;

  addTask: (
    title: string,
    system: string,
    createPart?: boolean
  ) => void;

  updateTask: (
    id: string,
    updates: Partial<BuildTask>
  ) => void;

  deleteTask: (
    id: string
  ) => void;

  cycleTask: (
    id: string
  ) => void;

  addPart: (
    name: string,
    system: string,
    vendor?: string,
    partNumber?: string,
    description?: string,
    estimatedCost?: number,
    actualCost?: number
  ) => void;

  updatePart: (
    id: string,
    updates: Partial<Part>
  ) => void;

  deletePart: (
    id: string
  ) => void;

  cyclePart: (
    id: string
  ) => void;

  toggleWidget: (
    id: string
  ) => void;

  toggleWidgetSize: (
    id: string
  ) => void;

  moveWidget: (
    id: string,
    direction: 'up' | 'down'
  ) => void;

  addPhoto: (
    caption: string,
    tag: string,
    uri?: string
  ) => void;

  setPhotoMilestone: (
    photoId: string,
    title: string
  ) => void;

  removePhotoMilestone: (
    photoId: string
  ) => void;

  setProjectCoverPhoto: (
    photoId: string
  ) => void;

  addVoiceNote: (
    transcript: string
  ) => void;

  saveAppData: () => Promise<void>;

  loadAppData: () => Promise<void>;
};

const now = () =>
  new Date().toISOString();

const today = () =>
  new Date().toISOString();

const nextId = (
  prefix: string
) => `${prefix}-${Date.now()}`;

const normalizeProjectStatus = (
  status: unknown
): ProjectStatus => {
  if (status === 'completed' || status === 'archived') {
    return status;
  }

  return 'active';
};

let persistTimeout:
  | ReturnType<typeof setTimeout>
  | null = null;

const persistSoon = (
  get: () => Store
) => {
  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }

  persistTimeout = setTimeout(() => {
    get().saveAppData();
  }, 150);
};

const quickActions: QuickAction[] = [
  {
    id: 'qa-task',
    type: 'task',
    title: 'Task',
    enabled: true,
  },
  {
    id: 'qa-part',
    type: 'part',
    title: 'Part',
    enabled: true,
  },
  {
    id: 'qa-photo',
    type: 'photo',
    title: 'Photo',
    enabled: true,
  },
];

const widgets: DashboardWidget[] = [
  {
    id: 'focus',
    type: 'focus',
    title: 'Today in Shop',
    enabled: true,
    size: 'expanded',
  },
];

export const useFabricatorStore =
  create<Store>()((set, get) => ({
    selectedProjectId: 'p1',

    projectFilter: 'active',

    projects: mock.projects,

    sessions: mock.sessions,

    voiceNotes: mock.voiceNotes,

    tasks: mock.tasks,

    parts: mock.parts,

    photos: mock.photos,

    dashboardPreset: 'Fabricator',

    dashboardWidgets: widgets,

    quickActions,

    hasLoadedAppData: false,

    selectProject: id => {
      set({
        selectedProjectId: id,
      });

      persistSoon(get);
    },

    setProjectFilter: filter => {
      set({
        projectFilter: filter,
      });

      persistSoon(get);
    },

    activeProject: () =>
      get().projects.find(
        p =>
          p.id ===
          get().selectedProjectId
      ),

    addProject: input =>
      set(state => {
        const id = nextId('p');

        persistSoon(get);

        return {
          selectedProjectId: id,

          projects: [
            {
              id,

              name: input.name,

              category: input.category,

              phase: input.phase,

              status:
                normalizeProjectStatus(
                  input.status
                ),

              progress: 0,

              hook:
                input.hook ||
                'Keep momentum in the shop.',

              budgetTarget:
                input.budgetTarget || 0,

              updatedAt: today(),
            },

            ...state.projects,
          ],
        };
      }),

    updateProject: (
      id,
      updates
    ) =>
      set(state => {
        persistSoon(get);

        return {
          projects:
            state.projects.map(
              project =>
                project.id === id
                  ? {
                      ...project,
                      ...updates,
                      status:
                        updates.status
                          ? normalizeProjectStatus(
                              updates.status
                            )
                          : project.status,
                      updatedAt: today(),
                    }
                  : project
            ),
        };
      }),

    completeProject: id =>
      set(state => {
        persistSoon(get);

        return {
          projects:
            state.projects.map(
              project =>
                project.id === id
                  ? {
                      ...project,
                      status:
                        'completed',
                      completedAt:
                        now(),
                      archivedAt:
                        undefined,
                      progress:
                        100,
                      phase:
                        'Complete',
                      updatedAt:
                        today(),
                    }
                  : project
            ),
        };
      }),

    archiveProject: id =>
      set(state => {
        persistSoon(get);

        return {
          projects:
            state.projects.map(
              project =>
                project.id === id
                  ? {
                      ...project,
                      status:
                        'archived',
                      archivedAt:
                        now(),
                      updatedAt:
                        today(),
                    }
                  : project
            ),
        };
      }),

    reopenProject: id =>
      set(state => {
        persistSoon(get);

        return {
          projects:
            state.projects.map(
              project =>
                project.id === id
                  ? {
                      ...project,
                      status: 'active',
                      completedAt:
                        undefined,
                      archivedAt:
                        undefined,
                      updatedAt:
                        today(),
                    }
                  : project
            ),
        };
      }),

    deleteProject: id =>
      set(state => {
        persistSoon(get);

        const remainingProjects =
          state.projects.filter(
            project => project.id !== id
          );

        const selectedProjectExists =
          remainingProjects.some(
            project =>
              project.id ===
              state.selectedProjectId
          );

        const nextSelectedProject =
          selectedProjectExists
            ? state.selectedProjectId
            : remainingProjects.find(
                project =>
                  project.status ===
                  'active'
              )?.id ||
              remainingProjects[0]?.id ||
              '';

        return {
          selectedProjectId:
            nextSelectedProject,

          projects:
            remainingProjects,

          sessions:
            state.sessions.filter(
              session =>
                session.projectId !== id
            ),

          voiceNotes:
            state.voiceNotes.filter(
              note =>
                note.projectId !== id
            ),

          tasks:
            state.tasks.filter(
              task =>
                task.projectId !== id
            ),

          parts:
            state.parts.filter(
              part =>
                part.projectId !== id
            ),

          photos:
            state.photos.filter(
              photo =>
                photo.projectId !== id
            ),
        };
      }),

    addTask: (
      title,
      system,
      createPart
    ) =>
      set(state => {
        persistSoon(get);

        const timestamp =
          now();

        const newParts =
          createPart
            ? [
                {
                  id: nextId('pa'),

                  projectId:
                    state.selectedProjectId,

                  name: title,

                  system,

                  status:
                    'Need to Order' as const,

                  createdAt:
                    timestamp,

                  updatedAt:
                    timestamp,
                },
              ]
            : [];

        return {
          tasks: [
            {
              id: nextId('t'),

              projectId:
                state.selectedProjectId,

              title,

              system,

              status:
                'To Do' as const,

              createdAt:
                timestamp,

              updatedAt:
                timestamp,
            },

            ...state.tasks,
          ],

          parts: [
            ...newParts,
            ...state.parts,
          ],
        };
      }),

    updateTask: (
      id,
      updates
    ) =>
      set(state => {
        persistSoon(get);

        return {
          tasks: state.tasks.map(
            task =>
              task.id === id
                ? {
                    ...task,
                    ...updates,
                    updatedAt:
                      now(),
                  }
                : task
          ),
        };
      }),

    deleteTask: id =>
      set(state => {
        persistSoon(get);

        return {
          tasks: state.tasks.filter(
            task => task.id !== id
          ),
        };
      }),

    cycleTask: id =>
      set(state => {
        persistSoon(get);

        return {
          tasks: state.tasks.map(
            task =>
              task.id === id
                ? {
                    ...task,

                    status:
                      task.status ===
                      'To Do'
                        ? 'In Progress'
                        : task.status ===
                          'In Progress'
                        ? 'Completed'
                        : 'To Do',

                    updatedAt: now(),
                  }
                : task
          ),
        };
      }),

    addPart: (
      name,
      system,
      vendor,
      partNumber,
      description,
      estimatedCost,
      actualCost
    ) =>
      set(state => {
        persistSoon(get);

        const timestamp =
          now();

        return {
          parts: [
            {
              id: nextId('pa'),

              projectId:
                state.selectedProjectId,

              name,

              system,

              status:
                'Need to Order' as const,

              vendor,

              partNumber,

              description,

              estimatedCost,

              actualCost,

              createdAt:
                timestamp,

              updatedAt:
                timestamp,
            },

            ...state.parts,
          ],
        };
      }),

    updatePart: (
      id,
      updates
    ) =>
      set(state => {
        persistSoon(get);

        return {
          parts: state.parts.map(
            part =>
              part.id === id
                ? {
                    ...part,
                    ...updates,
                    updatedAt:
                      now(),
                  }
                : part
          ),
        };
      }),

    deletePart: id =>
      set(state => {
        persistSoon(get);

        return {
          parts:
            state.parts.filter(
              part =>
                part.id !== id
            ),
        };
      }),

    cyclePart: id =>
      set(state => {
        persistSoon(get);

        return {
          parts: state.parts.map(
            part =>
              part.id === id
                ? {
                    ...part,

                    status:
                      part.status ===
                      'Need to Order'
                        ? 'On Hand'
                        : part.status ===
                          'On Hand'
                        ? 'Installed'
                        : 'Need to Order',

                    updatedAt:
                      now(),
                  }
                : part
          ),
        };
      }),

    toggleWidget: id =>
      set(state => ({
        dashboardWidgets:
          state.dashboardWidgets.map(
            widget =>
              widget.id === id
                ? {
                    ...widget,
                    enabled:
                      !widget.enabled,
                  }
                : widget
          ),
      })),

    toggleWidgetSize: id =>
      set(state => ({
        dashboardWidgets:
          state.dashboardWidgets.map(
            widget =>
              widget.id === id
                ? {
                    ...widget,

                    size:
                      widget.size ===
                      'compact'
                        ? 'expanded'
                        : 'compact',
                  }
                : widget
          ),
      })),

    moveWidget: (
      id,
      direction
    ) =>
      set(state => {
        const widgets = [
          ...state.dashboardWidgets,
        ];

        const index =
          widgets.findIndex(
            w => w.id === id
          );

        if (index < 0) {
          return state;
        }

        const target =
          direction === 'up'
            ? index - 1
            : index + 1;

        if (
          target < 0 ||
          target >= widgets.length
        ) {
          return state;
        }

        [
          widgets[index],
          widgets[target],
        ] = [
          widgets[target],
          widgets[index],
        ];

        return {
          dashboardWidgets:
            widgets,
        };
      }),

    addPhoto: (
      caption,
      tag,
      uri
    ) =>
      set(state => {
        persistSoon(get);

        return {
          photos: [
            {
              id: nextId('ph'),

              projectId:
                state.selectedProjectId,

              caption,

              tag,

              uri:
                uri ||
                'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=900',

              createdAt:
                now(),
            },

            ...state.photos,
          ],
        };
      }),

    setPhotoMilestone: (
      photoId,
      title
    ) =>
      set(state => ({
        photos: state.photos.map(
          photo =>
            photo.id === photoId
              ? {
                  ...photo,

                  isMilestone:
                    true,

                  milestoneTitle:
                    title,
                }
              : photo
        ),
      })),

    removePhotoMilestone:
      photoId =>
        set(state => ({
          photos:
            state.photos.map(
              photo =>
                photo.id ===
                photoId
                  ? {
                      ...photo,

                      isMilestone:
                        false,

                      milestoneTitle:
                        undefined,
                    }
                  : photo
            ),
        })),

    setProjectCoverPhoto:
      photoId =>
        set(state => ({
          projects:
            state.projects.map(
              project =>
                project.id ===
                state.selectedProjectId
                  ? {
                      ...project,

                      coverPhotoId:
                        photoId,
                    }
                  : project
            ),
        })),

    addVoiceNote: transcript =>
      set(state => {
        persistSoon(get);

        return {
          voiceNotes: [
            {
              id: nextId('v'),

              projectId:
                state.selectedProjectId,

              transcript,

              createdAt: now(),
            },

            ...state.voiceNotes,
          ],
        };
      }),

    saveAppData: async () => {
      const state = get();

      const data: PersistedData =
        {
          selectedProjectId:
            state.selectedProjectId,

          projectFilter:
            state.projectFilter,

          projects:
            state.projects,

          sessions:
            state.sessions,

          voiceNotes:
            state.voiceNotes,

          tasks: state.tasks,

          parts: state.parts,

          photos: state.photos,
        };

      await appDataStorage.save(
        data
      );
    },

    loadAppData: async () => {
      const saved =
        await appDataStorage.load();

      if (saved) {
        const savedProjects =
          saved.projects.map(
            project => ({
              ...project,
              status:
                normalizeProjectStatus(
                  project.status
                ),
            })
          );

        const selectedProjectExists =
          savedProjects.some(
            project =>
              project.id ===
              saved.selectedProjectId
          );

        set({
          ...saved,
          projectFilter:
            normalizeProjectStatus(
              saved.projectFilter
            ),
          projects:
            savedProjects,
          selectedProjectId:
            selectedProjectExists
              ? saved.selectedProjectId
              : savedProjects.find(
                  project =>
                    project.status ===
                    'active'
                )?.id ||
                savedProjects[0]?.id ||
                '',
          hasLoadedAppData: true,
        });
      } else {
        set({
          hasLoadedAppData: true,
        });
      }
    },
  }));
