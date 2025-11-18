import { Express } from 'express'

export function registerApiRoutes(app: Express) {
  app.get('/api/projects', (req, res) => {
    res.json({ projects: [] })
  })
  
  app.post('/api/projects', (req, res) => {
    res.json({ message: 'Project created' })
  })
  
  app.get('/api/insights', (req, res) => {
    res.json({ insights: [] })
  })
}
