console.log("🆔 You are now running THIS exact file");


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

console.log("🚀 Backend server file loaded");

const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());

// ✅ TEMP TEST ROUTE to prove routing is working
app.get('/test123', (req, res) => {
    console.log("🧪 Hitting /test123 NOW!");
    res.send('💯 THIS IS THE REAL ROUTE!');
  });
// 🧠 Analysis route
app.post('/analyze', async (req, res) => {
  console.log("✅ /analyze route hit");

  const { text } = req.body;
  console.log("Text received:", text);

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/roberta-base-openai-detector',
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("Raw response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error analyzing:', error.response?.status, error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze article.' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Fake News Detector API is live!');
});

// 🚧 Catch-all route (must stay LAST)
app.use((req, res) => {
  console.log(`⚠️ Unknown route hit: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
