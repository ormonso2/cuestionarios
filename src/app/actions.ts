'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function submitDemoForm(formData: any) {
  try {
    const { data, error } = await supabase
      .from('demos_hutec')
      .insert([
        {
          metadata: {
            submitted_at: new Date().toISOString(),
            source: "nextjs-mobile-form"
          },
          responses: formData
        }
      ]);

    if (error) {
      console.error('Error insertando en Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Error en el servidor:', err);
    return { success: false, error: err.message };
  }
}

export async function getSubmissions() {
  try {
    const { data, error } = await supabase
      .from('demos_hutec')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message, data: [] };
    }
    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}
