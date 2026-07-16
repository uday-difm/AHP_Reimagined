This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment (Persistent Next.js Architecture)

This application is designed to run as a single persistent Next.js process (using `next start` or standard containerized deployments), NOT as serverless functions. 

**Key Requirements:**
- **In-Process Background Worker:** Both web request handling and background email job processing happen inside the same Next.js process (initialized via `instrumentation.js`).
- **Redis Requirement:** The app requires a reachable `REDIS_URL` for BullMQ queues and shared rate limiting.
- **Horizontal Scaling:** If you scale to multiple replicas, each replica safely runs its own BullMQ worker and shares the job queue via Redis, preventing duplicate email sends. Web and worker capacity scale together.

## Background Jobs & Redis

Redis is required for rate limiting and backing the BullMQ email queue.

### Local Development
To run Redis locally, start the included docker-compose configuration:
```bash
docker compose up -d redis
```
Then use the default `REDIS_URL=redis://localhost:6379` in your `.env`.

### Production Deployment
Production Redis needs persistence (AOF/appendonly) enabled by whoever provisions it. Ensure `REDIS_URL` is set in your environment.

### Email Worker
The email worker starts automatically in-process via `instrumentation.js` when you run `next start`. There is no separate process to run. You can confirm it's running by looking for the log line:
`[Startup] Email campaign worker started in-process.`
