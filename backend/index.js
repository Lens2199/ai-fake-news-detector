const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Improved CORS configuration that explicitly includes Vercel domain
app.use(cors({
  origin: ['https://ai-fake-news-detector.vercel.app', process.env.FRONTEND_URL || '*'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' })); // Limit request size

// Setup OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/analyze', async (req, res) => {
  const { text } = req.body;

  // Validate input
  if (!text || text.trim().length < 10) {
    return res.status(400).json({ 
      error: 'Please provide a longer text to analyze (minimum 10 characters).' 
    });
  }

  try {
    // Enhanced prompt for better analysis
    const prompt = `
You are an expert fact-checker trained to detect fake news with high accuracy.
Analyze the following news article or claim.

Focus on these indicators of fake news:
1. Source credibility
2. Clickbait-style headlines
3. Emotional language
4. Lack of cited sources
5. Inconsistencies or factual errors
6. Implausible claims

Based on your analysis, classify this as:
- "Real" if it appears factual and credible
- "Fake" if it shows multiple signs of being false or misleading

Return ONLY a JSON object with:
1. "label": "Real" or "Fake"
2. "confidence": number between 0-1 (your confidence level)
3. "reasoning": brief explanation (1-2 sentences)

Text to analyze:
"""
${text}
"""`;

    // Call OpenAI with caching and rate limiting
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2, // Keep low temperature for more consistent results
      max_tokens: 150,  // Limit response size
    });

    // Parse and validate the response
    try {
      const result = JSON.parse(completion.choices[0].message.content.trim());
      
      // Validate required fields
      if (!result.label || result.confidence === undefined) {
        throw new Error('Invalid response format from AI model');
      }
      
      // Standardize the response
      const response = {
        label: result.label,
        confidence: result.confidence,
        reasoning: result.reasoning || 'No detailed reasoning provided'
      };
      
      // Log successful analysis
      console.log(`Analysis complete: ${result.label} with ${result.confidence} confidence`);
      
      res.json(response);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      res.status(500).json({ 
        error: 'Failed to process AI response',
        details: completion.choices[0].message.content 
      });
    }
  } catch (error) {
    console.error('❌ Error analyzing:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error?.message || 
                         error.message || 
                         'Unknown error occurred';
    
    res.status(500).json({ 
      error: 'Failed to analyze article',
      message: errorMessage
    });
  }
});

// Add OPTIONS preflight handler
app.options('/analyze', cors());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Fake News Detector API is running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});