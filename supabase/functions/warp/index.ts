import { createClient } from 'npm:@supabase/supabase-js@2';
const corsOptions = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key"
};
const QLOO_BASE = "https://hackathon.api.qloo.com";
const QLOO_HEADERS = {
  "X-Api-Key": Deno.env.get("QLOO_API_KEY")
};
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);
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
    const { entities, target_year, user_name } = await req.json();
    if (!entities || !Array.isArray(entities) || entities.length < 1 || entities.length > 5) {
      return new Response(JSON.stringify({
        error: "Entities must be an array of 1-5 items"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsOptions
        }
      });
    }
    if (!target_year || target_year < 1900 || target_year > 2025) {
      return new Response(JSON.stringify({
        error: "Target year must be between 1900-2025"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsOptions
        }
      });
    }
    // Validate that entities have required fields
    const validEntities = entities.filter(entity => {
      if (!entity || typeof entity !== 'object') return false;
      if (!entity.id || !entity.name) return false;
      return true;
    });
    
    console.log('[Warp] Valid entities found:', validEntities.length, validEntities);
    // Error if NO seeds resolve
    if (validEntities.length === 0) {
      return new Response(JSON.stringify({
        error: "Invalid entity data received. Please try selecting your favorites again."
      }), {
        status: 422,
        headers: {
          "Content-Type": "application/json",
          ...corsOptions
        }
      });
    }
    // Continue if at least 1 valid entity found (proceed with those)
    const bundle = await generateRecommendations(validEntities, target_year);
    console.log('[Warp] Generated bundle:', bundle);
    const essay = await generateEssay(validEntities.map((e)=>e.name), target_year, bundle, user_name);
    console.log('[Warp] Generated essay:', essay);
    const divergence = calculateDivergence(target_year);
    // Store in Supabase
    const { data, error } = await supabase.from('warps').insert({
      seeds: validEntities.map((e)=>e.name),
      target_year,
      bundle,
      essay,
      divergence
    }).select('id').single();
    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        error: "Failed to save warp"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsOptions
        }
      });
    }
    return new Response(JSON.stringify({
      warp_id: data.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsOptions
      }
    });
  } catch (error) {
    // Always return useful error (surface error.message if from validation above)
    console.error('Warp generation error:', error);
    return new Response(JSON.stringify({
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsOptions
      }
    });
  }
});
// ---- Qloo entity search (GET)
async function searchQlooEntity(seed) {
  try {
    console.log(`[Qloo Entity Search] Searching for: "${seed}"`);
    const url = `${QLOO_BASE}/search?query=${encodeURIComponent(seed)}&limit=1`;
    console.log(`[Qloo Entity Search] URL: ${url}`);
    const r = await fetch(url, {
      headers: QLOO_HEADERS
    });
    console.log(`[Qloo Entity Search] Response status: ${r.status}`);
    if (!r.ok) {
      console.error(`Qloo search failed for "${seed}":`, r.status);
      return null;
    }
    const data = await r.json();
    console.log(`[Qloo Entity Search] Response data for "${seed}":`, data);
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      console.log(`[Qloo Entity Search] Found entity for "${seed}":`, result);
      return {
        id: result.entity_id,
        name: result.name,
        type: result.types && result.types.length > 0 ? result.types[0] : 'unknown'
      };
    }
    console.log(`[Qloo Entity Search] No results found for "${seed}"`);
    return null;
  } catch (error) {
    console.error(`Error searching Qloo entity for "${seed}":`, error);
    return null;
  }
}
// ---- Qloo insights (GET /v2/insights)
async function getQlooInsights(entities, category, year) {
  try {
    console.log(`[Qloo Insights] Getting insights for category: ${category}, year: ${year}`);
    console.log(`[Qloo Insights] Input entities:`, entities);
    
    // Use all entities regardless of type - let Qloo's cross-domain intelligence work
    if (entities.length === 0) return null;
    
    // Define broader type filters that are more likely to return results
    const typeFilters = {
      music: ['urn:entity:artist', 'urn:entity:person'],
      film: ['urn:entity:movie', 'urn:entity:film'],
      food: ['urn:entity:place', 'urn:entity:restaurant'],
      fashion: ['urn:entity:brand'],
      travel: ['urn:entity:destination', 'urn:entity:place']
    };
    
    const params = new URLSearchParams({
      "signal.entities": entities.map((e)=>e.id).join(","),
      "filter.release_year.min": String(Math.max(year - 10, 1900)),
      "filter.release_year.max": String(Math.min(year + 10, 2025)),
      "limit": "5"
    });
    
    // Add multiple type filters for better results
    if (typeFilters[category]) {
      typeFilters[category].forEach(type => {
        params.append("filter.type", type);
      });
    }
    
    const url = `${QLOO_BASE}/v2/insights?${params.toString()}`;
    console.log(`[Qloo Insights] Insights URL: ${url}`);
    
    const r = await fetch(url, {
      headers: QLOO_HEADERS
    });
    console.log(`[Qloo Insights] Insights response status: ${r.status}`);
    
    if (!r.ok) {
      const errorText = await r.text();
      console.error(`Qloo insights failed for ${category}:`, r.status, errorText);
      
      // Try again without type filters as fallback
      console.log(`[Qloo Insights] Retrying without type filters for ${category}`);
      const fallbackParams = new URLSearchParams({
        "signal.entities": entities.map((e)=>e.id).join(","),
        "filter.release_year.min": String(Math.max(year - 10, 1900)),
        "filter.release_year.max": String(Math.min(year + 10, 2025)),
        "limit": "5"
      });
      
      const fallbackUrl = `${QLOO_BASE}/v2/insights?${fallbackParams.toString()}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: QLOO_HEADERS
      });
      
      if (!fallbackResponse.ok) {
        return getFallbackForCategory(category, year);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log(`[Qloo Insights] Fallback response data for ${category}:`, fallbackData);
      
      if (fallbackData.results && fallbackData.results.entities && fallbackData.results.entities.length > 0) {
        console.log(`[Qloo Insights] Found fallback recommendation for ${category}:`, fallbackData.results.entities[0].name);
        return fallbackData.results.entities[0].name;
      }
      
      return getFallbackForCategory(category, year);
    }
    
    const data = await r.json();
    console.log(`[Qloo Insights] Insights response data for ${category}:`, data);
    
    if (data.results && data.results.entities && data.results.entities.length > 0) {
      console.log(`[Qloo Insights] Found recommendation for ${category}:`, data.results.entities[0].name);
      return data.results.entities[0].name;
    }
    if (data.entities && data.entities.length > 0) {
      console.log(`[Qloo Insights] Found recommendation for ${category}:`, data.entities[0].name);
      return data.entities[0].name;
    }
    if (data.results && data.results.length > 0) {
      console.log(`[Qloo Insights] Found recommendation for ${category}:`, data.results[0].name);
      return data.results[0].name;
    }
    
    console.log(`[Qloo Insights] No recommendations found for ${category}`);
    return getFallbackForCategory(category, year);
  } catch (error) {
    console.error(`Error getting Qloo insights for ${category}:`, error);
    return getFallbackForCategory(category, year);
  }
}
// ---- Recommendations bundle
async function generateRecommendations(validEntities, target_year) {
  console.log('[Recommendations] Generating for entities:', validEntities);
  console.log('[Recommendations] Target year:', target_year);
  
  const [music, film, food, fashion, travel] = await Promise.all([
    getQlooInsights(validEntities, 'music', target_year),
    getQlooInsights(validEntities, 'film', target_year),
    getQlooInsights(validEntities, 'food', target_year),
    getQlooInsights(validEntities, 'fashion', target_year),
    getQlooInsights(validEntities, 'travel', target_year)
  ]);
  
  console.log('[Recommendations] Raw results:', { music, film, food, fashion, travel });
  
  // Modern equivalents (2025)
  const [modernMusic, modernFilm, modernFood, modernFashion, modernTravel] = await Promise.all([
    getQlooInsights(validEntities, 'music', 2025),
    getQlooInsights(validEntities, 'film', 2025),
    getQlooInsights(validEntities, 'food', 2025),
    getQlooInsights(validEntities, 'fashion', 2025),
    getQlooInsights(validEntities, 'travel', 2025)
  ]);
  
  console.log('[Recommendations] Modern equivalents:', { modernMusic, modernFilm, modernFood, modernFashion, modernTravel });

  return {
    music: music,
    film: film,
    food: food,
    fashion: fashion,
    travel: travel,
    modern_equivalents: {
      music: modernMusic || "Taylor Swift - Anti-Hero",
      film: modernFilm || "Everything Everywhere All at Once",
      food: modernFood || "Korean BBQ Tacos",
      fashion: modernFashion || "Oversized Blazers & Wide-leg Pants",
      travel: modernTravel || "Tokyo, Japan"
    }
  };
}
// ---- LLM essay generator (OpenAI)
async function generateEssay(seeds, target_year, bundle, userName) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  console.log('[OpenAI] API key present:', !!openaiApiKey);
  
  if (!openaiApiKey) return getFallbackEssay(target_year, userName);
  try {
    console.log('[OpenAI] Generating essay for:', { seeds, target_year, bundle, userName });
    const namePrefix = userName ? `${userName}, in ${target_year}` : `In ${target_year}`;
    const prompt = `Write a concise 60-word cultural context essay about ${target_year}. ${userName ? `Start with "${namePrefix}, you'd be all about..."` : ''}
User's favorites: ${seeds.join(', ')}
Era recommendations: Music: ${bundle.music}, Film: ${bundle.film}, Food: ${bundle.food}, Fashion: ${bundle.fashion}, Travel: ${bundle.travel}
Focus on the cultural zeitgeist, artistic movements, and lifestyle trends that defined ${target_year}. Be engaging and ${userName ? 'personal' : 'informative'}.`;
    
    console.log('[OpenAI] Prompt:', prompt);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a cultural historian who writes engaging, concise essays about different time periods. Keep responses to exactly 60 words.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });
    console.log('[OpenAI] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return getFallbackEssay(target_year);
    }
    const data = await response.json();
    console.log('[OpenAI] Response data:', data);
    
    if (data.choices && data.choices.length > 0) {
      const essay = data.choices[0].message.content.trim();
      console.log('[OpenAI] Generated essay:', essay);
      return essay;
    }
    console.log('[OpenAI] No choices in response, using fallback');
    return getFallbackEssay(target_year, userName);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getFallbackEssay(target_year, userName);
  }
}
function calculateDivergence(target_year) {
  const yearDiff = Math.abs(2025 - target_year);
  return Math.min(Math.floor(yearDiff / 1.25), 100);
}
// ---- Fallbacks
function getFallbackRecommendations(year) {
  const eraData = getFallbackEraData(year);
  return {
    music: eraData.music,
    film: eraData.film,
    food: eraData.food,
    fashion: eraData.fashion,
    travel: eraData.travel,
    modern_equivalents: {
      music: "Taylor Swift - Anti-Hero",
      film: "Everything Everywhere All at Once",
      food: "Korean BBQ Tacos",
      fashion: "Oversized Blazers & Wide-leg Pants",
      travel: "Tokyo, Japan"
    }
  };
}
function getFallbackForCategory(category, year) {
  const eraData = getFallbackEraData(year);
  return eraData[category] || `${year}s ${category} recommendation`;
}
function getFallbackEssay(year, userName) {
  const decade = Math.floor(year / 10) * 10;
  const namePrefix = userName ? `${userName}, in ${year}` : `The ${year}s`;
  const essays = {
    1920: userName ? `${namePrefix}, you'd be all about jazz revolution, Art Deco elegance, and speakeasy culture. Post-war optimism fueled experimentation in music, fashion, and lifestyle, creating a vibrant era of cultural rebellion and artistic innovation.` : "The Roaring Twenties brought jazz revolution, Art Deco elegance, and speakeasy culture. Post-war optimism fueled experimentation in music, fashion, and lifestyle, creating a vibrant era of cultural rebellion and artistic innovation.",
    1950: userName ? `${namePrefix}, you'd be all about American prosperity and suburban dreams. Rock 'n' roll emerged, Hollywood's Golden Age flourished, and consumer culture exploded with diners, drive-ins, and television transforming entertainment and social habits.` : "The 1950s epitomized American prosperity and suburban dreams. Rock 'n' roll emerged, Hollywood's Golden Age flourished, and consumer culture exploded with diners, drive-ins, and television transforming entertainment and social habits.",
    1970: userName ? `${namePrefix}, you'd be all about counterculture and disco fever. Folk rock, blockbuster cinema, and ethnic cuisine gained popularity while bell-bottoms and platform shoes defined fashion in this era of social change and musical diversity.` : "The 1970s embodied counterculture and disco fever. Folk rock, blockbuster cinema, and ethnic cuisine gained popularity while bell-bottoms and platform shoes defined fashion in this era of social change and musical diversity.",
    1990: userName ? `${namePrefix}, you'd be all about alternative culture's mainstream breakthrough. Grunge music, independent films, and fusion cuisine reflected a generation's authenticity-seeking spirit, while minimalist fashion and globalization shaped cultural identity.` : "The 1990s marked alternative culture's mainstream breakthrough. Grunge music, independent films, and fusion cuisine reflected a generation's authenticity-seeking spirit, while minimalist fashion and globalization shaped cultural identity.",
    2010: userName ? `${namePrefix}, you'd be all about digital revolution's cultural impact. Streaming services, food trucks, and sustainable fashion emerged as social media transformed how we discover, share, and experience music, film, and lifestyle trends.` : "The 2010s witnessed digital revolution's cultural impact. Streaming services, food trucks, and sustainable fashion emerged as social media transformed how we discover, share, and experience music, film, and lifestyle trends."
  };
  return essays[decade] || (userName ? `${namePrefix}, you'd be experiencing a unique cultural moment, blending traditional values with emerging trends across music, cinema, cuisine, fashion, and travel, creating distinctive aesthetic and lifestyle preferences.` : `The ${year}s represented a unique cultural moment, blending traditional values with emerging trends across music, cinema, cuisine, fashion, and travel, creating distinctive aesthetic and lifestyle preferences.`);
}
function getFallbackEraData(year) {
  const eraMap = {
    1920: {
      music: "Duke Ellington - Cotton Club Nights",
      film: "The Cabinet of Dr. Caligari",
      food: "Oysters Rockefeller",
      fashion: "Flapper Dresses & Cloche Hats",
      travel: "Paris, France"
    },
    1950: {
      music: "Elvis Presley - That's All Right",
      film: "Singin' in the Rain",
      food: "TV Dinners & Jello Salads",
      fashion: "Circle Skirts & Leather Jackets",
      travel: "Route 66 Road Trip"
    },
    1970: {
      music: "Fleetwood Mac - Go Your Own Way",
      film: "The Godfather",
      food: "Fondue & Quiche Lorraine",
      fashion: "Bell-bottoms & Fringe Vests",
      travel: "Woodstock, New York"
    },
    1990: {
      music: "Nirvana - Smells Like Teen Spirit",
      film: "Pulp Fiction",
      food: "Sushi & Bagel Everything",
      fashion: "Grunge Flannel & Doc Martens",
      travel: "Seattle, Washington"
    },
    2010: {
      music: "Adele - Rolling in the Deep",
      film: "Inception",
      food: "Artisanal Cupcakes & Kale Salads",
      fashion: "Skinny Jeans & Statement Necklaces",
      travel: "Portland, Oregon"
    }
  };
  const decade = Math.floor(year / 10) * 10;
  return eraMap[decade] || eraMap[2010];
}
