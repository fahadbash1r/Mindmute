create table if not exists public.thoughts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    summary text not null,
    emotion integer not null default 50,
    mood_label text,
    intention text,
    reframe text,
    todo_list text[],
    priorities jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.thoughts enable row level security;

-- Handle policies in a DO block to avoid errors if they already exist
DO $$ 
BEGIN 
    -- Drop existing policies if they exist
    BEGIN
        DROP POLICY IF EXISTS "Users can create their own thoughts" ON thoughts;
        DROP POLICY IF EXISTS "Users can view their own thoughts" ON thoughts;
        DROP POLICY IF EXISTS "Users can update their own thoughts" ON thoughts;
    EXCEPTION 
        WHEN undefined_object THEN 
            NULL;
    END;

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
END $$;

-- Create function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Drop trigger if exists before creating it again
drop trigger if exists update_thoughts_updated_at on thoughts;

-- Create trigger to call the function
create trigger update_thoughts_updated_at
    before update on thoughts
    for each row
    execute function update_updated_at_column();

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
