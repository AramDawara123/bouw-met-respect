import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx: Starting application');

const rootElement = document.getElementById("root");
console.log('main.tsx: Root element found:', rootElement);

if (!rootElement) {
  console.error('main.tsx: Root element not found!');
} else {
  console.log('main.tsx: Creating React root and rendering App');
  createRoot(rootElement).render(<App />);
}
