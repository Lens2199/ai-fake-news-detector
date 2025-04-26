const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');  // <-- this is correct for OpenAI v4
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// ✅ Setup OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/analyze', async (req, res) => {
  const { text } = req.body;

  try {
    const prompt = `
You are an expert AI trained to detect fake news.
Respond with only JSON: {"label": "Real" or "Fake", "confidence": 0-1}.
"""${text}"""`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content.trim());
    res.json(result);
  } catch (error) {
    console.error('❌ Error analyzing:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze article.' });
  }
});

app.get('/', (req, res) => {
  res.send('Fake News Detector Backend is live!');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
