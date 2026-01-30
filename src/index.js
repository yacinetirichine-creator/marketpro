import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Import du ThemeProvider
import { ThemeProvider } from './contexts/ThemeContext';

// Composant de chargement
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#1a1a2e',
    color: '#00D4AA'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '50px', 
        height: '50px', 
        border: '3px solid #00D4AA',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <p>Chargement de Market Pro...</p>
    </div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Suspense>
  </React.StrictMode>
);
