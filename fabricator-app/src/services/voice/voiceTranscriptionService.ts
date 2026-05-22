export interface VoiceCaptureResult {
  transcript:string;
  confidence:number;
  durationMs:number;
  source:'remote-speech-to-text'|'mock-local-pipeline';
}

export interface VoiceTranscriptionService {
  transcribe(uri?: string,durationMs?:number): Promise<VoiceCaptureResult>;
}

const TRANSCRIPTION_URL='https://api.openai.com/v1/audio/transcriptions';
const MODEL='whisper-1';

function apiKey(){
  return process.env.EXPO_PUBLIC_OPENAI_API_KEY;
}

function mockTranscript(durationMs:number){
  const templates=[
    'Need to order front heims and finish steering clearance before the next fabrication session.',
    'Passenger side mount still needs gussets. Verify rear crossmember alignment and tack the tabs next session.',
    'Need seam sealer, weld-through primer, and tubing before the next work session starts.',
    'Checked suspension clearance and marked interference points. Still need final fitment on the rear section.'
  ];
  return `${templates[Math.floor(Math.random()*templates.length)]} Recorded workshop capture duration ${(durationMs/1000).toFixed(0)} seconds.`;
}

async function remoteTranscribe(uri:string,durationMs:number):Promise<VoiceCaptureResult>{
  const key=apiKey();
  if(!key){
    return {transcript:`Speech-to-text key not configured. ${mockTranscript(durationMs)}`,confidence:0.5,durationMs,source:'mock-local-pipeline'};
  }

  const form=new FormData();
  form.append('model',MODEL);
  form.append('response_format','json');
  form.append('language','en');
  form.append('prompt','Workshop fabrication note. Preserve parts, measurements, materials, tasks, blockers, and next session instructions.');
  form.append('file',{uri,name:'fabricator-note.m4a',type:'audio/m4a'} as any);

  const response=await fetch(TRANSCRIPTION_URL,{method:'POST',headers:{Authorization:`Bearer ${key}`},body:form});
  if(!response.ok){
    return {transcript:`Speech-to-text failed with status ${response.status}.`,confidence:0,durationMs,source:'mock-local-pipeline'};
  }

  const payload=await response.json();
  return {transcript:payload.text || '',confidence:0.95,durationMs,source:'remote-speech-to-text'};
}

export const mockVoiceTranscriptionService: VoiceTranscriptionService = {
  async transcribe(uri?: string,durationMs:number=0){
    if(uri){
      return remoteTranscribe(uri,durationMs);
    }
    return {transcript:mockTranscript(durationMs),confidence:0.91,durationMs,source:'mock-local-pipeline'};
  }
};
