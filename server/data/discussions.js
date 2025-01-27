const fs = require('fs').promises;
const path = require('path');

let discussions = {};

// koad discussions from json
async function loadDiscussions() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'discussions.json'), 'utf8');
        discussions = JSON.parse(data);
        console.log(`Loaded discussions for ${Object.keys(discussions).length} pieces`);
    } catch (error) {
        console.log('No existing discussions file, starting with empty discussions');
        discussions = {};
    }
}

// save discussions to json
async function saveDiscussions() {
    await fs.writeFile(
        path.join(__dirname, 'discussions.json'),
        JSON.stringify(discussions, null, 2)
    );
}

function createMessage(userId, content) {
    return {
        id: Date.now().toString(),
        userId,
        content,
        timestamp: new Date().toISOString(),
        likes: [],
        replies: []
    };
}

module.exports = {
    loadDiscussions,
    
    // get messages for piece
    getDiscussion: (pieceId) => {
        return discussions[pieceId] || [];
    },
    
    // add message
    addMessage: async (pieceId, userId, content) => {
        if (!discussions[pieceId]) {
            discussions[pieceId] = [];
        }
        
        const message = createMessage(userId, content);
        discussions[pieceId].push(message);
        await saveDiscussions();
        return message;
    },
    
    // reply
    addReply: async (pieceId, messageId, userId, content) => {
        const discussion = discussions[pieceId];
        if (!discussion) throw new Error('Discussion not found');
        
        const message = discussion.find(m => m.id === messageId);
        if (!message) throw new Error('Message not found');
        
        const reply = createMessage(userId, content);
        message.replies.push(reply);
        await saveDiscussions();
        return reply;
    },
    
    // like/unlike
    toggleLike: async (pieceId, messageId, userId) => {
        const discussion = discussions[pieceId];
        if (!discussion) throw new Error('Discussion not found');
        
        const message = discussion.find(m => m.id === messageId);
        if (!message) throw new Error('Message not found');
        
        const likeIndex = message.likes.indexOf(userId);
        if (likeIndex === -1) {
            message.likes.push(userId);
        } else {
            message.likes.splice(likeIndex, 1);
        }
        
        await saveDiscussions();
        return message;
    }
}; 