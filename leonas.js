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

// 4. CLOSE WHEN CLICKING OUTSIDE (The "Magic" Fix)
document.addEventListener('click', (e) => {
  // If the menu is open...
  if (navMenu.classList.contains('active')) {
    // And the click was NOT on the menu, and NOT on the hamburger...
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      // Close it!
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

  // Open sidebar
  const sidebar = document.getElementById('cart-sidebar');
  const backdrop = document.getElementById('cart-backdrop');
  if (!sidebar.classList.contains('active')) {
    sidebar.classList.add('active');
    backdrop.classList.add('active');

    // AUTO CLOSE LOGIC (Close after 2.5 seconds)
    setTimeout(() => {
      // Only close if it's still open
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
      // Added the "X" remove-btn here at the start
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

  // 1. Validate Name (Letters & Spaces only)
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(customerName)) {
    showCustomAlert("Invalid Name", "Please enter a valid name (letters only).");
    return;
  }

  // 2. Validate Ghana Phone (Starts with 0, 10 digits)
  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(customerPhone)) {
    showCustomAlert("Invalid Phone", "Please enter a valid 10-digit Ghana phone number (e.g., 0551234567).");
    return;
  }

  const phoneNumber = "233596620696";

  let message = `Hello Leona's Pizzeria! New Order:\n`;
  message += `1. Name: ${customerName}\n`;
  message += `2. Phone: ${customerPhone}\n\n`;
  message += `3.Order Details:\n`;

  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    message += `- ${item.quantity}x ${item.size} ${item.name} (₵${itemTotal})\n`;
    total += itemTotal;
  });

  message += `\n 4.*Total to Pay: ₵${total}*`;
  message += `\n\nPlease confirm my order.`;

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(url, '_blank');

  setTimeout(() => {
    cart = [];
    document.getElementById('customer-name').value = "";
    document.getElementById('customer-phone').value = "";
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