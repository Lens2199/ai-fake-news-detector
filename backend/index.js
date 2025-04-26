const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/analyze', async (req, res) => {
  const { text } = req.body;

  try {
    const prompt = `
You are an expert AI trained to detect fake news. 
Respond with only JSON: {"label": "Real" or "Fake", "confidence": 0-1}
"""${text}"""`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.data.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze article.' });
  }
});

app.get('/', (req, res) => {
  res.send('Fake News Detector Backend is live!');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
