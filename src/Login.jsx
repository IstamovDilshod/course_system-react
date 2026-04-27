import React, { useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('login/', formData);
      const token = res.data.access;
      localStorage.setItem('access', token);

      const decoded = jwtDecode(token);
      console.log(decoded);

      if (decoded.role === 'instructor') {
        navigate('/create-course');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      alert("Login yoki parol xato!");
    }
  };

  return (
    <div className="login-page">          {/* ← Bu muhim! Markazga joylashtiradi */}
      <form onSubmit={handleLogin} className="auth-container">
        <h2>Kirish</h2>
        
        <input 
          type="text" 
          placeholder="Username" 
          onChange={(e) => setFormData({...formData, username: e.target.value})} 
        />

        <div className="password-input-container">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            className="password-input-field"
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
          <button 
            type="button" 
            className="password-toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button type="submit">Kirish</button>
      </form>
    </div>
  );
}

export default Login;