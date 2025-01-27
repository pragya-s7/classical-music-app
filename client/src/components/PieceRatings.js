import React, { useState, useEffect } from 'react';
import './PieceRatings.css';

function PieceRatings({ userId, pieceId }) {
    const [ratings, setRatings] = useState({ playing: null, listening: null });
    const [privateNotes, setPrivateNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const response = await fetch(
                    `http://localhost:4000/api/users/${userId}/library/${pieceId}/ratings`
                );
                if (response.ok) {
                    const data = await response.json();
                    setRatings(data.ratings || { playing: null, listening: null });
                    setPrivateNotes(data.privateNotes || '');
                    setLastSaved(data.lastUpdated);
                }
            } catch (error) {
                console.error('Error fetching ratings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRatings();
    }, [userId, pieceId]);

    const handleRatingChange = async (type, value) => {
        try {
            setSaving(true);
            const newRatings = { ...ratings, [type]: value };
            
            const response = await fetch(
                `http://localhost:4000/api/users/${userId}/library/${pieceId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ratings: newRatings
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setRatings(data.ratings);
                setLastSaved(data.lastUpdated);
            }
        } catch (error) {
            console.error('Error updating rating:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleNotesChange = async (notes) => {
        try {
            setSaving(true);
            const response = await fetch(
                `http://localhost:4000/api/users/${userId}/library/${pieceId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        privateNotes: notes
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setPrivateNotes(data.privateNotes);
                setLastSaved(data.lastUpdated);
            }
        } catch (error) {
            console.error('Error updating notes:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="ratings-loading">Loading ratings...</div>;

    return (
        <div className="piece-ratings">
            <h3>My Ratings</h3>
            
            <div className="rating-section">
                <div className="rating-type">
                    <label>As a Performer:</label>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className={`star ${ratings.playing >= star ? 'filled' : ''}`}
                                onClick={() => handleRatingChange('playing', star)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rating-type">
                    <label>As a Listener:</label>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className={`star ${ratings.listening >= star ? 'filled' : ''}`}
                                onClick={() => handleRatingChange('listening', star)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="private-notes">
                <h4>Private Notes</h4>
                <textarea
                    value={privateNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add your private notes about this piece..."
                    rows="4"
                />
            </div>

            <div className="save-status">
                {saving ? (
                    <span className="saving">Saving...</span>
                ) : lastSaved && (
                    <span className="saved">
                        Last saved: {new Date(lastSaved).toLocaleString()}
                    </span>
                )}
            </div>
        </div>
    );
}

export default PieceRatings; 