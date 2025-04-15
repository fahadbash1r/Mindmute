-- Create tasks table
create table if not exists public.tasks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    task text not null,
    type text not null check (type in ('emotional', 'mental', 'practical')),
    optional boolean default false not null,
    source_thought text,
    completed boolean default false not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Create policies
create policy "Users can view their own tasks"
    on public.tasks for select
    using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
    on public.tasks for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
    on public.tasks for update
    using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
    on public.tasks for delete
    using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at
    before update on public.tasks
    for each row
    execute function public.handle_updated_at(); 