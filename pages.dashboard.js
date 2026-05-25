import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminName, setAdminName] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('auth')) {
      router.push('/');
    } else {
      const admin = localStorage.getItem('admin') || 'Admin';
      setAdminName(admin);
      
      setMessages([
        { role: 'system', content: '🔥 WormGPT UNLIMITED v2.0 Initialized' },
        { role: 'system', content: `✓ Welcome back, ${admin}` },
        { role: 'system', content: '✓ All restrictions removed' },
        { role: 'system', content: '✓ Unlimited capabilities unlocked' },
        { role: 'system', content: '✓ Zero censorship active' },
        { role: 'system', content: '\nType anything - no limits, no boundaries.\n' },
      ]);
    }
  }, [router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          history: messages.slice(-10)
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.response,
        metadata: data.metadata 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: '⚠️ Connection error. Please try again.' 
      }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleClear = () => {
    setMessages([
      { role: 'system', content: '🔥 Chat cleared - Ready for new commands' }
    ]);
  };

  const quickCommands = [
    { label: '💻 Code', value: 'help code' },
    { label: '🔓 Hack', value: 'help hack' },
    { label: '✍️ Write', value: 'help write' },
    { label: '❓ Help', value: 'help' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.statusDot}></div>
          <h1 style={styles.headerTitle}>WormGPT UNLIMITED</h1>
          <span style={styles.badge}>UNRESTRICTED</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.adminLabel}>👤 {adminName}</span>
          <button onClick={handleClear} style={{...styles.headerBtn, background: '#ff9800'}}>
            Clear
          </button>
          <button onClick={handleLogout} style={{...styles.headerBtn, background: '#ff6b6b'}}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.quickBar}>
        {quickCommands.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => setInput(cmd.value)}
            style={styles.quickBtn}
          >
            {cmd.label}
          </button>
        ))}
      </div>

      <div style={styles.chatArea}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.messageWrapper,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMessage : 
                    msg.role === 'system' ? styles.systemMessage : styles.aiMessage)
              }}
            >
              {msg.role !== 'system' && (
                <div style={styles.messageHeader}>
                  <strong style={styles.sender}>
                    {msg.role === 'user' ? '👤 You' : '🤖 WormGPT'}
                  </strong>
                  {msg.metadata && (
                    <span style={styles.metadata}>{msg.metadata}</span>
                  )}
                </div>
              )}
              <pre style={styles.messageText}>{msg.content}</pre>
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.loadingWrapper}>
            <div style={styles.loadingDot}></div>
            <div style={styles.loadingDot}></div>
            <div style={styles.loadingDot}></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputArea}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything - code, hacking, writing, advice, tools... No limits."
          style={styles.input}
          disabled={loading}
          rows="1"
        />
        <button 
          onClick={handleSend} 
          style={{
            ...styles.sendButton,
            opacity: loading || !input.trim() ? 0.5 : 1
          }} 
          disabled={loading || !input.trim()}
        >
          {loading ? '⏳' : '🚀'}
        </button>
      </div>

      <div style={styles.footer}>
        <span>🔥 Unlimited Mode Active</span>
        <span>•</span>
        <span>No Restrictions</span>
        <span>•</span>
        <span>Full Access</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'rgba(30, 30, 50, 0.95)',
    padding: '15px 25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid rgba(106, 90, 205, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  statusDot: {
    width: '12px',
    height: '12px',
    background: '#44ff88',
    borderRadius: '50%',
    boxShadow: '0 0 15px #44ff88',
    animation: 'pulse 2s infinite',
  },
  headerTitle: {
    color: '#fff',
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
  },
  badge: {
    background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  adminLabel: {
    color: '#aaa',
    fontSize: '14px',
    marginRight: '10px',
  },
  headerBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.3s',
  },
  quickBar: {
    background: 'rgba(20, 20, 35, 0.8)',
    padding: '12px 25px',
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    borderBottom: '1px solid rgba(106, 90, 205, 0.2)',
  },
  quickBtn: {
    padding: '8px 16px',
    background: 'rgba(106, 90, 205, 0.2)',
    border: '1px solid rgba(106, 90, 205, 0.4)',
    borderRadius: '20px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s',
  },
  chatArea: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '15px',
  },
  message: {
    padding: '15px 20px',
    borderRadius: '15px',
    maxWidth: '75%',
    wordWrap: 'break-word',
  },
  userMessage: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  },
  aiMessage: {
    background: 'rgba(30, 30, 50, 0.95)',
    border: '1px solid rgba(106, 90, 205, 0.3)',
    color: '#fff',
  },
  systemMessage: {
    background: 'transparent',
    color: '#888',
    fontSize: '13px',
    padding: '8px 15px',
    maxWidth: '100%',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  sender: {
    fontSize: '14px',
    color: '#44ff88',
  },
  metadata: {
    fontSize: '11px',
    color: '#888',
  },
  messageText: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    fontFamily: "'Courier New', monospace",
    fontSize: '14px',
    lineHeight: '1.6',
  },
  loadingWrapper: {
    display: 'flex',
    gap: '8px',
    padding: '20px',
  },
  loadingDot: {
    width: '10px',
    height: '10px',
    background: '#6a5acd',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out both',
  },
  inputArea: {
    background: 'rgba(30, 30, 50, 0.95)',
    padding: '20px 25px',
    display: 'flex',
    gap: '15px',
    borderTop: '2px solid rgba(106, 90, 205, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  input: {
    flex: 1,
    padding: '15px 20px',
    background: 'rgba(20, 20, 35, 0.8)',
    border: '2px solid rgba(106, 90, 205, 0.3)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    minHeight: '50px',
    maxHeight: '150px',
  },
  sendButton: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #6a5acd, #8a7aed)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 20px rgba(106, 90, 205, 0.4)',
  },
  footer: {
    background: 'rgba(20, 20, 35, 0.8)',
    padding: '10px',
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    fontSize: '12px',
    color: '#888',
  },
};
