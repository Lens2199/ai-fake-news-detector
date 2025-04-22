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
      setResult(data[0]); // response is an array with Fake/Real labels
    } catch (error) {
      console.error('Error analyzing:', error);
      setResult({ label: 'error', score: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: 30 }}>
      <h1>🧠 AI Fake News Detector</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your news article here..."
        rows="10"
        cols="60"
        style={{ fontSize: 16 }}
      />
      <br />
      <button onClick={analyzeText} disabled={loading || !text.trim()}>
        {loading ? 'Analyzing...' : 'Check Article'}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>🧾 Result:</h2>
          <p>
            <strong>{result.label.toUpperCase()}</strong> <br />
            Confidence: {(result.score * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
