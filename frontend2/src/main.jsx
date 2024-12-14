import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';


// Import PWA registration helpers from vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker
registerSW({
  onNeedRefresh() {
    alert('A new version is available. Please refresh the page.');
  },
  onOfflineReady() {
    console.log('App is ready to work offline.');
  },
});
