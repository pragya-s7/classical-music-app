import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PieceList.css';

function PieceList({ userId }) {
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('title');
  const [filteredPieces, setFilteredPieces] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/pieces')
      .then((res) => res.json())
      .then((data) => {
        setPieces(data);
        setFilteredPieces(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching pieces:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPieces(pieces);
      return;
    }

    const filtered = pieces.filter((piece) => {
      const searchField =
        searchBy === 'composer' ? piece.composer : piece.title;
      return searchField.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredPieces(filtered);
  }, [searchTerm, searchBy, pieces]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value);
    setSearchTerm('');
  };

  if (loading) return <div className="pieces-loading">Loading...</div>;

  return (
    <div className="pieces-container">
      <h1>Browse Classical Pieces</h1>

      <div className="search-section">
        <div className="search-controls">
          <div className="search-type">
            <select
              value={searchBy}
              onChange={handleSearchByChange}
              className="search-select"
            >
              <option value="title">Search by Title</option>
              <option value="composer">Search by Composer</option>
            </select>
          </div>
          <input
            type="text"
            placeholder={`Search by ${searchBy}...`}
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        {searchTerm.trim() && filteredPieces.length === 0 && (
          <p className="no-results">
            No pieces found for "{searchTerm}"
          </p>
        )}
      </div>

      <div className="pieces-grid">
        {filteredPieces.map((piece) => (
          <div key={piece.id} className="piece-card">
            <h3>
              <Link to={`/piece/${piece.id}`}>
                {piece.title}
              </Link>
            </h3>
            <p className="composer-name">{piece.composer}</p>
            <p>Difficulty: {piece.difficulty}/10</p>
            <div className="piece-card-actions">
              <Link to={`/piece/${piece.id}`} className="view-details">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PieceList;
