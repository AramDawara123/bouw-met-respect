import React from 'react';

const FallbackApp = () => {
  console.log('FallbackApp rendering - this is a minimal test component');
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Fallback App Loading</h1>
      <p style={{ fontSize: '16px', marginBottom: '8px' }}>If you can see this, React is working.</p>
      <p style={{ fontSize: '16px', marginBottom: '8px' }}>Time: {new Date().toLocaleString()}</p>
      <p style={{ fontSize: '14px', color: '#666' }}>This is a minimal fallback component for debugging.</p>
    </div>
  );
};

export default FallbackApp;