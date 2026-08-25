import { useFabricatorStore } from '@/state/useFabricatorStore';
import { BuildActivity, BuildPhoto, BuildTask, Part, normalizePartStatus } from '@/types/models';

import { buildAdvisorPrompt } from './advisorPromptService';
import { advisorProviders } from './advisorProviders';
import {
  AdvisorProjectContext,
  AdvisorProviderKey,
  AdvisorRunInput,
  AdvisorStructuredResponse,
  AdvisorToolKey,
} from './advisorTypes';

export function buildAdvisorProjectContext(): AdvisorProjectContext {
  const state = useFabricatorStore.getState();
  const project = state.activeProject();
  const projectId = state.selectedProjectId;

  const tasks = state.tasks.filter((task: BuildTask) => task.projectId === projectId);
  const parts = state.parts.filter((part: Part) => part.projectId === projectId);
  const photos = state.photos.filter((photo: BuildPhoto) => photo.projectId === projectId);
  const activities = state.activities
    .filter((activity: BuildActivity) => activity.projectId === projectId)
    .slice(0, 10);

  return {
    project,
    category: project?.category,
    phase: project?.phase,
    openTasks: tasks.filter((task: BuildTask) => task.status !== 'Done' && task.status !== 'Completed'),
    completedTasks: tasks.filter((task: BuildTask) => task.status === 'Done' || task.status === 'Completed'),
    neededParts: parts.filter((part: Part) => normalizePartStatus(part.status) === 'Needed'),
    orderedParts: parts.filter((part: Part) => normalizePartStatus(part.status) === 'Ordered'),
    receivedParts: parts.filter((part: Part) => normalizePartStatus(part.status) === 'Received'),
    installedParts: parts.filter((part: Part) => normalizePartStatus(part.status) === 'Installed'),
    recentPhotos: photos.slice(0, 8),
    recentActivity: activities,
  };
}

export async function runAdvisorTool({
  tool,
  providerKey,
  missingInformation,
  photoUri,
  customEndpointUrl,
  customModelName,
}: {
  tool: AdvisorToolKey;
  providerKey: AdvisorProviderKey;
  missingInformation?: string;
  photoUri?: string;
  customEndpointUrl?: string;
  customModelName?: string;
}): Promise<AdvisorStructuredResponse> {
  const context = buildAdvisorProjectContext();
  const provider = advisorProviders[providerKey]?.enabled
    ? advisorProviders[providerKey]
    : advisorProviders.localPreview;
  const prompt = buildAdvisorPrompt(tool, context, missingInformation);

  const input: AdvisorRunInput = {
    tool,
    context,
    missingInformation,
    photoUri,
    providerKey,
    customEndpointUrl,
    customModelName,
  };

  return provider.run(input, prompt);
}

export function getAdvisorProviders() {
  return Object.values(advisorProviders).filter(provider => provider.enabled);
}
