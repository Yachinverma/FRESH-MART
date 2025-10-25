// Product data for reference
const products = [
  { id: 1, type: 'fruits', name: 'Apple', price: 80, unit: '1 kg', image: 'https://via.placeholder.com/400x300?text=Apple' },
  { id: 2, type: 'fruits', name: 'Banana', price: 40, unit: '1 dozen', image: 'https://via.placeholder.com/400x300?text=Banana' },
  { id: 3, type: 'fruits', name: 'Mango', price: 150, unit: '1 kg', image: 'https://via.placeholder.com/400x300?text=Mango' },
  { id: 4, type: 'vegetables', name: 'Tomato', price: 30, unit: '1 kg', image: 'https://via.placeholder.com/400x300?text=Tomato' },
  { id: 5, type: 'vegetables', name: 'Potato', price: 25, unit: '1 kg', image: 'https://via.placeholder.com/400x300?text=Potato' },
  { id: 6, type: 'vegetables', name: 'Spinach', price: 20, unit: '250 g', image: 'https://via.placeholder.com/400x300?text=Spinach' }
];

const cart = {};

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Quantity controls for each product card
document.querySelectorAll('.product-card').forEach(card => {
  const minusBtn = card.querySelector('.qty-btn.minus');
  const plusBtn = card.querySelector('.qty-btn.plus');
  const qtyDisplay = card.querySelector('.qty-display');
  minusBtn.addEventListener('click', () => {
    let value = parseInt(qtyDisplay.textContent) - 1;
    value = Math.max(1, value);
    qtyDisplay.textContent = value;
  });
  plusBtn.addEventListener('click', () => {
    let value = parseInt(qtyDisplay.textContent) + 1;
    qtyDisplay.textContent = value;
  });
});

// Use localStorage for cart persistence
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function loadCart() {
  const data = localStorage.getItem('cart');
  if (data) {
    const parsed = JSON.parse(data);
    Object.keys(parsed).forEach(id => cart[id] = parsed[id]);
  }
}

// Add to cart logic
document.querySelectorAll('.product-card .add-to-cart').forEach(btn => {
  btn.addEventListener('click', function () {
    const card = this.closest('.product-card');
    const id = parseInt(card.getAttribute('data-id'));
    const qty = parseInt(card.querySelector('.qty-display').textContent);
    const product = products.find(p => p.id === id);
    if (!cart[id]) {
      cart[id] = { ...product, qty: 0 };
    }
    cart[id].qty += qty; // Add to existing quantity instead of overriding

    // Reset quantity display to 1
    const qtyDisplay = document.querySelector(`[data-id="${id}"] .qty-display`);
    if (qtyDisplay) qtyDisplay.textContent = "1";

    updateCartCount();
    saveCart();
    showToast(`${qty}x ${product.name} added to cart!`);
  });
});

// Update cart count on all pages
function updateCartCount() {
  const count = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

// On page load, load cart from storage and update count
document.addEventListener('DOMContentLoaded', function() {
  loadCart();
  updateCartCount();

  // Only render cart if on cart.html
  if (document.getElementById('cart-items')) {
    renderCart();
  }
});

function renderCart() {
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  const items = Object.values(cart);
  if (items.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item-left">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <div class="price-unit">
            <span class="price">₹${item.price}</span>
            <span class="unit">(${item.unit})</span>
          </div>
          <div class="cart-qty" data-id="${item.id}">
            <button class="cart-qty-btn minus">-</button>
            <span class="qty-value">${item.qty}</span>
            <button class="cart-qty-btn plus">+</button>
          </div>
        </div>
        <div class="cart-item-actions">
          <div class="item-subtotal">₹${item.price * item.qty}</div>
          <button class="remove-btn">Remove</button>
        </div>
      `;
      container.appendChild(el);
    });
  }
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  document.getElementById('total-amount').textContent = total;
  saveCart();
}

// Use event delegation for cart plus/minus and remove
document.addEventListener('DOMContentLoaded', function() {
  loadCart();
  updateCartCount();

  // Only render cart if on cart.html
  if (document.getElementById('cart-items')) {
    renderCart();

    document.getElementById('cart-items').addEventListener('click', function(e) {
      const parentCartQty = e.target.closest('.cart-qty');
      const parentCartItem = e.target.closest('.cart-item');
      if (e.target.classList.contains('cart-qty-btn')) {
        const id = parseInt(parentCartQty.getAttribute('data-id'));
        if (e.target.classList.contains('plus')) {
          cart[id].qty += 1;
          showToast(`Updated ${cart[id].name} quantity to ${cart[id].qty}`);
        } else if (e.target.classList.contains('minus')) {
          cart[id].qty -= 1;
          if (cart[id].qty <= 0) {
            showToast(`${cart[id].name} removed from cart!`, 'error');
            delete cart[id];
          } else {
            showToast(`Updated ${cart[id].name} quantity to ${cart[id].qty}`);
          }
        }
        updateCartCount();
        renderCart();
      }
      if (e.target.classList.contains('remove-btn')) {
        const name = parentCartItem.querySelector('h4').textContent;
        const id = Object.keys(cart).find(
          key => cart[key].name === name
        );
        if (id) {
          showToast(`${cart[id].name} removed from cart!`, 'error');
          delete cart[id];
          updateCartCount();
          renderCart();
        }
      }
    });
  }
});

// Modal controls
window.openCart = function() {
  document.getElementById('cart-modal').style.display = 'block';
  renderCart();
};
window.closeCart = function() {
  document.getElementById('cart-modal').style.display = 'none';
};

// Checkout logic (if needed)
window.proceedToCheckout = function() {
  closeCart();
  const checkout = document.getElementById('checkout-modal');
  if (checkout) checkout.style.display = 'block';
  const subtotalEl = document.getElementById('checkout-subtotal');
  if (subtotalEl) {
    const total = Object.values(cart).reduce((s, it) => s + it.price * it.qty, 0);
    subtotalEl.textContent = total;
    document.getElementById('checkout-total').textContent = total;
  }
};
window.closeCheckout = function() {
  const m = document.getElementById('checkout-modal');
  if (m) m.style.display = 'none';
};
window.closeConfirmation = function() {
  const m = document.getElementById('confirmation-modal');
  if (m) m.style.display = 'none';
};
window.placeOrder = function() {
  alert('Place order flow not implemented in this demo.');
};

// Filter buttons logic
document.querySelectorAll('.filter-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    const fruitsSection = document.getElementById('section-fruits');
    const vegSection = document.getElementById('section-vegetables');
    if (filter === 'fruits') {
      fruitsSection.style.display = '';
      vegSection.style.display = 'none';
    } else if (filter === 'vegetables') {
      fruitsSection.style.display = 'none';
      vegSection.style.display = '';
    } else {
      fruitsSection.style.display = '';
      vegSection.style.display = '';
    }
  });
});

// Default show all
document.getElementById('btn-all').click();