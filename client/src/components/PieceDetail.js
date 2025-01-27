import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PieceDetail.css';
import Discussion from './Discussion';
import PieceRatings from './PieceRatings';

function PieceDetail({ userId }) {
  const { pieceId } = useParams();
  const navigate = useNavigate();
  const [piece, setPiece] = useState(null);
  const [loading, setLoading] = useState(true);
  const [libraryStatus, setLibraryStatus] = useState(null);

  useEffect(() => {
    const fetchPiece = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/pieces/${pieceId}`);
        const data = await response.json();
        setPiece(data);
        const libraryResponse = await fetch(`http://localhost:4000/api/users/${userId}/library/${pieceId}/status`);
        if (libraryResponse.ok) {
          const { status } = await libraryResponse.json();
          setLibraryStatus(status);
        }
      } catch (error) {
        console.error('Error fetching piece:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPiece();
  }, [pieceId, userId]);

  const addToLibrary = async (status) => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${userId}/library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pieceId: parseInt(pieceId),
          status
        }),
      });

      if (response.ok) {
        setLibraryStatus(status);
      }
    } catch (error) {
      console.error('Error adding to library:', error);
    }
  };

  if (loading) return <div className="piece-detail-loading">Loading...</div>;
  if (!piece) return <div className="piece-detail-error">Piece not found</div>;

  return (
    <div className="piece-detail">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back to List
      </button>

      <div className="piece-header">
        <h1>{piece.title}</h1>
        <h2>{piece.composer}</h2>
      </div>

      <div className="piece-actions">
        {!libraryStatus ? (
          <div className="add-to-library">
            <button onClick={() => addToLibrary('Want to Learn')}>
              Add to Library
            </button>
            <div className="status-dropdown">
              <select 
                onChange={(e) => addToLibrary(e.target.value)}
                value=""
              >
                <option value="" disabled>Add as...</option>
                <option value="Want to Learn">Want to Learn</option>
                <option value="Currently Learning">Currently Learning</option>
                <option value="Learned">Learned</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="library-status">
            Status: {libraryStatus}
          </div>
        )}
      </div>

      <div className="piece-content">
  <div className="piece-info">
    <h3>Details</h3>
    <p>Difficulty: {piece.difficulty}/10</p>
    {piece.imslp_link && (
      <div className="imslp-section">
        <a 
          href={piece.imslp_link}
          target="_blank"
          rel="noopener noreferrer"
          className="imslp-link"
        >
          View on IMSLP
        </a>
        <p className="imslp-note">
          Note: IMSLP provides free sheet music in the public domain.
        </p>
      </div>
    )}
    <PieceRatings userId={userId} pieceId={parseInt(pieceId)} />
  </div>

  <div className="imslp-embed">
    <h3>IMSLP Embed</h3>
    <iframe
      src={piece.imslp_link}
      title="IMSLP Score"
    ></iframe>
    <p className="imslp-disclaimer">
      IMSLP scores are displayed directly here. Note: Some features may require visiting the IMSLP website.
    </p>
  </div>

  <div className="discussion-section">
    <Discussion pieceId={parseInt(pieceId)} userId={userId} />
  </div>
</div>


    </div>
  );
}

export default PieceDetail;
