const express = require('express');
const connectDB = require('./database');
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);
app.disable("x-powered-by");

const isProd = process.env.NODE_ENV === "production";

const wsOrigin = isProd
  ? `wss://${process.env.RENDER_EXTERNAL_HOSTNAME || process.env.RENDER_EXTERNAL_HOSTNAME}`
  : "ws://localhost:5000";

const sessionSecret = process.env.SESSION_SECRET;
if (isProd && !sessionSecret) {
  throw new Error("SESSION_SECRET must be set in production");
}

// Connect to MongoDB
connectDB();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "object-src": ["'none'"],
      "frame-ancestors": ["'none'"],
      "form-action": ["'self'"],
      "frame-src": ["'none'"],

      "script-src": ["'self'"],
      "style-src": ["'self'"],

      "img-src": ["'self'", "data:"],
      "font-src": ["'self'", "data:"],
      "connect-src": ["'self'", wsOrigin],

      ...(isProd ? { "upgrade-insecure-requests": [] } : {}),
    },
  },
  crossOriginEmbedderPolicy: false,
}));

if (isProd) {
  app.use((req, res, next) => {
    const proto = req.headers["x-forwarded-proto"];
    if (proto && proto !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    next();
  });

  app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: false,
  }));
}

app.use(helmet.frameguard({ action: "deny" }));

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true);
    return cb(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(session({
  name: "hiresuite.sid",
  secret: sessionSecret || "dev-only-secret",
  resave: false,
  saveUninitialized: false,
  proxy: isProd,
  cookie: {
    secure: isProd,
    httpOnly: true,
    sameSite: "lax",
  },
}));

// Prevent caching of sensitive responses (auth/private APIs)
app.use((req, res, next) => {
  const isSensitive =
    req.path.startsWith("/auth") ||
    req.path.startsWith("/profile") ||
    req.path.startsWith("/apply") ||
    (req.path.startsWith("/job") && ["POST", "PUT", "DELETE"].includes(req.method));

  if (isSensitive) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  }

  next();
});

// Test route
app.get('/', (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.send('Backend is working!');
});

// Handle robots so it goes through Helmet
app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send("User-agent: *\nDisallow:");
});

// Handle favicon so it goes through Helmet
app.get("/favicon.ico", (req, res) => {
  res.status(204).end(); // No Content
});

// Serve sitemap so it goes through Helmet (and avoids a CSP-light 404 page)
app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`);
});

// Import routes
const authRoutes = require('../routes/authentication');
const profileRoutes = require('../routes/profile');
const jobRoutes = require('../routes/jobPost');
const applyRoutes = require('../routes/apply');

// Use routes with the base path
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/job', jobRoutes);
app.use('/apply', applyRoutes);

// Wrap Express app in HTTP server
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Websocket connected!');

  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket disconnected.');
  });
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));