import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [useTestEndpoint, setUseTestEndpoint] = useState(false);

  // Hardcoded fallback API URL in case environment variable isn't available
  const apiUrl = process.env.REACT_APP_API_URL || 'ai-fake-news-detector-production.up.railway.app';

  // Example news snippets for testing
  const examples = [
    {
      title: "Real News Example",
      text: "Scientists have discovered a new species of deep-sea coral off the coast of Japan. The findings, published in the journal Marine Biology, suggest the coral may have unique properties that could be beneficial for medical research."
    },
    {
      title: "Fake News Example",
      text: "BREAKING: Scientists shocked as man grows third arm after COVID vaccine! Doctors say this is just the beginning of strange side effects. Government officials REFUSE to comment on this developing situation."
    }
  ];

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Enhanced analyze function with debug logging
  const analyzeText = async () => {
    console.log("Button clicked, starting analysis");
    setLoading(true);
    setResult(null);
    setError(null);

    // Determine which endpoint to use
    const endpoint = useTestEndpoint ? 'test' : 'analyze';
    
    // Log the API URL being used
    console.log(`Using API URL: ${apiUrl}/${endpoint}`);
    
    try {
      console.log(`Attempting to fetch from: ${apiUrl}/${endpoint}`);
      
      const response = await fetch(`${apiUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      console.log("Fetch response received:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error(`HTTP ${response.status} - ${errorData}`);
      }

      const contentType = response.headers.get("content-type");
      console.log("Response content type:", contentType);
      
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", contentType);
        throw new Error("Response is not valid JSON");
      }

      const data = await response.json();
      console.log("Data received:", data);

      // Set result with all properties
      setResult({
        label: data.label,
        score: data.confidence,
        reasoning: data.reasoning || 'No reasoning provided'
      });
      
      console.log("Result set successfully");
    } catch (error) {
      console.error('Detailed error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      setError(error.message || 'Failed to analyze article');
    } finally {
      console.log("Analysis complete, loading set to false");
      setLoading(false);
    }
  };

  const getLabel = (label) => {
    if (label === 'Fake') return '❌ FAKE';
    if (label === 'Real') return '✅ REAL';
    if (label === 'Test') return '🧪 TEST';
    return '🌀 UNKNOWN';
  };

  const getColor = (label) => {
    if (label === 'Fake') return 'border-red-400 text-red-500';
    if (label === 'Real') return 'border-green-400 text-green-500';
    if (label === 'Test') return 'border-purple-400 text-purple-500';
    return 'border-blue-400 text-blue-400';
  };

  const loadExample = (example) => {
    setText(example.text);
  };

  const copyResult = () => {
    if (!result) return;
    
    const resultText = `
News Analysis Result:
Verdict: ${result.label} (${(result.score * 100).toFixed(2)}% confidence)
Reasoning: ${result.reasoning}
    `.trim();
    
    navigator.clipboard.writeText(resultText);
    setCopied(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 sm:px-8 py-10">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">🧠 AI Fake News Detector</h1>
        <p className="text-gray-400 text-center mb-8">Powered by OpenAI GPT-4</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your news article here..."
              rows="12"
              className="w-full bg-gray-800 border-2 border-purple-500 rounded-lg p-4 mb-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-400">
                {text.length > 0 ? `${text.length} characters` : 'Enter some text to analyze'}
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center mr-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useTestEndpoint}
                    onChange={(e) => setUseTestEndpoint(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">Use test endpoint</span>
                </label>
                <button
                  onClick={analyzeText}
                  disabled={loading || !text.trim() || text.trim().length < 10}
                  className={`bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 flex items-center gap-2 ${loading ? 'animate-pulse' : ''}`}
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                  {loading ? 'Analyzing...' : 'Check Article'}
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {useTestEndpoint ? '⚠️ Using test endpoint - will return mock data' : ''}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">📰 Example Texts</h2>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div key={index} className="cursor-pointer hover:bg-gray-700 p-2 rounded" onClick={() => loadExample(example)}>
                  <p className="font-medium text-purple-400">{example.title}</p>
                  <p className="text-sm text-gray-300 truncate">{example.text.substring(0, 60)}...</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className={`mt-6 p-6 rounded-xl shadow-lg w-full text-center border-2 bg-gray-800/80 ${getColor(result.label)}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">🧾 Analysis Result</h2>
              <button 
                onClick={copyResult}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            
            <p className={`text-3xl font-bold mt-2 ${getColor(result.label)}`}>
              {getLabel(result.label)}
            </p>
            
            <div className="relative w-full h-4 bg-gray-700 rounded-full my-4">
              <div
                className={`absolute top-0 left-0 h-4 rounded-full ${
                  result.label === 'Real'
                    ? 'bg-green-500'
                    : result.label === 'Fake'
                    ? 'bg-red-500'
                    : result.label === 'Test'
                    ? 'bg-purple-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${(result.score * 100).toFixed(0)}%` }}
              ></div>
            </div>
            
            <p className="text-gray-300 mb-4">
              Confidence: <span className="font-semibold">{typeof result.score === 'number' ? (result.score * 100).toFixed(2) : '0.00'}%</span>
            </p>

            {result.reasoning && (
              <div className="mt-2 p-4 bg-gray-700/50 rounded-lg text-left">
                <p className="text-sm font-semibold text-gray-300">AI Reasoning:</p>
                <p className="text-white">{result.reasoning}</p>
              </div>
            )}

            {(result.label === 'Real' || result.label === 'Fake' || result.label === 'Test') && (
              <div className="mt-6 mx-auto max-w-xs">
                <Pie
                  data={{
                    labels: ['Confidence', 'Uncertainty'],
                    datasets: [
                      {
                        data: [
                          result.score * 100,
                          100 - result.score * 100,
                        ],
                        backgroundColor: [
                          result.label === 'Real' 
                            ? 'rgba(34,197,94,0.7)' 
                            : result.label === 'Fake'
                            ? 'rgba(239,68,68,0.7)'
                            : 'rgba(168,85,247,0.7)',
                          'rgba(107,114,128,0.3)',
                        ],
                        borderColor: ['white', 'white'],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: {
                        labels: {
                          color: 'white',
                          font: {
                            size: 12
                          }
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-10 text-sm text-gray-500">
        <p>Built with ❤️ by Deo | <a href="https://github.com/Lens2199/ai-fake-news-detector" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">GitHub</a></p>
        <p className="mt-1 text-xs">This tool provides an AI-based assessment and is not a substitute for professional fact-checking</p>
      </footer>
    </div>
  );
}

export default App;