import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './components/styles.css'; // Ensure this line is present to import the CSS file
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);