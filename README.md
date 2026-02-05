# Nyvex Network Store (Production-style)

Kompletter Next.js Shop für **play.nyvex.org** (Minecraft 1.21.x) mit 3D Hero, Stripe Checkout, Delivery Queue und Admin-Funktionen.

## Stack
- Next.js App Router + TypeScript + TailwindCSS
- React Three Fiber + postprocessing Bloom + framer-motion
- Prisma + PostgreSQL
- NextAuth (Credentials, Discord optional)
- Stripe Checkout + Webhooks
- Email via Resend oder Nodemailer
- Optional Redis cache (fallback in-memory)

## Core Features
- 3D animierte Landing Hero (reduced-motion fallback)
- Live server status widget + testimonials + FAQ/Guarantee
- Shop mit Kategorien, Suche, Filter, Sort, Produktdetail, Cart, Checkout
- Gift Orders, Promo/Creator Code Inputs, Upsell order bump
- Rank upgrade hint (difference pricing)
- Flash Deal Banner mit Countdown
- Loyalty Punkte (1€ = 10 Punkte)
- Daily Reward Claim + Streak + Delivery Job
- Season Pass basic missions/progress
- Delivery Pull/Ack API mit HMAC + replay protection (timestamp + nonce)
- Retry/Backoff + Logs + Discord Alerts bei Delivery-Fehlern
- Admin: products/commands editierbar, refund->revoke, monitoring, affiliate CSV export

## Commands (ohne führenden Slash)
- Ranks (LuckPerms):
  - `lp user {player} parent set knight`
  - `lp user {player} parent set lord`
  - `lp user {player} parent set paladin`
  - `lp user {player} parent set duke`
  - `lp user {player} parent set king`
- Coins:
  - `coins add {player} {amount}`
- Prison Tokens:
  - `prison tokens add {player} {amount}`
- Permissions:
  - `lp user {player} permission set essentials.fly true`
  - `lp user {player} permission set essentials.repair true`

## Setup lokal
1. `cp .env.example .env`
2. `npm install`
3. `npm run prisma:generate`
4. `npx prisma migrate dev --name init`
5. `npm run prisma:seed`
6. `npm run dev`

## Docker
```bash
docker-compose up --build
```

## Stripe Webhook lokal
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
`STRIPE_WEBHOOK_SECRET` in `.env` übernehmen.

## Delivery Plugin Spec
### Pull
- Endpoint: `POST /api/delivery/pull`
- Header: `x-nyvex-signature: <hex hmac sha256 over raw body>`
- Body:
```json
{ "limit": 10, "timestamp": 1710000000000, "nonce": "random-unique-id" }
```
- Response enthält commands, bereits mit `{player}` und `{amount}` ersetzt.

### Ack
- Endpoint: `POST /api/delivery/ack`
- Header: `x-nyvex-signature`
- Body:
```json
{ "jobId": "...", "success": true, "log": "optional", "timestamp": 1710000000000, "nonce": "random-unique-id" }
```

## Tests
- pricing calc
- upgrade proration calc
- HMAC verify
- webhook signature helper verify (HMAC based unit)

## Security
- Zod validation
- Stripe webhook signature verification
- HMAC + replay protection via timestamp/nonce
- rate limits checkout/gift/daily/delivery
- fraud blocklist (mc name / ip / uuid)
