require('dotenv').config();
const axios = require('axios');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());
app.post('/analyze', async (req, res) => {
    const { text } = req.body;
  
    console.log("Token being used:", process.env.HUGGINGFACE_API_KEY);
  
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
      console.error('Error analyzing:', error.response?.status, error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to analyze article.' });
    }
  });
  
  
app.get('/', (req, res) => {
  res.send('Fake News Detector API is live!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
