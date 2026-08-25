import {
  AdvisorProviderAdapter,
  AdvisorRunInput,
  AdvisorStructuredResponse,
} from './advisorTypes';

function firstItems<T>(items: T[], count = 4) {
  return items.slice(0, count);
}

function localStructuredResponse(input: AdvisorRunInput, providerLabel: string): AdvisorStructuredResponse {
  const { context, tool, missingInformation } = input;
  const projectName = context.project?.name || 'this project';

  if (tool === 'priority') {
    const blockers = firstItems([...context.neededParts, ...context.orderedParts], 3).map(
      part => `Resolve part blocker: ${part.name}${part.system ? ` (${part.system})` : ''}.`
    );
    const tasks = firstItems(context.openTasks, 4).map(
      task => `Work task: ${task.title}${task.system ? ` (${task.system})` : ''}.`
    );

    return {
      headline: `Priority plan for ${projectName}`,
      summary: 'This is a structured local preview. A live provider can replace this response through the adapter layer.',
      sections: [
        {
          title: 'Start here',
          items: [...blockers, ...tasks].slice(0, 5).length
            ? [...blockers, ...tasks].slice(0, 5)
            : ['Add open tasks or parts so Advisor can prioritize actual project work.'],
        },
        {
          title: 'Avoid for now',
          items: ['Avoid cosmetic or finish work until blockers, fitment, and missing parts are handled.'],
        },
      ],
      nextAction: blockers[0] || tasks[0] || 'Create one specific next-session task.',
      providerLabel,
      isLiveProvider: false,
    };
  }

  if (tool === 'troubleshooting') {
    return {
      headline: `Troubleshooting plan for ${projectName}`,
      summary: missingInformation?.trim()
        ? `Problem described: ${missingInformation.trim()}`
        : 'Add the symptom or failure point, then run the tool again for a more specific plan.',
      sections: [
        {
          title: 'Safe checks first',
          items: [
            'Confirm the issue is repeatable before cutting, welding, drilling, or ordering parts.',
            'Check related open tasks and part blockers before assuming the problem is design-related.',
            'Use the lowest-risk reversible test first.',
          ],
        },
        {
          title: 'Project context to review',
          items: [
            `${context.openTasks.length} open tasks`,
            `${context.neededParts.length + context.orderedParts.length} needed or ordered parts`,
            `${context.recentActivity.length} recent activity records`,
          ],
        },
      ],
      nextAction: 'Add the exact symptom, location, and what changed right before the issue appeared.',
      providerLabel,
      isLiveProvider: false,
    };
  }

  return {
    headline: `Photo review for ${projectName}`,
    summary: input.photoUri
      ? 'Photo attached for review. This local response gives the review structure until a live vision provider is connected.'
      : 'Attach or choose a project photo to make this tool useful.',
    sections: [
      {
        title: 'Review checklist',
        items: [
          'Check clearance, mounting points, fastener access, and routing.',
          'Look for unsupported parts, sharp edges, heat exposure, or interference.',
          'Compare what is visible with open tasks and needed parts.',
        ],
      },
      {
        title: 'Suggested output',
        items: ['Create a short punch list from the photo instead of starting a conversation.'],
      },
    ],
    nextAction: 'Attach the most relevant photo and add one sentence about what you want reviewed.',
    providerLabel,
    isLiveProvider: false,
  };
}

async function callCustomEndpoint(input: AdvisorRunInput, prompt: string): Promise<AdvisorStructuredResponse> {
  if (!input.customEndpointUrl) {
    return localStructuredResponse(input, 'Custom endpoint not configured');
  }

  try {
    const response = await fetch(input.customEndpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: input.providerKey,
        model: input.customModelName,
        tool: input.tool,
        prompt,
        context: input.context,
        photoUri: input.photoUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Advisor endpoint returned ${response.status}`);
    }

    const data = await response.json();

    return {
      headline: String(data.headline || 'Advisor result'),
      summary: String(data.summary || ''),
      sections: Array.isArray(data.sections) ? data.sections : [],
      nextAction: String(data.nextAction || 'Review the result and create the next task.'),
      providerLabel: input.customModelName || 'Custom provider',
      isLiveProvider: true,
    };
  } catch (error) {
    return {
      ...localStructuredResponse(input, 'Custom endpoint fallback'),
      summary: `Custom endpoint was unavailable. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export const advisorProviders: Record<string, AdvisorProviderAdapter> = {
  localPreview: {
    key: 'localPreview',
    label: 'Local Preview',
    description: 'No external AI call. Uses project data on this device to preview Shop Help structure.',
    enabled: true,
    run: async (input, _prompt) => localStructuredResponse(input, 'Local preview'),
  },
  geminiFlash: {
    key: 'geminiFlash',
    label: 'Gemini Flash',
    description: 'Initial cloud provider target. Use through a backend endpoint so API keys stay off the phone.',
    enabled: false,
    run: async (input, _prompt) => localStructuredResponse(input, 'Gemini Flash adapter placeholder'),
  },
  openAI: {
    key: 'openAI',
    label: 'OpenAI',
    description: 'Future provider adapter.',
    enabled: false,
    run: async (input, _prompt) => localStructuredResponse(input, 'OpenAI adapter placeholder'),
  },
  claude: {
    key: 'claude',
    label: 'Claude',
    description: 'Future provider adapter.',
    enabled: false,
    run: async (input, _prompt) => localStructuredResponse(input, 'Claude adapter placeholder'),
  },
  ollama: {
    key: 'ollama',
    label: 'Ollama',
    description: 'Future self-hosted/local network provider adapter.',
    enabled: false,
    run: async (input, _prompt) => localStructuredResponse(input, 'Ollama adapter placeholder'),
  },
  localModel: {
    key: 'localModel',
    label: 'Local Model',
    description: 'Future on-device or local model adapter.',
    enabled: false,
    run: async (input, _prompt) => localStructuredResponse(input, 'Local model adapter placeholder'),
  },
  customEndpoint: {
    key: 'customEndpoint',
    label: 'Use My Own AI',
    description: 'Future user-managed advisor endpoint. Disabled until external AI use is approved.',
    enabled: false,
    supportsCustomEndpoint: true,
    run: callCustomEndpoint,
  },
};
