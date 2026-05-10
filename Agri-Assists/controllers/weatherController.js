const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB7xSb4_0JXYncMLDk--3oDmXVgWYxOeAc';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Ask Gemini (with Google Search grounding) for real-time weather data.
 * Returns a structured weather object matching the frontend's expected format.
 */
async function fetchWeatherFromGemini(locationQuery) {
    const prompt = `Give me the current real-time weather for "${locationQuery}". 
Return ONLY a valid JSON object with NO markdown, NO code fences, NO explanation. Just the raw JSON.
Use this exact structure:
{
  "name": "City Name",
  "sys": { "country": "Country Code like IN, US etc" },
  "main": { "temp": temperature_in_celsius_number, "humidity": humidity_percentage_number },
  "weather": [{ "main": "One word like Clear/Clouds/Rain/Haze/Mist/Thunderstorm/Snow/Drizzle/Fog", "description": "short description" }],
  "wind": { "speed": wind_speed_in_meters_per_second_number }
}
Use real current data. All number values must be plain numbers, not strings.`;

    // Try with google_search grounding first for real-time data
    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 300
        }
    };

    let response;
    try {
        response = await axios.post(GEMINI_URL, requestBody, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });
    } catch (grErr) {
        // If grounding fails (quota/permissions), try without grounding
        console.log('[Weather] Grounding failed, trying without grounding:', grErr.response?.status || grErr.message);
        delete requestBody.tools;
        response = await axios.post(GEMINI_URL, requestBody, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });
    }

    // Find the text part in the response
    const parts = response.data?.candidates?.[0]?.content?.parts || [];
    let text = '';
    for (const p of parts) {
        if (p.text) { text = p.text; break; }
    }

    if (!text) throw new Error('No text response from Gemini');

    // Clean up response — remove markdown fences if present
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    cleaned = cleaned.trim();

    const weatherData = JSON.parse(cleaned);

    // Validate essential fields
    if (!weatherData.main || !weatherData.weather || !Array.isArray(weatherData.weather)) {
        throw new Error('Invalid weather data structure from Gemini');
    }

    // Ensure numeric types
    weatherData.main.temp = Number(weatherData.main.temp);
    weatherData.main.humidity = Number(weatherData.main.humidity);
    weatherData.wind = weatherData.wind || { speed: 0 };
    weatherData.wind.speed = Number(weatherData.wind.speed);

    return weatherData;
}

const getWeather = async (req, res) => {
    try {
        let { city, lat, lon } = req.query;

        // Build location query string
        let locationQuery = '';
        if (city) {
            locationQuery = city;
        } else if (lat && lon) {
            locationQuery = `latitude ${lat}, longitude ${lon}`;
        } else {
            return res.status(400).json({ success: false, message: 'Provide city name or lat/lon coordinates.' });
        }

        console.log(`[Weather] Fetching weather via Gemini for: ${locationQuery}`);
        const weatherData = await fetchWeatherFromGemini(locationQuery);
        console.log(`[Weather] Got: ${weatherData.name} — ${weatherData.main.temp}°C, ${weatherData.weather[0].main}`);

        res.json({ success: true, weather: weatherData });

    } catch (error) {
        console.error(`[Weather] Gemini API error: ${error.message}`);

        // Graceful fallback with mock data so the UI doesn't break
        const mockWeather = {
            name: req.query.city || 'Your Location',
            sys: { country: 'IN' },
            main: { temp: 28, humidity: 65 },
            weather: [{ main: 'Clear', description: 'clear sky' }],
            wind: { speed: 3.5 }
        };
        res.json({ success: true, weather: mockWeather, isMock: true });
    }
};

module.exports = { getWeather };
