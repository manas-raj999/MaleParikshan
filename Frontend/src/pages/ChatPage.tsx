import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatService } from '../services/chatService'
import type { ChatMessage } from '../types'
import { useAuth } from '../context/AuthContext'

const QUICK_CHIPS = [
  { label: 'I am angry 😤', value: 'I am feeling angry, help me calm down' },
  { label: 'I want to talk 😊', value: 'I want to have a conversation' },
  { label: 'Is it safe to share personal info?', value: 'Is it safe to share personal information online?' },
  { label: 'How to be happy 😊', value: 'How can I be happier in daily life?' },
]

const QUICK_CATEGORIES = [
  { icon: '💔', title: 'Emotional Support', desc: 'Talk about feelings', color: '#ff4d6a', bg: '#ff4d6a22' },
  { icon: '❤️', title: 'Health & Sexual', desc: '100% Anonymous', color: '#ff7b2e', bg: '#ff7b2e22', highlight: true },
  { icon: '💡', title: 'Self Improvement', desc: 'Tips & Guidance', color: '#ffb830', bg: '#ffb83022' },
]

export default function ChatPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const [adultMode, setAdultMode] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    setChatStarted(true)
    const userMsg: ChatMessage = {
      id: Date.now().toString(), role: 'user', content: text, createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await chatService.send(text)
      setMessages(prev => [...prev, {
        id: res.id || (Date.now() + 1).toString(),
        role: 'assistant', content: res.message, createdAt: new Date().toISOString()
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: "I'm here to help. Could you tell me more about what's on your mind?",
        createdAt: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto', width: '100%', padding: '1.25rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => navigate(-1)} style={{
              width: 36, height: 36, borderRadius: '0.6rem',
              background: '#1e2340', border: '1px solid #252a4a',
              color: 'white', cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>←</button>
            <div>
              <p style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 700 }}>AI Page</p>
              <p style={{ fontFamily: 'Nunito', fontSize: '0.75rem', color: '#5a6190' }}>(Changes A/C to Mode)</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Mode toggle: calm / hot */}
            {user && user.age >= 18 && (
              <div style={{
                display: 'flex', alignItems: 'center',
                background: '#1e2340', border: '1px solid #252a4a',
                borderRadius: 999, padding: '3px',
                gap: '2px'
              }}>
                <button onClick={() => setAdultMode(false)} style={{
                  width: 30, height: 30, borderRadius: 999,
                  background: !adultMode ? 'linear-gradient(135deg,#4d7cff,#00d4ff)' : 'transparent',
                  border: 'none', cursor: 'pointer', fontSize: '0.9rem',
                  boxShadow: !adultMode ? '0 0 8px rgba(77,124,255,0.4)' : 'none'
                }}>☀️</button>
                <button onClick={() => setAdultMode(true)} style={{
                  width: 30, height: 30, borderRadius: 999,
                  background: adultMode ? 'linear-gradient(135deg,#ff7b2e,#ffb830)' : 'transparent',
                  border: 'none', cursor: 'pointer', fontSize: '0.9rem',
                  boxShadow: adultMode ? '0 0 8px rgba(255,123,46,0.4)' : 'none'
                }}>🔥</button>
              </div>
            )}
            <button style={{
              width: 36, height: 36, borderRadius: '0.6rem',
              background: '#1e2340', border: '1px solid #252a4a',
              color: '#5a6190', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>⚙</button>
          </div>
        </div>

        {/* Chat area or prompt screen */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!chatStarted ? (
            <>
              {/* What can I help with card */}
              <div className="card" style={{ marginBottom: '1rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: 'linear-gradient(90deg,#4d7cff,#00d4ff,transparent)'
                }} />
                <p style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>
                  What can I help with?
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'radial-gradient(circle, #4d7cff22, #00d4ff11)',
                    border: '1px solid #4d7cff33',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', animation: 'float 3s ease-in-out infinite'
                  }}>
                    {adultMode ? '😈' : '😊'}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {QUICK_CHIPS.map(chip => (
                    <button key={chip.value} onClick={() => sendMessage(chip.value)}
                      className="chip" style={{ textAlign: 'left' }}>
                      {chip.label}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem' }}>🔒</span>
                  <span style={{ fontFamily: 'Nunito', fontSize: '0.75rem' }}>
                    Your <span style={{ color: '#4ade80', fontWeight: 700 }}>privacy is safe</span> with us
                  </span>
                </div>
              </div>

              {/* Privacy banner */}
              <div style={{
                background: 'linear-gradient(135deg,#ffb83011,#ff7b2e11)',
                border: '1px solid #ffb83022',
                borderRadius: '1rem', padding: '0.85rem 1rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🔒</span>
                <div>
                  <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
                    AI <em>doesn't</em> save your personal data.
                  </p>
                  <p style={{ fontFamily: 'Nunito', fontSize: '0.75rem', color: '#5a6190' }}>
                    Everything is <strong style={{ color: '#ffb830' }}>private & secure</strong> 🔒
                  </p>
                </div>
              </div>

              {/* Quick Help Categories */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>⊞</span>
                  <p style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 700 }}>Quick Help Categories</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
                  {QUICK_CATEGORIES.map(cat => (
                    <div key={cat.title}
                      onClick={() => sendMessage(`I need help with ${cat.title.toLowerCase()}`)}
                      style={{
                        background: cat.bg, border: `1px solid ${cat.color}33`,
                        borderRadius: '1rem', padding: '0.85rem 0.6rem',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', gap: '0.4rem'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                      <p style={{ fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{cat.title}</p>
                      <p style={{
                        fontFamily: 'Nunito', fontSize: '0.7rem',
                        color: cat.highlight ? '#4ade80' : '#5a6190',
                        fontWeight: cat.highlight ? 700 : 400
                      }}>{cat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Chat messages */
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.3s ease forwards'
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: 32, height: 32, borderRadius: '0.6rem',
                      background: 'linear-gradient(135deg,#4d7cff22,#00d4ff22)',
                      border: '1px solid #4d7cff33',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem', marginRight: '0.5rem', flexShrink: 0, marginTop: 4
                    }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: '72%',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg,#4d7cff,#00d4ff)'
                      : '#1c2038',
                    border: msg.role === 'user' ? 'none' : '1px solid #252a4a',
                    borderRadius: msg.role === 'user' ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                    padding: '0.65rem 0.85rem',
                    fontFamily: 'Nunito', fontSize: '0.85rem', lineHeight: 1.5, color: 'white'
                  }}>
                    {msg.content}
                    <p style={{ fontSize: '0.65rem', color: msg.role === 'user' ? 'rgba(255,255,255,0.5)' : '#5a6190', marginTop: '0.3rem' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '0.6rem',
                    background: '#4d7cff22', border: '1px solid #4d7cff33',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
                  }}>🤖</div>
                  <div style={{ background: '#1c2038', border: '1px solid #252a4a', borderRadius: '1rem', padding: '0.65rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: 16 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width: 6, height: 6, borderRadius: '50%', background: '#5a6190',
                          animation: 'pulse 1.4s ease-in-out infinite',
                          animationDelay: `${i * 0.2}s`
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{
          background: '#161929', border: '1px solid #252a4a',
          borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 0.4rem 0.4rem 1rem',
          boxShadow: '0 0 20px rgba(77,124,255,0.1)',
          marginBottom: '0.5rem'
        }}>
          {chatStarted && (
            <span style={{ fontSize: '1rem', cursor: 'pointer' }}>🤖</span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Ask anything..."
            disabled={loading}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: 'Nunito', fontSize: '0.9rem', color: 'white',
              padding: '0.4rem 0'
            }}
          />
          <button style={{
            width: 36, height: 36, borderRadius: '0.6rem',
            background: 'transparent', border: 'none',
            color: '#5a6190', cursor: 'pointer', fontSize: '1.1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.2s'
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#4d7cff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#5a6190')}
          >🎤</button>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={{
              background: 'linear-gradient(135deg,#4d7cff,#00d4ff)',
              border: 'none', borderRadius: '0.75rem',
              padding: '0.5rem 1.25rem',
              fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.85rem', color: 'white',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              opacity: input.trim() ? 1 : 0.4,
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              boxShadow: '0 2px 10px rgba(77,124,255,0.3)'
            }}
          >
            🤖 Ask AI
          </button>
        </div>
      </div>
    </div>
  )
}
