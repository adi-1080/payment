# Payment Processing System

A production-inspired payment processing backend built using Bun, Hono, MongoDB, Redis, and BullMQ.

This project simulates real-world payment gateway behavior including:

- Payment lifecycle management
- Queue-based asynchronous processing
- Retry handling
- Idempotency
- Concurrency control
- External gateway simulation
- Webhook handling
- Failure recovery
- Logging and observability

---

# Tech Stack

| Technology | Purpose |
|---|---|
| Bun | Runtime |
| Hono | Web framework |
| MongoDB | Database |
| Redis | Queue backend |
| BullMQ | Background job processing |
| Mongoose | MongoDB ODM |
| Zod | Validation |
| Pino | Logging |

---

# Features

## Payment Lifecycle

Supports payment states:

- `PENDING`
- `PROCESSING`
- `SUCCESS`
- `FAILED`

---

## Idempotency

Duplicate requests with the same `Idempotency-Key`
do not create duplicate payments.

Prevents:
- double charges
- duplicate transactions
- inconsistent states

---

## Queue-Based Processing

Payments are processed asynchronously using BullMQ.

Flow:

```txt
Client → API → Queue → Worker → Gateway
```

---

## Retry Logic

Gateway failures and timeouts are retried automatically.

Includes:
- retry counter
- failure recovery
- async retries

---

## Concurrency Control

Atomic MongoDB updates prevent multiple workers from processing the same payment simultaneously.

---

## External Gateway Simulation

Simulates:
- random success
- random failure
- timeouts
- delayed responses

to mimic real payment providers.

---

## Webhook Handling

Supports asynchronous callback processing.

Handles:
- duplicate callbacks
- conflicting updates
- delayed webhook events

---

# System Architecture

```txt
Client
   ↓
Payment API
   ↓
MongoDB
   ↓
BullMQ Queue
   ↓
Worker
   ↓
Gateway Simulator
   ↓
Webhook Handler
```

---

# Folder Structure

```txt
src/
│
├── config/
│   ├── db.ts
│   └── redis.ts
│
├── models/
│   └── payment.model.ts
│
├── queues/
│   ├── payment.queue.ts
│   └── payment.worker.ts
│
├── routes/
│   ├── payment.routes.ts
│   └── webhook.routes.ts
│
├── services/
│   ├── payment.service.ts
│   └── gateway.service.ts
│
├── utils/
│   └── logger.ts
│
├── app.ts
└── server.ts
```

---

# Installation Guide

---

# 1. Clone Repository

```bash
git clone <repository-url>

cd payment-gateway
```

---

# 2. Install Bun

Linux / macOS:

```bash
curl -fsSL https://bun.sh/install | bash
```

Verify installation:

```bash
bun --version
```

---

# 3. Install Docker

Install Docker:

https://docs.docker.com/engine/install/

Verify installation:

```bash
docker --version
docker compose version
```

---

# 4. Install Dependencies

```bash
bun install
```

---

# 5. Create Environment Variables

Create `.env`

```env
PORT=3000

MONGO_URI=mongodb://localhost:27018/payments

REDIS_HOST=localhost
REDIS_PORT=6379

MAX_RETRIES=3
```

---

# 6. Configure Docker Compose

Create `docker-compose.yml`

```yaml
services:

  mongo:
    image: mongo
    ports:
      - "27018:27017"

  redis:
    image: redis
    ports:
      - "6379:6379"
```

---

# 7. Start MongoDB & Redis

```bash
docker compose up
```

You should see:

```txt
mongo-1  | Waiting for connections
redis-1  | Ready to accept connections
```

---

# 8. Run API Server

Open new terminal:

```bash
bun run dev
```

Expected output:

```txt
MongoDB Connected
Server running on 3000
```

---

# 9. Run Worker

Open another terminal:

```bash
bun run worker
```

Expected output:

```txt
MongoDB Connected
```

Worker now continuously listens for payment jobs.

---

# API Documentation

Base URL:

```txt
http://localhost:3000
```

---

# 1. Create Payment

Creates a new payment.

---

## Endpoint

```http
POST /payments
```

---

## Headers

| Header | Required |
|---|---|
| Content-Type: application/json | Yes |
| Idempotency-Key | Yes |

---

## Request Body

```json
{
  "amount": 1000
}
```

---

## Example Request

```bash
curl -X POST http://localhost:3000/payments \
-H "Content-Type: application/json" \
-H "Idempotency-Key: payment-123" \
-d '{"amount":1000}'
```

---

## Example Response

```json
{
  "_id": "681cd9f95a0dc0dca33bdf72",
  "amount": 1000,
  "status": "PENDING",
  "idempotencyKey": "payment-123",
  "retryCount": 0,
  "createdAt": "2026-05-08T15:20:00.000Z",
  "updatedAt": "2026-05-08T15:20:00.000Z"
}
```

---

# 2. Get Payment Status

Fetches latest payment state.

---

## Endpoint

```http
GET /payments/:id
```

---

## Example Request

```bash
curl http://localhost:3000/payments/681cd9f95a0dc0dca33bdf72
```

---

## Example Response

```json
{
  "_id": "681cd9f95a0dc0dca33bdf72",
  "amount": 1000,
  "status": "SUCCESS",
  "retryCount": 1,
  "gatewayTransactionId": "txn_12345"
}
```

---

# 3. Webhook Callback

Simulates external gateway callbacks.

---

## Endpoint

```http
POST /webhook
```

---

## Request Body

```json
{
  "paymentId": "681cd9f95a0dc0dca33bdf72",
  "status": "SUCCESS"
}
```

---

## Example Request

```bash
curl -X POST http://localhost:3000/webhook \
-H "Content-Type: application/json" \
-d '{
  "paymentId":"681cd9f95a0dc0dca33bdf72",
  "status":"SUCCESS"
}'
```

---

## Example Response

```json
{
  "updated": true
}
```

---

# Payment Flow

---

# Step 1 — Client Creates Payment

```txt
POST /payments
```

Payment stored in MongoDB.

Initial state:

```txt
PENDING
```

---

# Step 2 — Queue Job Created

Payment job pushed into BullMQ queue.

---

# Step 3 — Worker Picks Job

Background worker starts processing payment.

State changes:

```txt
PENDING → PROCESSING
```

---

# Step 4 — Gateway Simulation

Gateway randomly:
- succeeds
- fails
- times out

---

# Step 5 — Retry Handling

On temporary failures:

```txt
PROCESSING → RETRY
```

Retries continue until max retries reached.

---

# Step 6 — Final State

Possible outcomes:

```txt
SUCCESS
```

OR

```txt
FAILED
```

---

# Idempotency Flow

If same request is retried:

```txt
same Idempotency-Key
```

existing payment is returned.

Duplicate payments are prevented.

---

# Logging

System logs:
- payment creation
- retries
- failures
- webhook events
- payment lifecycle events

---

# Scalability Considerations

This architecture supports:

- horizontal worker scaling
- distributed processing
- asynchronous workloads
- resilient retry systems

---

# Future Improvements

- exponential backoff retries
- circuit breaker pattern
- rate limiting
- dead-letter queues
- metrics dashboard
- OpenTelemetry tracing
- Kafka integration
- distributed locks
- Kubernetes deployment

---

# Testing Scenarios

- duplicate payment requests
- gateway timeouts
- retry handling
- concurrent processing
- duplicate webhooks
- conflicting updates

---

# Design Decisions

---

## Why Queue-Based Processing?

Avoids blocking API requests while payments process asynchronously.

---

## Why Redis + BullMQ?

Provides:
- reliable job queues
- retries
- concurrency handling
- scalable workers

---

## Why Idempotency?

Prevents duplicate transactions during:
- client retries
- network failures
- repeated requests

---

# Running the Entire System

---

# Terminal 1

```bash
docker compose up
```

---

# Terminal 2

```bash
bun run dev
```

---

# Terminal 3

```bash
bun run worker
```

---

# Example End-to-End Test

---

## Create Payment

```bash
curl -X POST http://localhost:3000/payments \
-H "Content-Type: application/json" \
-H "Idempotency-Key: demo-1" \
-d '{"amount":1000}'
```

Copy returned `_id`.

---

## Check Payment Status

```bash
curl http://localhost:3000/payments/<payment-id>
```

You may see:

```json
{
  "status": "SUCCESS"
}
```

OR

```json
{
  "status": "FAILED"
}
```

depending on simulated gateway result.

---

# Author

Aditya Gupta