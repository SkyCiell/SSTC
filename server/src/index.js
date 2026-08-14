import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './config/db.js';
import generateRoutes from './routes/generateRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers with large limit for image data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/generate', generateRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Screenshot-to-Code API',
    aiProvider: process.env.AI_PROVIDER || 'gemini',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Initialize database and start server (Pixel-Accurate UI Vision active with OpenRouter Provider sk-or-v1-52f5...)
async function startServer() {
  await initDb();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Screenshot-to-Code backend running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[Server Error] Port ${PORT} sudah digunakan oleh proses Node.js lain!`);
      console.error(`Cara Mengatasi:`);
      console.error(`1. Matikan proses Node.js sebelumnya di terminal lain, ATAU`);
      console.error(`2. Jalankan perintah ini di PowerShell untuk menutup proses tersebut:`);
      console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    } else {
      console.error('[Server Listen Error]:', err);
    }
  });
}

startServer();
