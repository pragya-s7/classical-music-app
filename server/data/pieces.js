const fs = require('fs').promises;
const path = require('path');

const defaultPieces = [
  {
    id: 1,
    title: 'Piano Sonata No. 14 (Moonlight)',
    composer: 'Beethoven, Ludwig van',
    difficulty: 7,
    ratings: []
  },
  {
    id: 2,
    title: 'Violin Concerto in D Major, Op. 35',
    composer: 'Pyotr Ilyich Tchaikovsky',
    difficulty: 9,
    ratings: []
  },
  {
    id: 3,
    title: 'Cello Suite No. 1 in G Major, BWV 1007',
    composer: 'Johann Sebastian Bach',
    difficulty: 6,
    ratings: []
  }
];

let pieces = [...defaultPieces];

async function loadPieces() {
  try {
    console.log('Attempting to load IMSLP pieces...');
    const filePath = path.join(__dirname, 'imslp_pieces.json');
    console.log('Looking for file at:', filePath);
    
    const data = await fs.readFile(filePath, 'utf8');
    const loadedPieces = JSON.parse(data);
    
    if (loadedPieces && loadedPieces.length > 0) {
      pieces = loadedPieces;
      console.log(`Successfully loaded ${pieces.length} pieces from IMSLP data`);
      return pieces;
    } else {
      console.log('Loaded file was empty, using default pieces');
      return defaultPieces;
    }
  } catch (error) {
    console.error('Failed to load IMSLP pieces:', error);
    console.log('Using default pieces instead');
    return defaultPieces;
  }
}

async function refreshPieces() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'imslp_pieces.json'), 'utf8');
    pieces = JSON.parse(data);
    console.log(`Refreshed: loaded ${pieces.length} pieces from IMSLP data`);
    return true;
  } catch (error) {
    console.error('Failed to refresh pieces:', error);
    return false;
  }
}

function calculateAverageRatings(pieceId, users) {
    const ratings = {
        playing: [],
        listening: []
    };
    
    users.forEach(user => {
        const libraryEntry = user.library?.find(entry => entry.pieceId === pieceId);
        if (libraryEntry?.ratings) {
            if (libraryEntry.ratings.playing) ratings.playing.push(libraryEntry.ratings.playing);
            if (libraryEntry.ratings.listening) ratings.listening.push(libraryEntry.ratings.listening);
        }
    });

    return {
        playing: ratings.playing.length > 0 
            ? (ratings.playing.reduce((a, b) => a + b, 0) / ratings.playing.length).toFixed(1)
            : null,
        listening: ratings.listening.length > 0 
            ? (ratings.listening.reduce((a, b) => a + b, 0) / ratings.listening.length).toFixed(1)
            : null,
        totalRatings: {
            playing: ratings.playing.length,
            listening: ratings.listening.length
        }
    };
}

function getPieces() {
    return pieces;
}

function findPieceById(id) {
    return pieces.find(p => p.id === id);
}

module.exports = {
  loadPieces,
  getPieces,
  findPieceById,
  setPieces: (newPieces) => {
    pieces = newPieces;
  },
  refreshPieces,
  calculateAverageRatings,
  getPieceWithRatings: (pieceId, users) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return null;
    
    return {
        ...piece,
        averageRatings: calculateAverageRatings(pieceId, users)
    };
  }
};
