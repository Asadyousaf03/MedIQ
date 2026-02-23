'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSessionId(uuidv4());
    setMessages([
      {
        id: 'intro',
        role: 'assistant',
        text: "👋 Hello! I'm MediBot, your AI healthcare assistant. I'm here to help you understand symptoms, explain medical documents, and find healthcare providers. What can I assist you with today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      id: uuidv4(), 
      role: 'user', 
      text: input, 
      timestamp: new Date() 
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        text: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        text: '❌ I apologize, but I\'m experiencing connection issues. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const quickActions = [
    { label: '🩺 Check symptoms', color: 'from-blue-400 to-blue-600' },
    { label: '📋 Explain lab results', color: 'from-purple-400 to-purple-600' },
    { label: '👨‍⚕️ Find a doctor', color: 'from-green-400 to-green-600' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-thumb-purple-500::-webkit-scrollbar-thumb {
          background-color: #a855f7;
          border-radius: 4px;
        }

        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }

        .group-hover\:opacity-100:hover {
          opacity: 1;
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl border-b-4 border-purple-400 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-300 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">
                  MediBot
                </h1>
                <p className="text-blue-100 font-semibold text-sm">Your Personal AI Healthcare Assistant</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-sm font-medium">
                ✨ Always Learning
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`flex items-start gap-4 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transform transition-transform hover:scale-110 ${msg.role === 'user' ? 'bg-gradient-to-br from-amber-400 to-orange-600' : 'bg-gradient-to-br from-cyan-400 to-blue-600'}`}>
                    {msg.role === 'assistant' ? '🤖' : '👤'}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className="flex flex-col space-y-2">
                    <div className={`px-5 py-4 rounded-3xl shadow-xl backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md border-blue-400/50 ml-2'
                        : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 rounded-bl-md border-purple-400/30 mr-2'
                    }`}>
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                    </div>
                    <span className={`text-xs font-semibold text-slate-400 px-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex items-start gap-4 max-w-xs">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                    🤖
                  </div>
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-purple-400/30 px-5 py-4 rounded-3xl rounded-bl-md shadow-xl">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-sm font-semibold text-cyan-300">Analyzing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-900/90 border-t-2 border-purple-500/30 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 min-w-0 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Describe your symptoms, upload a report, or ask for doctor recommendations..."
                  rows={1}
                  className="relative w-full px-5 py-4 bg-slate-800 border-2 border-slate-700 rounded-2xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-slate-500 text-white font-medium hover:border-purple-500/50"
                  style={{
                    minHeight: '50px',
                    maxHeight: '140px',
                    overflowY: 'auto',
                  }}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 text-white rounded-2xl hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 disabled:from-slate-600 disabled:via-slate-600 disabled:to-slate-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-xl hover:shadow-2xl transform hover:scale-110 disabled:transform-none disabled:shadow-md flex items-center justify-center active:scale-95"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setInput(action.label.split(' ').slice(1).join(' '))}
                  className={`px-4 py-2.5 text-sm font-bold bg-gradient-to-r ${action.color} hover:shadow-lg text-white rounded-full border-2 border-white/20 transition-all duration-300 transform hover:scale-105 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                  disabled={isLoading}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}
