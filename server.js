const path = require('path');
const express = require('express');
const Stripe = require('stripe');

const app = express();
const PORT = process.env.PORT || 4173;
const domain = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('WARN: STRIPE_SECRET_KEY fehlt. Stripe Checkout Endpoint wird Fehler zurückgeben.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe ist nicht konfiguriert. Bitte STRIPE_SECRET_KEY setzen.' });
    }

    const { cart, minecraft, email } = req.body || {};
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Warenkorb ist leer.' });
    }

    const line_items = cart.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          metadata: { minecraft }
        },
        unit_amount: Math.round(Number(item.price) * 100)
      },
      quantity: Number(item.qty) || 1
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items,
      success_url: `${domain}/success.html`,
      cancel_url: `${domain}/checkout.html`,
      metadata: { minecraft }
    });

    return res.json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unbekannter Fehler.' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Nyvex Store läuft auf ${domain}`);
});
