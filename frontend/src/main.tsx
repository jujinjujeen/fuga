import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@radix-ui/themes/styles.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import { Theme } from '@radix-ui/themes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Theme
        accentColor="indigo"
        grayColor="slate"
        radius="large"
        scaling="100%"
        appearance="light"
      >
        <App />
      </Theme>
    </BrowserRouter>
  </StrictMode>
);
