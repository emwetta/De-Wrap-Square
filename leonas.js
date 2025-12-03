// --- SMART HAMBURGER MENU ---
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const closeBtn = document.querySelector(".mobile-close-btn");

// 1. Open/Close on Hamburger Click
if (hamburger) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });
}

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
  if (slides.length > 0) {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }
}
setInterval(nextSlide, 5000);


// ============================================================
//  PROFESSIONAL NOTIFICATION SYSTEM
// ============================================================

function showCustomAlert(title, message, type = 'normal') {
  const modal = document.getElementById('custom-alert');
  const titleEl = document.getElementById('modal-title');
  const msgEl = document.getElementById('modal-message');
  const iconEl = document.querySelector('.modal-icon');
  const headerEl = document.querySelector('.modal-header');
  const actionsEl = document.querySelector('.modal-actions');

  // 1. Set Content
  titleEl.innerText = title;
  msgEl.innerHTML = message;

  // 2. Set Theme (Colors & Icons)
  if (type === 'success') {
    iconEl.innerText = '✅';
    headerEl.style.backgroundColor = '#25D366'; // WhatsApp Green
  } else if (type === 'error') {
    iconEl.innerText = '⚠️';
    headerEl.style.backgroundColor = '#B71C1C'; // Error Red
  } else {
    iconEl.innerText = '🔔';
    headerEl.style.backgroundColor = '#B71C1C'; // Default Brand Red
  }

  // 3. Set Buttons
  if (message.includes('<a href')) {
    actionsEl.innerHTML = `<button class="modal-btn-secondary" onclick="closeAlert()">Close</button>`;
  } else {
    actionsEl.innerHTML = `<button class="modal-btn-primary" onclick="closeAlert()">Okay, Got it</button>`;
  }

  modal.classList.add('active');
}

function closeAlert() {
  document.getElementById('custom-alert').classList.remove('active');
}

// --- CART LOGIC ---
let cart = [];

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  sidebar.classList.toggle('active');
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
    cart.push({
      name,
      size,
      price,
      quantity: 1
    });
  }
  updateCartUI();

  const sidebar = document.getElementById('cart-sidebar');
  if (!sidebar.classList.contains('active')) {
    sidebar.classList.add('active');
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

// ============================================================
//  STRICT CHECKOUT SYSTEM (NO PAY = NO ORDER)
// ============================================================

function checkout() {
  if (cart.length === 0) {
    showCustomAlert("Cart Empty", "Please add items to your cart first!", "error");
    return;
  }

  const customerName = document.getElementById('customer-name').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const isDelivery = document.getElementById('type-delivery').checked;
  const customerAddress = document.getElementById('customer-address').value;

  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!customerName || !nameRegex.test(customerName)) {
    showCustomAlert("Invalid Name", "Please enter a valid name (letters only).", "error");
    return;
  }

  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(customerPhone)) {
    showCustomAlert("Invalid Phone", "Please enter a valid 10-digit Ghana phone number.", "error");
    return;
  }

  if (isDelivery && customerAddress.trim() === "") {
    showCustomAlert("Location Needed", "Please enter your delivery location.", "error");
    return;
  }

  let totalAmount = 0;
  cart.forEach(item => {
    totalAmount += item.price * item.quantity;
  });

  payWithPaystack(customerName, customerPhone, customerAddress, totalAmount, isDelivery);
}

// --- PAYSTACK INTEGRATION ---
function payWithPaystack(name, phone, address, amount, isDelivery) {

  // 1. Generate Reference
  const paymentRef = '' + Math.floor((Math.random() * 1000000000) + 1);

  // 2. Save Pending Order
  const orderData = {
    name: name,
    phone: phone,
    address: address,
    total: amount,
    isDelivery: isDelivery,
    ref: paymentRef,
    items: cart,
    status: 'pending',
    timestamp: new Date().getTime()
  };
  localStorage.setItem('backup_order', JSON.stringify(orderData));

  // 3. Open Paystack (LIVE KEY)
  const publicKey = "pk_test_9b2e43f2332af4fff23f3967f1bf76e8b2a59d88";

  let handler = PaystackPop.setup({
    key: publicKey,
    email: "orders@dewrapsquare.com",
    amount: amount * 100,
    currency: "GHS",
    ref: paymentRef,
    metadata: {
      custom_fields: [
        { display_name: "Customer Name", variable_name: "customer_name", value: name },
        { display_name: "Phone Number", variable_name: "mobile_number", value: phone }
      ]
    },
    callback: function (response) {
      orderData.status = 'verified';
      localStorage.setItem('backup_order', JSON.stringify(orderData));
      sendToWhatsapp(orderData);
    },
    onClose: function () {
      showCustomAlert("Payment Cancelled", "Order was not placed because payment was cancelled.", "error");
    }
  });

  handler.openIframe();
}

// ============================================================
//  UPDATED WHATSAPP SENDER (Fixes the "Return" issue)
// ============================================================

function sendToWhatsapp(orderData) {
  const phoneNumber = "233596620696"; // Company Number

  const orderType = orderData.isDelivery ? "DELIVERY" : "PICK UP";
  const paymentLabel = "✅ PAYMENT CONFIRMED";

  let message = `*NEW PAID ORDER - DE WRAP SQUARE* \n`;
  message += `${paymentLabel}\n`;
  message += `*Ref:* ${orderData.ref}\n`;

  message += ` *Name:* ${orderData.name}\n`;
  message += ` *Phone:* ${orderData.phone}\n`;
  message += ` *Type:* ${orderType}\n`;

  if (orderData.isDelivery) {
    message += ` *Location:* ${orderData.address}\n`;
  }

  message += `\n* ORDER DETAILS:\n`;

  orderData.items.forEach(item => {
    message += `- ${item.quantity}x ${item.name} (${item.size})\n`;
  });

  message += `\n *FOOD TOTAL PAID: ₵${orderData.total}*\n`;

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  // 1. OPEN WHATSAPP
  window.open(url, '_blank');

  // 2. CRITICAL FIX: Update LocalStorage to mark as SENT immediately
  // This ensures if they return or reload, the button won't show.
  orderData.status = 'sent';
  localStorage.setItem('backup_order', JSON.stringify(orderData));

  // 3. HIDE THE RECOVERY BUTTON IMMEDIATELY (Visual Fix)
  const recoveryBtn = document.getElementById('recovery-btn');
  if (recoveryBtn) recoveryBtn.style.display = 'none';

  // 4. CLEAR CART & FORMS
  cart = [];
  updateCartUI();
  document.getElementById('customer-name').value = "";
  document.getElementById('customer-phone').value = "";
  document.getElementById('customer-address').value = "";

  // Close Sidebar if open
  const sidebar = document.getElementById('cart-sidebar');
  if (sidebar.classList.contains('active')) {
    toggleCart();
  }

  // 5. SHOW SUCCESS MESSAGE (Visible when they return to the tab)
  const successMsg = `
    <p><strong>Order Sent Successfully! ✅</strong></p>
    <p>We have received your payment.</p>
    <p>Your order has been forwarded to the kitchen.</p>
  `;

  // Slight delay to allow the window switch to happen smoothly first
  setTimeout(() => {
    showCustomAlert("Order Confirmed", successMsg, 'success');
  }, 1000);
}

// ============================================================
//  UPDATED RECOVERY LOGIC (Checks status before showing button)
// ============================================================

function checkPendingOrder() {
  const savedOrder = localStorage.getItem('backup_order');

  // If no data, do nothing
  if (!savedOrder) return;

  const order = JSON.parse(savedOrder);
  const now = new Date().getTime();

  // 1. Expire old orders (24 hours)
  if (now - order.timestamp > 86400000) {
    localStorage.removeItem('backup_order');
    return;
  }

  // 2. CRITICAL FIX: If status is 'sent', DELETE IT and DO NOT show button
  if (order.status === 'sent') {
    localStorage.removeItem('backup_order');
    return;
  }

  // 3. Only show button if status is 'pending' (not paid) or 'verified' (paid but not sent)
  const btn = document.getElementById('recovery-btn');
  const actionBtn = document.querySelector('.resend-btn');
  const msgSpan = document.querySelector('.recovery-box span');

  if (btn) {
    btn.style.display = 'flex';

    if (order.status === 'pending') {
      // Logic: User clicked pay, but we aren't sure if they finished payment
      msgSpan.innerText = "Did your payment go through?";
      actionBtn.innerText = "Yes, I Paid! Send Order 📲";
      actionBtn.style.background = "#FF9800";
      actionBtn.onclick = function () {
        if (confirm("Only click OK if money was deducted.\nThe shop owner will verify the ID.")) {
          // If they force send, we verify it manually
          order.status = 'verified';
          sendToWhatsapp(order);
        }
      };
    } else if (order.status === 'verified') {
      // Logic: User Paid, Paystack confirmed, but they closed browser before WhatsApp opened
      msgSpan.innerText = "⚠️ Order Not Sent?";
      actionBtn.innerText = "Resend to WhatsApp 📲";
      actionBtn.style.background = "#25D366";
      actionBtn.onclick = function () {
        sendToWhatsapp(order);
      };
    }
  }
}
// ============================================================
//  UI HELPERS
// ============================================================

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
  document.getElementById('menu-grid').scrollLeft = 0;
}

// --- OPEN/CLOSED LOGIC (FIXED) ---
function checkShopStatus() {
  const badge = document.getElementById('status-badge');
  const text = document.getElementById('status-text');

  if (!badge || !text) return; // Safety check

  // 1. Get Current Time in GMT (Accra is UTC+0)
  const now = new Date();
  const hour = now.getUTCHours();

  // 2. Define Shop Hours (10 AM to 10 PM)
  const isOpen = hour >= 10 && hour < 22;

  // 3. Update the UI
  if (isOpen) {
    badge.className = 'status-badge status-open';
    text.innerText = "Open Now - Taking Orders";
  } else {
    badge.className = 'status-badge status-closed';
    text.innerText = "Closed (Opens 10:00 AM)";
  }
}

function toggleAddress(isDelivery) {
  const addressField = document.getElementById('address-field');
  if (isDelivery) {
    addressField.style.display = "block";
  } else {
    addressField.style.display = "none";
  }
}

const scrollBtn = document.getElementById("scrollTopBtn");
window.onscroll = function () {
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    if (scrollBtn) scrollBtn.style.display = "block";
  } else {
    if (scrollBtn) scrollBtn.style.display = "none";
  }
};

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// FAQ Logic
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  question.addEventListener('click', () => {
    item.classList.toggle('active');
    if (item.classList.contains('active')) {
      answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
      answer.style.maxHeight = 0;
    }
  });
});

// Menu Scroll
const menuGrid = document.getElementById('menu-grid');
let autoScrollInterval;

function slideMenu(direction) {
  const scrollAmount = 350;
  if (direction === 1) {
    menuGrid.scrollLeft += scrollAmount;
    if (menuGrid.scrollLeft + menuGrid.clientWidth >= menuGrid.scrollWidth - 10) {
      menuGrid.scrollTo({ left: 0, behavior: 'smooth' });
    }
  } else {
    menuGrid.scrollLeft -= scrollAmount;
  }
}

function startAutoScroll() {
  if (!menuGrid) return;
  autoScrollInterval = setInterval(() => {
    if (!menuGrid.matches(':hover')) {
      if (menuGrid.scrollLeft + menuGrid.clientWidth >= menuGrid.scrollWidth - 10) {
        menuGrid.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        menuGrid.scrollBy({ left: 350, behavior: 'smooth' });
      }
    }
  }, 4000);
}

if (menuGrid) {
  menuGrid.parentElement.addEventListener('mouseenter', () => {
    clearInterval(autoScrollInterval);
  });
  menuGrid.parentElement.addEventListener('mouseleave', () => {
    startAutoScroll();
  });
}

// --- INIT (RUNS ON LOAD) ---
window.onload = function () {
  checkPendingOrder();
  checkShopStatus(); // Runs status check immediately
  startAutoScroll();
};

// Also verify status when DOM is ready (extra safety)
document.addEventListener('DOMContentLoaded', checkShopStatus);

function showToast(message) {
  const x = document.getElementById("toast-box");
  x.innerText = message;
  x.className = "show";
  setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}