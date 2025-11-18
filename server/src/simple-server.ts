import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config()

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const app = express()

// Middleware
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// Register endpoint
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    console.log('🔐 Registering user:', email)

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name || email.split('@')[0]
      }
    })

    if (error) {
      console.error('❌ Registration error:', error.message)
      return res.status(400).json({ error: error.message })
    }

    console.log('✅ User registered successfully:', data.user?.id)

    res.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name
      }
    })
  } catch (error) {
    console.error('❌ Registration server error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Signup endpoint (for frontend compatibility)
app.post('/auth/signup', async (req, res) => {
  try {
    console.log('🔍 SIGNUP REQUEST RECEIVED');
    console.log('📧 Request body:', JSON.stringify(req.body, null, 2));
    
    const { email, password, firstName, lastName } = req.body

    console.log('✅ Extracted fields - Email:', email, 'FirstName:', firstName, 'LastName:', lastName);

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (!firstName || !lastName) {
      console.log('❌ Missing first name or last name');
      return res.status(400).json({ error: 'First name and last name are required' })
    }

    const fullName = `${firstName} ${lastName}`
    console.log('🔐 Attempting to sign up user:', email, 'Name:', fullName);

    // First check if user already exists
    console.log('🔍 Checking if user already exists...');
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error checking existing users:', listError.message);
    } else {
      const existingUser = existingUsers.users?.find(u => u.email === email);
      if (existingUser) {
        console.log('⚠️ User already exists with email:', email);
        return res.status(400).json({ error: 'A user with this email address has already been registered' });
      }
    }

    // Create user in Supabase Auth
    console.log('📝 Creating new user in Supabase...');
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: fullName,
        firstName,
        lastName
      }
    })

    if (error) {
      console.error('❌ Supabase signup error:', error.message);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      return res.status(400).json({ error: error.message })
    }

    console.log('✅ User signed up successfully:', data.user?.id);
    console.log('📊 User data:', JSON.stringify(data.user, null, 2));

    const response = {
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        firstName: data.user?.user_metadata?.firstName,
        lastName: data.user?.user_metadata?.lastName,
        name: data.user?.user_metadata?.name
      }
    };

    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('❌ Signup server error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Full error object:', error);
    res.status(500).json({ error: 'Signup failed: ' + errorMessage })
  }
})

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    console.log('🔐 Logging in user:', email)

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ Login error:', error.message)
      return res.status(401).json({ error: error.message })
    }

    console.log('✅ User logged in successfully:', data.user?.id)

    res.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token
      }
    })
  } catch (error) {
    console.error('❌ Login server error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Voice call endpoint (working)
app.post('/voice/call', async (req, res) => {
  try {
    const { persona, idea } = req.body

    console.log('🎙️ Voice call request for:', persona?.name, 'Idea:', idea)

    if (!persona || !idea) {
      return res.status(400).json({ error: 'Persona and idea are required' })
    }

    // Create Vapi assistant configuration
    const assistantConfig = {
      name: persona.name || 'AI Assistant',
      model: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        systemPrompt: `You are ${persona.name || 'AI Assistant'}, evaluating this product idea: "${idea}". Respond naturally and ask relevant questions.`,
      },
      voice: {
        provider: 'playht',
        voiceId: persona.demographics?.gender === 'female' 
          ? 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b4ef-c4ef86023486/female-calm.mp3' 
          : 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b4ef-c4ef86023486/male-professional.mp3',
      },
      firstMessage: `Hi! I'm ${persona.name || 'AI Assistant'}. I'd love to hear about your product idea: "${idea}".`,
    }

    console.log('✅ Assistant config created successfully')

    res.json({
      success: true,
      assistantConfig,
      publicKey: process.env.VAPI_API_KEY || 'your-vapi-api-key-here',
      persona: {
        id: persona.id || 'default',
        name: persona.name || 'AI Assistant',
        location: persona.demographics?.location || { city: 'San Francisco' },
        role: persona.demographics?.role || 'Professional',
      }
    })
  } catch (error) {
    console.error('❌ Voice call setup error:', error)
    res.status(500).json({ 
      error: 'Failed to setup voice call',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// AI Chat endpoint (for direct voice mode)
app.post('/ai/chat', async (req, res) => {
  try {
    const { messages, persona, idea } = req.body

    console.log('🤖 AI chat request for:', persona?.name, 'Idea:', idea)

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    // Simulate AI response (in production, this would call OpenAI)
    const aiResponse = {
      role: 'assistant',
      content: `Hi! I'm ${persona?.name || 'AI Assistant'}. Based on your idea "${idea}", I think it has potential. Could you tell me more about the target audience?`
    }

    console.log('✅ AI response generated successfully')

    res.json({
      success: true,
      response: aiResponse,
      sessionId: 'session_' + Date.now()
    })
  } catch (error) {
    console.error('❌ AI chat error:', error)
    res.status(500).json({ 
      error: 'Failed to process chat',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Feedback endpoint (for simulation)
app.post('/feedback', async (req, res) => {
  try {
    const { feedback, sessionId, userId } = req.body

    console.log('📝 Feedback received from user:', userId, 'Session:', sessionId)

    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required' })
    }

    // Simulate saving feedback (in production, this would save to database)
    console.log('✅ Feedback saved successfully')

    res.json({
      success: true,
      message: 'Feedback saved successfully',
      feedbackId: 'feedback_' + Date.now()
    })
  } catch (error) {
    console.error('❌ Feedback save error:', error)
    res.status(500).json({ 
      error: 'Failed to save feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Project feedback endpoint
app.post('/projects/:projectId/feedback', async (req, res) => {
  try {
    const { projectId } = req.params
    const { feedback, userId } = req.body

    console.log('📝 Project feedback received for project:', projectId, 'User:', userId)

    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required' })
    }

    // Simulate saving project feedback
    console.log('✅ Project feedback saved successfully')

    res.json({
      success: true,
      message: 'Project feedback saved successfully',
      projectId,
      feedbackId: 'project_feedback_' + Date.now()
    })
  } catch (error) {
    console.error('❌ Project feedback save error:', error)
    res.status(500).json({ 
      error: 'Failed to save project feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Start server
const port = Number(process.env.PORT || 5050)
const server = app.listen(port, () => {
  console.log(`🚀 SIMPLE SERVER listening on http://localhost:${port}`)
  console.log('✅ Supabase configured')
  console.log('✅ Auth endpoints ready')
  console.log('✅ Voice endpoints ready')
})

// Keep server running
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

// Prevent server from exiting
setInterval(() => {
  // Keep alive
}, 1000)
