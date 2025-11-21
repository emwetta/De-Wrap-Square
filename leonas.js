// --- SMART HAMBURGER MENU ---
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const closeBtn = document.querySelector(".mobile-close-btn");

// 1. Open/Close on Hamburger Click
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// 2. Close when clicking the "Close Menu X" button
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });
}

// 3. Close when clicking any link
document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
  hamburger.classList.remove("active");
  navMenu.classList.remove("active");
}));

// 4. CLOSE WHEN CLICKING OUTSIDE
document.addEventListener('click', (e) => {
  if (navMenu.classList.contains('active')) {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    }
  }
});

// --- HERO SLIDER ---
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;
function nextSlide() {
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
}
setInterval(nextSlide, 5000);

// --- AUTO SLIDE CONTACT INFO (Mobile) ---
function autoSlideContact() {
  const container = document.querySelector('.contact-info');
  // Only run on mobile where flex is active
  if (window.innerWidth <= 768 && container) {
    // Scroll width of one item + gap
    const scrollAmount = container.offsetWidth * 0.85 + 20;

    // If we are at the end, scroll back to start
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}
// Slide contact info every 4 seconds
setInterval(autoSlideContact, 4000);


// --- CUSTOM ALERT LOGIC ---
function showCustomAlert(title, message) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-message').innerText = message;
  document.getElementById('custom-alert').classList.add('active');
}

function closeAlert() {
  document.getElementById('custom-alert').classList.remove('active');
}

// --- CART LOGIC ---
let cart = [];

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const backdrop = document.getElementById('cart-backdrop');

  sidebar.classList.toggle('active');
  backdrop.classList.toggle('active');
}

function clearCart() {
  if (cart.length === 0) return;
  if (confirm("Are you sure you want to remove all items?")) {
    cart = [];
    updateCartUI();
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function addToCart(name, size, price) {
  const existingItem = cart.find(item => item.name === name && item.size === size);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, size, price, quantity: 1 });
  }
  updateCartUI();

  const sidebar = document.getElementById('cart-sidebar');
  const backdrop = document.getElementById('cart-backdrop');
  if (!sidebar.classList.contains('active')) {
    sidebar.classList.add('active');
    backdrop.classList.add('active');

    setTimeout(() => {
      if (sidebar.classList.contains('active')) {
        toggleCart();
      }
    }, 2500);
  }
}

function increaseQty(index) {
  cart[index].quantity += 1;
  updateCartUI();
}

function decreaseQty(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }
  updateCartUI();
}

function updateCartUI() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');

  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.innerText = totalQty;

  let totalPrice = 0;
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
  } else {
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      totalPrice += itemTotal;

      const itemDiv = document.createElement('div');
      itemDiv.classList.add('cart-item');
      itemDiv.innerHTML = `
        <span class="remove-btn" onclick="removeItem(${index})">×</span>
        <div class="item-info">
          <h5>${item.name} (${item.size})</h5>
          <small>₵${item.price} x ${item.quantity} = ₵${itemTotal}</small>
        </div>
        <div class="qty-controls">
          <span class="qty-btn" onclick="decreaseQty(${index})">-</span>
          <span>${item.quantity}</span>
          <span class="qty-btn" onclick="increaseQty(${index})">+</span>
        </div>
      `;
      cartItemsContainer.appendChild(itemDiv);
    });
  }

  cartTotal.innerText = '₵' + totalPrice;
}

function checkout() {
  if (cart.length === 0) {
    showCustomAlert("Cart Empty", "Please add some delicious items to your cart first!");
    return;
  }

  const customerName = document.getElementById('customer-name').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const isDelivery = document.getElementById('type-delivery').checked;
  const orderType = isDelivery ? "Delivery 🛵" : "Pick Up 🏃";
  const customerAddress = document.getElementById('customer-address').value;

  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!customerName || !nameRegex.test(customerName)) {
    showCustomAlert("Invalid Name", "Please enter a valid name (letters only).");
    return;
  }

  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(customerPhone)) {
    showCustomAlert("Invalid Phone", "Please enter a valid 10-digit Ghana phone number.");
    return;
  }

  if (isDelivery && customerAddress.trim() === "") {
    showCustomAlert("Location Needed", "Please enter your delivery location.");
    return;
  }

  const phoneNumber = "233543723772";

  let message = `*NEW ORDER - LEONA'S PIZZERIA* 🍕\n\n`;
  message += `👤 *Name:* ${customerName}\n`;
  message += `📞 *Phone:* ${customerPhone}\n`;
  message += `📦 *Type:* ${orderType}\n`;

  if (isDelivery) {
    message += `📍 *Location:* ${customerAddress}\n`;
  }

  message += `\n*📝 ORDER DETAILS:*\n`;

  let total = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    message += `- ${item.quantity}x ${item.size} ${item.name} (₵${itemTotal})\n`;
    total += itemTotal;
  });

  message += `\n💰 *TOTAL TO PAY: ₵${total}*`;

  if (isDelivery) {
    message += `\n_(Delivery fee will be added based on location)_`;
  }

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(url, '_blank');

  setTimeout(() => {
    cart = [];
    document.getElementById('customer-name').value = "";
    document.getElementById('customer-phone').value = "";
    document.getElementById('customer-address').value = "";
    updateCartUI();
    toggleCart();
  }, 1000);
}

// --- MENU FILTERING LOGIC ---
function filterMenu(category) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  const items = document.querySelectorAll('.pizza-card');
  items.forEach(item => {
    const itemCategory = item.getAttribute('data-category');
    if (category === 'all' || itemCategory === category) {
      item.style.display = 'flex';
      item.style.animation = 'fadeIn 0.5s ease';
    } else {
      item.style.display = 'none';
    }
  });
}

// --- OPEN/CLOSED LOGIC ---
function checkShopStatus() {
  const now = new Date();
  const hour = now.getHours();
  const badge = document.getElementById('status-badge');
  const text = document.getElementById('status-text');

  const isOpen = hour >= 10 && hour < 22;

  if (isOpen) {
    badge.classList.add('status-open');
    badge.classList.remove('status-closed');
    text.innerText = "Open Now - Taking Orders";
  } else {
    badge.classList.add('status-closed');
    badge.classList.remove('status-open');
    text.innerText = "Closed (Opens 10:00 AM)";
  }
}
checkShopStatus();
setInterval(checkShopStatus, 60000);

// --- TOGGLE ADDRESS FIELD ---
function toggleAddress(isDelivery) {
  const addressField = document.getElementById('address-field');
  if (isDelivery) {
    addressField.style.display = "block";
  } else {
    addressField.style.display = "none";
  }
}