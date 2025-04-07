-- Create the thoughts table
CREATE TABLE public.thoughts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    summary TEXT NOT NULL,
    reframe TEXT,
    todo_list JSONB,
    priorities JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own thoughts
CREATE POLICY "Users can read their own thoughts"
    ON public.thoughts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own thoughts
CREATE POLICY "Users can insert their own thoughts"
    ON public.thoughts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own thoughts
CREATE POLICY "Users can update their own thoughts"
    ON public.thoughts
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own thoughts
CREATE POLICY "Users can delete their own thoughts"
    ON public.thoughts
    FOR DELETE
    USING (auth.uid() = user_id); 