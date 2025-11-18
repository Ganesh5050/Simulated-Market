-- Create feedback table for storing user feedback
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
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_project_id ON feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own feedback
CREATE POLICY "Users can view their own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own feedback
CREATE POLICY "Users can insert their own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own feedback
CREATE POLICY "Users can update their own feedback" ON feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own feedback
CREATE POLICY "Users can delete their own feedback" ON feedback
  FOR DELETE USING (auth.uid() = user_id);
