# Nyvex Network Store

Produktionsnahe Shop-Plattform für **play.nyvex.org** (Minecraft 1.21.x) mit Next.js + Prisma + Stripe.

## Features
- 3D Hero (React Three Fiber + Bloom) mit Neon Nyvex Vibe und Reduced-Motion-Fallback.
- Kategorien: Ränge, Coins, Tokens, Rechte.
- Produktsuche + Filter + Detailseite + Cart + Checkout.
- Stripe Checkout + Webhook (`checkout.session.completed`).
- Delivery Pull API mit HMAC-Auth und Retry/Backoff.
- Admin CRUD (Produkte, Commands), Orders/Delivery-Übersicht.
- Auth mit NextAuth Credentials (Discord optional vorbereitet).
- Produkticons als Minecraft-Style SVGs unter `/public/icons/products`.

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

## Stripe Webhook Test
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
`STRIPE_WEBHOOK_SECRET` aus CLI übernehmen.

## Delivery Pull Plugin Flow
- Plugin ruft `POST /api/delivery/pull` mit Header `x-nyvex-signature` (HMAC SHA256) auf.
- API liefert Commands mit `{player},{uuid},{amount}` kompiliert.
- Plugin bestätigt Status via `PATCH /api/delivery/pull`.

## Security
- Zod Validation bei Checkout.
- Stripe Signature Verify.
- HMAC Verify für Delivery Pull.
- Basic in-memory Rate Limit für Checkout.

## Tests
- `npm test` (pricing calc + hmac verify)
