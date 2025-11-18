-- Tunnel Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personas table
CREATE TABLE IF NOT EXISTS personas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  continent TEXT NOT NULL,
  industry TEXT NOT NULL,
  role TEXT NOT NULL,
  demographics JSONB NOT NULL DEFAULT '{}',
  psychographics JSONB NOT NULL DEFAULT '{}',
  personality JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  idea TEXT NOT NULL,
  reactions JSONB DEFAULT '[]',
  insights TEXT,
  viral_coefficient DECIMAL(3,1),
  global_deployment JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice calls table (optional, for tracking call history)
CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  vapi_call_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'initiated',
  duration_seconds INTEGER,
  transcript TEXT,
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table for storing user feedback on personas/nodes
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  session_id UUID REFERENCES session_states(id) ON DELETE CASCADE,
  node_id TEXT,
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_personas_industry ON personas(industry);
CREATE INDEX IF NOT EXISTS idx_personas_location ON personas(location);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_calls_session_id ON voice_calls(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_persona_id ON voice_calls(persona_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_project_id ON feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_calls_vapi_call_id ON voice_calls(vapi_call_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Personas are public (read-only for all users)
CREATE POLICY "Anyone can view personas" ON personas
    FOR SELECT USING (true);

-- Sessions are private to users
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own sessions" ON sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own sessions" ON sessions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own sessions" ON sessions
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Voice calls are private to users
CREATE POLICY "Users can view own voice calls" ON voice_calls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sessions 
            WHERE sessions.id = voice_calls.session_id 
            AND sessions.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can create own voice calls" ON voice_calls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sessions 
            WHERE sessions.id = voice_calls.session_id 
            AND sessions.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own voice calls" ON voice_calls
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM sessions 
            WHERE sessions.id = voice_calls.session_id 
            AND sessions.user_id::text = auth.uid()::text
        )
    );

-- Insert some sample personas
INSERT INTO personas (name, age, location, industry, role, demographics, psychographics, personality) VALUES
('Sarah Chen', 28, 'San Francisco, CA', 'Technology', 'Software Engineer', 
 '{"gender": "female", "education": "Bachelor", "income": "high"}',
 '{"riskTolerance": "moderate", "techAdoption": "early", "innovation": "high"}',
 '{"openness": 8, "conscientiousness": 7, "extraversion": 6, "agreeableness": 7, "neuroticism": 4}'),

('Marcus Johnson', 35, 'Austin, TX', 'Technology', 'CTO',
 '{"gender": "male", "education": "Master", "income": "very-high"}',
 '{"riskTolerance": "low", "techAdoption": "early", "innovation": "high"}',
 '{"openness": 7, "conscientiousness": 9, "extraversion": 5, "agreeableness": 6, "neuroticism": 3}'),

('Dr. Emily Rodriguez', 42, 'Boston, MA', 'Healthcare', 'Physician',
 '{"gender": "female", "education": "Doctorate", "income": "high"}',
 '{"riskTolerance": "low", "techAdoption": "moderate", "innovation": "moderate"}',
 '{"openness": 6, "conscientiousness": 9, "extraversion": 7, "agreeableness": 8, "neuroticism": 5}'),

('David Kim', 38, 'New York, NY', 'Finance', 'Investment Banker',
 '{"gender": "male", "education": "Master", "income": "very-high"}',
 '{"riskTolerance": "moderate", "techAdoption": "early", "innovation": "moderate"}',
 '{"openness": 5, "conscientiousness": 8, "extraversion": 8, "agreeableness": 5, "neuroticism": 4}'),

('Lisa Thompson', 45, 'Chicago, IL', 'Education', 'Principal',
 '{"gender": "female", "education": "Master", "income": "moderate"}',
 '{"riskTolerance": "low", "techAdoption": "late", "innovation": "low"}',
 '{"openness": 4, "conscientiousness": 9, "extraversion": 6, "agreeableness": 9, "neuroticism": 6}'),

('James Wilson', 31, 'Miami, FL', 'Retail', 'Store Manager',
 '{"gender": "male", "education": "Bachelor", "income": "moderate"}',
 '{"riskTolerance": "moderate", "techAdoption": "moderate", "innovation": "moderate"}',
 '{"openness": 6, "conscientiousness": 7, "extraversion": 8, "agreeableness": 7, "neuroticism": 5}'),

('Maria Garcia', 50, 'Detroit, MI', 'Manufacturing', 'Operations Manager',
 '{"gender": "female", "education": "Bachelor", "income": "moderate"}',
 '{"riskTolerance": "low", "techAdoption": "late", "innovation": "low"}',
 '{"openness": 4, "conscientiousness": 8, "extraversion": 5, "agreeableness": 8, "neuroticism": 6}'),

('Alex Patel', 26, 'Seattle, WA', 'Startup', 'Founder',
 '{"gender": "male", "education": "Bachelor", "income": "low"}',
 '{"riskTolerance": "high", "techAdoption": "early", "innovation": "very-high"}',
 '{"openness": 9, "conscientiousness": 6, "extraversion": 8, "agreeableness": 6, "neuroticism": 5}');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
