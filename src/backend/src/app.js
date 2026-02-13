const express = require('express');
const connectDB = require('./database');
const mongoose = require("mongoose");
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

const externalHost = process.env.RENDER_EXTERNAL_HOSTNAME || `localhost:${PORT}`;
const wsOrigin = `${isProd ? "wss" : "ws"}://${externalHost}`;

const sessionSecret = process.env.SESSION_SECRET;
if (isProd && !sessionSecret) {
  throw new Error("SESSION_SECRET must be set in production");
}

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

// lightweight readiness check
app.get("/healthz", (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  if (!dbOk) return res.status(503).send("db not ready");
  res.status(200).send("ok");
});

const ONE_DAY = 60 * 60 * 24;

// Handle robots so it goes through Helmet
app.get("/robots.txt", (req, res) => {
  res.setHeader("Cache-Control", `public, max-age=${ONE_DAY}`);
  res.type("text/plain").send("User-agent: *\nDisallow:");
});

// Serve sitemap so it goes through Helmet
app.get("/sitemap.xml", (req, res) => {
  res.setHeader("Cache-Control", `public, max-age=${ONE_DAY}`);
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`);
});

// Handle favicon so it goes through Helmet
app.get("/favicon.ico", (req, res) => {
  res.setHeader("Cache-Control", `public, max-age=${ONE_DAY}`);
  res.status(204).end();
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

(async () => {
  try {
    await connectDB();
    server.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();