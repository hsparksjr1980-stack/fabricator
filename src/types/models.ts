
export type ProjectStatus =
  | 'active'
  | 'completed'
  | 'archived';

export type TaskStatus =
  | 'To Do'
  | 'In Progress'
  | 'Completed'
  | 'Done';

export type PartStatus =
  | 'Need to Order'
  | 'On Hand'
  | 'Installed'
  | 'Ordered';

export type ProjectCategory = string;

export type ProjectPhase = string;

export interface Project {
  id: string;

  name: string;

  category: ProjectCategory;

  phase: ProjectPhase;

  status: ProjectStatus;

  progress: number;

  hook?: string;

  budgetTarget?: number;

  description?: string;

  completedAt?: string;

  archivedAt?: string;

  isOnHold?: boolean;

  coverPhotoId?: string;

  updatedAt: string;
}

export interface BuildTask {
  id: string;

  projectId: string;

  title: string;

  system: string;

  notes?: string;

  priority?: 'Low' | 'Medium' | 'High';

  status: TaskStatus;

  createdAt: string;

  updatedAt: string;
}

export interface Part {
  id: string;

  projectId: string;

  name: string;

  system: string;

  status: PartStatus;

  vendor?: string;

  quantity?: number;

  tags?: string[];

  notes?: string;

  partNumber?: string;

  description?: string;

  estimatedCost?: number;

  actualCost?: number;

  createdAt: string;

  updatedAt: string;
}

export interface VoiceNote {
  id: string;

  projectId: string;

  transcript: string;

  createdAt: string;
}

export interface BuildPhoto {
  id: string;

  projectId: string;

  caption: string;

  tag: string;

  uri: string;

  createdAt: string;

  isMilestone?: boolean;

  milestoneTitle?: string;
}

export interface GarageSession { id: string; projectId: string; title: string; durationMinutes?: number; notes?: string; createdAt: string;
}

export type DashboardPreset =
  | 'Fabricator'
  | 'Woodworker'
  | 'Restoration'
  | 'Content Creator'
  | 'Race Build'
  | 'Motorcycle Build';

export interface DashboardWidget {
  id: string;

  type:
    | 'focus' 
    | 'quickActions' 
    | 'progress' 
    | 'stats' 
    | 'nextSession' 
    | 'blockers' 
    | 'parts' 
    | 'materialsInventory' 
    | 'recentActivity' 
    | 'photoFeature' 
    | 'creator' 
    | 'sessionTimer'
    | 'timer' | 'activity' | 'render';

  title: string;

  enabled: boolean;

  size: 'compact' | 'expanded';
}

export interface QuickAction {
  id: string;

  type:
    | 'task'
    | 'part'
    | 'photo'
    | 'render';

  title: string;

  enabled: boolean;
}

