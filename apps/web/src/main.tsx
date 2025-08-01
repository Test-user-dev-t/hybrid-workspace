import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { YjsProvider } from './lib/yjs/provider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <YjsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </YjsProvider>
  </React.StrictMode>,
);
