const MarketPrice = require('../models/MarketPrice');
const axios = require('axios');

const API_KEY = process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd0000016df988d6b46d41e858f0a5c1cf954ff1';

// ✅ Two resource IDs — try primary first, fallback to backup
const RESOURCE_IDS = [
    '9ef84268-d588-465a-a308-a864a43d0070', // primary
    '35985678-0d79-46b4-9ed6-6f13308a1d24', // backup (variety-wise)
];

/**
 * Build a data.gov.in mandi price URL manually using %5B %5D encoding
 * so that filter keys with spaces like "State Name" work correctly.
 * Resource 0 (primary) uses lowercase keys, Resource 1 (backup) uses PascalCase.
 */
function buildMarketUrl(resourceId, { state = '', district = '', commodity = '' } = {}) {
    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${API_KEY}&format=json&limit=100&offset=0`;
    const isPrimary = resourceId === RESOURCE_IDS[0];
    if (state) {
        const key = isPrimary ? 'state' : 'State';
        url += `&filters%5B${key}%5D=${encodeURIComponent(state)}`;
    }
    if (district) {
        const key = isPrimary ? 'district' : 'District';
        url += `&filters%5B${key}%5D=${encodeURIComponent(district)}`;
    }
    if (commodity) {
        const key = isPrimary ? 'commodity' : 'Commodity';
        url += `&filters%5B${key}%5D=${encodeURIComponent(commodity)}`;
    }
    return url;
}

/**
 * Fetch live records from data.gov.in, trying each resource ID in order.
 * Returns raw records array or [] if all fail.
 */
async function fetchLiveRecords(filters = {}) {
    for (const resourceId of RESOURCE_IDS) {
        try {
            const url = buildMarketUrl(resourceId, filters);
            console.log('Fetching market data from:', url);
            const response = await axios.get(url, { timeout: 10000 });
            const data = response.data;
            console.log(`Resource ${resourceId} — total: ${data.total}, records: ${data.records?.length}`);
            if (data.records && data.records.length > 0) {
                return data.records;
            }
        } catch (err) {
            console.warn(`Resource ID ${resourceId} failed:`, err.message);
        }
    }

    // Last-resort alive check (no filters)
    try {
        const testUrl = `https://api.data.gov.in/resource/${RESOURCE_IDS[0]}?api-key=${API_KEY}&format=json&limit=5`;
        const testRes = await axios.get(testUrl, { timeout: 8000 });
        console.log('API alive test response:', testRes.data);
    } catch (e) {
        console.error('API alive test also failed:', e.message);
    }

    return [];
}

/** Map raw API record to our frontend shape (handles both lowercase and PascalCase keys) */
function mapRecord(record) {
    return {
        crop:      record.commodity   || record.Commodity   || 'Unknown',
        city:     [record.market      || record.Market,
                   record.district    || record.District,
                   record.state       || record.State].filter(Boolean).join(', ') || 'Unknown',
        price:     parseInt(record.modal_price || record.Modal_Price) || 0,
        minPrice:  parseInt(record.min_price   || record.Min_Price)   || 0,
        maxPrice:  parseInt(record.max_price   || record.Max_Price)   || 0,
        updatedAt: record.arrival_date || record.Arrival_Date || new Date().toISOString(),
        state:     record.state        || record.State        || ''
    };
}

// ─── ROUTE: GET /api/market/prices  (existing route, search param) ─────────
const getMarketPrices = async (req, res) => {
    try {
        const searchInput = (req.query.search || '').trim();

        const knownStates = ['maharashtra', 'gujarat', 'punjab', 'haryana', 'rajasthan',
                             'uttar pradesh', 'madhya pradesh', 'karnataka', 'kerala',
                             'andhra pradesh', 'telangana', 'west bengal', 'bihar'];

        let state     = 'Maharashtra';
        let commodity = '';

        if (searchInput) {
            const lower = searchInput.toLowerCase();
            const matchedState = knownStates.find(s => lower.includes(s));
            if (matchedState) {
                state = matchedState.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            } else {
                commodity = searchInput; // treat as crop name
            }
        }

        const records = await fetchLiveRecords({ state: commodity ? '' : state, commodity });

        if (records.length > 0) {
            return res.json({ success: true, prices: records.map(mapRecord), source: 'live' });
        }

        // DB fallback
        let query = {};
        if (searchInput) {
            const regex = new RegExp(searchInput, 'i');
            query = { $or: [{ crop: regex }, { city: regex }] };
        }
        const prices = await MarketPrice.find(query).sort({ updatedAt: -1 }).limit(50);
        if (prices.length > 0) {
            return res.json({ success: true, prices, source: 'db' });
        }

        return res.json({ success: false, prices: [], message: 'No market data available.' });

    } catch (error) {
        console.error('getMarketPrices error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching market prices' });
    }
};

// ─── ROUTE: GET /api/market-prices  (new route, state/district/commodity) ──
const getMarketPricesDirect = async (req, res) => {
    try {
        const { state = '', district = '', commodity = '' } = req.query;

        // 🌾 If crop is specified → search nationwide (no state filter)
        // 📍 If only state/district → filter by location (default Maharashtra)
        const filters = {
            state:     commodity ? '' : (state || 'Maharashtra'),
            district,
            commodity
        };

        const records = await fetchLiveRecords(filters);

        if (records.length > 0) {
            return res.json({ success: true, prices: records.map(mapRecord), total: records.length, source: 'live' });
        }

        return res.json({ success: false, prices: [], message: 'No records found.' });

    } catch (error) {
        console.error('getMarketPricesDirect error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── Seed DB (utility) ──────────────────────────────────────────────────────
const seedMarketPrices = async (req, res) => {
    try {
        const crops  = ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Sugarcane', 'Onion', 'Potato', 'Tomato', 'Chilli', 'Brinjal'];
        const cities = ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Latur', 'Aurangabad'];
        await MarketPrice.deleteMany({});
        const data = [];
        for (const crop of crops) {
            for (const city of cities) {
                data.push({ crop, city, price: Math.floor(Math.random() * 5000) + 500 });
            }
        }
        await MarketPrice.insertMany(data);
        res.json({ success: true, message: 'Market prices seeded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error seeding data' });
    }
};

module.exports = { getMarketPrices, getMarketPricesDirect, seedMarketPrices };
