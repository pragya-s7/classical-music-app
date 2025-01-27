import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './RatingsOverview.css';

function RatingsOverview({ entry, averageRatings, onRemoveRating, onRemoveFromLibrary }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const renderStars = (rating) => {
        if (!rating) return 'Not rated';
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const renderComparison = (userRating, avgRating) => {
        if (!userRating || !avgRating) return null;
        const diff = userRating - avgRating;
        if (Math.abs(diff) < 0.5) return 'Average';
        return diff > 0 ? 'Above Average' : 'Below Average';
    };

    return (
        <div className="ratings-overview">
            <div className="rating-type playing">
                <div className="rating-header">
                    <h4>Playing</h4>
                    {entry.ratings.playing && (
                        <button 
                            className="remove-rating-btn"
                            onClick={() => onRemoveRating(entry.pieceId, 'playing')}
                            title="Remove playing rating"
                        >
                            ×
                        </button>
                    )}
                </div>
                <div className="rating-stars">{renderStars(entry.ratings.playing)}</div>
                {averageRatings?.playing && (
                    <div className="rating-comparison">
                        <span className="avg-rating">
                            Avg: {averageRatings.playing} ({averageRatings.totalRatings.playing} ratings)
                        </span>
                        {entry.ratings.playing && (
                            <span className={`comparison-badge ${renderComparison(entry.ratings.playing, parseFloat(averageRatings.playing))?.toLowerCase().replace(' ', '-')}`}>
                                {renderComparison(entry.ratings.playing, parseFloat(averageRatings.playing))}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="rating-type listening">
                <div className="rating-header">
                    <h4>Listening</h4>
                    {entry.ratings.listening && (
                        <button 
                            className="remove-rating-btn"
                            onClick={() => onRemoveRating(entry.pieceId, 'listening')}
                            title="Remove listening rating"
                        >
                            ×
                        </button>
                    )}
                </div>
                <div className="rating-stars">{renderStars(entry.ratings.listening)}</div>
                {averageRatings?.listening && (
                    <div className="rating-comparison">
                        <span className="avg-rating">
                            Avg: {averageRatings.listening} ({averageRatings.totalRatings.listening} ratings)
                        </span>
                        {entry.ratings.listening && (
                            <span className={`comparison-badge ${renderComparison(entry.ratings.listening, parseFloat(averageRatings.listening))?.toLowerCase().replace(' ', '-')}`}>
                                {renderComparison(entry.ratings.listening, parseFloat(averageRatings.listening))}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="ratings-actions">
                <Link to={`/piece/${entry.pieceId}`} className="view-details-link">
                    View Details
                </Link>
                {!showConfirm ? (
                    <button 
                        className="remove-piece-btn"
                        onClick={() => setShowConfirm(true)}
                    >
                        Remove from Library
                    </button>
                ) : (
                    <div className="confirm-remove">
                        <span>Are you sure?</span>
                        <button 
                            className="confirm-yes"
                            onClick={() => onRemoveFromLibrary(entry.pieceId)}
                        >
                            Yes
                        </button>
                        <button 
                            className="confirm-no"
                            onClick={() => setShowConfirm(false)}
                        >
                            No
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RatingsOverview; 