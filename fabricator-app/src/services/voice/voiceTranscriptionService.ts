export interface VoiceTranscriptionService { transcribe(uri?: string): Promise<string>; }
export const mockVoiceTranscriptionService: VoiceTranscriptionService = { async transcribe(){ return 'Placeholder transcript: finish the patch panel, order bushings, and shoot progress photos for the build log.'; } };
