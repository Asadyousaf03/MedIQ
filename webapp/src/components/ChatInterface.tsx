'use client';

import { useState, FormEvent, useRef, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Paperclip, Send, X, FileText, Stethoscope, User, Loader2 } from 'lucide-react';
import { bookAppointment } from '@/app/actions';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  file?: {
    name: string;
    type: string;
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    setSessionId(uuidv4());
    setMessages([
      {
        id: 'intro',
        role: 'assistant',
        text: "Hello, I'm MediBot, your AI healthcare assistant. I can help you understand your symptoms, explain lab reports or medical documents, and find the right doctor to see next. You can also attach a lab report or document for me to review.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF or image file (JPG, PNG, WebP)');
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    const messageText = selectedFile
      ? `${input.trim() || 'Please analyze this document'}\n\nAttached: ${selectedFile.name}`
      : input.trim();

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      text: messageText,
      timestamp: new Date(),
      file: selectedFile ? { name: selectedFile.name, type: selectedFile.type } : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    const currentFile = selectedFile;
    setInput('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsLoading(true);

    try {
      let response;

      if (currentFile) {
        const formData = new FormData();
        formData.append('sessionId', sessionId);
        formData.append('message', currentInput || 'Please analyze this document');
        formData.append('file', currentFile);

        response = await fetch(`${API_BASE}/chat/upload`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: currentInput,
          }),
        });
      }

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        text: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        text: `I couldn't reach the MedIQ backend. Make sure the API server is running and reachable at ${API_BASE}, then try again.`,
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
      hour12: true,
    });
  };

  const handleBookAppointment = async (doctorId: number, doctorName: string) => {
    if (!window.confirm(`Do you want to book an appointment with ${doctorName} for tomorrow at 10 AM?`)) return;

    try {
      const result = await bookAppointment(doctorId, 'Referral from AI Chat');
      if (result.success) {
        setMessages((prev) => [...prev, {
          id: uuidv4(),
          role: 'system',
          text: result.message,
          timestamp: new Date(),
        }]);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to book appointment.');
    }
  };

  const quickActions = [
    { label: 'Check symptoms', prompt: 'I want to describe my symptoms' },
    { label: 'Explain lab results', prompt: 'Can you help me understand my lab results?' },
    { label: 'Find a doctor', prompt: 'I need to find a specialist doctor' },
    { label: 'Mental health support', prompt: 'I need help with my mental health' },
  ];

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-slate-500 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-sm">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">MediBot</h1>
                <p className="text-xs text-slate-500">AI Healthcare Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/patient" className="hidden text-sm font-medium text-slate-500 hover:text-[var(--primary)] sm:inline-block">
                Patient Portal
              </Link>
              <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg) => {
            if (msg.role === 'system') {
              return (
                <div key={msg.id} className="my-2 flex animate-fade-in justify-center">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const parts: React.ReactNode[] = [];
            const regex = /\[BOOK_APPOINTMENT:(.*?)\]/g;
            let lastIndex = 0;
            let match;
            const text = msg.text || '';

            while ((match = regex.exec(text)) !== null) {
              if (match.index > lastIndex) {
                parts.push(<span key={lastIndex}>{text.substring(lastIndex, match.index)}</span>);
              }
              try {
                const data = JSON.parse(match[1]);
                parts.push(
                  <button
                    key={match.index}
                    onClick={() => handleBookAppointment(data.id, data.name)}
                    className="mt-2 block w-full rounded-lg border border-[var(--primary)]/30 bg-teal-50 px-4 py-2 text-center text-sm font-medium text-[var(--primary-hover)] transition hover:bg-teal-100"
                  >
                    Book appointment with {data.name}
                  </button>,
                );
              } catch (e) {
                console.error(e);
              }
              lastIndex = regex.lastIndex;
            }
            if (lastIndex < text.length) {
              parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
            }

            return (
              <div
                key={msg.id}
                className={`flex animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] items-start gap-3 sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-700 text-white'
                      : 'bg-[var(--primary)] text-white'
                  }`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                  </div>

                  <div className="flex flex-col space-y-1">
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === 'user'
                        ? 'rounded-tr-sm bg-[var(--primary)] text-white'
                        : 'rounded-tl-sm border border-[var(--border)] bg-white text-slate-800'
                    }`}>
                      {msg.file && (
                        <div className={`mb-2 flex items-center gap-2 border-b pb-2 ${msg.role === 'user' ? 'border-white/25' : 'border-slate-200'}`}>
                          <FileText className="h-4 w-4 opacity-80" />
                          <span className="text-sm opacity-80">{msg.file.name}</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
                        {parts.length > 0 ? parts : text}
                      </div>
                    </div>
                    <span className={`px-2 text-xs text-slate-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex animate-fade-in justify-start">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-sm">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-[var(--border)] bg-white px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary)]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary)]" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--primary)]" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-slate-500">Analyzing…</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          {/* Quick Actions */}
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setInput(action.prompt)}
                disabled={isLoading}
                className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-slate-600 transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* File Preview */}
          {selectedFile && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-[var(--border)] bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-[var(--primary)]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-slate-500 transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Describe your symptoms or ask a question…"
                rows={1}
                disabled={isLoading}
                className="input-field resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !selectedFile)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-sm transition-all hover:bg-[var(--primary-hover)] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-slate-400">
            Press Enter to send · Shift+Enter for new line · Attach lab reports or images
          </p>
        </div>
      </footer>
    </div>
  );
}
