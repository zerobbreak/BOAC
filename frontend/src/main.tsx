/**
 *   Description:
 *   Bootstraps the React application, sets up global providers
 *   including React Query and React Router, and mounts the App
 *   component into the root DOM node.
 *
 * Notes:
 *   - Uses StrictMode for highlighting potential issues.
 *   - QueryClientProvider supplies TanStack Query caching.
 *   - BrowserRouter enables client-side routing.
 *   - App contains all public and admin routes.
 */



import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/app'
import './app/styles.css'
import { queryClient } from './lib/query-client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
