const http = require('http');
const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 4173);
const PUBLIC_URL = process.env.PUBLIC_URL;

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
if (!stripe) {
  console.warn('[nyvex] STRIPE_SECRET_KEY fehlt: Checkout API antwortet mit Konfigurationsfehler, Frontend bleibt nutzbar.');
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8'
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Request body zu groß.'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Ungültiges JSON.'));
      }
    });

    req.on('error', reject);
  });
}

function safePathFromUrl(urlPathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPathname);
  } catch {
    return null;
  }

  const normalized = path.normalize(decoded).replace(/^([.]{2}[/\\])+/, '');
  const resolved = path.join(__dirname, normalized);
  if (!resolved.startsWith(__dirname)) return null;
  return resolved;
}

function getRequestPathname(req) {
  const [pathname] = (req.url || '/').split('?');
  return pathname || '/';
}

function getPublicBaseUrl(req) {
  if (PUBLIC_URL) return PUBLIC_URL.replace(/\/$/, '');
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || 'http';
  const host = req.headers.host || `localhost:${PORT}`;
  return `${protocol}://${host}`;
}

function sendFileResponse(req, res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    return res.end(req.method === 'HEAD' ? '' : content);
  });
}

function serveStatic(req, res, pathname) {
  const filePath = pathname === '/' ? path.join(__dirname, 'index.html') : safePathFromUrl(pathname);
  if (!filePath) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  let candidate = filePath;
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    candidate = path.join(candidate, 'index.html');
  }

  if (!path.extname(candidate)) {
    const htmlCandidate = `${candidate}.html`;
    if (fs.existsSync(htmlCandidate)) {
      candidate = htmlCandidate;
      return sendFileResponse(req, res, candidate);
    }

    return sendFileResponse(req, res, path.join(__dirname, 'index.html'));
  }

  return sendFileResponse(req, res, candidate);
}

async function handleCreateCheckoutSession(req, res) {
  if (!stripe) {
    return sendJson(res, 500, { error: 'Stripe ist nicht konfiguriert. Bitte STRIPE_SECRET_KEY setzen.' });
  }

  try {
    const { cart, minecraft, email } = await readJsonBody(req);

    if (!Array.isArray(cart) || cart.length === 0) {
      return sendJson(res, 400, { error: 'Warenkorb ist leer.' });
    }
    if (!minecraft || !email) {
      return sendJson(res, 400, { error: 'Minecraft-Name und E-Mail sind erforderlich.' });
    }

    const lineItems = cart.map((item) => {
      const unitAmount = Math.round(Number(item.price) * 100);
      const qty = Math.max(1, Number(item.qty) || 1);
      if (!item.name || Number.isNaN(unitAmount) || unitAmount <= 0) {
        throw new Error('Ungültiges Produkt im Warenkorb.');
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            metadata: { minecraft }
          },
          unit_amount: unitAmount
        },
        quantity: qty
      };
    });

    const baseUrl = getPublicBaseUrl(req);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: lineItems,
      payment_method_types: ['card'],
      success_url: `${baseUrl}/success.html`,
      cancel_url: `${baseUrl}/checkout.html`,
      metadata: { minecraft }
    });

    return sendJson(res, 200, { url: session.url });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Checkout konnte nicht erstellt werden.' });
  }
}

const server = http.createServer(async (req, res) => {
  const pathname = getRequestPathname(req);

  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, {
      ok: true,
      service: 'nyvex-store',
      stripeConfigured: Boolean(stripe),
      host: HOST,
      port: PORT
    });
  }

  if (req.method === 'POST' && pathname === '/api/create-checkout-session') {
    return handleCreateCheckoutSession(req, res);
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    return serveStatic(req, res, pathname);
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
});

server.listen(PORT, HOST, () => {
  const publicInfo = PUBLIC_URL || `http://${HOST}:${PORT}`;
  console.log(`[nyvex] Node.js Store läuft auf ${publicInfo}`);
});
