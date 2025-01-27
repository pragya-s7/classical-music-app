import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PieceList from './components/PieceList';
import PieceDetail from './components/PieceDetail';
import Library from './components/Library';
import './App.css';
import './index.css';

function App() {
  // hardcode a user ID until I add authentication
  const userId = 1;

  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">Browse Pieces</Link></li>
            <li><Link to="/library">My Library</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<PieceList userId={userId} />} />
          <Route path="/piece/:pieceId" element={<PieceDetail userId={userId} />} />
          <Route path="/library" element={<Library userId={userId} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
