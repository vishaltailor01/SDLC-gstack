require('dotenv').config();
const { Worker, Queue, QueueScheduler } = require('bullmq');
const IORedis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL);
const redis = connection;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Ensure schedulers run so delayed/retry works
new QueueScheduler('ideas', { connection });
new QueueScheduler('tasks', { connection });

const tasksQueue = new Queue('tasks', { connection });

// ideas worker: when an idea arrives, enqueue agent tasks
const ideasWorker = new Worker('ideas', async job => {
  console.log('ideasWorker:', job.id, job.name);
  if (job.name === 'idea') {
    const idea = job.data.idea;
    await redis.hset(`status:${job.id}`, 'state', 'planning');
    await tasksQueue.add('planner', { idea, parent: job.id }, { jobId: `${job.id}:planner` });
    console.log('enqueued planner for', job.id);
  }
}, { connection });

// tasks worker: simulate Planner -> Researcher -> Designer -> Engineer -> Integrator
const tasksWorker = new Worker('tasks', async job => {
  console.log('tasksWorker:', job.id, job.name);
  const parent = job.data.parent;
  if (job.name === 'planner') {
    await redis.hset(`status:${parent}`, 'planner_started', Date.now().toString());
    await sleep(1000 + Math.floor(Math.random() * 1500));
    await redis.hset(`status:${parent}`, 'planner_result', JSON.stringify([{ id: 't1', title: 'scaffold app' }]));
    await redis.hset(`status:${parent}`, 'state', 'researching');
    await tasksQueue.add('researcher', { idea: job.data.idea, parent }, { jobId: `${parent}:researcher` });
  } else if (job.name === 'researcher') {
    await redis.hset(`status:${parent}`, 'researcher_started', Date.now().toString());
    await sleep(800 + Math.floor(Math.random() * 1200));
    await redis.hset(`status:${parent}`, 'research_result', JSON.stringify({ competitors: ['X','Y'], notes: 'TAM looks reasonable' }));
    await redis.hset(`status:${parent}`, 'state', 'designing');
    await tasksQueue.add('designer', { idea: job.data.idea, parent }, { jobId: `${parent}:designer` });
  } else if (job.name === 'designer') {
    await redis.hset(`status:${parent}`, 'designer_started', Date.now().toString());
    await sleep(700 + Math.floor(Math.random() * 1000));
    await redis.hset(`status:${parent}`, 'design_result', 'mockups_created');
    await redis.hset(`status:${parent}`, 'state', 'engineering');
    await tasksQueue.add('engineer', { idea: job.data.idea, parent }, { jobId: `${parent}:engineer` });
  } else if (job.name === 'engineer') {
    await redis.hset(`status:${parent}`, 'engineer_started', Date.now().toString());
    await sleep(1500 + Math.floor(Math.random() * 2000));
    await redis.hset(`status:${parent}`, 'engineering_result', 'prototype_ready');
    await redis.hset(`status:${parent}`, 'state', 'deploying');
    await tasksQueue.add('integrator', { idea: job.data.idea, parent }, { jobId: `${parent}:integrator` });
  } else if (job.name === 'integrator') {
    await redis.hset(`status:${parent}`, 'integrator_started', Date.now().toString());
    await sleep(500 + Math.floor(Math.random() * 500));
    await redis.hset(`status:${parent}`, 'integrator_result', 'deployed_demo');
    await redis.hset(`status:${parent}`, 'state', 'done');
  }
}, { connection });

ideasWorker.on('completed', job => console.log('idea job completed', job.id));
tasksWorker.on('completed', job => console.log('task completed', job.id));

console.log('Worker process started');
