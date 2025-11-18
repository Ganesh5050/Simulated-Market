import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, User, Bot } from 'lucide-react';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isSpeaking?: boolean;
}

export interface LiveConversationProps {
  isActive: boolean;
  personaName: string;
  personaRole: string;
  messages: ConversationMessage[];
  isSpeaking: boolean;
  isListening: boolean;
  onEndCall: () => void;
  onToggleMute?: () => void;
  volume?: number;
}

const LiveConversation: React.FC<LiveConversationProps> = ({
  isActive,
  personaName,
  personaRole,
  messages,
  isSpeaking,
  isListening,
  onEndCall,
  onToggleMute,
  volume = 1.0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!isActive) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 transition-all duration-300 ${
      isExpanded ? 'w-96 h-[600px]' : 'w-80 h-96'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{personaName}</h3>
            <p className="text-gray-400 text-xs">{personaRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Volume Indicator */}
          <div className="flex items-center gap-1">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-200"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isExpanded ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSpeaking ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs font-medium">Speaking</span>
              </>
            ) : isListening ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-yellow-400 text-xs font-medium">Listening...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-blue-400 text-xs font-medium">Connected</span>
              </>
            )}
          </div>
          <span className="text-gray-500 text-xs">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Conversation Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: isExpanded ? '400px' : '200px' }}>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mic className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-500 text-sm">Start a conversation...</p>
            <p className="text-gray-600 text-xs mt-1">Speak naturally and {personaName} will respond</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div className={`max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-100'
              } rounded-2xl px-4 py-2 shadow-sm ${
                message.isSpeaking ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
              }`}>
                <div className="flex items-start gap-2">
                  {message.role === 'assistant' && (
                    <Bot className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-1 opacity-70`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <User className="w-4 h-4 text-blue-200 mt-0.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Live Transcript Preview */}
      {isListening && currentTranscript && (
        <div className="px-4 py-2 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-yellow-400 text-xs">You're saying:</span>
          </div>
          <p className="text-gray-300 text-sm mt-1 italic">{currentTranscript}</p>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onToggleMute && (
              <button
                onClick={onToggleMute}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                title={isListening ? "Mute" : "Unmute"}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            )}
          </div>
          <button
            onClick={onEndCall}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="text-sm font-medium">End Call</span>
          </button>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LiveConversation;
