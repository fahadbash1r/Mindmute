-- Drop and recreate the table to force schema refresh
DROP TABLE IF EXISTS public.thoughts CASCADE;

CREATE TABLE public.thoughts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    summary text NOT NULL,
    emotion integer NOT NULL DEFAULT 50,
    mood_label text,
    intention text,
    reframe text,
    todo_list text[],
    priorities jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own thoughts" 
ON public.thoughts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own thoughts" 
ON public.thoughts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own thoughts" 
ON public.thoughts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_thoughts_updated_at
    BEFORE UPDATE ON thoughts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- Add missing columns if they don't exist
DO $$ 
BEGIN 
    -- Add reframe column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'thoughts' AND column_name = 'reframe') THEN
        ALTER TABLE thoughts ADD COLUMN reframe text;
    END IF;

    -- Add todo_list column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'thoughts' AND column_name = 'todo_list') THEN
        ALTER TABLE thoughts ADD COLUMN todo_list text[];
    END IF;

    -- Add priorities column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'thoughts' AND column_name = 'priorities') THEN
        ALTER TABLE thoughts ADD COLUMN priorities jsonb;
    END IF;

    -- Rename content to summary if content exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'thoughts' AND column_name = 'content') THEN
        ALTER TABLE thoughts RENAME COLUMN content TO summary;
    END IF;
END $$;
