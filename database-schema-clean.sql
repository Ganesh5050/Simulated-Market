-- Clean Database Schema for Tunnel AI Project
-- Run this step by step to avoid dependency errors

-- Step 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS persona_feedback CASCADE;
DROP TABLE IF EXISTS session_states CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS project_persona_nodes CASCADE;
DROP TABLE IF EXISTS analysis_sessions CASCADE;
DROP TABLE IF EXISTS personas CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS countries CASCADE;

-- Step 3: Create countries table FIRST (no dependencies)
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  continent VARCHAR(50) NOT NULL,
  population BIGINT,
  gdp_per_capita DECIMAL(10,2),
  internet_penetration DECIMAL(5,2),
  mobile_penetration DECIMAL(5,2),
  tech_adoption_index DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create projects table (depends on auth.users)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  prompt TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Step 5: Create personas table (depends on countries)
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  country_id UUID REFERENCES countries(id),
  age INTEGER NOT NULL,
  gender VARCHAR(20) NOT NULL,
  income_level VARCHAR(50),
  education_level VARCHAR(50),
  occupation VARCHAR(100),
  tech_savviness INTEGER CHECK (tech_savviness >= 1 AND tech_savviness <= 10),
  personality_traits JSONB,
  demographics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create project_persona_nodes table (depends on projects and personas)
CREATE TABLE project_persona_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  node_id VARCHAR(50) NOT NULL,
  persona_id UUID REFERENCES personas(id),
  sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  feedback TEXT,
  confidence_score DECIMAL(3,2),
  lat DECIMAL(10, 8),
  lon DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, node_id)
);

-- Step 7: Create analysis_sessions table (depends on projects)
CREATE TABLE analysis_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Step 8: Create persona_feedback table (depends on project_persona_nodes)
CREATE TABLE persona_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_persona_node_id UUID REFERENCES project_persona_nodes(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  sentiment VARCHAR(20) NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 9: Create session_states table (depends on projects)
CREATE TABLE session_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name VARCHAR(255) NOT NULL,
  analysis_input TEXT,
  selected_nodes JSONB DEFAULT '[]'::jsonb,
  focused_nodes JSONB DEFAULT '[]'::jsonb,
  analyzed_nodes JSONB DEFAULT '[]'::jsonb,
  feedback_list JSONB DEFAULT '[]'::jsonb,
  impact_score INTEGER DEFAULT 0,
  analyzed_sentiment BOOLEAN DEFAULT FALSE,
  show_all_nodes BOOLEAN DEFAULT FALSE,
  show_focused_nodes BOOLEAN DEFAULT FALSE,
  clicked_nodes JSONB DEFAULT '[]'::jsonb,
  current_voice_call JSONB,
  is_recording BOOLEAN DEFAULT FALSE,
  live_transcript TEXT,
  analysis_progress INTEGER DEFAULT 0,
  is_analyzing BOOLEAN DEFAULT FALSE,
  is_focusing BOOLEAN DEFAULT FALSE,
  show_feedback BOOLEAN DEFAULT FALSE,
  is_calling BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id, session_name)
);

-- Step 10: Create user_preferences table (depends on auth.users)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_session_name VARCHAR(255) DEFAULT 'Main Session',
  auto_save BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  theme VARCHAR(20) DEFAULT 'dark',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 11: Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_countries_continent ON countries(continent);
CREATE INDEX idx_personas_country_id ON personas(country_id);
CREATE INDEX idx_project_persona_nodes_project_id ON project_persona_nodes(project_id);
CREATE INDEX idx_project_persona_nodes_sentiment ON project_persona_nodes(sentiment);
CREATE INDEX idx_analysis_sessions_project_id ON analysis_sessions(project_id);
CREATE INDEX idx_session_states_project_user ON session_states(project_id, user_id);
CREATE INDEX idx_session_states_last_accessed ON session_states(last_accessed_at DESC);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Step 12: Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_persona_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Step 13: Create RLS Policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON analysis_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON analysis_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view nodes for their projects" ON project_persona_nodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_persona_nodes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view feedback for their projects" ON persona_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_persona_nodes ppn
      JOIN projects p ON p.id = ppn.project_id
      WHERE ppn.id = persona_feedback.project_persona_node_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own session states" ON session_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session states" ON session_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own session states" ON session_states
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own session states" ON session_states
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Step 14: Insert sample countries data
INSERT INTO countries (name, continent, population, gdp_per_capita, internet_penetration, mobile_penetration, tech_adoption_index) VALUES
('United States', 'North America', 331002651, 65297.52, 87.3, 97.0, 8.5),
('China', 'Asia', 1439323776, 10261.68, 70.4, 95.0, 7.2),
('India', 'Asia', 1380004385, 1900.71, 50.0, 85.0, 6.8),
('Brazil', 'South America', 212559417, 6796.84, 70.0, 80.0, 6.5),
('Germany', 'Europe', 83783942, 45723.64, 89.0, 95.0, 8.2),
('Japan', 'Asia', 126476461, 40113.59, 93.0, 98.0, 8.8),
('United Kingdom', 'Europe', 67886011, 42330.87, 95.0, 97.0, 8.6),
('France', 'Europe', 65273511, 40463.64, 90.0, 96.0, 8.1),
('Canada', 'North America', 37742154, 46194.24, 91.0, 98.0, 8.4),
('Australia', 'Oceania', 25499884, 55059.73, 88.0, 97.0, 8.3),
('South Korea', 'Asia', 51269185, 31362.38, 96.0, 99.0, 9.1),
('Mexico', 'North America', 128932753, 9893.17, 70.0, 75.0, 6.2),
('Italy', 'Europe', 60461826, 31702.13, 76.0, 90.0, 7.5),
('Spain', 'Europe', 46754778, 29560.70, 87.0, 95.0, 7.8),
('Russia', 'Europe', 145934462, 10126.72, 76.0, 85.0, 6.9),
('South Africa', 'Africa', 59308690, 6001.40, 56.0, 70.0, 5.8),
('Nigeria', 'Africa', 206139589, 2028.18, 46.0, 60.0, 4.9),
('Egypt', 'Africa', 102334404, 3027.55, 57.0, 65.0, 5.2),
('Argentina', 'South America', 45195774, 9913.22, 80.0, 85.0, 6.7),
('Thailand', 'Asia', 69799978, 7188.78, 82.0, 90.0, 7.1)
ON CONFLICT (name) DO NOTHING;
