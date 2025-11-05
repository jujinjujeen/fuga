import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@radix-ui/themes/styles.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import { Theme } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  </StrictMode>
);
