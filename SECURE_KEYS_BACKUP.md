# 🔐 API Keys Backup - SECURE STORAGE

## ⚠️ IMPORTANT SECURITY NOTICE

This file contains sensitive API keys. Store this securely and do not share or commit to version control.

## 📋 Original API Keys (Save These Securely)

### Supabase Configuration
```
URL: https://giapfmvpowrmvbjpxtym.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYXBmbXZwb3dybXZianB4dHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MzkyNzQsImV4cCI6MjA3NjMxNTI3NH0.UJQH_CN8iU6GHU36-mNewovkE71CZ34d2EEHC3mEEIY
SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYXBmbXZwb3dybXZianB4dHltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDczOTI3NCwiZXhwIjoyMDc2MzE1Mjc0fQ._a0QcNoyoArvj9Z0nyiVVZwRK4sRFG5B-cmNf3U4QaY
```

### Cohere AI API
```
API_KEY: zp59e58wo6Kxburfke7mf21H3iLWiWLZAnM5i2Pf
```

### Vapi Voice AI API
```
API_KEY: 3f28ddbd-1f75-4f5e-b05a-21fc49f50255
```

### Project Configuration
```
PROJECT_ID: giapfmvpowrmvbjpxtym
```

## 🛠️ How to Restore Keys for Development

1. **Create `.env.local` file** in project root (this file is already in .gitignore)
2. **Add the following content** to `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://giapfmvpowrmvbjpxtym.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYXBmbXZwb3dybXZianB4dHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MzkyNzQsImV4cCI6MjA3NjMxNTI3NH0.UJQH_CN8iU6GHU36-mNewovkE71CZ34d2EEHC3mEEIY
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYXBmbXZwb3dybXZianB4dHltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDczOTI3NCwiZXhwIjoyMDc2MzE1Mjc0fQ._a0QcNoyoArvj9Z0nyiVVZwRK4sRFG5B-cmNf3U4QaY

# Cohere AI API
VITE_COHERE_API_KEY=zp59e58wo6Kxburfke7mf21H3iLWiWLZAnM5i2Pf

# Vapi Voice AI API
VITE_VAPI_API_KEY=3f28ddbd-1f75-4f5e-b05a-21fc49f50255

# Project Configuration
VITE_PROJECT_ID=giapfmvpowrmvbjpxtym
```

3. **For server environment**, create `server/.env` with:

```env
SUPABASE_URL=https://giapfmvpowrmvbjpxtym.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYXBmbXZwb3dybXZianB4dHltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDczOTI3NCwiZXhwIjoyMDc2MzE1Mjc0fQ._a0QcNoyoArvj9Z0nyiVVZwRK4sRFG5B-cmNf3U4QaY
VAPI_API_KEY=3f28ddbd-1f75-4f5e-b05a-21fc49f50255
OPENAI_API_KEY=your_openai_key_here
PORT=5050
CORS_ORIGIN=http://localhost:8083
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## 🔒 Security Best Practices

1. **Never commit real API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys regularly** for security
4. **Use different keys** for development and production
5. **Monitor API usage** for unusual activity
6. **Store this backup file securely** (password manager, encrypted drive)

## 🚀 After Securing Keys

- The project now uses placeholder keys in committed files
- Real keys are only in local environment files
- The offline voice functionality works without any API keys
- Your project is now secure for sharing and deployment

---

**⚠️ Delete this file after restoring your keys to maintain security!**
