const path = require('path');
const express = require('express');
const Stripe = require('stripe');

const app = express();
const PORT = Number(process.env.PORT || 4173);
const DOMAIN = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
if (!stripe) {
  console.warn('[nyvex] STRIPE_SECRET_KEY fehlt: Checkout API antwortet mit Konfigurationsfehler, Frontend bleibt nutzbar.');
}

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname, { extensions: ['html'] }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'nyvex-store', stripeConfigured: Boolean(stripe) });
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe ist nicht konfiguriert. Bitte STRIPE_SECRET_KEY setzen.' });
    }

    const { cart, minecraft, email } = req.body || {};
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Warenkorb ist leer.' });
    }
    if (!minecraft || !email) {
      return res.status(400).json({ error: 'Minecraft-Name und E-Mail sind erforderlich.' });
    }

    const line_items = cart.map((item) => {
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

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items,
      payment_method_types: ['card'],
      success_url: `${DOMAIN}/success.html`,
      cancel_url: `${DOMAIN}/checkout.html`,
      metadata: { minecraft }
    });

    return res.json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Checkout konnte nicht erstellt werden.' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[nyvex] Store läuft auf ${DOMAIN}`);
});
