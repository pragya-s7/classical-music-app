const fs = require('fs').promises;
const path = require('path');

let users = [];

const PIECE_STATUSES = {
    WANT_TO_LEARN: 'Want to Learn',
    CURRENTLY_LEARNING: 'Currently Learning',
    LEARNED: 'Learned',
    ABANDONED: 'Abandoned'
};

async function initializeDefaultUser() {
    const defaultUser = {
        id: 1,
        username: 'defaultUser',
        email: 'default@example.com',
        dateJoined: new Date().toISOString(),
        library: [],
        following: [],
        followers: [],
        settings: {
            privacyLevel: 'public',
            emailNotifications: true
        }
    };
    
    try {
        await fs.access(path.join(__dirname, 'users.json'));
        const data = await fs.readFile(path.join(__dirname, 'users.json'), 'utf8');
        users = JSON.parse(data);
    } catch (error) {
        users = [defaultUser];
        await saveUsers();
    }
}

async function loadUsers() {
    try {
        await initializeDefaultUser();
        console.log(`Loaded ${users.length} users`);
    } catch (error) {
        console.error('Error loading users:', error);
        users = [];
    }
}

async function saveUsers() {
    await fs.writeFile(
        path.join(__dirname, 'users.json'),
        JSON.stringify(users, null, 2)
    );
}

function createRatingHistoryEntry(type, value, previousValue) {
    return {
        id: Date.now().toString(),
        type,
        newValue: value,
        previousValue,
        timestamp: new Date().toISOString()
    };
}

function createLibraryEntry(pieceId, status = PIECE_STATUSES.WANT_TO_LEARN) {
    return {
        pieceId,
        status,
        dateAdded: new Date().toISOString(),
        dateStatusChanged: new Date().toISOString(),
        ratings: {
            playing: null,
            listening: null
        },
        ratingHistory: [],
        privateNotes: '',
        practiceLogs: [],
        difficulty: null,
        timeSpentPracticing: 0,
        lastUpdated: new Date().toISOString()
    };
}

module.exports = {
    PIECE_STATUSES,
    loadUsers,
    saveUsers,
    getUsers: () => users,
    findUserById: (id) => users.find(user => user.id === id),
    createUser: async (username, email, passwordHash) => {
        const newUser = {
            id: users.length + 1,
            username,
            email,
            passwordHash,
            dateJoined: new Date().toISOString(),
            library: [],
            following: [],
            followers: [],
            settings: {
                privacyLevel: 'public',
                emailNotifications: true
            }
        };
        users.push(newUser);
        await saveUsers();
        return newUser;
    },
    addToLibrary: async (userId, pieceId, status = PIECE_STATUSES.WANT_TO_LEARN) => {
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');
        
        if (!user.library) {
            user.library = [];
        }
        
        const existingEntry = user.library.find(entry => entry.pieceId === pieceId);
        if (existingEntry) {
            existingEntry.status = status;
            existingEntry.dateStatusChanged = new Date().toISOString();
        } else {
            user.library.push(createLibraryEntry(pieceId, status));
        }
        
        await saveUsers();
        return user.library;
    },
    updateLibraryEntry: async (userId, pieceId, updates) => {
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');
        
        const entry = user.library?.find(e => e.pieceId === pieceId);
        if (!entry) throw new Error('Library entry not found');
        
        if (updates.ratings) {
            for (const [type, newValue] of Object.entries(updates.ratings)) {
                if (newValue !== entry.ratings[type]) {
                    if (!entry.ratingHistory) entry.ratingHistory = [];
                    entry.ratingHistory.push(
                        createRatingHistoryEntry(type, newValue, entry.ratings[type])
                    );
                }
            }
            entry.ratings = {
                ...entry.ratings,
                ...updates.ratings
            };
        }
        
        Object.assign(entry, {
            ...updates,
            lastUpdated: new Date().toISOString()
        });
        
        await saveUsers();
        return entry;
    },
    getLibraryEntry: (userId, pieceId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return null;
        return user.library?.find(e => e.pieceId === pieceId) || null;
    }
}; 