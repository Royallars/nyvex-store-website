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
App läuft standardmäßig auf dem in `.env` gesetzten Port (aktuell `4262`).

## Entwicklung
```bash
npm run dev
```

## Stripe aktivieren (echte Zahlung)
Nutze direkt die vorhandene `.env` Datei (im Projekt-Root):
```env
HOST=0.0.0.0
PORT=4262
PUBLIC_URL=https://store.nyvex.org
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


## Pterodactyl (store.nyvex.org) Setup
- Startup command: `npm run start`
- Wichtig: Server muss auf der zugewiesenen Port-Variable laufen. Dieser Server nutzt `PORT` oder automatisch `SERVER_PORT`.
- Empfohlene Variablen:
  - `.env` verwenden mit `HOST=0.0.0.0` und `PORT=4262`
  - `PUBLIC_URL=https://store.nyvex.org`
  - `STRIPE_SECRET_KEY=...`
- Healthcheck testen:
  - `https://store.nyvex.org/api/health`
- Wenn Domain nicht erreichbar ist, prüfe im Panel Reverse Proxy / Allocation Mapping auf Port 4262.
