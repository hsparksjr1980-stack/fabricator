import {
  AiSummary,
  GarageSession,
  VoiceNote,
} from '@/types/models';

export interface AiService {
  summarizeBuildInput(input: {
    sessions: GarageSession[];
    voiceNotes: VoiceNote[];
  }): Promise<AiSummary>;
}

export const mockAiService: AiService = {
  async summarizeBuildInput(_input) {
    return {
      completedWork: [
        'Cleaned frame section',
      ],
      blockers: [
        'Waiting on parts',
      ],
      nextSteps: [
        'Finish welding',
      ],
      recommendations: [
        'Document measurements before final assembly',
      ],
    };
  },
};