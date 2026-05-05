const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const proxyRoutes = require('./routes/proxy');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
  : ['http://localhost:5173', 'http://localhost:5174', 'https://gravity-frontend-one.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/graphql', proxyRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const hasApiKey = !!process.env.GROQ_API_KEY;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      aiConnectivity: hasApiKey ? 'configured' : 'missing_api_key'
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  
  // Self-ping mechanism to prevent Render free-tier sleep
  const pingInterval = 14 * 60 * 1000; // 14 minutes
  setInterval(async () => {
    try {
      const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
      const response = await fetch(`${url}/api/health`);
      console.log(`[Self-Ping] Kept service awake. Status: ${response.status} at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('[Self-Ping Error] Failed to ping health endpoint:', error.message);
    }
  }, pingInterval);
});
