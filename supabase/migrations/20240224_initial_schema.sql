-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  target_weight float,
  current_weight float,
  height float,
  birth_date date,
  gender text, -- 'male', 'female', 'other'
  activity_level text, -- 'sedentary', 'light', 'moderate', 'active', 'very_active'
  tdee int,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(email) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create weight_logs table
create table weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  weight float not null,
  photo_url text,
  note text,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table weight_logs enable row level security;

create policy "Users can view own weight logs."
  on weight_logs for select
  using ( auth.uid() = user_id );

create policy "Users can insert own weight logs."
  on weight_logs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own weight logs."
  on weight_logs for update
  using ( auth.uid() = user_id );

create policy "Users can delete own weight logs."
  on weight_logs for delete
  using ( auth.uid() = user_id );

-- Create diet_logs table
create table diet_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  meal_type text not null, -- 'breakfast', 'lunch', 'dinner', 'snack'
  photo_url text,
  description text,
  calories int,
  protein float,
  carbs float,
  fat float,
  is_ai_generated boolean default false,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table diet_logs enable row level security;

create policy "Users can view own diet logs."
  on diet_logs for select
  using ( auth.uid() = user_id );

create policy "Users can insert own diet logs."
  on diet_logs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own diet logs."
  on diet_logs for update
  using ( auth.uid() = user_id );

create policy "Users can delete own diet logs."
  on diet_logs for delete
  using ( auth.uid() = user_id );

-- Create fitness_logs table
create table fitness_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  activity_type text not null,
  duration_minutes int,
  calories_burned int,
  photo_url text,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table fitness_logs enable row level security;

create policy "Users can view own fitness logs."
  on fitness_logs for select
  using ( auth.uid() = user_id );

create policy "Users can insert own fitness logs."
  on fitness_logs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own fitness logs."
  on fitness_logs for update
  using ( auth.uid() = user_id );

create policy "Users can delete own fitness logs."
  on fitness_logs for delete
  using ( auth.uid() = user_id );

-- Create a trigger to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
