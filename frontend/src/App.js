import { useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeText = async () => {
    setLoading(true);
    setResult(null);
  
    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
  
      const data = await response.json();
      const predictions = Array.isArray(data) ? data.flat() : [];
      const bestResult = predictions.reduce(
        (prev, current) => (current.score > prev.score ? current : prev),
        { label: 'unknown', score: 0 }
      );
  
      setResult(bestResult);
    } catch (error) {
      console.error('Error analyzing:', error);
      setResult({ label: 'error', score: 0 });
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
    if (label === 'Fake') return 'border-red-400 text-red-600';
    if (label === 'Real') return 'border-green-400 text-green-600';
    return 'border-blue-400 text-blue-600';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-8 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6">🧠 AI Fake News Detector</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your news article here..."
        rows="10"
        className="w-full max-w-xl border-2 border-purple-400 rounded-lg p-4 mb-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <button
        onClick={analyzeText}
        disabled={loading || !text.trim()}
        className={`bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 flex items-center gap-2 ${loading ? 'animate-pulse' : ''}`}
      >
        {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
        {loading ? 'Analyzing...' : 'Check Article'}
      </button>

      {result && (
        <div className={`mt-6 p-6 rounded-xl shadow-lg max-w-md w-full text-center border-2 ${getColor(result.label)}`}>
          <h2 className="text-lg font-semibold">🧾 Result:</h2>
          <p className={`text-2xl font-bold mt-2 ${getColor(result.label)}`}>
            {getLabel(result.label)}
          </p>
          <div className="relative w-full h-2 bg-gray-200 rounded-full my-2">
            <div
              className={`absolute top-0 left-0 h-2 rounded-full ${
                result.label === 'Real'
                  ? 'bg-green-500'
                  : result.label === 'Fake'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${(result.score * 100).toFixed(0)}%` }}
            ></div>
          </div>
          <p className="text-gray-700">
            Confidence: {typeof result.score === 'number' ? (result.score * 100).toFixed(2) : '0.00'}%
          </p>
        </div>
      )}

      <footer className="mt-10 text-sm text-gray-400">Built with ❤️ by Deo</footer>
    </div>
  );
}

export default App;
