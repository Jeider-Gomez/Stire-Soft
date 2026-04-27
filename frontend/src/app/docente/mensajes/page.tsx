'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { messageApi } from '@/lib/api';

export default function MensajesDocente() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    loadMessages();
  }, [tab]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = tab === 'inbox' ? await messageApi.getInbox() : await messageApi.getSent();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId || !content) return;
    setSending(true);
    try {
      await messageApi.send(parseInt(receiverId), content);
      setContent('');
      setShowCompose(false);
      await loadMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const openConversation = async (otherUserId: number) => {
    try {
      const conv = await messageApi.getConversation(otherUserId);
      setSelectedConversation(conv);
      setSelectedUserId(otherUserId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>💬 Mensajes</h1>
        <p>Comunicación con tus estudiantes</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button className={`btn ${tab === 'inbox' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setTab('inbox'); setSelectedUserId(null); }}>📥 Recibidos</button>
        <button className={`btn ${tab === 'sent' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setTab('sent'); setSelectedUserId(null); }}>📤 Enviados</button>
        <button className="btn btn-success" onClick={() => setShowCompose(true)}>✏️ Nuevo Mensaje</button>
      </div>

      {showCompose && (
        <div className="modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Nuevo Mensaje</h3>
              <button className="modal-close" onClick={() => setShowCompose(false)}>×</button>
            </div>
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label className="form-label">ID del Destinatario</label>
                <input className="form-input" type="number" placeholder="ID del estudiante" value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mensaje</label>
                <textarea className="form-input form-textarea" placeholder="Escribe tu mensaje..."
                  value={content} onChange={(e) => setContent(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedUserId && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <span className="card-title">Conversación</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUserId(null)}>← Volver</button>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0' }}>
            {selectedConversation.map((msg: any) => (
              <div key={msg.id} className={`chat-message ${msg.senderId === user?.id ? 'user' : 'tutor'}`}>
                <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem', opacity: 0.7 }}>
                  {msg.sender?.fullName} • {new Date(msg.createdAt).toLocaleString('es-CO')}
                </div>
                {msg.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedUserId && (
        loading ? (
          <div className="loading-container"><div className="loading-spinner" /></div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Sin mensajes</h3>
            <p>No tienes mensajes {tab === 'inbox' ? 'recibidos' : 'enviados'} aún.</p>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((msg: any) => {
              const otherUser = tab === 'inbox' ? msg.sender : msg.receiver;
              const initials = (otherUser?.fullName || '??')
                .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div key={msg.id} className={`message-item ${!msg.isRead && tab === 'inbox' ? 'unread' : ''}`}
                  onClick={() => openConversation(otherUser?.id)}>
                  <div className="message-avatar">{initials}</div>
                  <div className="message-content">
                    <div className="message-sender">{otherUser?.fullName}</div>
                    <div className="message-preview">{msg.content}</div>
                  </div>
                  <div className="message-time">{new Date(msg.createdAt).toLocaleDateString('es-CO')}</div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
