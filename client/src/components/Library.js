import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RatingsOverview from './RatingsOverview';
import './Library.css';

function Library({ userId }) {
  const [library, setLibrary] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState({
    'Want to Learn': 'Want to Learn',
    'Currently Learning': 'Currently Learning',
    'Learned': 'Learned',
    'Abandoned': 'Abandoned'
  });
  const [view, setView] = useState('all'); // 'all', 'rated'

  // Fetch user's library
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:4000/api/users/${userId}/library`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setLibrary(data);
      } catch (err) {
        console.error('Error fetching library:', err);
        setError('Failed to load library. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [userId]);

  const updatePieceStatus = async (pieceId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${userId}/library/${pieceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      const updatedEntry = await response.json();
      setLibrary(library.map(entry => 
        entry.pieceId === pieceId ? updatedEntry : entry
      ));
    } catch (error) {
      console.error('Error updating piece status:', error);
    }
  };

  const removeRating = async (pieceId, ratingType) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/users/${userId}/library/${pieceId}/ratings/${ratingType}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setLibrary(library.map(entry => {
          if (entry.pieceId === pieceId) {
            return {
              ...entry,
              ratings: {
                ...entry.ratings,
                [ratingType]: null
              }
            };
          }
          return entry;
        }));
      }
    } catch (error) {
      console.error('Error removing rating:', error);
    }
  };

  const removeFromLibrary = async (pieceId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/users/${userId}/library/${pieceId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setLibrary(library.filter(entry => entry.pieceId !== pieceId));
      }
    } catch (error) {
      console.error('Error removing piece from library:', error);
    }
  };

  if (loading) return <div className="library-loading">Loading your library...</div>;
  if (error) return <div className="library-error">{error}</div>;

  const filteredLibrary = library.filter(entry => {
    if (view === 'rated') {
      return entry.ratings?.playing || entry.ratings?.listening;
    }
    return statusFilter === 'all' || entry.status === statusFilter;
  });

  return (
    <div className="library">
      <h1>My Music Library</h1>
      
      <div className="library-filters">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Pieces</option>
          {Object.values(statuses).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
        >
          <option value="all">All Entries</option>
          <option value="rated">Rated Pieces</option>
        </select>
      </div>

      {filteredLibrary.length === 0 ? (
        <div className="library-empty">
          <p>{view === 'rated' ? 'No rated pieces yet.' : 'Your library is empty.'}</p>
        </div>
      ) : (
        <div className="library-grid">
          {filteredLibrary.map(entry => (
            <div key={entry.pieceId} className="library-item">
              <h3>
                <Link to={`/piece/${entry.pieceId}`} className="piece-title-link">
                  {entry.piece?.title || 'Unknown Piece'}
                </Link>
              </h3>
              <p>{entry.piece?.composer || 'Unknown Composer'}</p>
              <div className="status-section">
                <select
                  value={entry.status}
                  onChange={(e) => updatePieceStatus(entry.pieceId, e.target.value)}
                >
                  {Object.values(statuses).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <RatingsOverview 
                entry={entry} 
                averageRatings={entry.piece?.averageRatings}
                onRemoveRating={removeRating}
                onRemoveFromLibrary={removeFromLibrary}
              />
              <div className="piece-details">
                <p>Added: {new Date(entry.dateAdded).toLocaleDateString()}</p>
                {entry.timeSpentPracticing > 0 && (
                  <p>Practice Time: {entry.timeSpentPracticing} minutes</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Library; 