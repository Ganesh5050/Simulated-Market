import { supabase, supabaseAdmin } from '@/lib/supabase'

export interface PersonaProfile {
  id: string
  name: string
  age: number
  location: string
  industry: string
  role: string
  demographics: {
    gender: string
    education: string
    income: string
  }
  psychographics: {
    riskTolerance: string
    techAdoption: string
    innovation: string
  }
  personality: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  created_at?: string
  updated_at?: string
}

export interface Session {
  id: string
  user_id: string
  idea: string
  reactions: any[]
  insights?: string
  viral_coefficient?: number
  global_deployment?: any
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  created_at?: string
  updated_at?: string
}

export class DatabaseService {
  // User Management
  async createUser(email: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({ email })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUser(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Persona Management
  async createPersona(persona: Omit<PersonaProfile, 'id' | 'created_at' | 'updated_at'>): Promise<PersonaProfile> {
    const { data, error } = await supabase
      .from('personas')
      .insert(persona)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getPersonas(): Promise<PersonaProfile[]> {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getPersonaById(id: string): Promise<PersonaProfile | null> {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updatePersona(id: string, updates: Partial<PersonaProfile>): Promise<PersonaProfile> {
    const { data, error } = await supabase
      .from('personas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deletePersona(id: string): Promise<void> {
    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Session Management
  async createSession(userId: string, idea: string): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        idea,
        reactions: []
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getSessions(userId: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getSessionById(id: string): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async addReactionToSession(sessionId: string, reaction: any): Promise<Session> {
    const session = await this.getSessionById(sessionId)
    if (!session) throw new Error('Session not found')

    const updatedReactions = [...(session.reactions || []), reaction]
    
    return this.updateSession(sessionId, { reactions: updatedReactions })
  }

  async updateSessionInsights(sessionId: string, insights: string): Promise<Session> {
    return this.updateSession(sessionId, { insights })
  }

  async deleteSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Bulk Operations
  async createMultiplePersonas(personas: Omit<PersonaProfile, 'id' | 'created_at' | 'updated_at'>[]): Promise<PersonaProfile[]> {
    const { data, error } = await supabase
      .from('personas')
      .insert(personas)
      .select()

    if (error) throw error
    return data || []
  }

  async getPersonasByIndustry(industry: string): Promise<PersonaProfile[]> {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('industry', industry)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getPersonasByLocation(location: string): Promise<PersonaProfile[]> {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('location', location)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Analytics
  async getSessionStats(userId: string): Promise<{
    totalSessions: number
    totalReactions: number
    averageReactionsPerSession: number
  }> {
    const sessions = await this.getSessions(userId)
    const totalReactions = sessions.reduce((sum, session) => sum + (session.reactions?.length || 0), 0)
    
    return {
      totalSessions: sessions.length,
      totalReactions,
      averageReactionsPerSession: sessions.length > 0 ? totalReactions / sessions.length : 0
    }
  }
}

export const databaseService = new DatabaseService()
