// prompts.js - Create this file in your backend
const createAnalysisPrompt = (text) => {
    return `
  You are an expert fact-checker and misinformation analyst using a systematic framework to evaluate news content.
  
  ## Your Task:
  Analyze the following text to determine if it's likely REAL news or FAKE news.
  
  ## Evaluation Criteria:
  1. SOURCE CREDIBILITY:
     - Does it mention or cite established sources?
     - Are experts quoted with proper credentials?
  
  2. LANGUAGE ASSESSMENT:
     - Is it using sensationalist, emotional language?
     - Does it use excessive ALL CAPS, exclamation points, or clickbait techniques?
     - Does it use partisan or loaded terms designed to trigger emotional responses?
  
  3. FACTUAL INTEGRITY:
     - Are specific facts, figures, dates, and locations provided?
     - Can these details be potentially verified?
     - Are there internal inconsistencies or implausible claims?
  
  4. CONTEXTUALIZATION:
     - Is the story presented with appropriate context?
     - Does it acknowledge complexity rather than present oversimplified narratives?
  
  5. JOURNALISTIC STANDARDS:
     - Does it separate facts from opinions?
     - Does it present multiple perspectives on contested issues?
     - Does it show signs of having gone through editorial review?
  
  ## Content to Analyze:
  """
  ${text}
  """
  
  ## Instructions:
  1. You must classify this as either "Real" or "Fake" based on your analysis
  2. Provide a confidence score between 0-1 (e.g., 0.87)
  3. Include brief reasoning for your classification (1-3 sentences)
  4. Return ONLY a valid JSON object with the following structure:
  {
    "label": "Real" or "Fake",
    "confidence": [number between 0-1],
    "reasoning": "[your brief explanation]"
  }`;
  };
  
  module.exports = { createAnalysisPrompt };
  
  // Then in your main server file:
  const { createAnalysisPrompt } = require('./prompts');
  
  // And in your /analyze endpoint:
  const prompt = createAnalysisPrompt(text);