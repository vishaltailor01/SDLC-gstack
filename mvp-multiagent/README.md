# MVP Multi-Agent Workflow

Minimal Node + Redis (BullMQ) MVP demonstrating a multi-agent workflow:
- API accepts an idea and enqueues an `idea` job
- Worker orchestrates agent tasks: `planner`, `researcher`, `designer`, `engineer`, `integrator`
- Status stored in Redis for quick inspection

Quick start

1. Start Redis (docker-compose):

```bash
cd mvp-multiagent
docker-compose up -d
```

2. Install dependencies and run services (two terminals):

```bash
cd mvp-multiagent
npm install
npm run start   # API
npm run worker  # worker
```

3. Submit an idea:

```bash
curl -X POST http://localhost:3000/ideas \
  -H "Content-Type: application/json" \
  -d '{"idea":"Build a tiny multi-agent demo"}'
```

Response includes an `id`. Poll status:

```bash
curl http://localhost:3000/status/<id>
```

Run the simulator

1. Ensure services are running (Redis, API, worker).

```bash
# from mvp-multiagent
npm run simulate
# or pass an idea: node scripts/simulate.js "My idea text"
```

The simulator submits an idea and polls `/status/<id>` until the workflow reaches `done`.

What this shows

- Simple, extendable orchestration via Redis + BullMQ
- Workers modeled as agents that update a Redis status record
- Clear extension points to add human gates, retries, or richer event tracing

Next steps (pick one):
- Run the demo locally
- Add a web UI for status & logs
- Replace Redis with Redis Streams or Temporal for stronger orchestration
