import { BuildActivity, BuildPhoto, BuildTask, Part, Project } from '@/types/models';

export type AdvisorToolKey = 'priority' | 'troubleshooting' | 'photoReview';

export type AdvisorProviderKey = 'geminiFlash' | 'openAI' | 'claude' | 'ollama' | 'localModel' | 'customEndpoint';

export type AdvisorResponseSection = {
  title: string;
  items: string[];
};

export type AdvisorStructuredResponse = {
  headline: string;
  summary: string;
  sections: AdvisorResponseSection[];
  nextAction: string;
  providerLabel: string;
  isLiveProvider: boolean;
};

export type AdvisorProjectContext = {
  project?: Project;
  category?: string;
  phase?: string;
  openTasks: BuildTask[];
  completedTasks: BuildTask[];
  neededParts: Part[];
  orderedParts: Part[];
  receivedParts: Part[];
  installedParts: Part[];
  recentPhotos: BuildPhoto[];
  recentActivity: BuildActivity[];
};

export type AdvisorRunInput = {
  tool: AdvisorToolKey;
  context: AdvisorProjectContext;
  missingInformation?: string;
  photoUri?: string;
  providerKey: AdvisorProviderKey;
  customEndpointUrl?: string;
  customModelName?: string;
};

export type AdvisorProviderAdapter = {
  key: AdvisorProviderKey;
  label: string;
  description: string;
  enabled: boolean;
  supportsCustomEndpoint?: boolean;
  run: (input: AdvisorRunInput, prompt: string) => Promise<AdvisorStructuredResponse>;
};
