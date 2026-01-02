/**
 * AI Chat - 世界最高峰のUIデザイン
 * グラスモーフィズム、美しいグラデーション、スムーズなアニメーション
 */
'use client';

import { useState, useRef, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMessage }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const data = await res.json();
      if (!sessionId) setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    if (sessionId) {
      await fetch(`${API_URL}/api/chat/${sessionId}`, { method: 'DELETE' });
    }
    setMessages([]);
    setSessionId(null);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <div style={{ ...styles.wrapper, background: theme.background }}>
      {/* 背景のグラデーションオーブ */}
      <div style={{ ...styles.orb, ...styles.orb1, background: theme.orb1 }} />
      <div style={{ ...styles.orb, ...styles.orb2, background: theme.orb2 }} />
      <div style={{ ...styles.orb, ...styles.orb3, background: theme.orb3 }} />

      <div style={{ ...styles.container, background: theme.glass, borderColor: theme.border }}>
        {/* ヘッダー */}
        <header style={{ ...styles.header, borderColor: theme.border }}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke={theme.accent} strokeWidth="2"/>
                <circle cx="16" cy="16" r="6" fill={theme.accent}/>
              </svg>
            </div>
            <div>
              <h1 style={{ ...styles.title, color: theme.text }}>AI Assistant</h1>
              <p style={{ ...styles.subtitle, color: theme.textSecondary }}>Powered by Claude</p>
            </div>
          </div>

          <div style={styles.headerRight}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{ ...styles.iconButton, background: theme.buttonBg }}
              title={darkMode ? 'ライトモード' : 'ダークモード'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <a href="/" style={{ ...styles.navLink, background: theme.buttonBg, color: theme.text }}>
              Todo App
            </a>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ ...styles.primaryButton, background: theme.accentGradient }}
            >
              {showForm ? '← 戻る' : 'お問い合わせ'}
            </button>
            {messages.length > 0 && (
              <button
                onClick={clearSession}
                style={{ ...styles.ghostButton, color: theme.textSecondary, borderColor: theme.border }}
              >
                リセット
              </button>
            )}
          </div>
        </header>

        {showForm ? (
          <ContactForm
            sessionId={sessionId}
            onClose={() => setShowForm(false)}
            theme={theme}
          />
        ) : (
          <>
            {/* メッセージエリア */}
            <div style={{ ...styles.messageArea, background: theme.messageBg }}>
              {messages.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{ ...styles.emptyIcon, background: theme.accentGradient }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="white" strokeWidth="2" fill="none"/>
                      <circle cx="24" cy="24" r="8" fill="white"/>
                    </svg>
                  </div>
                  <h2 style={{ ...styles.emptyTitle, color: theme.text }}>
                    AIアシスタントへようこそ
                  </h2>
                  <p style={{ ...styles.emptyText, color: theme.textSecondary }}>
                    何でも質問してください。<br/>
                    日本語で丁寧にお答えします。
                  </p>
                  <div style={styles.suggestions}>
                    {['今日の天気は？', 'プログラミングを教えて', 'ビジネスの相談'].map((text, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(text)}
                        style={{ ...styles.suggestionChip, background: theme.chipBg, color: theme.text, borderColor: theme.border }}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={styles.messageList}>
                  {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} theme={theme} />
                  ))}
                  {loading && (
                    <div style={{ ...styles.message, ...styles.assistantMessage }}>
                      <div style={{ ...styles.avatar, background: theme.accentGradient }}>AI</div>
                      <div style={{ ...styles.bubble, ...styles.assistantBubble, background: theme.assistantBg }}>
                        <div style={styles.typing}>
                          <span style={{ ...styles.dot, animationDelay: '0ms' }} />
                          <span style={{ ...styles.dot, animationDelay: '150ms' }} />
                          <span style={{ ...styles.dot, animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* 入力エリア */}
            <form onSubmit={sendMessage} style={{ ...styles.inputArea, background: theme.glass, borderColor: theme.border }}>
              <div style={{ ...styles.inputWrapper, background: theme.inputBg, borderColor: theme.border }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="メッセージを入力..."
                  style={{ ...styles.input, color: theme.text }}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  style={{
                    ...styles.sendButton,
                    background: input.trim() ? theme.accentGradient : theme.disabledBg,
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18 10L4 2V8L10 10L4 12V18L18 10Z" fill="white"/>
                  </svg>
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function MessageBubble({ message, theme }) {
  const isUser = message.role === 'user';

  return (
    <div style={{
      ...styles.message,
      ...(isUser ? styles.userMessage : styles.assistantMessage),
      animation: 'fadeIn 0.3s ease-out',
    }}>
      {!isUser && (
        <div style={{ ...styles.avatar, background: theme.accentGradient }}>AI</div>
      )}
      <div style={{
        ...styles.bubble,
        ...(isUser ? styles.userBubble : styles.assistantBubble),
        background: isUser ? theme.userBubble : theme.assistantBg,
        color: isUser ? 'white' : theme.text,
      }}>
        {message.content}
      </div>
      {isUser && (
        <div style={{ ...styles.avatar, ...styles.userAvatar, background: theme.userBubble }}>You</div>
      )}
    </div>
  );
}

function ContactForm({ sessionId, onClose, theme }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, sessionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '送信に失敗しました');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.formSuccess}>
        <div style={{ ...styles.successIcon, background: theme.successGradient }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M14 24L20 30L34 16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 style={{ ...styles.successTitle, color: theme.text }}>送信完了</h2>
        <p style={{ ...styles.successText, color: theme.textSecondary }}>
          お問い合わせありがとうございます。<br/>
          担当者より折り返しご連絡いたします。
        </p>
        <button onClick={onClose} style={{ ...styles.primaryButton, background: theme.accentGradient }}>
          チャットに戻る
        </button>
      </div>
    );
  }

  return (
    <div style={styles.formContainer}>
      <div style={styles.formHeader}>
        <h2 style={{ ...styles.formTitle, color: theme.text }}>お問い合わせ</h2>
        <p style={{ ...styles.formSubtitle, color: theme.textSecondary }}>
          ご質問・ご要望をお聞かせください
        </p>
      </div>

      {error && (
        <div style={{ ...styles.errorBanner, background: theme.errorBg }}>
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={{ ...styles.label, color: theme.text }}>
              お名前 <span style={{ color: theme.accent }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ ...styles.formInput, background: theme.inputBg, color: theme.text, borderColor: theme.border }}
              placeholder="山田 太郎"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={{ ...styles.label, color: theme.text }}>
              メールアドレス <span style={{ color: theme.accent }}>*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ ...styles.formInput, background: theme.inputBg, color: theme.text, borderColor: theme.border }}
              placeholder="example@email.com"
              required
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={{ ...styles.label, color: theme.text }}>電話番号</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={{ ...styles.formInput, background: theme.inputBg, color: theme.text, borderColor: theme.border }}
            placeholder="090-1234-5678"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={{ ...styles.label, color: theme.text }}>メッセージ</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            style={{ ...styles.textarea, background: theme.inputBg, color: theme.text, borderColor: theme.border }}
            placeholder="お問い合わせ内容をご記入ください..."
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitButton,
            background: loading ? theme.disabledBg : theme.accentGradient,
          }}
        >
          {loading ? '送信中...' : '送信する'}
        </button>
      </form>
    </div>
  );
}

// テーマ定義
const lightTheme = {
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)',
  glass: 'rgba(255, 255, 255, 0.85)',
  border: 'rgba(255, 255, 255, 0.5)',
  text: '#1a1a2e',
  textSecondary: '#6b7280',
  accent: '#6366f1',
  accentGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  successGradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  buttonBg: 'rgba(255, 255, 255, 0.8)',
  inputBg: 'rgba(255, 255, 255, 0.9)',
  messageBg: 'rgba(248, 250, 252, 0.5)',
  userBubble: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  assistantBg: 'rgba(255, 255, 255, 0.95)',
  chipBg: 'rgba(255, 255, 255, 0.8)',
  disabledBg: '#d1d5db',
  errorBg: '#fef2f2',
  orb1: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
  orb2: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
  orb3: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
};

const darkTheme = {
  background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
  glass: 'rgba(30, 30, 50, 0.85)',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  accent: '#818cf8',
  accentGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  successGradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  buttonBg: 'rgba(255, 255, 255, 0.1)',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  messageBg: 'rgba(0, 0, 0, 0.2)',
  userBubble: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  assistantBg: 'rgba(255, 255, 255, 0.08)',
  chipBg: 'rgba(255, 255, 255, 0.1)',
  disabledBg: '#374151',
  errorBg: 'rgba(239, 68, 68, 0.2)',
  orb1: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
  orb2: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)',
  orb3: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
};

// スタイル定義
const styles = {
  wrapper: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'float 20s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orb1: {
    width: '600px',
    height: '600px',
    top: '-200px',
    right: '-200px',
  },
  orb2: {
    width: '500px',
    height: '500px',
    bottom: '-150px',
    left: '-150px',
    animationDelay: '-5s',
  },
  orb3: {
    width: '400px',
    height: '400px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animationDelay: '-10s',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    height: 'calc(100vh - 40px)',
    borderRadius: '24px',
    backdropFilter: 'blur(20px)',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '12px',
    margin: 0,
    opacity: 0.7,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconButton: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  navLink: {
    padding: '10px 16px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    padding: '10px 20px',
    borderRadius: '12px',
    border: 'none',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  ghostButton: {
    padding: '10px 16px',
    borderRadius: '12px',
    background: 'transparent',
    border: '1px solid',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  messageArea: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  emptyState: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '12px',
    letterSpacing: '-0.02em',
  },
  emptyText: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  suggestions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  suggestionChip: {
    padding: '12px 20px',
    borderRadius: '100px',
    border: '1px solid',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  messageList: {
    height: '100%',
    overflowY: 'auto',
    padding: '24px',
  },
  message: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: 'white',
    flexShrink: 0,
  },
  userAvatar: {
    order: 1,
  },
  bubble: {
    maxWidth: '70%',
    padding: '14px 18px',
    borderRadius: '20px',
    fontSize: '15px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  userBubble: {
    borderBottomRightRadius: '6px',
  },
  assistantBubble: {
    borderBottomLeftRadius: '6px',
  },
  typing: {
    display: 'flex',
    gap: '4px',
    padding: '4px 0',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    animation: 'pulse 1s ease-in-out infinite',
  },
  inputArea: {
    padding: '20px 24px',
    borderTop: '1px solid',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    borderRadius: '16px',
    border: '1px solid',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '15px',
    border: 'none',
    background: 'transparent',
    outline: 'none',
  },
  sendButton: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  formContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '32px',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  formSubtitle: {
    fontSize: '16px',
  },
  form: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  formInput: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    border: '1px solid',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    border: '1px solid',
    borderRadius: '12px',
    outline: 'none',
    resize: 'vertical',
    minHeight: '120px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  submitButton: {
    width: '100%',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  errorBanner: {
    padding: '14px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  formSuccess: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  successText: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
};
