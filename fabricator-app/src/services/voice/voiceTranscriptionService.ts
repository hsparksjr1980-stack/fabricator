import { TRANSCRIBE_ENDPOINT } from '@/config/supabase';

export interface VoiceCaptureResult {
  transcript:string;
  confidence:number;
  durationMs:number;
  source:string;
}

export interface VoiceTranscriptionService {
  transcribe(uri?: string,durationMs?:number): Promise<VoiceCaptureResult>;
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

async function readError(response:Response){
  try{
    const payload=await response.json();
    return JSON.stringify(payload,null,2);
  }catch{
    return await response.text();
  }
}

async function remoteTranscribe(uri:string,durationMs:number):Promise<VoiceCaptureResult>{
  const form=new FormData();
  form.append('durationMs',String(durationMs));
  form.append('file',{uri,name:'fabricator-note.m4a',type:'audio/m4a'} as any);

  const response=await fetch(TRANSCRIBE_ENDPOINT,{method:'POST',body:form});

  if(!response.ok){
    const detail=await readError(response);
    return {
      transcript:`Supabase transcription failed with status ${response.status}. Details: ${detail}`,
      confidence:0,
      durationMs,
      source:'supabase-error'
    };
  }

  const payload=await response.json();

  return {
    transcript:payload.transcript || '',
    confidence:payload.confidence || 0.95,
    durationMs,
    source:payload.source || 'supabase'
  };
}

export const mockVoiceTranscriptionService: VoiceTranscriptionService = {
  async transcribe(uri?: string,durationMs:number=0){
    if(uri){
      return remoteTranscribe(uri,durationMs);
    }

    return {
      transcript:mockTranscript(durationMs),
      confidence:0.91,
      durationMs,
      source:'mock-local-pipeline'
    };
  }
};
