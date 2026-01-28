import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'antd/dist/reset.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import axios from 'axios';

// --- AXIOS CONFIGURATION ---
// If VITE_SERVER_URL is present (production/env file), use it.
// Otherwise, fallback to empty string (relative path) or localhost.
const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';
axios.defaults.baseURL = serverUrl;

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </Provider>
);