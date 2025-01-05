import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// src/App.jsx
import StockDashboard from './components/StockDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <StockDashboard />
    </div>
  );
}

export default App;

