// js/app.js — Optica Glasses Store

// ─── Config ────────────────────────────────────────────────────────
const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://localhost:3000/api`
  : '/api';

// ─── State ─────────────────────────────────────────────────────────
const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('optica-cart') || '[]'),
  activeFilter: 'all',
  currentProduct: null,
  selectedSize: null
};

// ─── DOM Cache ──────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ─── API Client ─────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    return await res.json();
  } catch (err) {
    console.warn('API error (using mock data):', err.message);
    return null;
  }
}

// ─── SVG Glass Illustrations ─────────────────────────────────────────
function glasssSVG(type = 'rect', size = 160, color = 'white') {
  const shapes = {
    rect: `<svg width="${size}" height="${Math.round(size*0.45)}" viewBox="0 0 160 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="16" width="60" height="40" rx="8" stroke="${color}" stroke-width="2.5" fill="none"/>
      <rect x="96" y="16" width="60" height="40" rx="8" stroke="${color}" stroke-width="2.5" fill="none"/>
      <line x1="64" y1="36" x2="96" y2="36" stroke="${color}" stroke-width="2.5"/>
      <line x1="0" y1="28" x2="4" y2="28" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="156" y1="28" x2="160" y2="28" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="12" y="24" width="44" height="26" rx="4" fill="${color}" fill-opacity="0.04"/>
      <rect x="104" y="24" width="44" height="26" rx="4" fill="${color}" fill-opacity="0.04"/>
    </svg>`,

    round: `<svg width="${size}" height="${Math.round(size*0.5)}" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="34" stroke="${color}" stroke-width="2.5" fill="none"/>
      <circle cx="120" cy="40" r="34" stroke="${color}" stroke-width="2.5" fill="none"/>
      <line x1="74" y1="40" x2="86" y2="40" stroke="${color}" stroke-width="2.5"/>
      <line x1="0" y1="32" x2="6" y2="32" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="154" y1="32" x2="160" y2="32" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="40" cy="40" r="26" fill="${color}" fill-opacity="0.04"/>
      <circle cx="120" cy="40" r="26" fill="${color}" fill-opacity="0.04"/>
    </svg>`,

    aviator: `<svg width="${size}" height="${Math.round(size*0.5)}" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20 Q30 12 64 36 Q64 60 34 64 Q4 64 4 40 Z" stroke="${color}" stroke-width="2.5" fill="none"/>
      <path d="M156 20 Q130 12 96 36 Q96 60 126 64 Q156 64 156 40 Z" stroke="${color}" stroke-width="2.5" fill="none"/>
      <line x1="64" y1="36" x2="96" y2="36" stroke="${color}" stroke-width="2"/>
      <line x1="0" y1="24" x2="4" y2="24" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="156" y1="24" x2="160" y2="24" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,

    cateye: `<svg width="${size}" height="${Math.round(size*0.45)}" viewBox="0 0 160 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 44 Q8 20 28 14 Q52 8 64 32 Q64 52 44 56 Q20 60 4 44 Z" stroke="${color}" stroke-width="2.5" fill="none"/>
      <path d="M156 44 Q152 20 132 14 Q108 8 96 32 Q96 52 116 56 Q140 60 156 44 Z" stroke="${color}" stroke-width="2.5" fill="none"/>
      <line x1="64" y1="36" x2="96" y2="36" stroke="${color}" stroke-width="2"/>
      <line x1="0" y1="38" x2="4" y2="40" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="156" y1="40" x2="160" y2="38" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,

    hexagon: `<svg width="${size}" height="${Math.round(size*0.5)}" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="18,20 46,10 66,20 66,52 46,62 18,52" stroke="${color}" stroke-width="2.5" fill="none"/>
      <polygon points="94,20 122,10 142,20 142,52 122,62 94,52" stroke="${color}" stroke-width="2.5" fill="none"/>
      <line x1="66" y1="36" x2="94" y2="36" stroke="${color}" stroke-width="2"/>
      <line x1="0" y1="30" x2="18" y2="30" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="142" y1="30" x2="160" y2="30" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,

    sport: `<svg width="${size}" height="${Math.round(size*0.4)}" viewBox="0 0 160 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 24 Q2 12 20 12 L72 14 Q80 24 80 24 Q80 24 88 14 L140 12 Q158 12 158 24 Q158 44 140 48 Q110 52 88 40 Q84 38 80 38 Q76 38 72 40 Q50 52 20 48 Q2 44 2 24 Z" stroke="${color}" stroke-width="2.5" fill="none"/>
      <line x1="0" y1="20" x2="2" y2="24" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="160" y1="20" x2="158" y2="24" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M20 20 L72 22 Q80 28 88 22 L140 20" stroke="${color}" stroke-width="1" stroke-dasharray="4 4" opacity="0.3"/>
    </svg>`
  };

  return shapes[type] || shapes.rect;
}

function getGlassShape(product) {
  const map = {
    'Rectangle': 'rect',
    'Round':     'round',
    'Aviator':   'aviator',
    'Cat-Eye':   'cateye',
    'Hexagon':   'hexagon',
    'Wrap':      'sport',
    'Square':    'rect'
  };
  return map[product.frameShape] || 'rect';
}

// ─── Custom Cursor ──────────────────────────────────────────────────
function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();
}

// ─── Navigation ─────────────────────────────────────────────────────
function initNav() {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ─── Scroll Reveal ──────────────────────────────────────────────────
function initReveal() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  $$('.reveal').forEach(el => observer.observe(el));
}

// ─── Render Products ────────────────────────────────────────────────
function renderProducts(products, containerId = 'products-grid') {
  const grid = $(containerId);
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 0;color:var(--grey-600)">
        <div style="font-family:var(--font-display);font-size:2rem;letter-spacing:0.1em;margin-bottom:12px">NO RESULTS</div>
        <p style="font-size:0.85rem">Try adjusting your filters</p>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card reveal" onclick="openProduct('${p.id}')">
      ${p.badge ? `<div class="product-badge badge-${p.badge.toLowerCase()}">${p.badge}</div>` : ''}
      <div class="product-img-wrapper">
        <div class="product-img-placeholder">
          ${glasssSVG(getGlassShape(p), 140, p.category === 'sunglasses' ? '#888' : 'white')}
        </div>
        <div class="product-actions">
          <button class="product-action-btn" onclick="event.stopPropagation();addToCart('${p.id}')" title="Add to Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </button>
          <button class="product-action-btn" onclick="event.stopPropagation();openProduct('${p.id}')" title="Quick View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.description}</div>
        <div class="product-footer">
          <div class="product-price">
            <span class="price-current">$${p.price.toFixed(2)}</span>
            ${p.originalPrice ? `<span class="price-original">$${p.originalPrice.toFixed(2)}</span>` : ''}
          </div>
          <div class="product-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${p.rating} (${p.reviews})
          </div>
        </div>
      </div>
    </div>
  `).join('');

  initReveal();
}

// ─── Product Modal ───────────────────────────────────────────────────
async function openProduct(id) {
  const overlay = $('modal-overlay');
  const product = state.products.find(p => p.id === id) || await apiFetch(`/products/${id}`);
  if (!product) return;

  state.currentProduct = product;
  state.selectedSize = product.sizes?.[1] || product.sizes?.[0] || 'Medium';

  const data = product.data || product;

  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <button class="modal-close" onclick="closeModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="modal-inner">
        <div class="modal-visual">
          ${glasssSVG(getGlassShape(data), 200, data.category === 'sunglasses' ? '#aaa' : 'white')}
        </div>
        <div class="modal-body">
          <div class="modal-category">${data.category} · ${data.frameShape}</div>
          <h3 class="modal-name">${data.name}</h3>
          <p class="modal-desc">${data.longDescription || data.description}</p>
          <div class="modal-price">$${data.price.toFixed(2)}</div>

          <div class="modal-spec-grid">
            <div class="modal-spec">
              <div class="modal-spec-key">Material</div>
              <div class="modal-spec-val">${data.material}</div>
            </div>
            <div class="modal-spec">
              <div class="modal-spec-key">Shape</div>
              <div class="modal-spec-val">${data.frameShape}</div>
            </div>
            <div class="modal-spec">
              <div class="modal-spec-key">Gender</div>
              <div class="modal-spec-val" style="text-transform:capitalize">${data.gender}</div>
            </div>
            <div class="modal-spec">
              <div class="modal-spec-key">Rating</div>
              <div class="modal-spec-val">★ ${data.rating} (${data.reviews} reviews)</div>
            </div>
          </div>

          ${data.sizes?.length ? `
          <div>
            <div class="modal-spec-key" style="margin-bottom:10px">Size</div>
            <div class="size-selector">
              ${data.sizes.map(s => `
                <button class="size-btn ${s === state.selectedSize ? 'active' : ''}"
                  onclick="selectSize(this, '${s}')">${s}</button>
              `).join('')}
            </div>
          </div>` : ''}

          <button class="btn btn-primary" onclick="addToCart('${data.id}');closeModal()" style="width:100%;justify-content:center">
            <span>Add to Cart</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function selectSize(btn, size) {
  $$('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.selectedSize = size;
}

// ─── Cart ───────────────────────────────────────────────────────────
function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(item =>
    item.id === productId && item.size === (state.selectedSize || 'Medium')
  );

  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      size: state.selectedSize || product.sizes?.[1] || 'Medium',
      category: product.category,
      frameShape: product.frameShape,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart`);
}

function removeFromCart(idx) {
  state.cart.splice(idx, 1);
  saveCart();
  updateCartUI();
  renderCart();
}

function saveCart() {
  localStorage.setItem('optica-cart', JSON.stringify(state.cart));
}

function updateCartUI() {
  const total = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const countEl = document.querySelector('.cart-count');
  if (countEl) {
    countEl.textContent = total;
    countEl.classList.toggle('visible', total > 0);
  }
}

function openCart() {
  $('cart-sidebar').classList.add('open');
  renderCart();
}

function closeCart() {
  $('cart-sidebar').classList.remove('open');
}

function renderCart() {
  const itemsEl = $('cart-items');
  const totalEl = $('cart-total-price');

  if (!state.cart.length) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <p style="font-size:0.85rem">Your cart is empty</p>
        <button class="btn btn-outline" onclick="closeCart()" style="margin-top:8px"><span>Browse Collection</span></button>
      </div>`;
  } else {
    itemsEl.innerHTML = state.cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-visual">
          ${glasssSVG(item.frameShape ? getGlassShape(item) : 'rect', 48, '#ccc')}
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">${item.category} · ${item.size} · Qty ${item.qty}</div>
        </div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <button class="cart-remove" onclick="removeFromCart(${idx})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

async function checkout() {
  if (!state.cart.length) { showToast('Add items to cart first'); return; }

  const order = {
    items: state.cart.map(i => ({
      productId: i.id,
      quantity: i.qty,
      size: i.size
    })),
    customer: { name: 'Guest Customer', email: 'guest@optica.com' },
    shipping: { address: '123 Vision St', city: 'New York', zip: '10001' }
  };

  const res = await apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(order)
  });

  if (res?.success) {
    showToast(`Order ${res.data.orderNumber} confirmed!`);
    state.cart = [];
    saveCart();
    updateCartUI();
    renderCart();
  } else {
    showToast('Order placed! (Demo mode)');
    state.cart = [];
    saveCart();
    updateCartUI();
    renderCart();
  }
}

// ─── Filters ─────────────────────────────────────────────────────────
function initFilters() {
  $$('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      const filtered = filter === 'all'
        ? state.products
        : state.products.filter(p => p.category === filter);
      renderProducts(filtered);
    });
  });
}

// ─── Search ──────────────────────────────────────────────────────────
function initSearch() {
  const input = $('search-input');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    const filtered = q
      ? state.products.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.tags || []).some(t => t.includes(q))
        )
      : state.products;
    renderProducts(filtered);
  });
}

// ─── Toast ───────────────────────────────────────────────────────────
function showToast(msg) {
  const container = document.querySelector('.toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ─── Stats ────────────────────────────────────────────────────────────
async function loadStats() {
  const res = await apiFetch('/stats');
  if (res?.success) {
    const { totalProducts, totalOrders, categories } = res.data;
    const statsMap = {
      'stat-products':   totalProducts,
      'stat-orders':     totalOrders,
      'stat-categories': categories,
      'stat-brands':     1
    };
    Object.entries(statsMap).forEach(([id, val]) => {
      const el = $(id);
      if (el) animateNumber(el, 0, val, 1500);
    });
  }
}

function animateNumber(el, from, to, duration) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * ease);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ─── Hero 3D SVG ─────────────────────────────────────────────────────
function renderHeroGlasses() {
  const container = document.querySelector('.glasses-3d');
  if (!container) return;

  container.innerHTML = `
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <!-- Shadow -->
      <ellipse cx="200" cy="370" rx="120" ry="16" fill="rgba(255,255,255,0.04)"/>

      <!-- Left lens -->
      <rect x="20" y="140" width="160" height="100" rx="20"
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.9)" stroke-width="3"/>
      <!-- Left lens inner reflection -->
      <path d="M 38 152 Q 70 148 100 158" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M 38 165 Q 60 162 80 168" stroke="rgba(255,255,255,0.15)" stroke-width="1" fill="none" stroke-linecap="round"/>

      <!-- Right lens -->
      <rect x="220" y="140" width="160" height="100" rx="20"
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.9)" stroke-width="3"/>
      <!-- Right lens inner reflection -->
      <path d="M 238 152 Q 270 148 300 158" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M 238 165 Q 260 162 280 168" stroke="rgba(255,255,255,0.15)" stroke-width="1" fill="none" stroke-linecap="round"/>

      <!-- Bridge -->
      <path d="M 180 185 Q 200 178 220 185" stroke="rgba(255,255,255,0.9)" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Left temple -->
      <path d="M 20 175 L -20 185" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Right temple -->
      <path d="M 380 175 L 420 185" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round"/>

      <!-- 3D depth lines -->
      <rect x="24" y="144" width="152" height="92" rx="17" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <rect x="224" y="144" width="152" height="92" rx="17" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

      <!-- Corner accent dots -->
      <circle cx="40" cy="152" r="2" fill="rgba(255,255,255,0.4)"/>
      <circle cx="260" cy="152" r="2" fill="rgba(255,255,255,0.4)"/>
    </svg>
  `;
}

// ─── Init ──────────────────────────────────────────────────────────
async function init() {
  initCursor();
  initNav();
  renderHeroGlasses();

  // Load products
  const res = await apiFetch('/products?limit=50');
  if (res?.success) {
    state.products = res.data;
  } else {
    // Fallback mock data if API not running
    state.products = MOCK_PRODUCTS;
  }

  renderProducts(state.products);
  renderProducts(state.products.filter(p => p.featured).slice(0, 4), 'featured-grid');

  initFilters();
  initSearch();
  updateCartUI();
  loadStats();

  showToast('click f11 for the full experience');

  setTimeout(initReveal, 100);
}

// ─── Fallback Mock Data ──────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id:'1', name:'Obsidian Frame', category:'eyeglasses', price:189.99, originalPrice:249.99, description:'Ultra-thin acetate frames with matte black finish. Featherlight yet architecturally bold.', longDescription:'The Obsidian Frame redefines what eyewear can be.', material:'Italian Acetate', frameShape:'Rectangle', gender:'unisex', sizes:['Small','Medium','Large'], stock:45, rating:4.8, reviews:124, badge:'Bestseller', featured:true, new:false, tags:['premium'] },
  { id:'2', name:'Glacier Aviator', category:'sunglasses', price:219.99, originalPrice:null, description:'Titanium aviators with polarized white-tinted lenses. A monument to refined minimalism.', longDescription:'Born from aerospace engineering.', material:'Titanium', frameShape:'Aviator', gender:'unisex', sizes:['Medium','Large'], stock:28, rating:4.9, reviews:87, badge:'New', featured:true, new:true, tags:['premium'] },
  { id:'3', name:'Phantom Round', category:'eyeglasses', price:159.99, originalPrice:199.99, description:'Perfect circles in black steel wire. Philosophical. Deliberate. Unmistakable.', longDescription:'The Phantom Round is geometry made wearable.', material:'Steel Wire', frameShape:'Round', gender:'unisex', sizes:['Small','Medium'], stock:62, rating:4.7, reviews:203, badge:'Sale', featured:true, new:false, tags:['wire'] },
  { id:'4', name:'Eclipse Cat-Eye', category:'eyeglasses', price:175.00, originalPrice:null, description:'Dramatic upswept angles in polished black acetate. Bold femininity meets architectural precision.', longDescription:'The Eclipse commands attention.', material:'Premium Acetate', frameShape:'Cat-Eye', gender:'women', sizes:['Small','Medium'], stock:33, rating:4.9, reviews:156, badge:null, featured:false, new:false, tags:['bold'] },
  { id:'5', name:'Monolith Square', category:'sunglasses', price:249.99, originalPrice:null, description:'Oversized black squares with mirror lenses. Architecture you wear. Statement you make.', longDescription:'A study in controlled excess.', material:'Acetate + Steel', frameShape:'Square', gender:'unisex', sizes:['One Size'], stock:19, rating:4.6, reviews:67, badge:'Limited', featured:true, new:false, tags:['statement'] },
  { id:'6', name:'Wireframe Classic', category:'eyeglasses', price:129.99, originalPrice:159.99, description:'Timeless rectangular wire frames. The foundation of every great wardrobe.', longDescription:'Some designs transcend trends.', material:'Stainless Steel', frameShape:'Rectangle', gender:'unisex', sizes:['Small','Medium','Large'], stock:94, rating:4.5, reviews:341, badge:'Sale', featured:false, new:false, tags:['classic'] },
  { id:'7', name:'Apex Sport', category:'sport', price:199.99, originalPrice:null, description:'Wraparound performance frames with polarized grey lenses. Built for motion.', longDescription:'Engineering for the human in motion.', material:'TR90 + Rubber', frameShape:'Wrap', gender:'unisex', sizes:['Medium','Large'], stock:41, rating:4.8, reviews:89, badge:null, featured:false, new:true, tags:['sport'] },
  { id:'8', name:'Ivory Hexagon', category:'eyeglasses', price:145.00, originalPrice:null, description:'Six-sided geometry in pale acetate. Geometry as self-expression.', longDescription:'The Ivory Hexagon defies the tyranny of circles.', material:'Bio-Acetate', frameShape:'Hexagon', gender:'unisex', sizes:['Small','Medium'], stock:27, rating:4.7, reviews:44, badge:'New', featured:false, new:true, tags:['geometric'] }
];

// ─── Global listeners ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

$('modal-overlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
