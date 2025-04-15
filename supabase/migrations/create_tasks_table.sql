-- Create tasks table
create table public.tasks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    thought_id uuid references public.thoughts(id) on delete cascade,
    task text not null,
    type text check (type in ('emotional', 'mental', 'practical', 'clarity', 'custom')) not null,
    optional boolean default false,
    completed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.tasks enable row level security;

-- Create policies
create policy "Users can view their own tasks"
    on public.tasks for select
    using (auth.uid() = user_id);

create policy "Users can create their own tasks"
    on public.tasks for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
    on public.tasks for update
    using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
    on public.tasks for delete
    using (auth.uid() = user_id);

-- Create updated_at trigger
create function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

create trigger on_tasks_updated
    before update on public.tasks
    for each row
    execute function public.handle_updated_at(); 