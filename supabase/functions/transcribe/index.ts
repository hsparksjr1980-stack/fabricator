const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const providerKey = Deno.env.get('OPENAI_API_KEY');
    if (!providerKey) {
      return Response.json({ error: 'Server transcription key is not configured.' }, { status: 500, headers: corsHeaders });
    }

    const incoming = await req.formData();
    const audio = incoming.get('file');
    const durationMs = Number(incoming.get('durationMs') || 0);

    if (!(audio instanceof File)) {
      return Response.json({ error: 'Missing audio file.' }, { status: 400, headers: corsHeaders });
    }

    const payload = new FormData();
    payload.append('model', 'whisper-1');
    payload.append('response_format', 'json');
    payload.append('language', 'en');
    payload.append('prompt', 'Workshop build note. Preserve parts, measurements, materials, blockers, and next-session instructions.');
    payload.append('file', audio, audio.name || 'fabricator-note.m4a');

    const upstream = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + providerKey },
      body: payload
    });

    if (!upstream.ok) {
      return Response.json({ error: 'Speech transcription failed.', status: upstream.status }, { status: upstream.status, headers: corsHeaders });
    }

    const result = await upstream.json();
    return Response.json({ transcript: result.text || '', confidence: 0.95, durationMs, source: 'supabase-speech-transcription' }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown transcription error.' }, { status: 500, headers: corsHeaders });
  }
});
