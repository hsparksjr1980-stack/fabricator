export const PROJECT_CATEGORIES = [
  'Vehicle',
  'Woodworking',
  'Electronics',
  'Home Improvement',
  'Fabrication',
  'Crafts',
  'General',
] as const;

export const PROJECT_PHASES = [
  'Planning',
  'Design',
  'Parts Gathering',
  'In Progress',
  'Testing',
  'Finishing',
  'Complete',
] as const;

export const PROJECT_STATUSES = [
  'active',
  'completed',
  'archived',
] as const;

export type ProjectCategory =
  | (typeof PROJECT_CATEGORIES)[number]
  | (string & {});

export type ProjectPhase =
  | (typeof PROJECT_PHASES)[number]
  | (string & {});

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
  | 'Ordered'
  | 'On Hand'
  | 'Received'
  | 'Installed';

export type ActivityKind =
  | 'project'
  | 'task'
  | 'part'
  | 'photo'
  | 'milestone'
  | 'budget'
  | 'voice'
  | 'status'
  | 'system';

export const DEFAULT_PROJECT_CATEGORY: ProjectCategory = 'General';
export const DEFAULT_PROJECT_PHASE: ProjectPhase = 'Planning';
export const DEFAULT_PROJECT_STATUS: ProjectStatus = 'active';
export const DEFAULT_PROJECT_PROGRESS = 0;
export const DEFAULT_PROJECT_EXPECTED_BUDGET = 0;

export interface Project {
  id: string;
  name: string;

  /** Phase 1 project model fields. */
  category: ProjectCategory;
  phase: ProjectPhase;
  expectedBudget?: number;

  /** Existing fields maintained for compatibility. */
  status: ProjectStatus;
  progress: number;

  hook?: string;
  description?: string;
  completedAt?: string;
  archivedAt?: string;
  isOnHold?: boolean;
  coverPhotoId?: string;
  updatedAt: string;

  /**
   * Backward-compatible legacy field.
   * Keep this while older screens or saved data may still reference budgetTarget.
   * New code should prefer expectedBudget.
   */
  budgetTarget?: number;

  /** Optional calculated fields used by dashboards/metrics. */
  estimatedSpend?: number;
  actualSpend?: number;
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
  comparisonGroup?: string;
}

export interface GarageSession {
  id: string;
  projectId: string;
  title: string;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
}

export interface BuildActivity {
  id: string;
  projectId: string;
  kind: ActivityKind | string;
  title: string;
  detail?: string;
  refId?: string;
  createdAt: string;
}

export type DashboardPreset =
  | 'Fabricator'
  | 'Woodworker'
  | 'Restoration'
  | 'Content Creator'
  | 'Race Build'
  | 'Motorcycle Build';

export interface AiSummary {
  completedWork: string[];
  blockers: string[];
  nextSteps: string[];
  recommendations: string[];
}

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
    | 'timer'
    | 'activity'
    | 'render';
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

export function normalizeProjectCategory(
  category: unknown
): ProjectCategory {
  if (typeof category !== 'string' || !category.trim()) {
    return DEFAULT_PROJECT_CATEGORY;
  }

  const trimmed = category.trim();

  if (PROJECT_CATEGORIES.includes(trimmed as (typeof PROJECT_CATEGORIES)[number])) {
    return trimmed as ProjectCategory;
  }

  const lower = trimmed.toLowerCase();

  if (
    lower.includes('vehicle') ||
    lower.includes('car') ||
    lower.includes('truck') ||
    lower.includes('motorcycle') ||
    lower.includes('restoration')
  ) {
    return 'Vehicle';
  }

  if (lower.includes('wood')) {
    return 'Woodworking';
  }

  if (lower.includes('elect')) {
    return 'Electronics';
  }

  if (
    lower.includes('home') ||
    lower.includes('house') ||
    lower.includes('repair') ||
    lower.includes('remodel')
  ) {
    return 'Home Improvement';
  }

  if (
    lower.includes('fabrication') ||
    lower.includes('fabricator') ||
    lower.includes('metal') ||
    lower.includes('welding') ||
    lower.includes('blacksmith')
  ) {
    return 'Fabrication';
  }

  if (lower.includes('craft')) {
    return 'Crafts';
  }

  return DEFAULT_PROJECT_CATEGORY;
}

export function normalizeProjectPhase(
  phase: unknown
): ProjectPhase {
  if (typeof phase !== 'string' || !phase.trim()) {
    return DEFAULT_PROJECT_PHASE;
  }

  const trimmed = phase.trim();

  if (PROJECT_PHASES.includes(trimmed as (typeof PROJECT_PHASES)[number])) {
    return trimmed as ProjectPhase;
  }

  const lower = trimmed.toLowerCase();

  if (lower.includes('plan')) return 'Planning';
  if (lower.includes('design')) return 'Design';
  if (lower.includes('part') || lower.includes('gather')) return 'Parts Gathering';
  if (lower.includes('progress') || lower.includes('assembly') || lower.includes('fabrication')) return 'In Progress';
  if (lower.includes('test')) return 'Testing';
  if (lower.includes('finish') || lower.includes('paint')) return 'Finishing';
  if (lower.includes('complete') || lower.includes('done')) return 'Complete';

  return DEFAULT_PROJECT_PHASE;
}

export function normalizeProjectStatus(
  status: unknown
): ProjectStatus {
  if (status === 'completed' || status === 'archived') {
    return status;
  }

  return DEFAULT_PROJECT_STATUS;
}

export function normalizeProjectProgress(progress: unknown): number {
  const numeric = Number(progress);

  if (!Number.isFinite(numeric)) {
    return DEFAULT_PROJECT_PROGRESS;
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
}

export function normalizeExpectedBudget(
  expectedBudget: unknown,
  legacyBudgetTarget?: unknown
): number {
  const preferred = Number(expectedBudget);
  const legacy = Number(legacyBudgetTarget);

  if (Number.isFinite(preferred) && preferred >= 0) {
    return preferred;
  }

  if (Number.isFinite(legacy) && legacy >= 0) {
    return legacy;
  }

  return DEFAULT_PROJECT_EXPECTED_BUDGET;
}

export function migrateProjectModel(project: Partial<Project>): Project {
  const timestamp =
    typeof project.updatedAt === 'string' && project.updatedAt
      ? project.updatedAt
      : new Date().toISOString();

  const expectedBudget = normalizeExpectedBudget(
    project.expectedBudget,
    project.budgetTarget
  );

  return {
    id: project.id || `p-${Date.now()}`,
    name: project.name || 'Untitled Project',
    category: normalizeProjectCategory(project.category),
    phase: normalizeProjectPhase(project.phase),
    expectedBudget,
    status: normalizeProjectStatus(project.status),
    progress: normalizeProjectProgress(project.progress),
    hook: project.hook,
    description: project.description,
    completedAt: project.completedAt,
    archivedAt: project.archivedAt,
    isOnHold: project.isOnHold,
    coverPhotoId: project.coverPhotoId,
    updatedAt: timestamp,
    budgetTarget: project.budgetTarget ?? expectedBudget,
    estimatedSpend: project.estimatedSpend,
    actualSpend: project.actualSpend,
  };
}
