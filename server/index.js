const express = require('express');
const cors = require('cors');
const { 
  loadPieces, 
  getPieces, 
  getPieceWithRatings 
} = require('./data/pieces');
const { 
  loadUsers, 
  findUserById, 
  PIECE_STATUSES, 
  addToLibrary, 
  updateLibraryEntry, 
  getLibraryEntry, 
  getUsers, 
  saveUsers 
} = require('./data/users');
const { 
  loadDiscussions, 
  getDiscussion, 
  addMessage, 
  addReply, 
  toggleLike 
} = require('./data/discussions');
const { 
  searchIMSLP, 
  getPieceDetails 
} = require('./services/imslpService');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

/**
 * GET /api/pieces
 * Returns your *local* database of pieces only
 */
app.get('/api/pieces', (req, res) => {
  res.json(getPieces());
});

/**
 * GET /api/pieces/:pieceId
 * If pieceId starts with "imslp_", retrieve from IMSLP; otherwise from local DB
 */
app.get('/api/pieces/:pieceId', async (req, res) => {
  try {
    const pieceId = req.params.pieceId;

    // If it's an IMSLP piece, fetch from IMSLP service
    if (pieceId.startsWith('imslp_')) {
      const imslpId = pieceId.replace('imslp_', '');
      const pieceDetails = await getPieceDetails(imslpId);
      return res.json(pieceDetails);
    }

    // Otherwise, get from local database
    const piece = getPieces().find(p => p.id === parseInt(pieceId));
    if (!piece) {
      return res.status(404).json({ error: 'Piece not found' });
    }

    res.json(piece);
  } catch (error) {
    console.error('Error fetching piece:', error);
    res.status(500).json({ error: 'Failed to fetch piece' });
  }
});

/**
 * GET /api/users/:userId/library
 * Returns the user's library with enriched piece data
 */
app.get('/api/users/:userId/library', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = findUserById(userId);
    const allUsers = getUsers();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.library) {
      user.library = [];
    }

    // Enrich library entries with piece details + average ratings
    const enrichedLibrary = user.library.map(entry => ({
      ...entry,
      piece: getPieceWithRatings(entry.pieceId, allUsers)
    }));

    res.json(enrichedLibrary);
  } catch (error) {
    console.error('Error fetching library:', error);
    res.status(500).json({ error: 'Failed to fetch library' });
  }
});

/**
 * GET /api/users/:userId/library/:pieceId/status
 * Check if the user has a piece in their library and return its status
 */
app.get('/api/users/:userId/library/:pieceId/status', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const pieceId = parseInt(req.params.pieceId);
    const user = findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const libraryEntry = user.library?.find(entry => entry.pieceId === pieceId);
    if (!libraryEntry) {
      return res.status(404).json({ error: 'Piece not in library' });
    }

    res.json({ status: libraryEntry.status });
  } catch (error) {
    console.error('Error checking piece status:', error);
    res.status(500).json({ error: 'Failed to check piece status' });
  }
});

/**
 * POST /api/users/:userId/library
 * Add a local piece to the user's library
 */
app.post('/api/users/:userId/library', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { pieceId, status = PIECE_STATUSES.WANT_TO_LEARN } = req.body;

    // Verify piece is in local DB
    const piece = getPieces().find(p => p.id === pieceId);
    if (!piece) {
      return res.status(404).json({ error: 'Piece not found' });
    }

    const updatedLibrary = await addToLibrary(userId, pieceId, status);
    const entry = updatedLibrary.find(e => e.pieceId === pieceId);

    res.json({ ...entry, piece });
  } catch (error) {
    console.error('Error adding to library:', error);
    res.status(500).json({ error: 'Failed to add to library' });
  }
});

/**
 * PATCH /api/users/:userId/library/:pieceId
 * Update a user's library entry
 */
app.patch('/api/users/:userId/library/:pieceId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const pieceId = parseInt(req.params.pieceId);
    const updates = req.body;

    const updatedEntry = await updateLibraryEntry(userId, pieceId, updates);

    // Enrich with piece details
    const piece = getPieces().find(p => p.id === pieceId);
    res.json({ ...updatedEntry, piece });
  } catch (error) {
    console.error('Error updating library entry:', error);
    res.status(500).json({ error: 'Failed to update library entry' });
  }
});

/**
 * GET /api/piece-statuses
 * Return available statuses
 */
app.get('/api/piece-statuses', (req, res) => {
  res.json(PIECE_STATUSES);
});

/**
 * GET /api/pieces/:pieceId/discussion
 * Fetch discussion data for a piece
 */
app.get('/api/pieces/:pieceId/discussion', (req, res) => {
  try {
    const pieceId = parseInt(req.params.pieceId);
    const discussion = getDiscussion(pieceId);
    res.json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ error: 'Failed to fetch discussion' });
  }
});

/**
 * POST /api/pieces/:pieceId/discussion
 * Add a top-level message to the discussion
 */
app.post('/api/pieces/:pieceId/discussion', async (req, res) => {
  try {
    const pieceId = parseInt(req.params.pieceId);
    const { userId, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = await addMessage(pieceId, userId, content);
    res.json(message);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

/**
 * POST /api/pieces/:pieceId/discussion/:messageId/reply
 * Add a reply to a specific message
 */
app.post('/api/pieces/:pieceId/discussion/:messageId/reply', async (req, res) => {
  try {
    const pieceId = parseInt(req.params.pieceId);
    const { messageId } = req.params;
    const { userId, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    const reply = await addReply(pieceId, messageId, userId, content);
    res.json(reply);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

/**
 * POST /api/pieces/:pieceId/discussion/:messageId/like
 * Toggle like on a message
 */
app.post('/api/pieces/:pieceId/discussion/:messageId/like', async (req, res) => {
  try {
    const pieceId = parseInt(req.params.pieceId);
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await toggleLike(pieceId, messageId, userId);
    res.json(message);
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

/**
 * GET /api/users/:userId/library/:pieceId/ratings
 * Fetch the user's personal ratings for a piece
 */
app.get('/api/users/:userId/library/:pieceId/ratings', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const pieceId = parseInt(req.params.pieceId);

    const entry = getLibraryEntry(userId, pieceId);
    if (!entry) {
      return res.status(404).json({ error: 'Library entry not found' });
    }

    res.json({
      ratings: entry.ratings,
      privateNotes: entry.privateNotes,
      lastUpdated: entry.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

/**
 * DELETE /api/users/:userId/library/:pieceId/ratings/:ratingType
 * Remove a specific rating from user's library entry
 */
app.delete('/api/users/:userId/library/:pieceId/ratings/:ratingType', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const pieceId = parseInt(req.params.pieceId);
    const { ratingType } = req.params;

    const user = findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const entry = user.library?.find(e => e.pieceId === pieceId);
    if (!entry) {
      return res.status(404).json({ error: 'Library entry not found' });
    }

    if (entry.ratings) {
      // Keep track of the old value before setting to null
      const oldValue = entry.ratings[ratingType];
      entry.ratings[ratingType] = null;

      // Add a record to ratingHistory
      if (!entry.ratingHistory) entry.ratingHistory = [];
      entry.ratingHistory.push({
        id: Date.now().toString(),
        type: ratingType,
        newValue: null,
        previousValue: oldValue,
        timestamp: new Date().toISOString()
      });
    }

    await saveUsers();
    res.json(entry);
  } catch (error) {
    console.error('Error removing rating:', error);
    res.status(500).json({ error: 'Failed to remove rating' });
  }
});

/**
 * DELETE /api/users/:userId/library/:pieceId
 * Remove a piece from the user's library
 */
app.delete('/api/users/:userId/library/:pieceId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const pieceId = parseInt(req.params.pieceId);

    const user = findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.library) {
      return res.status(404).json({ error: 'Library not found' });
    }

    user.library = user.library.filter(entry => entry.pieceId !== pieceId);
    await saveUsers();

    res.json({ message: 'Piece removed from library' });
  } catch (error) {
    console.error('Error removing piece from library:', error);
    res.status(500).json({ error: 'Failed to remove piece from library' });
  }
});

/**
 * GET /api/pieces/search?query=...&type=...
 * Search local pieces; if local results are few, also search IMSLP
 */
app.get('/api/pieces/search', async (req, res) => {
  try {
    const { query = '', type = 'title' } = req.query;
    if (!query.trim()) {
      // If no search, just return local pieces
      return res.json(getPieces());
    }

    // 1) Filter local pieces by title or composer
    let localResults = getPieces().filter(piece => {
      const fieldToSearch = (type === 'composer') 
        ? piece.composer 
        : piece.title;
      return fieldToSearch.toLowerCase().includes(query.toLowerCase());
    });

    // 2) If local is small, also call IMSLP
    if (localResults.length < 5) {
      try {
        const imslpResults = await searchIMSLP(query, type);
        // Filter out duplicates based on some IMslp ID
        const newImslpResults = imslpResults.filter(imslpPiece => 
          !localResults.some(localPiece => 
            localPiece.imslp_id && localPiece.imslp_id === imslpPiece.imslp_id
          )
        );
        // Combine
        localResults = [...localResults, ...newImslpResults];
      } catch (error) {
        console.error('IMSLP search error:', error);
        // fallback to local if IMSLP fails
      }
    }

    res.json(localResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search pieces' });
  }
});

// -------------------------------------------------
// Start server after loading data
// -------------------------------------------------
async function startServer() {
  try {
    await loadPieces();
    await loadUsers();
    await loadDiscussions();

    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
      console.log('Server routes initialized:');
      console.log('- GET /api/pieces');
      console.log('- GET /api/pieces/:pieceId');
      console.log('- GET /api/pieces/search');
      console.log('- GET /api/users/:userId/library');
      console.log('- GET /api/users/:userId/library/:pieceId/status');
      console.log('- POST /api/users/:userId/library');
      console.log('- PATCH /api/users/:userId/library/:pieceId');
      console.log('- GET /api/piece-statuses');
      console.log('- GET /api/pieces/:pieceId/discussion');
      console.log('- POST /api/pieces/:pieceId/discussion');
      console.log('- POST /api/pieces/:pieceId/discussion/:messageId/reply');
      console.log('- POST /api/pieces/:pieceId/discussion/:messageId/like');
      console.log('- GET /api/users/:userId/library/:pieceId/ratings');
      console.log('- DELETE /api/users/:userId/library/:pieceId/ratings/:ratingType');
      console.log('- DELETE /api/users/:userId/library/:pieceId');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
