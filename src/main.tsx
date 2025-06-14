
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Check if we're in development mode
const isDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname.includes('.lovable.dev');

if (isDev) {
  console.log('Application running in development mode');
  
  // In development mode, unregister any service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister();
        console.log('Service Worker unregistered for development');
      }
    });
  }
}

// Make sure the root container has a background that fills the entire viewport
const rootElement = document.getElementById("root")!;
rootElement.style.width = "100%";
rootElement.style.height = "100vh";
rootElement.style.margin = "0";
rootElement.style.padding = "0";

// Use createRoot API to mount the app
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
