import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/game.js';
import { initDb, sessionContext } from './db/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// Session Isolation & Cache Buster Middleware
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const sessionId = req.headers['x-session-id'] || req.query.session_id || 'default';
  sessionContext.run({ sessionId }, () => {
    next();
  });
});

// Routes
app.use('/api/game', gameRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

async function bootstrap() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 [LifeGraph Backend] Server is running on http://localhost:${PORT}`);
  });
}

bootstrap();
