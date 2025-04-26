import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeText = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`HTTP ${response.status} - ${message}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not valid JSON");
      }

      const data = await response.json();

      // ✅ GPT-based response structure support
      if (Array.isArray(data) && data[0]?.label && data[0]?.confidence !== undefined) {
        setResult({ label: data[0].label, score: data[0].confidence });
      } else {
        setResult({ label: 'unknown', score: 0 });
      }      
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
    if (label === 'Fake') return 'border-red-400 text-red-500';
    if (label === 'Real') return 'border-green-400 text-green-500';
    return 'border-blue-400 text-blue-400';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 sm:px-8 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6">🧠 AI Fake News Detector</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your news article here..."
        rows="10"
        className="w-full max-w-xl bg-black border-2 border-purple-400 rounded-lg p-4 mb-4 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <button
        onClick={analyzeText}
        disabled={loading || !text.trim()}
        className={`bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 flex items-center gap-2 ${loading ? 'animate-pulse' : ''}`}
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
          <div className="relative w-full h-2 bg-gray-700 rounded-full my-2">
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
          <p className="text-gray-300">
            Confidence: {typeof result.score === 'number' ? (result.score * 100).toFixed(2) : '0.00'}%
          </p>

          {/* 🎯 Add pie chart */}
          {(result.label === 'Real' || result.label === 'Fake') && (
            <div className="mt-6">
              <Pie
                data={{
                  labels: ['Confidence', 'Remaining'],
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
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      )}

      <footer className="mt-10 text-sm text-gray-500">Built with ❤️ by Deo</footer>
    </div>
  );
}

export default App;
