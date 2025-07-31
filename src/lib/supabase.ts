import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  throw new Error('VITE_SUPABASE_URL is not configured. Please set it to your actual Supabase project URL in the .env file.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  throw new Error('VITE_SUPABASE_ANON_KEY is not configured. Please set it to your actual Supabase anon key in the .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Search functions
export async function searchQlooEntities(query: string) {
  const response = await fetch(`${supabaseUrl}/functions/v1/qloo-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search entities');
  }

  const data = await response.json();
  
  // Debug: Log raw API response to diagnose missing id/type fields
  console.log('[Supabase] Raw API response data:', data);
  console.log('[Supabase] Raw results array:', data.results);
  
  return data.results;
}

// API functions
export async function createWarp(seeds: string[], target_year: number, userName?: string): Promise<string> {
  try {
  const response = await fetch(`${supabaseUrl}/functions/v1/warp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ seeds, target_year, user_name: userName }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Edge function response error:', response.status, errorText);
    try {
      const error = JSON.parse(errorText);
      throw new Error(error.error || `Failed to create warp: ${response.status}`);
    } catch {
      throw new Error(`Failed to create warp: ${response.status} - ${errorText}`);
    }
  }

  const data = await response.json();
  return data.warp_id;
  } catch (error) {
    console.error('createWarp error:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the time-warp service. Please check your internet connection and try again.');
    }
    throw error;
  }
}

export async function getWarp(id: string) {
  const { data, error } = await supabase
    .from('warps')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}