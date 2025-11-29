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
    cart.push({
      name,
      size,
      price,
      quantity: 1
    });
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

// ============================================================
//  STRICT CHECKOUT SYSTEM (NO PAY = NO ORDER)
// ============================================================

function checkout() {
  // 1. Check if Cart is Empty
  if (cart.length === 0) {
    showCustomAlert("Cart Empty", "Please add items to your cart first!");
    return;
  }

  // 2. Get Input Values
  const customerName = document.getElementById('customer-name').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const isDelivery = document.getElementById('type-delivery').checked;
  const customerAddress = document.getElementById('customer-address').value;

  // 3. Validate Inputs
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

  // 4. Calculate Total
  let totalAmount = 0;
  cart.forEach(item => {
    totalAmount += item.price * item.quantity;
  });

  // 5. Trigger Paystack directly
  payWithPaystack(customerName, customerPhone, customerAddress, totalAmount, isDelivery);
}

// --- PAYSTACK INTEGRATION ---
function payWithPaystack(name, phone, address, amount, isDelivery) {

  // YOUR PUBLIC KEY
  const publicKey = "pk_test_9b2e43f2332af4fff23f3967f1bf76e8b2a59d88";

  let handler = PaystackPop.setup({
    key: publicKey,
    email: "orders@dewrapsquare.com", // Dummy email for the system
    amount: amount * 100, // Amount in pesewas
    currency: "GHS",
    ref: '' + Math.floor((Math.random() * 1000000000) + 1), // Unique Ref
    metadata: {
      custom_fields: [{
        display_name: "Customer Name",
        variable_name: "customer_name",
        value: name
      },
      {
        display_name: "Phone Number",
        variable_name: "mobile_number",
        value: phone
      }
      ]
    },
    callback: function (response) {
      // 🟢 SUCCESS! Payment verified by Paystack.
      // ONLY NOW do we generate the WhatsApp order.
      const paymentRef = response.reference;
      sendToWhatsapp(name, phone, address, amount, isDelivery, paymentRef);
    },
    onClose: function () {
      // 🔴 FAILED/CLOSED. No WhatsApp message is sent.
      showCustomAlert("Payment Cancelled", "Order was not placed because payment was cancelled.");
    }
  });

  handler.openIframe();
}

// --- WHATSAPP SENDER ---
function sendToWhatsapp(name, phone, address, total, isDelivery, paymentRef) {

  // 🔴 CHANGE TO COMPANY NUMBER WHEN READY
  const phoneNumber = "233596620696";

  const orderType = isDelivery ? "DELIVERY" : "PICK UP";

  let message = `*NEW PAID ORDER - DE WRAP SQUARE* \n`;
  message += `--------------------------------\n`;
  message += `✅ *PAYMENT CONFIRMED*\n`;
  message += `💳 *Ref:* ${paymentRef}\n`; // This proves it is paid
  message += `--------------------------------\n`;
  message += `👤 *Name:* ${name}\n`;
  message += `📞 *Phone:* ${phone}\n`;
  message += `📦 *Type:* ${orderType}\n`;

  if (isDelivery) {
    message += `📍 *Location:* ${address}\n`;
  }

  message += `\n*📝 ORDER DETAILS:*\n`;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    message += `- ${item.quantity}x ${item.name} (${item.size})\n`;
  });

  message += `\n💰 *FOOD TOTAL PAID: ₵${total}*\n`;

  if (isDelivery) {
    message += `⚠️ *NOTE:* Delivery fee is NOT included. Customer pays rider.\n`;
  }

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(url, '_blank');

  // Success Message to user
  showCustomAlert("Order Sent!", "Payment received. We are processing your order on WhatsApp.");

  // Clear cart
  setTimeout(() => {
    cart = [];
    document.getElementById('customer-name').value = "";
    document.getElementById('customer-phone').value = "";
    document.getElementById('customer-address').value = "";
    updateCartUI();
    toggleCart();
  }, 2000);
}

// ============================================================
//  UI HELPERS
// ============================================================

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

  // Reset scroll to start when filtering
  document.getElementById('menu-grid').scrollLeft = 0;
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

// --- SCROLL TO TOP LOGIC ---
const scrollBtn = document.getElementById("scrollTopBtn");

window.onscroll = function () {
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    scrollBtn.style.display = "block";
  } else {
    scrollBtn.style.display = "none";
  }
};

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// --- FAQ ACCORDION LOGIC ---
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  question.addEventListener('click', () => {
    // 1. Toggle the active class
    item.classList.toggle('active');

    // 2. Handle the smooth slide animation
    if (item.classList.contains('active')) {
      answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
      answer.style.maxHeight = 0;
    }
  });
});

// --- MENU AUTO-SLIDER & CONTROLS ---

const menuGrid = document.getElementById('menu-grid');
let autoScrollInterval;

// 1. Manual Slide Function (for Arrows)
function slideMenu(direction) {
  // Determine width of card + gap (320px + 30px gap = 350px)
  const scrollAmount = 350;

  if (direction === 1) {
    menuGrid.scrollLeft += scrollAmount;
    if (menuGrid.scrollLeft + menuGrid.clientWidth >= menuGrid.scrollWidth - 10) {
      menuGrid.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
  } else {
    menuGrid.scrollLeft -= scrollAmount;
  }
}

// 2. Auto Scroll Logic
function startAutoScroll() {
  autoScrollInterval = setInterval(() => {
    // If user is NOT hovering, scroll right
    if (!menuGrid.matches(':hover')) {
      if (menuGrid.scrollLeft + menuGrid.clientWidth >= menuGrid.scrollWidth - 10) {
        menuGrid.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        menuGrid.scrollBy({
          left: 350,
          behavior: 'smooth'
        });
      }
    }
  }, 4000); // Slides every 4 seconds
}

// 3. Pause Auto-Scroll on Hover
menuGrid.parentElement.addEventListener('mouseenter', () => {
  clearInterval(autoScrollInterval);
});

menuGrid.parentElement.addEventListener('mouseleave', () => {
  startAutoScroll();
});

// Initialize
startAutoScroll();