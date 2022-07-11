// React
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// Component
import App from './App';
import { AuthContextProvider } from './context/AuthContext';
// Style
import './static/style/global.css'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <Router>
        <Routes>
          <Route path='*' element={<App/>}/>
        </Routes>
      </Router>
    </AuthContextProvider>
  </React.StrictMode>
);