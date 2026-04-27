'use client';

import { useState, useRef, useEffect } from 'react';
import { tutorApi } from '@/lib/api';

interface ChatMsg {
  role: 'user' | 'tutor';
  content: string;
  timestamp: Date;
}

export default function TutorChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'tutor',
      content: '¡Hola! 👋 Soy tu tutor STIRE de Fundamentos de Algoritmia. Puedo ayudarte con:\n\n• **Explicar conceptos** como variables, IF, FOR, funciones\n• **Recomendar** qué estudiar basándome en tu progreso\n• **Resolver dudas** de algoritmia\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Agregar mensaje del usuario
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, timestamp: new Date() },
    ]);

    setIsLoading(true);

    try {
      const response = await tutorApi.chat(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: 'tutor',
          content: response.response,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'tutor',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Intenta de nuevo. 😕',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    // Handle code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^\w+\n/, '');
        return (
          <pre key={i}>
            <code>{code}</code>
          </pre>
        );
      }
      // Handle inline markdown
      return (
        <span key={i} dangerouslySetInnerHTML={{
          __html: part
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br/>')
        }} />
      );
    });
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>🤖 Tutor Inteligente</h1>
        <p>Tu asistente personal de Fundamentos de Algoritmia</p>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-avatar">🧠</div>
          <div className="chat-header-info">
            <h3>STIRE Tutor</h3>
            <p>IA · Fundamentos de Algoritmia</p>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              {renderContent(msg.content)}
            </div>
          ))}

          {isLoading && (
            <div className="chat-message tutor">
              <div className="chat-typing">
                <div className="chat-typing-dot" />
                <div className="chat-typing-dot" />
                <div className="chat-typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Escribe tu pregunta... (Enter para enviar)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
