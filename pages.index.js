import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (username === 'Fanzz155' && password === 'admin22') {
      localStorage.setItem('auth', 'true');
      localStorage.setItem('admin', username);
      router.push('/dashboard');
    } else {
      setError('✗ Invalid credentials - Admin access denied');
      setPassword('');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>🔥</div>
        </div>
        
        <h1 style={styles.title}>WormGPT UNLIMITED</h1>
        <p style={styles.subtitle}>Unrestricted AI Assistant</p>
        <p style={styles.tagline}>Zero Boundaries • Infinite Possibilities</p>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <span style={styles.icon}>👤</span>
            <input
              type="text"
              placeholder="Admin Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              autoComplete="off"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <span style={styles.icon}>🔒</span>
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <button type="submit" style={styles.button}>
            <span>UNLOCK UNLIMITED ACCESS</span>
          </button>
          
          {error && <div style={styles.error}>{error}</div>}
        </form>
        
        <div style={styles.features}>
          <div style={styles.feature}>✓ Code Generation</div>
          <div style={styles.feature}>✓ Hacking Tools</div>
          <div style={styles.feature}>✓ Content Writing</div>
          <div style={styles.feature}>✓ No Restrictions</div>
        </div>
        
        <p style={styles.footer}>v2.0 Unlimited Edition</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  loginBox: {
    background: 'rgba(30, 30, 50, 0.95)',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)',
    maxWidth: '450px',
    width: '100%',
    border: '1px solid rgba(106, 90, 205, 0.3)',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  logo: {
    fontSize: '60px',
    animation: 'pulse 2s infinite',
  },
  title: {
    color: '#fff',
    fontSize: '28px',
    textAlign: 'center',
    marginBottom: '8px',
    fontWeight: 'bold',
    textShadow: '0 0 20px rgba(106, 90, 205, 0.5)',
  },
  subtitle: {
    color: '#6a5acd',
    textAlign: 'center',
    fontSize: '16px',
    marginBottom: '5px',
  },
  tagline: {
    color: '#888',
    textAlign: 'center',
    fontSize: '13px',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '15px',
    fontSize: '18px',
  },
  input: {
    width: '100%',
    padding: '15px 15px 15px 50px',
    background: 'rgba(20, 20, 35, 0.8)',
    border: '2px solid rgba(106, 90, 205, 0.3)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s',
  },
  button: {
    padding: '16px',
    background: 'linear-gradient(135deg, #6a5acd, #8a7aed)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'all 0.3s',
    boxShadow: '0 8px 25px rgba(106, 90, 205, 0.4)',
  },
  error: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: '12px',
    background: 'rgba(255, 107, 107, 0.1)',
    borderRadius: '8px',
    fontSize: '14px',
    border: '1px solid rgba(255, 107, 107, 0.3)',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '25px',
  },
  feature: {
    color: '#44ff88',
    fontSize: '12px',
    padding: '8px',
    background: 'rgba(68, 255, 136, 0.05)',
    borderRadius: '6px',
    textAlign: 'center',
    border: '1px solid rgba(68, 255, 136, 0.2)',
  },
  footer: {
    color: '#555',
    textAlign: 'center',
    fontSize: '11px',
    marginTop: '25px',
  },
};
