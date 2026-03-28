/* ═══════════════════════════════════════════
   CRAVE — script.js  |  Full Working Logic
═══════════════════════════════════════════ */

/* ─────────────────────────────────
   DATA
───────────────────────────────── */
const RESTAURANTS = [
  { id:1, name:'Pizzafire Co.',      emoji:'🍕', bg:'rh-1', category:'pizza',   rating:4.8, reviews:2300, time:22, deliveryFee:30,  promo:'20% OFF', tags:['Pizza','Italian','Wood-fired'],
    menu:[
      {id:101, name:'Truffle Margherita',  emoji:'🍕', price:420, bg:'di-1', rating:4.9, rev:1100},
      {id:102, name:'Pepperoni Feast',     emoji:'🍕', price:480, bg:'di-1', rating:4.8, rev:870},
      {id:103, name:'BBQ Chicken Pizza',   emoji:'🍕', price:510, bg:'di-1', rating:4.7, rev:650},
      {id:104, name:'Garlic Bread',        emoji:'🥖', price:120, bg:'di-7', rating:4.6, rev:430},
    ]},
  { id:2, name:'Sakura Sushi Bar',   emoji:'🍣', bg:'rh-2', category:'sushi',   rating:4.9, reviews:1700, time:35, deliveryFee:0,   promo:null,      tags:['Japanese','Sushi','Ramen'],
    menu:[
      {id:201, name:'Dragon Roll',         emoji:'🍣', price:680, bg:'di-2', rating:4.8, rev:924},
      {id:202, name:'Salmon Nigiri (8pc)', emoji:'🍣', price:550, bg:'di-2', rating:4.9, rev:760},
      {id:203, name:'Spicy Tuna Roll',     emoji:'🍣', price:620, bg:'di-2', rating:4.7, rev:510},
      {id:204, name:'Miso Ramen',          emoji:'🍜', price:380, bg:'di-3', rating:4.8, rev:680},
    ]},
  { id:3, name:'The Green Bowl',     emoji:'🥗', bg:'rh-3', category:'healthy', rating:4.5, reviews:890,  time:27, deliveryFee:50,  promo:'New',     tags:['Healthy','Vegan','Bowls'],
    menu:[
      {id:301, name:'Quinoa Power Bowl',   emoji:'🥗', price:320, bg:'di-3', rating:4.7, rev:612},
      {id:302, name:'Avocado Toast',       emoji:'🥑', price:220, bg:'di-6', rating:4.6, rev:480},
      {id:303, name:'Green Smoothie',      emoji:'🥤', price:180, bg:'di-6', rating:4.5, rev:320},
      {id:304, name:'Acai Bowl',           emoji:'🫐', price:290, bg:'di-3', rating:4.8, rev:410},
    ]},
  { id:4, name:'Grill Street',       emoji:'🍔', bg:'rh-6', category:'burger',  rating:4.7, reviews:3100, time:20, deliveryFee:30,  promo:'Free Fries',tags:['Burgers','American','Grills'],
    menu:[
      {id:401, name:'Smash Burger',        emoji:'🍔', price:370, bg:'di-4', rating:4.9, rev:2100},
      {id:402, name:'Double Patty',        emoji:'🍔', price:440, bg:'di-4', rating:4.8, rev:1560},
      {id:403, name:'Crispy Chicken',      emoji:'🍗', price:330, bg:'di-4', rating:4.7, rev:980},
      {id:404, name:'Loaded Fries',        emoji:'🍟', price:190, bg:'di-7', rating:4.6, rev:1200},
    ]},
  { id:5, name:'Noodle Republic',    emoji:'🍜', bg:'rh-4', category:'chinese', rating:4.6, reviews:1200, time:18, deliveryFee:0,   promo:null,      tags:['Chinese','Thai','Noodles'],
    menu:[
      {id:501, name:'Pad Thai',            emoji:'🍜', price:290, bg:'di-8', rating:4.7, rev:890},
      {id:502, name:'Kung Pao Chicken',    emoji:'🍛', price:320, bg:'di-7', rating:4.6, rev:670},
      {id:503, name:'Dumplings (8pc)',     emoji:'🥟', price:250, bg:'di-5', rating:4.8, rev:1100},
      {id:504, name:'Fried Rice',          emoji:'🍚', price:220, bg:'di-8', rating:4.5, rev:540},
    ]},
  { id:6, name:'Spice Garden',       emoji:'🍛', bg:'rh-5', category:'indian',  rating:4.8, reviews:4200, time:30, deliveryFee:20,  promo:'10% OFF', tags:['Indian','Curry','Tandoor'],
    menu:[
      {id:601, name:'Butter Chicken',      emoji:'🍛', price:350, bg:'di-4', rating:4.9, rev:3100},
      {id:602, name:'Paneer Tikka',        emoji:'🧀', price:280, bg:'di-1', rating:4.8, rev:1800},
      {id:603, name:'Dal Makhani',         emoji:'🍲', price:240, bg:'di-6', rating:4.7, rev:1400},
      {id:604, name:'Garlic Naan',         emoji:'🫓', price:60,  bg:'di-7', rating:4.6, rev:2200},
    ]},
];

const COUPONS = {
  'CRAVE10': 10,
  'FIRST20': 20,
  'SAVE50':  50,
  'FLAT30':  30,
};

/* ─────────────────────────────────
   STATE
───────────────────────────────── */
let cart = [];          // [{item, restaurantId, restaurantName, qty}]
let appliedCoupon = null;
let appliedDiscount = 0;
let activeFilter = 'all';
let currentOrder = null;
let riderDistances = [2.3,1.9,1.4,1.0,0.7,0.4,'📍'];
let riderIdx = 0;
let trackInterval = null;

/* ─────────────────────────────────
   INIT
───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderRestaurants(RESTAURANTS);
  renderFeaturedDishes();
  setupCartEvents();
  setupPaymentOptions();
  setupScrollReveal();
  setupHeaderScroll();
  simulateLiveTrackerStrip();
});

/* ─────────────────────────────────
   RENDER RESTAURANTS
───────────────────────────────── */
function renderRestaurants(list) {
  const grid = document.getElementById('restaurantGrid');
  if (!list.length) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1"><div>🔍</div><p>No restaurants found. Try a different search.</p></div>`;
    return;
  }
  grid.innerHTML = list.map((r, i) => `
    <div class="rest-card" style="transition-delay:${i*0.07}s" id="rc-${r.id}">
      <div class="rest-hero ${r.bg}">
        ${r.emoji}
        ${r.promo ? `<div class="rest-promo">${r.promo}</div>` : ''}
        <button class="rest-fav" id="fav-${r.id}" onclick="toggleFav(${r.id}, event)">♡</button>
      </div>
      <div class="rest-body">
        <div class="rest-name">${r.name}</div>
        <div class="rest-tags">${r.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <div class="rest-meta">
          <div class="meta-item"><span class="stars">★★★★${r.rating>=4.8?'★':'☆'}</span>&nbsp;<span class="rating-val">${r.rating}</span>&nbsp;<span style="color:var(--sand)">(${(r.reviews/1000).toFixed(1)}k)</span></div>
          <div class="meta-item">⏱ ${r.time} min</div>
          <div class="meta-item">🛵 ${r.deliveryFee===0?'Free':'₹'+r.deliveryFee}</div>
        </div>
        <button class="view-menu-btn" onclick="openMenu(${r.id})">View Menu & Order</button>
      </div>
    </div>
  `).join('');

  // trigger scroll reveal
  setTimeout(() => {
    document.querySelectorAll('.rest-card').forEach(c => c.classList.add('visible'));
  }, 100);
}

/* ─────────────────────────────────
   OPEN MENU (inline below card)
───────────────────────────────── */
function openMenu(restId) {
  const rest = RESTAURANTS.find(r => r.id === restId);
  if (!rest) return;

  // Remove any previously open menu panel
  document.querySelectorAll('.menu-panel').forEach(p => p.remove());
  document.querySelectorAll('.view-menu-btn').forEach(b => { b.textContent = 'View Menu & Order'; });

  const card = document.getElementById(`rc-${restId}`);
  const btn = card.querySelector('.view-menu-btn');
  btn.textContent = '▲ Close Menu';

  const panel = document.createElement('div');
  panel.className = 'menu-panel';
  panel.id = `menu-panel-${restId}`;
  panel.innerHTML = `
    <div class="menu-panel-header">
      <span class="menu-panel-title">${rest.emoji} ${rest.name} — Menu</span>
      <span class="menu-panel-sub">⏱ ${rest.time} min · 🛵 ${rest.deliveryFee===0?'Free Delivery':'₹'+rest.deliveryFee+' delivery'}</span>
    </div>
    <div class="menu-items-grid">
      ${rest.menu.map(item => `
        <div class="menu-item-card">
          <div class="mi-img ${item.bg}">${item.emoji}</div>
          <div class="mi-body">
            <div class="mi-name">${item.name}</div>
            <div class="mi-rating">⭐ ${item.rating} (${item.rev})</div>
            <div class="mi-footer">
              <div class="mi-price">₹${item.price}</div>
              <div class="mi-qty-row" id="mqr-${item.id}">
                ${getQtyWidget(item.id, restId, rest.name, item)}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Insert after the card's parent row — we'll just insert after the card in the grid
  card.after(panel);
  panel.style.opacity = '0';
  panel.style.transform = 'translateY(-10px)';
  requestAnimationFrame(() => {
    panel.style.transition = 'all .3s ease';
    panel.style.opacity = '1';
    panel.style.transform = 'translateY(0)';
  });
  panel.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function getQtyWidget(itemId, restId, restName, item) {
  const existing = cart.find(c => c.item.id === itemId);
  if (existing) {
    return `
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty(${itemId}, -1, ${restId}, '${restName}', event)">−</button>
        <span class="qty-num">${existing.qty}</span>
        <button class="qty-btn" onclick="changeQty(${itemId}, 1, ${restId}, '${restName}', event)">+</button>
      </div>`;
  }
  return `<button class="add-to-cart-btn" onclick="addToCart(${itemId}, ${restId}, '${restName}', event)">+ Add</button>`;
}

/* ─────────────────────────────────
   FEATURED DISHES
───────────────────────────────── */
function renderFeaturedDishes() {
  const featured = [];
  RESTAURANTS.forEach(r => { if (r.menu[0]) featured.push({...r.menu[0], restaurant:r.name, restId:r.id}); });
  // take first 8
  const top8 = featured.slice(0,8);

  document.getElementById('dishesGrid').innerHTML = top8.map((d, i) => `
    <div class="dish-card" style="transition-delay:${i*0.06}s">
      <div class="dish-img ${d.bg}">
        ${d.emoji}
        <button class="dish-add-btn" onclick="addToCartDirect(${d.id}, ${d.restId}, '${d.restaurant}', '${d.name}', ${d.price}, '${d.bg}', event)">+</button>
      </div>
      <div class="dish-body">
        <div class="dish-name">${d.name}</div>
        <div class="dish-from">${d.restaurant}</div>
        <div class="dish-footer">
          <div class="dish-price">₹${d.price}</div>
          <div class="dish-rating"><b>${d.rating}</b> ★ (${d.rev})</div>
        </div>
      </div>
    </div>
  `).join('');

  setTimeout(() => {
    document.querySelectorAll('.dish-card').forEach(c => c.classList.add('visible'));
  }, 200);
}

/* ─────────────────────────────────
   CART LOGIC
───────────────────────────────── */
function addToCart(itemId, restId, restName, e) {
  if (e) e.stopPropagation();
  const rest = RESTAURANTS.find(r => r.id === restId);
  const item = rest.menu.find(m => m.id === itemId);

  // Check if different restaurant
  if (cart.length && cart[0].restId !== restId) {
    if (!confirm(`Your cart has items from "${cart[0].restName}". Start a new cart from "${restName}"?`)) return;
    cart = [];
  }

  const existing = cart.find(c => c.item.id === itemId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ item, restId, restName, qty:1 });
  }

  updateCartUI();
  refreshMenuQtyWidget(itemId, restId, restName, item);
  showToast(`🛒 ${item.name} added to cart!`);
}

function addToCartDirect(itemId, restId, restName, name, price, bg, e) {
  if (e) e.stopPropagation();
  const rest = RESTAURANTS.find(r => r.id === restId);
  const item = rest ? rest.menu.find(m => m.id === itemId) : {id:itemId,name,price,emoji:'🍽',bg};

  if (cart.length && cart[0].restId !== restId) {
    if (!confirm(`Your cart has items from "${cart[0].restName}". Start a new cart from "${restName}"?`)) return;
    cart = [];
  }

  const existing = cart.find(c => c.item.id === itemId);
  if (existing) { existing.qty++; }
  else { cart.push({ item, restId, restName, qty:1 }); }

  updateCartUI();
  showToast(`🛒 ${name} added to cart!`);
}

function changeQty(itemId, delta, restId, restName, e) {
  if (e) e.stopPropagation();
  const rest = RESTAURANTS.find(r => r.id === restId);
  const item = rest.menu.find(m => m.id === itemId);
  const idx = cart.findIndex(c => c.item.id === itemId);

  if (idx === -1 && delta > 0) {
    cart.push({ item, restId, restName, qty:1 });
  } else if (idx !== -1) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
  }

  updateCartUI();
  refreshMenuQtyWidget(itemId, restId, restName, item);
}

function removeFromCart(itemId) {
  cart = cart.filter(c => c.item.id !== itemId);
  updateCartUI();
  refreshAllMenuWidgets();
  showToast('🗑 Item removed from cart');
}

function refreshMenuQtyWidget(itemId, restId, restName, item) {
  const container = document.getElementById(`mqr-${itemId}`);
  if (container) {
    container.innerHTML = getQtyWidget(itemId, restId, restName, item);
  }
}

function refreshAllMenuWidgets() {
  RESTAURANTS.forEach(r => {
    r.menu.forEach(item => {
      const c = document.getElementById(`mqr-${item.id}`);
      if (c) c.innerHTML = getQtyWidget(item.id, r.id, r.name, item);
    });
  });
}

/* ─────────────────────────────────
   UPDATE CART UI
───────────────────────────────── */
function updateCartUI() {
  const count = cart.reduce((s,c) => s+c.qty, 0);
  const badge = document.getElementById('cartCount');
  badge.textContent = count;
  badge.classList.remove('bounce');
  void badge.offsetWidth;
  badge.classList.add('bounce');

  const list = document.getElementById('cartItemsList');
  const empty = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');

  if (!cart.length) {
    empty.style.display = 'block';
    footer.style.display = 'none';
    list.innerHTML = '';
    list.appendChild(empty);
    return;
  }

  empty.style.display = 'none';
  footer.style.display = 'block';

  list.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-emoji ${c.item.bg||'di-1'}">${c.item.emoji}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${c.item.name}</div>
        <div class="cart-item-restaurant">${c.restName}</div>
        <div class="cart-item-price">₹${c.item.price * c.qty}</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQtyFromCart(${c.item.id}, -1)">−</button>
        <span class="qty-num">${c.qty}</span>
        <button class="qty-btn" onclick="changeQtyFromCart(${c.item.id}, 1)">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${c.item.id})" title="Remove">🗑</button>
    </div>
  `).join('');

  recalcTotals();
}

function changeQtyFromCart(itemId, delta) {
  const idx = cart.findIndex(c => c.item.id === itemId);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartUI();
  refreshAllMenuWidgets();
}

function recalcTotals() {
  const subtotal = cart.reduce((s,c) => s + c.item.price*c.qty, 0);
  const deliveryFee = cart.length && cart[0].restId ? (RESTAURANTS.find(r=>r.id===cart[0].restId)?.deliveryFee||30) : 30;
  const total = subtotal + deliveryFee - appliedDiscount;

  document.getElementById('summarySubtotal').textContent = '₹'+subtotal;
  document.getElementById('summaryDelivery').textContent = deliveryFee===0?'Free':'₹'+deliveryFee;
  document.getElementById('summaryTotal').textContent = '₹'+Math.max(0,total);

  const discRow = document.getElementById('discountRow');
  if (appliedDiscount > 0) {
    discRow.style.display = 'flex';
    document.getElementById('summaryDiscount').textContent = '-₹'+appliedDiscount;
  } else {
    discRow.style.display = 'none';
  }
}

/* ─────────────────────────────────
   COUPON
───────────────────────────────── */
function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim().toUpperCase();
  if (!code) { showToast('⚠️ Please enter a coupon code'); return; }
  if (COUPONS[code] !== undefined) {
    appliedDiscount = COUPONS[code];
    appliedCoupon = code;
    recalcTotals();
    showToast(`🎉 Coupon "${code}" applied! ₹${appliedDiscount} off`);
  } else {
    showToast('❌ Invalid coupon code. Try: CRAVE10, FIRST20, SAVE50');
  }
}

/* ─────────────────────────────────
   CART SIDEBAR OPEN/CLOSE
───────────────────────────────── */
function setupCartEvents() {
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  updateCartUI();
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────
   CHECKOUT
───────────────────────────────── */
function openCheckout() {
  if (!cart.length) { showToast('🛒 Add items to cart first!'); return; }
  closeCart();

  // Populate checkout summary
  const subtotal = cart.reduce((s,c) => s+c.item.price*c.qty, 0);
  const rest = RESTAURANTS.find(r=>r.id===cart[0].restId);
  const deliveryFee = rest?.deliveryFee||30;
  const total = subtotal + deliveryFee - appliedDiscount;

  document.getElementById('checkoutItemsList').innerHTML = cart.map(c => `
    <div class="co-item-row">
      <div>
        <div class="co-item-name">${c.item.name}</div>
        <div class="co-item-qty">x${c.qty}</div>
      </div>
      <div class="co-item-price">₹${c.item.price * c.qty}</div>
    </div>
  `).join('');

  document.getElementById('coSubtotal').textContent = '₹'+subtotal;
  document.getElementById('coDelivery').textContent = deliveryFee===0?'Free':'₹'+deliveryFee;
  document.getElementById('coTotal').textContent = '₹'+Math.max(0,total);

  const discRow = document.getElementById('coDiscRow');
  if (appliedDiscount > 0) {
    discRow.style.display = 'flex';
    document.getElementById('coDiscount').textContent = '-₹'+appliedDiscount;
  } else {
    discRow.style.display = 'none';
  }

  document.getElementById('checkoutModal').classList.add('open');
  document.getElementById('checkoutOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('open');
  document.getElementById('checkoutOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('checkoutOverlay').addEventListener('click', closeCheckout);

/* ─────────────────────────────────
   PAYMENT OPTIONS
───────────────────────────────── */
function setupPaymentOptions() {
  document.querySelectorAll('.payment-opt input[type=radio]').forEach(radio => {
    radio.addEventListener('change', function() {
      document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
      this.closest('.payment-opt').classList.add('selected');
      const cardFields = document.getElementById('cardFields');
      cardFields.style.display = this.value === 'card' ? 'block' : 'none';
    });
  });
}

function highlightPayment(label) {
  document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
  label.classList.add('selected');
  const val = label.querySelector('input').value;
  document.getElementById('cardFields').style.display = val === 'card' ? 'block' : 'none';
}

function formatCardNum(input) {
  let v = input.value.replace(/\D/g,'').substring(0,16);
  input.value = v.match(/.{1,4}/g)?.join(' ') || v;
}

/* ─────────────────────────────────
   PLACE ORDER
───────────────────────────────── */
function placeOrder() {
  const name = document.getElementById('contactName').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const address = document.getElementById('deliveryAddress').value.trim();

  if (!name) { showToast('⚠️ Please enter your name'); document.getElementById('contactName').focus(); return; }
  if (!phone) { showToast('⚠️ Please enter your phone number'); document.getElementById('contactPhone').focus(); return; }
  if (!address) { showToast('⚠️ Please enter a delivery address'); document.getElementById('deliveryAddress').focus(); return; }

  const orderId = 'CR-' + Math.floor(Math.random()*9000+1000);
  const subtotal = cart.reduce((s,c) => s+c.item.price*c.qty, 0);
  const rest = RESTAURANTS.find(r=>r.id===cart[0].restId);
  const deliveryFee = rest?.deliveryFee||30;
  const total = Math.max(0, subtotal + deliveryFee - appliedDiscount);

  currentOrder = {
    id: orderId,
    items: [...cart],
    subtotal, deliveryFee, total,
    restaurantName: rest?.name || cart[0].restName,
    address, name, phone,
    timestamp: new Date(),
  };

  // Save to order history
  const history = JSON.parse(localStorage.getItem('craveOrders')||'[]');
  history.unshift(currentOrder);
  localStorage.setItem('craveOrders', JSON.stringify(history.slice(0,10)));

  closeCheckout();

  document.getElementById('successOrderId').textContent = orderId;
  document.getElementById('successModal').classList.add('open');
  document.getElementById('successOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  // Clear cart
  cart = [];
  appliedCoupon = null;
  appliedDiscount = 0;
  updateCartUI();
  refreshAllMenuWidgets();
  document.querySelectorAll('.menu-panel').forEach(p => p.remove());
  document.querySelectorAll('.view-menu-btn').forEach(b => b.textContent = 'View Menu & Order');

  // Reset tracking
  riderIdx = 0;
  startTrackingSimulation();
}

document.getElementById('successOverlay').addEventListener('click', closeSuccess);
function closeSuccess() {
  document.getElementById('successModal').classList.remove('open');
  document.getElementById('successOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────
   LIVE TRACKING MODAL
───────────────────────────────── */
function openTracking() {
  if (currentOrder) {
    document.getElementById('trackOrderId').textContent = currentOrder.id;
    document.getElementById('trackRestaurantName').textContent = '🍽 ' + currentOrder.restaurantName;
    document.getElementById('noActiveOrder').style.display = 'none';
    document.getElementById('trackItemsBox').style.display = 'block';

    const now = new Date();
    document.getElementById('ts1').textContent = formatTime(now, 0);
    document.getElementById('ts2').textContent = formatTime(now, 3);

    document.getElementById('trackItemsList').innerHTML = currentOrder.items.map(c => `
      <div class="track-item-row"><span>${c.item.name} x${c.qty}</span><span>₹${c.item.price*c.qty}</span></div>
    `).join('');
    document.getElementById('trackTotal').textContent = '₹' + currentOrder.total;
  } else {
    document.getElementById('noActiveOrder').style.display = 'block';
    document.getElementById('trackItemsBox').style.display = 'none';
    document.getElementById('trackOrderId').textContent = '—';
    document.getElementById('trackRestaurantName').textContent = '';
  }

  document.getElementById('trackingModal').classList.add('open');
  document.getElementById('trackOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTracking() {
  document.getElementById('trackingModal').classList.remove('open');
  document.getElementById('trackOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('trackOverlay').addEventListener('click', closeTracking);

function formatTime(base, addMinutes) {
  const d = new Date(base.getTime() + addMinutes*60000);
  return d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
}

function startTrackingSimulation() {
  if (trackInterval) clearInterval(trackInterval);
  riderIdx = 0;
  trackInterval = setInterval(() => {
    if (riderIdx >= riderDistances.length) { clearInterval(trackInterval); return; }
    const dist = riderDistances[riderIdx];
    const eta = Math.max(1, 12 - riderIdx*2);
    const riderEl = document.getElementById('riderDist');
    const etaEl = document.getElementById('etaMin');
    if (riderEl) riderEl.textContent = dist;
    if (etaEl) etaEl.textContent = eta;
    riderIdx++;
  }, 5000);
}

/* ─────────────────────────────────
   LIVE TRACKER STRIP (bottom section)
───────────────────────────────── */
function simulateLiveTrackerStrip() {
  const dists = [2.3,1.9,1.4,1.0,0.7,0.4,'📍'];
  let idx = 0;
  setInterval(() => {
    if (idx >= dists.length) idx = 0;
    const riderEl = document.getElementById('liveRiderInfo');
    const etaEl = document.getElementById('liveEta');
    const eta = Math.max(1, 12 - idx*2);
    if (riderEl) riderEl.textContent = `Rahul is ${dists[idx]} km away`;
    if (etaEl) etaEl.textContent = `Est. ~${eta} min`;
    idx++;
  }, 4000);
}

/* ─────────────────────────────────
   FILTER BY CUISINE
───────────────────────────────── */
function filterCuisine(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');

  const filtered = cat === 'all'
    ? [...RESTAURANTS]
    : RESTAURANTS.filter(r => r.category === cat);

  applySortAndRender(filtered);
}

function applySortAndRender(list) {
  const sort = document.getElementById('sortSelect').value;
  let sorted = [...list];
  if (sort === 'rating') sorted.sort((a,b) => b.rating - a.rating);
  else if (sort === 'delivery') sorted.sort((a,b) => a.time - b.time);
  else if (sort === 'price-low') sorted.sort((a,b) => a.deliveryFee - b.deliveryFee);
  else if (sort === 'price-high') sorted.sort((a,b) => b.deliveryFee - a.deliveryFee);
  renderRestaurants(sorted);
}

function sortAndRender() {
  const filtered = activeFilter === 'all'
    ? [...RESTAURANTS]
    : RESTAURANTS.filter(r => r.category === activeFilter);
  applySortAndRender(filtered);
}

/* ─────────────────────────────────
   SEARCH
───────────────────────────────── */
function handleSearch() {
  const query = document.getElementById('cuisineInput').value.trim().toLowerCase();
  const loc = document.getElementById('locationInput').value.trim();

  if (!loc) { showToast('📍 Please enter a delivery address'); return; }
  if (!query) { sortAndRender(); scrollToRestaurants(); showToast('🔍 Showing all restaurants near ' + loc); return; }

  const filtered = RESTAURANTS.filter(r =>
    r.name.toLowerCase().includes(query) ||
    r.category.includes(query) ||
    r.tags.some(t => t.toLowerCase().includes(query)) ||
    r.menu.some(m => m.name.toLowerCase().includes(query))
  );

  renderRestaurants(filtered);
  scrollToRestaurants();
  showToast(filtered.length ? `🔍 ${filtered.length} result(s) for "${query}"` : `😕 No results for "${query}"`);
}

document.getElementById('locationInput').addEventListener('keydown', e => { if(e.key==='Enter') handleSearch(); });
document.getElementById('cuisineInput').addEventListener('keydown', e => { if(e.key==='Enter') handleSearch(); });

/* ─────────────────────────────────
   FAVOURITES
───────────────────────────────── */
function toggleFav(restId, e) {
  e.stopPropagation();
  const btn = document.getElementById(`fav-${restId}`);
  btn.classList.toggle('faved');
  btn.textContent = btn.classList.contains('faved') ? '❤' : '♡';
  showToast(btn.classList.contains('faved') ? '❤️ Added to favourites!' : '🤍 Removed from favourites');
}

/* ─────────────────────────────────
   SCROLL HELPERS
───────────────────────────────── */
function scrollToRestaurants() {
  document.getElementById('restaurantsSection').scrollIntoView({ behavior:'smooth' });
}
function scrollToCuisines() {
  document.getElementById('cuisineBar').scrollIntoView({ behavior:'smooth' });
}

/* ─────────────────────────────────
   SCROLL REVEAL
───────────────────────────────── */
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold:0.1 });

  document.querySelectorAll('.review-card, .step').forEach(el => observer.observe(el));
}

/* ─────────────────────────────────
   HEADER SCROLL SHADOW
───────────────────────────────── */
function setupHeaderScroll() {
  window.addEventListener('scroll', () => {
    document.getElementById('mainHeader').classList.toggle('scrolled', window.scrollY > 10);
  });
}

/* ─────────────────────────────────
   TOAST
───────────────────────────────── */
let toastTimer;
function showToast(msg, duration=2800) {
  const t = document.getElementById('toast');
  clearTimeout(toastTimer);
  t.textContent = msg;
  t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}
