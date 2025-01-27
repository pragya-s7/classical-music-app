const axios = require('axios');

// IMSLP API requires a user agent
const IMSLP_API_URL = 'https://imslp.org/imslpapi.php';
const USER_AGENT = 'ClassicalMusicApp/1.0';

async function searchIMSLP(query) {
    try {
        const response = await axios.get(IMSLP_API_URL, {
            params: {
                type: 'search',
                query: query,
                ctxt: 'all',
                limit: 10,
                format: 'json'
            },
            headers: {
                'User-Agent': USER_AGENT
            }
        });

        // Transform IMSLP data to match our app's format
        const results = [];
        for (const [id, data] of Object.entries(response.data)) {
            if (id === '_searchTime') continue;

            const piece = {
                id: `imslp_${id}`,
                title: data.title || 'Unknown Title',
                composer: data.composer || 'Unknown Composer',
                difficulty: null, // IMSLP doesn't provide difficulty ratings
                imslp_link: `https://imslp.org/wiki/${id}`,
                imslp_id: id,
                type: data.type,
                completeness: data.completeness,
                parent: data.parent,
                // Add any additional IMSLP metadata we want to preserve
            };
            results.push(piece);
        }

        return results;
    } catch (error) {
        console.error('IMSLP API Error:', error);
        throw new Error('Failed to fetch from IMSLP');
    }
}

async function getPieceDetails(imslpId) {
    try {
        const response = await axios.get(IMSLP_API_URL, {
            params: {
                type: 'piece',
                id: imslpId,
                format: 'json'
            },
            headers: {
                'User-Agent': USER_AGENT
            }
        });

        const data = response.data;
        return {
            id: `imslp_${imslpId}`,
            title: data.title || 'Unknown Title',
            composer: data.composer || 'Unknown Composer',
            difficulty: null,
            imslp_link: `https://imslp.org/wiki/${imslpId}`,
            imslp_id: imslpId,
            details: {
                period: data.period,
                movements: data.movements,
                language: data.language,
                genres: data.genres,
                instruments: data.instruments,
                // Add other relevant IMSLP metadata
            }
        };
    } catch (error) {
        console.error('IMSLP API Error:', error);
        throw new Error('Failed to fetch piece details from IMSLP');
    }
}

module.exports = {
    searchIMSLP,
    getPieceDetails
}; 