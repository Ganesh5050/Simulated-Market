# PipeIt - AI Voice Research Platform

A sophisticated voice-powered market research platform that enables businesses to conduct simulated interviews with AI personas from different demographics and regions around the world.

## 🚀 Features

### Core Functionality
- **🌍 Global Persona Simulation**: AI personas from 195+ countries with authentic demographics
- **🎙️ Voice Conversations**: Real-time voice interaction with AI personas using Vapi AI
- **📝 Live Transcription**: Automatic transcription of voice conversations
- **💾 Persistent Feedback**: Save and retrieve feedback across projects and sessions
- **🔒 Secure Authentication**: User authentication and data protection with Supabase

### Advanced Features
- **📊 Sentiment Analysis**: Real-time analysis of persona responses
- **🎯 Interactive 3D Globe**: Visual representation of global personas
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔄 Session Management**: Save and resume research sessions
- **📈 Impact Scoring**: Calculate overall sentiment impact scores

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Three.js** - 3D globe visualization
- **Framer Motion** - Smooth animations

### Backend & Services
- **Node.js/Express** - RESTful API server
- **Supabase** - Database and authentication
- **Vapi AI** - Voice conversation API
- **OpenAI** - AI persona responses
- **Cohere AI** - Additional AI capabilities

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ganesh5050/Simulated-Market.git
   cd Simulated-Market
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies (API server)
   cd api
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment files
   cp env.example .env.local
   cp api/env-config.txt.example api/env-config.txt
   ```

4. **Configure your API keys**
   Edit `.env.local` and `api/env-config.txt` with your actual API keys:
   - Supabase URL and keys
   - Vapi API key
   - OpenAI API key
   - Cohere API key

5. **Start the development servers**
   ```bash
   # Start the frontend (port 8080)
   npm run dev
   
   # Start the backend API server (port 5050)
   cd api
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5050

## 🗄️ Database Setup

### Supabase Configuration
1. Create a new Supabase project
2. Run the provided SQL scripts in order:
   - `database-schema.sql` - Main database schema
   - `create-feedback-table.sql` - Feedback system
3. Configure Row Level Security (RLS) policies
4. Update environment variables with your Supabase credentials

## 🚀 Deployment

### Frontend Deployment
Deploy to Vercel, Netlify, or any static hosting service:

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### Backend Deployment
Deploy the API server to Railway, Render, or similar platforms:

```bash
# Build backend
cd api
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
PipeIt-main/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API service layers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   └── types/             # TypeScript type definitions
├── api/                   # Backend API server
│   ├── src/               # Server source code
│   └── package.json       # Backend dependencies
├── public/                # Static assets
├── database-schema.sql    # Database setup script
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_VAPI_API_KEY=your_vapi_api_key
VITE_COHERE_API_KEY=your_cohere_api_key
```

#### Backend (api/env-config.txt)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
VITE_VAPI_API_KEY=your_vapi_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Project Management
- `GET /projects` - List user projects
- `POST /projects` - Create new project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Feedback System
- `POST /feedback` - Save feedback
- `GET /projects/:id/feedback` - Get project feedback

### Voice Services
- `POST /voice/start` - Start voice recording
- `POST /voice/stop` - Stop voice recording
- `POST /voice/transcribe` - Transcribe audio

## 🔒 Security

- **Authentication**: JWT-based authentication with Supabase
- **API Security**: Environment variables for all API keys
- **Data Protection**: Row Level Security (RLS) in Supabase
- **CORS**: Properly configured for production domains

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Review the documentation in the `/docs` folder
- Check the troubleshooting guide

## 🌟 Acknowledgments

- **Vapi AI** - Voice conversation capabilities
- **Supabase** - Database and authentication services
- **OpenAI** - AI persona generation
- **Three.js** - 3D globe visualization
- **shadcn/ui** - Beautiful UI components

---

**Built with ❤️ for market research professionals**
