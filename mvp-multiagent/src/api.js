require('dotenv').config();
const express = require('express');
const path = require('path');
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL);
const ideaQueue = new Queue('ideas', { connection });
const redis = connection; // reuse

const app = express();
app.use(express.json());
// Serve a small static UI for submitting ideas and viewing status
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/ideas', async (req, res) => {
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: 'missing idea' });
  const id = 'idea:' + uuidv4();
  await ideaQueue.add('idea', { idea }, { jobId: id });
  await redis.hset(`status:${id}`, 'state', 'queued', 'idea', idea, 'createdAt', Date.now());
  res.status(202).json({ id, message: 'Idea queued' });
});

app.get('/status/:id', async (req, res) => {
  const id = req.params.id;
  const data = await redis.hgetall(`status:${id}`);
  if (!data || Object.keys(data).length === 0) return res.status(404).json({ error: 'not found' });
  res.json(data);
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on ${port}`));
