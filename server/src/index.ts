import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import messagesRoutes from './routes/messages.js';
import chatsRoutes from './routes/chats.js';
import appointmentsRoutes from './routes/appointments.js';
import availabilityRoutes from './routes/availability.js';
import ratingsRoutes from './routes/ratings.js';
import notificationsRoutes from './routes/notifications.js';
import documentsRoutes from './routes/documents.js';
import taxbotRoutes from './routes/taxbot.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/password', authLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'TaxTalk API running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/taxbot', taxbotRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`TaxTalk server running on http://localhost:${PORT}`);
});
