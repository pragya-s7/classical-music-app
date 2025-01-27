import React, { useState } from 'react';
import './RatingHistory.css';

function RatingHistory({ history }) {
    const [filter, setFilter] = useState('all'); // 'all', 'playing', or 'listening'
    
    if (!history || history.length === 0) {
        return (
            <div className="rating-history empty">
                <p>No rating history yet.</p>
            </div>
        );
    }

    const filteredHistory = filter === 'all' 
        ? history 
        : history.filter(entry => entry.type === filter);

    const groupedHistory = filteredHistory.reduce((groups, entry) => {
        const date = new Date(entry.timestamp);
        const monthYear = date.toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        if (!groups[monthYear]) {
            groups[monthYear] = [];
        }
        groups[monthYear].push(entry);
        return groups;
    }, {});

    return (
        <div className="rating-history">
            <div className="history-filters">
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Ratings</option>
                    <option value="playing">Playing Ratings</option>
                    <option value="listening">Listening Ratings</option>
                </select>
            </div>

            {Object.entries(groupedHistory).map(([monthYear, entries]) => (
                <div key={monthYear} className="history-month">
                    <h4>{monthYear}</h4>
                    {entries.map(entry => (
                        <div key={entry.id} className="history-entry">
                            <div className="history-entry-header">
                                <span className="rating-type">
                                    {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                                </span>
                                <span className="rating-date">
                                    {new Date(entry.timestamp).toLocaleDateString()} at{' '}
                                    {new Date(entry.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="rating-change">
                                <div className="stars previous">
                                    {entry.previousValue ? '★'.repeat(entry.previousValue) + '☆'.repeat(5 - entry.previousValue) : 'No rating'}
                                </div>
                                <div className="arrow">→</div>
                                <div className="stars new">
                                    {entry.newValue ? '★'.repeat(entry.newValue) + '☆'.repeat(5 - entry.newValue) : 'Removed'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default RatingHistory; 