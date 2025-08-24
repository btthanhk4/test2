import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { MongoClient } from 'mongodb';
import Redis from 'ioredis';
import { Client as MinioClient } from 'minio';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

const {
  MONGO_URI,
  MONGO_DB,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_USE_SSL,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET,
  INTEGRATION_BASE_URL,
  PORT = 3000
} = process.env;

// --- MongoDB ---
let mongoClient, mongoDb;
async function initMongo() {
  mongoClient = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  await mongoClient.connect();
  mongoDb = mongoClient.db(MONGO_DB || 'los');
  console.log('[MongoDB] connected');
}

// --- Redis ---
let redis;
async function initRedis() {
  redis = new Redis({
    host: REDIS_HOST,
    port: Number(REDIS_PORT || 6379),
    password: REDIS_PASSWORD || undefined,
    lazyConnect: true
  });
  await redis.connect();
  console.log('[Redis] connected');
}

// --- MinIO ---
let minio;
async function initMinio() {
  minio = new MinioClient({
    endPoint: MINIO_ENDPOINT,
    port: Number(MINIO_PORT || 9000),
    useSSL: String(MINIO_USE_SSL).toLowerCase() === 'true',
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY
  });
  // Ensure bucket
  const exists = await minio.bucketExists(MINIO_BUCKET).catch(() => false);
  if (!exists) {
    await minio.makeBucket(MINIO_BUCKET, 'us-east-1');
    console.log('[MinIO] bucket created:', MINIO_BUCKET);
  } else {
    console.log('[MinIO] bucket exists:', MINIO_BUCKET);
  }
}

// --- Routes ---
app.get('/api/health', async (req, res) => {
  try {
    const mongoOk = await mongoDb.command({ ping: 1 });
    const redisOk = await redis.ping();
    res.json({ status: 'ok', mongo: mongoOk.ok === 1, redis: redisOk === 'PONG' });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

app.get('/api/mongo/count', async (req, res) => {
  const count = await mongoDb.collection('documents').countDocuments();
  res.json({ count });
});

app.post('/api/mongo/insert', async (req, res) => {
  const { doc } = req.body || {};
  const r = await mongoDb.collection('documents').insertOne({ ...doc, at: new Date() });
  res.json({ insertedId: r.insertedId });
});

app.get('/api/redis/incr/:key', async (req, res) => {
  const { key } = req.params;
  const val = await redis.incr(key);
  res.json({ key, value: val });
});

app.get('/api/minio/list', async (req, res) => {
  const stream = minio.listObjectsV2(MINIO_BUCKET, '', true);
  const files = [];
  stream.on('data', obj => files.push({ name: obj.name, size: obj.size, etag: obj.etag }));
  stream.on('end', () => res.json({ bucket: MINIO_BUCKET, files }));
  stream.on('error', err => res.status(500).json({ error: err.message }));
});

app.post('/api/minio/upload', async (req, res) => {
  const name = `hello-${Date.now()}.txt`;
  const content = Buffer.from('hello from backend');
  await minio.putObject(MINIO_BUCKET, name, content);
  res.json({ uploaded: name });
});

app.get('/api/integration/ping', async (req, res) => {
  const { data } = await axios.get(`${INTEGRATION_BASE_URL}/int/ping`);
  res.json({ integration: data });
});

// start server
async function start() {
  await initMongo();
  await initRedis();
  await initMinio();
  app.listen(PORT, () => console.log(`Backend listening on :${PORT}`));
}
start().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
