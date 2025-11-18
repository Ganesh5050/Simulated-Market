# Vapi Voice Conversations Integration

## Overview
Full implementation of real-time AI voice conversations with personas using Vapi's Voice AI platform.

## What's Implemented

### ✅ Backend (server/src/routes/voice.ts)
- **Vapi SDK Integration**: Uses `@vapi-ai/server-sdk` for creating and managing voice assistants
- **Dynamic Assistant Creation**: Creates unique Vapi assistants for each persona with custom system prompts
- **Voice Selection**: Automatically selects gender-matched voices (jennifer/michael) based on persona name
- **Endpoints**:
  - `POST /voice/start` - Creates Vapi assistant and returns config for frontend
  - `POST /voice/stop` - Ends call and retrieves final transcript
  - `GET /voice/call/:callId` - Fetches call details and transcript
  - `POST /voice/webhook` - Handles Vapi webhook events for real-time updates

### ✅ Frontend (src/pages/Simulation.tsx + src/services/vapiService.ts)
- **Vapi Web SDK Integration**: Uses `@vapi-ai/web` for browser-based voice calls
- **Real-time Transcription**: Live display of conversation as it happens
- **Call Controls**:
  - Mute/Unmute microphone
  - End call button
  - Visual indicators for speaking status
- **Beautiful UI**:
  - Gradient call status header
  - Live transcript with color-coded speakers (blue for user, green for assistant)
  - Audio visualizations (speaking indicators)
  - Smooth transitions between idle/calling states
- **Transcript Storage**: Automatically saves full conversation to session feedback when call ends

## How It Works

### 1. Starting a Call
```typescript
// User clicks "Call Persona" button
// Frontend makes request to backend to create Vapi assistant
POST /voice/start {
  personaId, personaName, productIdea, demographics
}

// Backend creates Vapi assistant with persona-specific prompt
const assistant = await vapi.assistants.create({
  name: personaName,
  model: { provider: 'openai', model: 'gpt-3.5-turbo' },
  voice: { provider: 'playht', voiceId: 'jennifer' },
  firstMessage: "Hi! I'm {persona}..."
})

// Returns assistant ID and public key to frontend

// Frontend starts WebRTC call using Vapi Web SDK
await vapiService.startCall({
  assistantId, personaName, productIdea, publicKey
})
```

### 2. During the Call
- User speaks into microphone
- Vapi processes speech-to-text in real-time
- GPT generates persona response based on system prompt
- Vapi converts text-to-speech and plays it
- All transcripts appear live in the UI
- Callbacks update UI state (speaking indicators, transcript list)

### 3. Ending the Call
- User clicks "End Call" button
- Frontend calls `vapiService.endCall()`
- Full transcript is saved to session feedback
- UI returns to idle state

## Configuration Required

### Backend (.env)
```env
VAPI_API_KEY=your_vapi_api_key_here
OPENAI_API_KEY=your_openai_key  # Vapi uses this
```

### Frontend
No additional config needed - uses Vapi public key from backend response

## Features

### ✅ Implemented
- [x] Real-time voice conversations
- [x] Live transcription display
- [x] Mute/unmute controls
- [x] End call functionality
- [x] Persona-specific voices
- [x] Gender-matched voice selection
- [x] Transcript storage in sessions
- [x] Speaking indicators
- [x] Beautiful UI with gradients and animations
- [x] Error handling
- [x] Call state management

### 🔜 Future Enhancements
- [ ] More sophisticated voice selection (age, accent, language)
- [ ] Call recording download
- [ ] Sentiment analysis during calls
- [ ] Multi-language support
- [ ] Voice visualization (waveforms)
- [ ] Call history dashboard

## Testing

### Test the Full Flow
1. Start backend: `cd server && npm run dev`
2. Start frontend: `npm run dev`
3. Navigate to a simulation session
4. Click on any node on the globe
5. Click "Call Persona" button
6. Allow microphone access when prompted
7. Speak to the persona - they will respond!
8. Use mute/unmute controls
9. Click "End Call" when done
10. Check session feedback for saved transcript

## Troubleshooting

### "Voice service not configured"
- Make sure `VAPI_API_KEY` is set in `server/.env`
- Restart the backend server

### No microphone access
- Must use `https://` or `localhost` (secure context required)
- Grant microphone permissions in browser

### Call not connecting
- Check browser console for errors
- Verify Vapi API key is valid
- Check network tab for failed requests

## Architecture

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │ 1. Request assistant creation
       ▼
┌─────────────┐
│   Backend   │
│  Express    │
└──────┬──────┘
       │ 2. Create assistant
       ▼
┌─────────────┐
│  Vapi API   │
│  (Server)   │
└──────┬──────┘
       │ 3. Return assistant ID
       │
       ▼
┌─────────────┐
│   Browser   │ 4. Start WebRTC call
│ Vapi Web SDK│    using assistant ID
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Vapi + GPT  │ 5. Real-time voice
│  + PlayHT   │    conversation
└─────────────┘
```

## Code Locations

- **Backend Voice Routes**: `server/src/routes/voice.ts`
- **Frontend Vapi Service**: `src/services/vapiService.ts`
- **UI Integration**: `src/pages/Simulation.tsx` (lines 442-562, 1260-1335)
- **Voice SDK**: `@vapi-ai/web` and `@vapi-ai/server-sdk`

## Success! 🎉

You now have fully functional AI voice conversations! Users can click any persona and have natural, phone-like conversations about their product ideas.

