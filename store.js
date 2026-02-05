const products = {
  ranks: [
    { id: 'knight', name: 'Knight', price: 4.99, desc: 'Basis-Rang mit Starter-Rechten.', perks: ['2 Homes', '/kit knight', 'Graues Prefix'] },
    { id: 'lord', name: 'Lord', price: 9.99, desc: 'Für aktive Spieler mit mehr Komfort.', perks: ['4 Homes', '/hat', 'Grünes Prefix'] },
    { id: 'paladin', name: 'Paladin', price: 14.99, desc: 'Starker Mid-Tier Rang mit Extras.', perks: ['/fly am Spawn', '6 Homes', 'Blaues Prefix'] },
    { id: 'duke', name: 'Duke', price: 24.99, desc: 'High-Tier mit starken Vorteilen.', perks: ['/ec + /workbench', '10 Homes', 'Goldenes Prefix'] },
    { id: 'king', name: 'King', price: 39.99, desc: 'Bester Rang auf Nyvex Network.', perks: ['/nick', '15 Homes', 'Cyan Prefix + Partikel'], featured: true }
  ],
  currencies: [
    { id: 'coins-1k', name: '1.000 Coins', price: 2.99, desc: 'Perfekt für kleine Crate-Öffnungen.' },
    { id: 'coins-5k', name: '5.000 Coins', price: 9.99, desc: 'Beliebtes Paket für Stammspieler.' },
    { id: 'cash-100k', name: '100.000$ Ingame', price: 4.49, desc: 'Boost für deine Economy-Basis.' },
    { id: 'cash-1m', name: '1.000.000$ Ingame', price: 14.99, desc: 'Direkt voll einsteigen auf allen Modi.' }
  ]
};

const cartKey = 'nyvex-cart-v3';

function euro(value) {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

function getCart() {
  return JSON.parse(localStorage.getItem(cartKey) || '[]');
}

function saveCart(items) {
  localStorage.setItem(cartKey, JSON.stringify(items));
  updateCartCount();
}

function addToCart(product) {
  const cart = getCart();
  const found = cart.find((item) => item.id === product.id);
  if (found) found.qty += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
}

function updateQty(id, delta) {
  const cart = getCart().map((item) => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  saveCart(cart);
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('#cartCount').forEach((el) => {
    el.textContent = count;
  });
}

function renderProducts(category, selector) {
  updateCartCount();
  const mount = document.querySelector(selector);
  if (!mount) return;

  mount.innerHTML = products[category]
    .map(
      (p) => `
      <article class="glass product-card minecraft-frame ${p.featured ? 'featured' : ''}">
        ${p.featured ? '<span class="tag">Best Value</span>' : ''}
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        ${p.perks ? `<ul>${p.perks.map((perk) => `<li>${perk}</li>`).join('')}</ul>` : ''}
        <p class="price">${euro(p.price)}</p>
        <button class="btn btn-primary" data-id="${p.id}" data-category="${category}">In den Warenkorb</button>
      </article>
    `
    )
    .join('');

  mount.querySelectorAll('button[data-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const categoryProducts = products[button.dataset.category];
      const product = categoryProducts.find((entry) => entry.id === button.dataset.id);
      addToCart(product);
      button.textContent = 'Hinzugefügt ✓';
      setTimeout(() => (button.textContent = 'In den Warenkorb'), 900);
    });
  });
}

async function startStripeCheckout(extraData) {
  const cart = getCart();
  if (!cart.length) throw new Error('Warenkorb ist leer.');

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart, ...extraData })
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Checkout konnte nicht gestartet werden.');
  window.location.href = payload.url;
}

function renderCheckout() {
  updateCartCount();
  const cartItems = document.querySelector('#cartItems');
  const cartTotal = document.querySelector('#cartTotal');
  const form = document.querySelector('#checkoutForm');
  const message = document.querySelector('#checkoutMessage');
  const payNowButton = document.querySelector('#payNowButton');
  if (!cartItems || !cartTotal || !form || !message || !payNowButton) return;

  function paint() {
    const cart = getCart();
    if (!cart.length) {
      cartItems.innerHTML = '<p class="empty">Dein Warenkorb ist leer. Gehe auf Ränge oder Coins & Cash.</p>';
      cartTotal.textContent = euro(0);
      return;
    }

    cartItems.innerHTML = cart
      .map(
        (item) => `
        <article class="cart-item">
          <div>
            <h4>${item.name}</h4>
            <p>${euro(item.price)} pro Stück</p>
          </div>
          <div class="qty-controls">
            <button data-action="minus" data-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button data-action="plus" data-id="${item.id}">+</button>
            <button class="remove" data-action="remove" data-id="${item.id}">x</button>
          </div>
          <strong>${euro(item.price * item.qty)}</strong>
        </article>
      `
      )
      .join('');

    cartItems.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const { action, id } = btn.dataset;
        if (action === 'plus') updateQty(id, 1);
        if (action === 'minus') updateQty(id, -1);
        if (action === 'remove') removeFromCart(id);
        paint();
      });
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartTotal.textContent = euro(total);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const cart = getCart();
    if (!cart.length) {
      message.textContent = 'Bitte lege zuerst Produkte in den Warenkorb.';
      return;
    }

    const data = new FormData(form);
    message.textContent = `Bestellung erstellt für ${data.get('minecraft')} (${data.get('email')}). Klicke jetzt auf "Jetzt echt bezahlen".`;
  });

  payNowButton.addEventListener('click', async () => {
    const cart = getCart();
    if (!cart.length) {
      message.textContent = 'Bitte lege zuerst Produkte in den Warenkorb.';
      return;
    }

    const data = new FormData(form);
    const minecraft = data.get('minecraft')?.trim();
    const email = data.get('email')?.trim();
    const payment = data.get('payment');

    if (!minecraft || !email || !payment) {
      message.textContent = 'Bitte fülle Name, E-Mail und Zahlungsart aus.';
      return;
    }

    if (payment !== 'stripe') {
      message.textContent = 'Aktuell ist echte Zahlung über Stripe aktiv. PayPal folgt.';
      return;
    }

    message.textContent = 'Stripe Checkout wird gestartet...';
    try {
      await startStripeCheckout({ minecraft, email, payment });
    } catch (error) {
      message.textContent = `Fehler: ${error.message}`;
    }
  });

  paint();
}

updateCartCount();
