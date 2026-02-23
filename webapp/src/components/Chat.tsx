// 'use client';

// import { useState, FormEvent, useRef, useEffect } from 'react';
// import { v4 as uuidv4 } from 'uuid';

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   text: string;
//   timestamp: Date;
// }

// export default function Chat() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [sessionId, setSessionId] = useState('');
//   const [isClient, setIsClient] = useState(false);

//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   // 1. Initialize Client and Session
//   useEffect(() => {
//     setIsClient(true);
//     setSessionId(uuidv4());
//     setMessages([
//       {
//         id: 'intro',
//         role: 'assistant',
//         text: "👋 Hello! I'm MediBot, your AI healthcare assistant. I'm here to help you understand symptoms, explain medical documents, and find healthcare providers. What can I assist you with today?",
//         timestamp: new Date(),
//       },
//     ]);
//   }, []);

//   // 2. Auto-scroll to bottom
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     const currentInput = input.trim();
//     if (!currentInput || isLoading) return;

//     const userMessage: Message = { 
//       id: uuidv4(), 
//       role: 'user', 
//       text: currentInput, 
//       timestamp: new Date() 
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       const response = await fetch('http://localhost:3001/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sessionId,
//           message: currentInput, // Use currentInput instead of state 'input' which is now cleared
//           agentName: 'routingAgent' // Added based on your previous server logic requirements
//         }),
//       });

//       if (!response.ok) throw new Error('Network response was not ok');

//       const data = await response.json();
      
//       const assistantMessage: Message = {
//         id: uuidv4(),
//         role: 'assistant',
//         text: data.response,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, assistantMessage]);
//     } catch (error) {
//       console.error('Error fetching chat response:', error);
//       const errorMessage: Message = {
//         id: uuidv4(),
//         role: 'assistant',
//         text: '❌ I apologize, but I\'m experiencing connection issues. Please check your connection and try again.',
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString('en-US', { 
//       hour: '2-digit', 
//       minute: '2-digit',
//       hour12: true 
//     });
//   };

//   const quickActions = [
//     { label: '🩺 Check symptoms', prompt: 'I want to check my symptoms' },
//     { label: '📋 Explain lab results', prompt: 'Can you help me explain some lab results?' },
//     { label: '👨‍⚕️ Find a doctor', prompt: 'I need to find a specialist doctor' },
//   ];

//   if (!isClient) return null;

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
//         .scrollbar-thin::-webkit-scrollbar { width: 6px; }
//         .scrollbar-thumb-purple-500::-webkit-scrollbar-thumb { background-color: #a855f7; border-radius: 10px; }
//       `}</style>

//       {/* Header */}
//       <header className="bg-slate-900/50 backdrop-blur-md border-b border-white/10 p-4">
//         <div className="max-w-4xl mx-auto flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
//               <span className="text-xl">🩺</span>
//             </div>
//             <h1 className="text-xl font-bold text-white tracking-tight">MediBot <span className="text-purple-400 text-xs font-normal">v1.1</span></h1>
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//             <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">System Active</span>
//           </div>
//         </div>
//       </header>

//       {/* Messages */}
//       <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 px-4 py-6">
//         <div className="max-w-4xl mx-auto space-y-6">
//           {messages.map((msg) => (
//             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
//               <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
//                 msg.role === 'user' 
//                 ? 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-900/20' 
//                 : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
//               }`}>
//                 <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
//                 <p className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
//                   {formatTime(msg.timestamp)}
//                 </p>
//               </div>
//             </div>
//           ))}
//           {isLoading && (
//             <div className="flex justify-start">
//               <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-white/5 flex items-center space-x-2">
//                 <div className="flex space-x-1">
//                   <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
//                   <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
//                   <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
//                 </div>
//               </div>
//             </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>
//       </main>

//       {/* Footer / Input */}
//       <footer className="p-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/5">
//         <div className="max-w-4xl mx-auto space-y-4">
//           <div className="flex flex-wrap gap-2 justify-center">
//              {quickActions.map((action) => (
//                <button 
//                  key={action.label}
//                  onClick={() => setInput(action.prompt)}
//                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-white/5 transition-colors"
//                >
//                  {action.label}
//                </button>
//              ))}
//           </div>
          
//           <form onSubmit={handleSubmit} className="relative flex items-center">
//             <textarea
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit(e))}
//               placeholder="Ask me anything..."
//               className="w-full bg-slate-800 text-white text-sm rounded-xl px-4 py-3 pr-12 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all resize-none min-h-[48px] max-h-32"
//               rows={1}
//             />
//             <button 
//               type="submit"
//               disabled={isLoading || !input.trim()}
//               className="absolute right-2 p-2 text-purple-400 hover:text-purple-300 disabled:text-slate-600 transition-colors"
//             >
//               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
//             </button>
//           </form>
//         </div>
//       </footer>
//     </div>
//   );
// }