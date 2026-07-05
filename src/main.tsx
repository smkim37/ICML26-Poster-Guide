import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { UserDataProvider } from './hooks/useUserData';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <UserDataProvider>
        <App />
      </UserDataProvider>
    </HashRouter>
  </React.StrictMode>,
);
