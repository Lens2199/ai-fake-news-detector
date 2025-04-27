const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Log startup environment information
console.log('=== SERVER STARTUP ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`OpenAI API Key exists: ${!!process.env.OPENAI_API_KEY}`);
console.log(`OpenAI API Key length: ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0}`);

// Improved CORS configuration
app.use(cors({
  origin: ['https://lens2199.github.io', process.env.FRONTEND_URL || '*'],
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
  console.log('=== NEW ANALYSIS REQUEST ===');
  
  const { text } = req.body;
  console.log(`Request body received: ${text ? 'yes' : 'no'}`);
  console.log(`Text length: ${text ? text.length : 0} characters`);

  // Validate input
  if (!text || text.trim().length < 10) {
    console.log('❌ Request rejected: text too short');
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

    console.log(`Prompt prepared (${prompt.length} chars)`);
    
    // Try using gpt-3.5-turbo instead of gpt-4 for testing
    const model = "gpt-3.5-turbo";
    console.log(`🔄 Attempting OpenAI API call with model: ${model}`);
    
    try {
      console.log('⏳ Starting OpenAI API request...');
      const startTime = Date.now();
      
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 150,
      });
      
      const endTime = Date.now();
      console.log(`✅ OpenAI API request successful (${endTime - startTime}ms)`);
      
      if (completion && completion.choices && completion.choices.length > 0) {
        console.log('Response content received');
      } else {
        console.error('❌ Unexpected response structure:', JSON.stringify(completion));
      }

      // Parse and validate the response
      try {
        const content = completion.choices[0].message.content.trim();
        console.log(`Raw content from OpenAI: ${content}`);
        
        const result = JSON.parse(content);
        console.log(`Parsed result: ${JSON.stringify(result)}`);
        
        // Validate required fields
        if (!result.label || result.confidence === undefined) {
          console.error('❌ Invalid response format from AI - missing required fields');
          throw new Error('Invalid response format from AI model');
        }
        
        // Standardize the response
        const response = {
          label: result.label,
          confidence: result.confidence,
          reasoning: result.reasoning || 'No detailed reasoning provided'
        };
        
        console.log(`✅ Analysis successful: ${result.label} (${result.confidence * 100}% confidence)`);
        res.json(response);
      } catch (parseError) {
        console.error('❌ Failed to parse AI response:', parseError);
        console.error(`Raw content causing the parse error: ${completion.choices[0].message.content}`);
        res.status(500).json({ 
          error: 'Failed to process AI response',
          details: completion.choices[0].message.content 
        });
      }
    } catch (openaiError) {
      console.error('=== OPENAI API ERROR DETAILS ===');
      console.error(`Error name: ${openaiError.name}`);
      console.error(`Error message: ${openaiError.message}`);
      
      // Log detailed error information
      if (openaiError.response) {
        console.error('API Response Error:');
        console.error(`  Status: ${openaiError.response.status}`);
        console.error(`  Data: ${JSON.stringify(openaiError.response.data)}`);
        console.error(`  Headers: ${JSON.stringify(openaiError.response.headers)}`);
      } else if (openaiError.request) {
        console.error('No response received from API');
        console.error(`Request details: ${JSON.stringify(openaiError.request)}`);
      }
      
      // Check for common error types
      if (openaiError.message.includes('API key') || openaiError.message.includes('authentication')) {
        console.error('🔑 API KEY ERROR DETECTED');
        res.status(500).json({
          error: 'Failed to analyze article',
          message: 'OpenAI API key error. Please check your API key configuration.'
        });
      } else if (openaiError.message.includes('insufficient_quota') || openaiError.message.includes('exceeded')) {
        console.error('💸 QUOTA EXCEEDED ERROR DETECTED');
        res.status(500).json({
          error: 'Failed to analyze article',
          message: 'OpenAI API quota exceeded. Please check your usage limits.'
        });
      } else if (openaiError.message.includes('timeout') || openaiError.message.includes('ECONNRESET')) {
        console.error('⏱️ TIMEOUT ERROR DETECTED');
        res.status(500).json({
          error: 'Failed to analyze article',
          message: 'Connection timeout when calling OpenAI API.'
        });
      } else {
        console.error('General OpenAI error:', openaiError);
        res.status(500).json({
          error: 'Failed to analyze article',
          message: 'Connection error with OpenAI API.'
        });
      }
    }
  } catch (error) {
    console.error('=== GENERAL ERROR ===');
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
    
    res.status(500).json({ 
      error: 'Failed to analyze article',
      message: error.message || 'Unknown error occurred'
    });
  }
});

// Add test endpoint for troubleshooting deployment issues
app.post('/test', (req, res) => {
  console.log('=== TEST ENDPOINT ACCESSED ===');
  console.log('Request body:', req.body);
  
  // Return a mock response
  res.json({
    label: "Test",
    confidence: 1.0,
    reasoning: "This is a test response to verify deployment without OpenAI dependency"
  });
});

// Health check endpoint with detailed information
app.get('/', (req, res) => {
  console.log('Health check endpoint accessed');
  res.json({
    status: 'ok',
    message: 'Fake News Detector API is running',
    environment: process.env.NODE_ENV || 'development',
    openai_key_configured: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Add OPTIONS preflight handler
app.options('/analyze', cors());
app.options('/test', cors());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('=== UNHANDLED SERVER ERROR ===');
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 OpenAI API key configured: ${!!process.env.OPENAI_API_KEY}`);
});