import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ShieldAlert, Bot, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const GITHUB_TOKEN = "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";

export default function EmergencyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello. I am the E-Suraksha Emergency Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemMessage: ChatMessage = {
        role: 'system',
        content: `You are an emergency AI assistant for E-Suraksha Campus Safety. 
Keep your answers brief, helpful, and calm. 
If someone is in immediate physical danger, tell them to use the SOS button on the app right away.
Focus on safety and prompt response. Avoid being overly talkative.`
      };

      // Ensure we only keep the last 10 messages to limit token usage
      const conversationHistory = messages.slice(-10);

      const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GITHUB_TOKEN}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [systemMessage, ...conversationHistory, userMessage],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now. If this is a real emergency, please tap the SOS button immediately.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 transition-all z-50 transform hover:scale-105"
          aria-label="Open Emergency Chat"
        >
          <ShieldAlert className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 flex justify-between items-center shadow-md z-10">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-semibold">Emergency Bot</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-red-200 transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-zinc-800 text-foreground rounded-bl-sm border border-border shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl rounded-bl-sm border border-border shadow-sm">
                  <div className="flex space-x-1 items-center h-4">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-border z-10">
            <form onSubmit={handleSend} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={isLoading}
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-foreground placeholder:text-muted-foreground rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 transition-colors flex flex-shrink-0 items-center justify-center"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
