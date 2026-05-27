-- Ejecuta este script en el editor SQL de tu panel de Supabase:
-- URL: https://app.supabase.com/project/_/sql

CREATE TABLE IF NOT EXISTS public.demos_hutec (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metadata JSONB,
    responses JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurarse de que la tabla sea segura pero accesible para insertar desde el servicio:
-- Si estás usando Anon Key de forma pública (NO RECOMENDADO si es muy sensible), habilita RLS y permite INSERT.
-- Por defecto Next.js Server Actions usando ANON KEY necesitará permisos para insertar.

ALTER TABLE public.demos_hutec ENABLE ROW LEVEL SECURITY;

-- Permite insertar nuevos registros de forma anónima
CREATE POLICY "Permitir insertar demos de forma anónima" 
ON public.demos_hutec 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Permitir leer todos los registros desde el servidor (anon key en server actions)
CREATE POLICY "Permitir leer demos desde servidor" 
ON public.demos_hutec 
FOR SELECT 
TO anon 
USING (true);
