import { OfferingsExperience } from './OfferingsExperience';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';
const root = document.getElementById('root');
if (!root) throw new Error('Missing app root');
createRoot(root).render(
  <StrictMode>
    {new URLSearchParams(window.location.search).has('offerings') ? (
      <OfferingsExperience />
    ) : (
      <App />
    )}
  </StrictMode>
);
