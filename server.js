const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5500;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const DATA_PATH = path.join(__dirname, 'data', 'content.json');

if (!ADMIN_TOKEN) {
  console.warn('[WARN] ADMIN_TOKEN missing in environment. Set it in .env');
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function readContent() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeContent(payload) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(payload, null, 2), 'utf-8');
}

function authorize(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

app.get('/api/content', (req, res) => {
  try {
    const content = readContent();
    res.json(content);
  } catch (error) {
    console.error('Error reading content', error);
    res.status(500).json({ message: 'Unable to load content' });
  }
});

app.put('/api/content', authorize, (req, res) => {
  try {
    const payload = req.body;
    writeContent(payload);
    res.json({ message: 'Content updated', content: payload });
  } catch (error) {
    console.error('Error writing content', error);
    res.status(500).json({ message: 'Unable to update content' });
  }
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
  if (
    req.method !== 'GET' ||
    req.path.startsWith('/api') ||
    req.path === '/admin'
  ) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
