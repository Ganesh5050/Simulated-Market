import { Express, Request, Response } from 'express'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export function registerAuthRoutes(app: Express) {
  // Register new user
  app.post('/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }

      console.log('Registering user:', email)

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
        console.error('Registration error:', error)
        return res.status(400).json({ error: error.message })
      }

      console.log('User registered successfully:', data.user?.id)

      res.json({
        success: true,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: data.user?.user_metadata?.name
        }
      })
    } catch (error) {
      console.error('Registration server error:', error)
      res.status(500).json({ error: 'Registration failed' })
    }
  })
  
  // Login user
  app.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }

      console.log('Logging in user:', email)

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Login error:', error)
        return res.status(401).json({ error: error.message })
      }

      console.log('User logged in successfully:', data.user?.id)

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
      console.error('Login server error:', error)
      res.status(500).json({ error: 'Login failed' })
    }
  })
  
  // Logout user
  app.post('/auth/logout', async (req: Request, res: Response) => {
    try {
      const { token } = req.body

      if (!token) {
        return res.status(400).json({ error: 'Token is required' })
      }

      console.log('Logging out user')

      // Sign out from Supabase
      const { error } = await supabase.auth.admin.signOut(token)

      if (error) {
        console.error('Logout error:', error)
        return res.status(400).json({ error: error.message })
      }

      console.log('User logged out successfully')

      res.json({ success: true })
    } catch (error) {
      console.error('Logout server error:', error)
      res.status(500).json({ error: 'Logout failed' })
    }
  })

  // Get current user
  app.get('/auth/user', async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        return res.status(401).json({ error: 'Authorization token is required' })
      }

      // Verify token and get user
      const { data, error } = await supabase.auth.getUser(token)

      if (error) {
        console.error('Get user error:', error)
        return res.status(401).json({ error: 'Invalid token' })
      }

      res.json({
        success: true,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: data.user?.user_metadata?.name
        }
      })
    } catch (error) {
      console.error('Get user server error:', error)
      res.status(500).json({ error: 'Failed to get user' })
    }
  })
}
