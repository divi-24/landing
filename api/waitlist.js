import { saveWaitlistEntry } from './waitlistStore.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const result = await saveWaitlistEntry(req.body);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: status === 500 ? 'Could not save waitlist entry' : error.message,
    });
  }
}
