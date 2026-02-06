# Nyvex Network Store (nur Node.js + HTML)

Minecraft Shop für **Nyvex Network** (play.nyvex.org) als klassisches Node.js Deployment mit statischen HTML/CSS/JS Seiten.

## Stack
- Node.js Core HTTP Server (kein Express, kein Next.js)
- HTML + CSS + Vanilla JavaScript
- Stripe Checkout API (optional, per ENV aktiv)

## Seiten
- `index.html` – Startseite + Netzwerkbeschreibung
- `ranks.html` – Rang-Shop (Knight bis King)
- `coins.html` – Coins / Ingame-Geld
- `checkout.html` – Warenkorb + Checkout-Form
- `success.html` – Payment Erfolgsseite

## Lokal starten
```bash
npm install
npm run start
```
App läuft standardmäßig auf `http://localhost:4173`.

## Entwicklung
```bash
npm run dev
```

## Stripe aktivieren (echte Zahlung)
Lege eine `.env` Datei an:
```env
PORT=4173
PUBLIC_URL=http://localhost:4173
STRIPE_SECRET_KEY=sk_test_xxx
```

Dann über den Button **„Jetzt echt bezahlen“** im Checkout wird eine echte Stripe Session erzeugt.

## Docker Deployment (Node.js)
```bash
docker compose up --build
```
Danach ist der Shop auf `http://localhost:4173` erreichbar.

## Hinweise
- Komplette Laufzeit ist nur Node.js (kein Express, kein Next.js Build nötig).
- UI nutzt kontinuierliche CSS-Animationen (Hero, Grid, Cards, Icons, Rahmen).
- Healthcheck: `GET /api/health`
