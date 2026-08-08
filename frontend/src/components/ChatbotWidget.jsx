import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { MessageSquare, X, Send, Bot, Sparkles, User, Loader2, Minimize2 } from 'lucide-react';

export default function ChatbotWidget({ applicantData }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! I am your **CredAI Loan Advisor** 🤖. Ask me anything like:\n\n• Why was I decisioned?\n• How can I improve my risk score?\n• Which loan product suits me best?\n• Can I get another loan?`,
      suggestions: [
        "Why was my application flagged?",
        "How can I improve my score?",
        "Which loan suits my profile?",
        "Can I get another loan?"
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.sendAdvisorChat(text, applicantData);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: res.reply,
        suggestions: res.suggestions
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sorry, I ran into an issue connecting to the AI Loan Advisor service. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Open AI Loan Advisor"
        >
          <Bot size={28} />
        </button>
      ) : (
        <div
          className="card-glass"
          style={{
            width: 380,
            height: 520,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(99,102,241,0.2)',
            padding: 0,
            overflow: 'hidden',
            animation: 'fadeUp 0.3s ease forwards',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                  AI Loan Advisor
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-green-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="glow-dot glow-dot-green" style={{ width: 6, height: 6 }} /> Instant Credit Assistant
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: m.sender === 'user' ? 'var(--primary)' : 'var(--glass)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border)',
                  color: m.sender === 'user' ? 'white' : 'var(--text-primary)',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                }}>
                  {m.text}
                </div>

                {/* Chips */}
                {m.suggestions && i === messages.length - 1 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {m.suggestions.map((chip, cIdx) => (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => handleSend(chip)}
                        style={{
                          background: 'rgba(99,102,241,0.1)',
                          border: '1px solid rgba(99,102,241,0.25)',
                          borderRadius: 'var(--radius-full)',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          color: 'var(--primary-light)',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        💡 {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                AI Advisor thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div style={{
            padding: 12,
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            display: 'flex',
            gap: 8,
          }}>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              placeholder="Ask AI Advisor..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{ padding: '8px 14px' }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
