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
    const form = await req.formData();
    const durationMs = Number(form.get('durationMs') || 0);

    return Response.json(
      {
        transcript: `Supabase transcription endpoint reached. Replace this placeholder with server-side speech transcription. Duration ${Math.round(durationMs / 1000)} seconds.`,
        confidence: 0.5,
        durationMs,
        source: 'supabase-placeholder'
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown transcription error.' },
      { status: 500, headers: corsHeaders }
    );
  }
});
