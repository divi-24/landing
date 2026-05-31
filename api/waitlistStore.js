import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'dropp';
const collectionName = process.env.MONGODB_WAITLIST_COLLECTION || 'waitlist';

let clientPromise;

const getClient = () => {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  return clientPromise;
};

export const saveWaitlistEntry = async (payload = {}) => {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const role = String(payload.role || '').trim();
  const interest = String(payload.interest || '').trim();

  if (!name || !email || !role || !interest) {
    const error = new Error('Name, email, role, and interest are required');
    error.statusCode = 400;
    throw error;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error('Please enter a valid email address');
    error.statusCode = 400;
    throw error;
  }

  const client = await getClient();
  const collection = client.db(dbName).collection(collectionName);
  const now = new Date();

  const result = await collection.updateOne(
    { email },
    {
      $set: {
        name,
        email,
        role,
        interest,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
        source: 'landing_waitlist',
      },
    },
    { upsert: true }
  );

  return {
    success: true,
    id: result.upsertedId?.toString() || null,
    existing: result.matchedCount > 0,
  };
};
