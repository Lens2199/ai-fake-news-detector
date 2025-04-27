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

  // Use the production backend URL
  const apiUrl = process.env.REACT_APP_API_URL || 'https://ai-fake-news-detector-production.up.railway.app';

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Analyze text function
  const analyzeText = async () => {
    console.log("Button clicked, starting analysis");
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      console.log(`Attempting to fetch from: ${apiUrl}/analyze`);
      
      const response = await fetch(`${apiUrl}/analyze`, {
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

      const data = await response.json();
      console.log("Data received:", data);

      // Set result with all properties
      setResult({
        label: data.label,
        score: data.confidence,
        reasoning: data.reasoning || 'No reasoning provided'
      });
      
    } catch (error) {
      console.error('Error details:', error);
      setError(error.message || 'Failed to analyze article');
    } finally {
      setLoading(false);
    }
  };

  const getLabel = (label) => {
    if (label === 'Fake') return '❌ FAKE';
    if (label === 'Real') return '✅ REAL';
    return '🌀 UNKNOWN';
  };

  const getColor = (label) => {
    if (label === 'Fake') return 'border-red-400 text-red-500';
    if (label === 'Real') return 'border-green-400 text-green-500';
    return 'border-blue-400 text-blue-400';
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
        <p className="text-gray-400 text-center mb-8">Powered by OpenAI GPT</p>

        <div className="w-full mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your news article here..."
            rows="12"
            className="w-full bg-gray-800 border-2 border-purple-500 rounded-lg p-4 mb-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {text.length > 0 ? `${text.length} characters` : 'Enter some text to analyze'}
            </div>
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

            {(result.label === 'Real' || result.label === 'Fake') && (
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
                          result.label === 'Real' ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)',
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