import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthContext } from './AuthContext';

// Foydalanuvchi ma'lumotini context orqali barcha komponentlarga yetkazamiz
const userValue = { user: { id: 1, role: 'instructor' } };

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContext.Provider value={userValue}>
        <App />
      </AuthContext.Provider>
    </BrowserRouter>
  </React.StrictMode>
);