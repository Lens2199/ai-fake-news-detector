const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Fake News Detector API is live!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
