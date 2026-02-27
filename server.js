const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const multer = require('multer');
const uploadDir = path.join(__dirname, 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Benzersiz dosya ismi oluştur
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, base + '-' + unique + ext);
  }
});
const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 5500;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const DATA_PATH = path.join(__dirname, 'data', 'content.json');

if (!ADMIN_TOKEN) {
  console.warn('[WARN] ADMIN_TOKEN missing in environment. Set it in .env');
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Cache heavy static assets (safe for uploaded images because filenames are unique)
app.use(
  '/images',
  express.static(path.join(__dirname, 'images'), {
    maxAge: '7d'
  })
);
app.use(
  '/audio',
  express.static(path.join(__dirname, 'audio'), {
    maxAge: '7d'
  })
);

// Railway (and most reverse proxies) forward https via headers
app.set('trust proxy', 1);

function getBaseUrl(req) {
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http')
    .toString()
    .split(',')[0]
    .trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '')
    .toString()
    .split(',')[0]
    .trim();
  return host ? `${proto}://${host}` : '';
}

function readContent() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeContent(payload) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(payload, null, 2), 'utf-8');
}

function authorize(req, res, next) {
  const header = req.headers.authorization || '';
  const raw = header.startsWith('Bearer ') ? header.slice(7) : null;

  // Support both plain tokens and encoded tokens sent as: b64.<base64url>
  const decodeToken = (val) => {
    if (!val) return null;
    if (val.startsWith('b64.')) {
      const b64url = val.slice(4);
      const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64 + '==='.slice((b64.length + 3) % 4);
      try {
        return Buffer.from(padded, 'base64').toString('utf8');
      } catch {
        return null;
      }
    }
    return val;
  };

  const token = decodeToken(raw);
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

app.get('/api/content', (req, res) => {
  try {
    const content = readContent();
    res.set('Cache-Control', 'no-store');
    res.json(content);
  } catch (error) {
    console.error('Error reading content', error);
    res.status(500).json({ message: 'Unable to load content' });
  }
});

// Health check (useful for Railway + debugging)
app.get('/health', (req, res) => {
  res.type('text/plain');
  res.set('Cache-Control', 'no-store');
  res.send('ok');
});

// Basic SEO endpoints
app.get('/robots.txt', (req, res) => {
  const base = getBaseUrl(req);
  res.type('text/plain');
  res.set('Cache-Control', 'no-store');
  res.send(
    [
      'User-agent: *',
      'Allow: /',
      base ? `Sitemap: ${base}/sitemap.xml` : 'Sitemap: /sitemap.xml'
    ].join('\n') + '\n'
  );
});

// Favicon (many browsers + Google request /favicon.ico explicitly)
app.get('/favicon.ico', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.type('image/png');
  res.sendFile(path.join(__dirname, 'images', 'piskin-logo.png'));
});

app.get('/sitemap.xml', (req, res) => {
  const base = getBaseUrl(req) || '';
  const urls = ['/'].map((p) => (base ? `${base}${p}` : p));

  res.type('application/xml');
  res.set('Cache-Control', 'no-store');
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map(
          (loc) =>
            `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
        )
        .join('\n') +
      `\n</urlset>\n`
  );
});
// Expose content to the frontend as a small JS payload (used for hero slideshow etc.)
app.get('/site-content.js', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.type('application/javascript');
  res.send('window.__SITE_CONTENT = ' + JSON.stringify(readContent()) + ';');
});

app.put('/api/content', authorize, (req, res) => {
  try {
    const payload = req.body;
    writeContent(payload);
    res.set('Cache-Control', 'no-store');
    res.json({ message: 'Content updated', content: payload });
  } catch (error) {
    console.error('Error writing content', error);
    res.status(500).json({ message: 'Unable to update content' });
  }
});

app.get('/admin', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Prevent stale caching of admin assets on mobile/hosted environments
app.get('/admin.js', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'admin.js'));
});

app.get('/admin.css', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'admin.css'));
});

app.use(express.static(path.join(__dirname)));

// Görsel yükleme endpointi
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Dosya yüklenemedi' });
  }
  // Yüklenen dosyanın yolunu döndür
  const filePath = 'images/' + req.file.filename;
  res.json({ filePath });
});

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
