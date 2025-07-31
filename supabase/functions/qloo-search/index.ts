const corsOptions = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key"
};
Deno.serve(async (req)=>{
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsOptions
      });
    }
    if (req.method !== "POST") {
      return new Response(JSON.stringify({
        error: "Method not allowed"
      }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsOptions
        }
      });
    }
    const { query } = await req.json();
    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({
        error: "Query must be at least 2 characters"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsOptions
        }
      });
    }
    const qlooApiKey = Deno.env.get('QLOO_API_KEY');
    if (!qlooApiKey) {
      return new Response(JSON.stringify({
        error: "Qloo API key not configured"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsOptions
        }
      });
    }
    try {
      // Qloo Hackathon search endpoint is GET, with query params
      const params = new URLSearchParams({
        query: query.trim(),
        limit: "5"
      });
      const url = `https://hackathon.api.qloo.com/search?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Api-Key": qlooApiKey
        }
      });
      if (!response.ok) {
        console.error('Qloo search API error:', response.status, await response.text());
        return new Response(JSON.stringify({
          error: "Search service unavailable"
        }), {
          status: 503,
          headers: {
            "Content-Type": "application/json",
            ...corsOptions
          }
        });
      }
      const data = await response.json();
      const results = (data.results || []).map((result)=>({
          id: result.entity_id,
          name: result.name,
          type: result.types && result.types.length > 0 ? result.types[0] : 'unknown'
        }));
      return new Response(JSON.stringify({
        results
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsOptions
        }
      });
    } catch (error) {
      console.error('Qloo API error:', error);
      return new Response(JSON.stringify({
        error: "Search service error"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsOptions
        }
      });
    }
  } catch (error) {
    console.error('Search function error:', error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsOptions
      }
    });
  }
});
