import dotenv from 'dotenv'
// Load environment variables FIRST before importing anything // Force restart
dotenv.config()

import express from 'express'
import cors from 'cors'
import { registerAuthRoutes } from './routes/auth'
import { registerApiRoutes } from './routes/api'
import { registerAiRoutes } from './routes/ai'
import { voiceRoutes } from './routes/voice'

const app = express()
app.use(cors({ 
  origin: true, // Allow all origins in development
  credentials: true 
}))
app.use(express.json())

app.get('/health', (_req, res) => {
	res.json({ ok: true, time: new Date().toISOString() })
})

// Test auth endpoint
app.post('/test-auth', async (req, res) => {
	try {
		const { email, password } = req.body
		res.json({ 
			success: true, 
			message: 'Auth test working',
			received: { email, password: password ? '***' : 'missing' }
		})
	} catch (error) {
		res.status(500).json({ error: 'Test failed' })
	}
})

// Routes
registerAuthRoutes(app)
registerApiRoutes(app)
// registerAiRoutes(app) // Temporarily disabled - causing server issues
app.use('/', voiceRoutes)

const port = Number(process.env.PORT || 5050)
app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log(`API listening on http://localhost:${port}`)
})


