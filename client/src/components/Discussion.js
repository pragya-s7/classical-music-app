import React, { useState, useEffect } from 'react';
import './Discussion.css';

function Discussion({ pieceId, userId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:4000/api/pieces/${pieceId}/discussion`)
            .then(res => res.json())
            .then(data => {
                setMessages(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching discussion:', error);
                setError('Failed to load discussion');
                setLoading(false);
            });
    }, [pieceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await fetch(`http://localhost:4000/api/pieces/${pieceId}/discussion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    content: newMessage
                }),
            });

            const message = await response.json();
            setMessages([...messages, message]);
            setNewMessage('');
        } catch (error) {
            console.error('Error posting message:', error);
        }
    };

    const handleLike = async (messageId) => {
        try {
            const response = await fetch(
                `http://localhost:4000/api/pieces/${pieceId}/discussion/${messageId}/like`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId }),
                }
            );

            const updatedMessage = await response.json();
            setMessages(messages.map(msg => 
                msg.id === messageId ? updatedMessage : msg
            ));
        } catch (error) {
            console.error('Error liking message:', error);
        }
    };

    if (loading) return <div className="discussion-loading">Loading discussion...</div>;
    if (error) return <div className="discussion-error">{error}</div>;

    return (
        <div className="discussion">
            <h3>Discussion</h3>
            
            <div className="message-list">
                {messages.length === 0 ? (
                    <p className="no-messages">Be the first to start a discussion about this piece!</p>
                ) : (
                    messages.map(message => (
                        <div key={message.id} className="message">
                            <div className="message-content">
                                <p>{message.content}</p>
                                <div className="message-meta">
                                    <span className="message-time">
                                        {new Date(message.timestamp).toLocaleString()}
                                    </span>
                                    <button 
                                        className={`like-button ${message.likes.includes(userId) ? 'liked' : ''}`}
                                        onClick={() => handleLike(message.id)}
                                    >
                                        ♥ {message.likes.length}
                                    </button>
                                </div>
                            </div>
                            
                            {message.replies.length > 0 && (
                                <div className="replies">
                                    {message.replies.map(reply => (
                                        <div key={reply.id} className="reply">
                                            <p>{reply.content}</p>
                                            <span className="reply-time">
                                                {new Date(reply.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="message-form">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Share your thoughts about this piece..."
                    rows="3"
                />
                <button type="submit" disabled={!newMessage.trim()}>
                    Post Message
                </button>
            </form>
        </div>
    );
}

export default Discussion; 