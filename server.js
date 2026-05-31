import 'dotenv/config';
import express from 'express';
import { saveWaitlistEntry } from './api/waitlistStore.js';

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/waitlist', async (req, res) => {
  try {
    const result = await saveWaitlistEntry(req.body);
    res.json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: status === 500 ? 'Could not save waitlist entry' : error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
