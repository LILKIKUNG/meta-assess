-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enum for Roles
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'staff');

-- 2. Create Tables

-- Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criteria Table
CREATE TABLE criteria (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  weight INTEGER NOT NULL CHECK (weight > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments Table
CREATE TABLE assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  evaluator_id UUID REFERENCES profiles(id) NOT NULL,
  subject_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'reviewed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores Table
CREATE TABLE scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  criterion_id UUID REFERENCES criteria(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 10),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, criterion_id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Profiles Policies
-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (
  auth.uid() = id
);

-- Staff can view profiles of people they need to evaluate (basic visibility for app function)
-- Note: Simplified to allow authenticated users to view names/departments to prevent broken UI
CREATE POLICY "Authenticated users can view basic profile info"
ON profiles FOR SELECT
USING (auth.role() = 'authenticated');


-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (
  auth.uid() = id
);

-- Criteria Policies
-- Everyone (authenticated) can view criteria
CREATE POLICY "Everyone can view criteria" 
ON criteria FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only admins can insert/update/delete criteria
CREATE POLICY "Admins can manage criteria" 
ON criteria FOR ALL 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Assessments Policies
-- Admin can view all
CREATE POLICY "Admins can view all assessments" 
ON assessments FOR SELECT 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Users can see assessments where they are the evaluator OR the subject
CREATE POLICY "Users can view relevant assessments" 
ON assessments FOR SELECT 
USING (
  auth.uid() = evaluator_id OR auth.uid() = subject_id
);

-- Evaluators can insert assessments
CREATE POLICY "Evaluators can create assessments" 
ON assessments FOR INSERT 
WITH CHECK (
  auth.uid() = evaluator_id
);

-- Evaluators can update their own pending assessments
CREATE POLICY "Evaluators can update own assessments" 
ON assessments FOR UPDATE 
USING (
  auth.uid() = evaluator_id
);

-- Scores Policies
-- Similar to assessments
CREATE POLICY "Users can view relevant scores" 
ON scores FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM assessments 
    WHERE assessments.id = scores.assessment_id 
    AND (assessments.evaluator_id = auth.uid() OR assessments.subject_id = auth.uid() OR 
         (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  )
);

CREATE POLICY "Evaluators can insert scores" 
ON scores FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessments 
    WHERE assessments.id = scores.assessment_id 
    AND assessments.evaluator_id = auth.uid()
  )
);

-- 5. Mock Data Generation

-- Helper function to create user in auth.users (Requires appropriate permissions, usually works in SQL Editor)
-- If this fails, you may need to create users manually in the Authentication tab first.
-- Here we'll simulate the IDs for insertion into profiles, assuming these IDs WILL exist or we just insert profile data directly 
-- NOTE: In Supabase, you must delete users from auth.users to clean up. Inserting directly into profiles without auth.users might fail FK constraint.
-- For this script, we will insert into auth.users first if possible, or just assume the user runs this with privileges.

do $$
declare
  admin_id uuid := gen_random_uuid();
  supervisor_id uuid := gen_random_uuid();
  staff_id uuid := gen_random_uuid();
begin
  -- Insert into auth.users (This allows them to log in if you knew the password, but here we just need the FK to exist)
  -- Note: This is a hack for seeding. In production, use the Supabase Auth API/Actions.
  -- Valid password hash for "password123" (bcrypt) - just a placeholder
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES 
    (admin_id, 'admin@company.com', '$2a$10$abcdef...', now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
    (supervisor_id, 'supervisor@company.com', '$2a$10$abcdef...', now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
    (staff_id, 'staff@company.com', '$2a$10$abcdef...', now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING; -- Skip if exists (unlikely with random uuid)

  -- Insert Profiles
  INSERT INTO public.profiles (id, full_name, role, department)
  VALUES
    (admin_id, 'Admin User', 'admin', 'Management'),
    (supervisor_id, 'Supervisor Jane', 'supervisor', 'Engineering'),
    (staff_id, 'Staff John', 'staff', 'Engineering');

  -- Insert Criteria
  INSERT INTO public.criteria (title, weight, description)
  VALUES 
    ('Punctuality', 20, 'Arrives on time and meets deadlines'),
    ('Attitude', 30, 'Positive mindset and teamwork'),
    ('Technical Skills', 50, 'Proficiency in required technologies');
    
  -- Insert Mock Assessment (Supervisor evaluates Staff)
  INSERT INTO public.assessments (evaluator_id, subject_id, status)
  VALUES (supervisor_id, staff_id, 'pending');

end $$;
