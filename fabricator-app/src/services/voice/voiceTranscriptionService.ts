export interface VoiceCaptureResult {
  transcript:string;
  confidence:number;
  durationMs:number;
  source:'mock-local-pipeline';
}

export interface VoiceTranscriptionService {
  transcribe(uri?: string,durationMs?:number): Promise<VoiceCaptureResult>;
}

function buildTranscript(durationMs:number){
  const templates=[
    'Need to order front heims and finish steering clearance before the next fabrication session.',
    'Passenger side mount still needs gussets. Verify rear crossmember alignment and tack the tabs next session.',
    'Need seam sealer, weld-through primer, and tubing before the next work session starts.',
    'Checked suspension clearance and marked interference points. Still need final fitment on the rear section.'
  ];

  const pick=templates[Math.floor(Math.random()*templates.length)];
  return `${pick} Recorded workshop capture duration ${(durationMs/1000).toFixed(0)} seconds.`;
}

export const mockVoiceTranscriptionService: VoiceTranscriptionService = {
  async transcribe(uri?: string,durationMs:number=0){
    return {
      transcript:buildTranscript(durationMs),
      confidence:0.91,
      durationMs,
      source:'mock-local-pipeline'
    };
  }
};
