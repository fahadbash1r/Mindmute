-- Add onboarding fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS mood text,
ADD COLUMN IF NOT EXISTS challenge text,
ADD COLUMN IF NOT EXISTS clarity_area text,
ADD COLUMN IF NOT EXISTS spin_frequency text,
ADD COLUMN IF NOT EXISTS desired_outcome text,
ADD COLUMN IF NOT EXISTS daily_time text,
ADD COLUMN IF NOT EXISTS tone_preference text,
ADD COLUMN IF NOT EXISTS reminder_pref text,
ADD COLUMN IF NOT EXISTS onboarded boolean DEFAULT false; 