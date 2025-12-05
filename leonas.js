// --- SMART HAMBURGER MENU ---
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const closeBtn = document.querySelector(".mobile-close-btn");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });
}

document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
  hamburger.classList.remove("active");
  navMenu.classList.remove("active");
}));

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

// --- NOTIFICATION & TOAST SYSTEMS ---
const icons = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" class="modal-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" class="modal-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" class="modal-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>`
};

function showCustomAlert(title, message, type = 'normal') {
  const modal = document.getElementById('custom-alert');
  const modalBox = modal.querySelector('.modal-box');
  const iconContainer = document.getElementById('modal-icon-container');
  const titleEl = document.getElementById('modal-title');
  const msgEl = document.getElementById('modal-message');
  const actionsEl = document.getElementById('modal-actions');

  modalBox.className = 'modal-box';

  if (type === 'success') {
    modalBox.classList.add('modal-theme-success');
    iconContainer.innerHTML = icons.success;
  } else if (type === 'error') {
    modalBox.classList.add('modal-theme-error');
    iconContainer.innerHTML = icons.error;
  } else {
    modalBox.classList.add('modal-theme-normal');
    iconContainer.innerHTML = icons.info;
  }

  titleEl.innerText = title;
  msgEl.innerHTML = message;

  if (!actionsEl.innerHTML.includes('<a')) {
    actionsEl.innerHTML = `<button class="modal-btn-primary" onclick="closeAlert()">Okay</button>`;
  }

  modal.classList.add('active');
}

function closeAlert() {
  document.getElementById('custom-alert').classList.remove('active');
  setTimeout(() => {
    document.getElementById('modal-actions').innerHTML = '';
  }, 300);
}

function showToast(message) {
  const x = document.getElementById("toast-box");
  if (x) {
    x.innerText = message;
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
  }
}

// --- CART LOGIC ---
let cart = [];
let currentDiscount = 0;
let appliedCode = "";
let calculatedDeliveryFee = 0;

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
    cart.push({ name, size, price, quantity: 1 });
  }

  updateCartUI();
  showToast(`Added: ${name} 🍕`);

  const sidebar = document.getElementById('cart-sidebar');
  if (!sidebar.classList.contains('active')) {
    sidebar.classList.add('active');
    setTimeout(() => {
      if (sidebar.classList.contains('active')) toggleCart();
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
  currentDiscount = 0;
  appliedCode = "";
  const promoInput = document.getElementById('promo-input');
  const promoMsg = document.getElementById('promo-message');
  if (promoInput) promoInput.value = "";
  if (promoMsg) promoMsg.innerText = "";

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

function applyPromo() {
  const input = document.getElementById('promo-input');
  const msg = document.getElementById('promo-message');
  const code = input.value.trim().toUpperCase();
  const cartTotalElement = document.getElementById('cart-total');

  let subtotal = 0;
  cart.forEach(item => subtotal += item.price * item.quantity);

  if (subtotal === 0) {
    showToast("Cart is empty!");
    return;
  }

  if (code === "LEONA10") {
    currentDiscount = subtotal * 0.10;
    appliedCode = "LEONA10";
    msg.style.color = "#25D366";
    msg.innerText = `✅ 10% Discount Applied (-₵${currentDiscount.toFixed(2)})`;
    showToast("Discount Applied! 🔥");
  }
  else {
    currentDiscount = 0;
    appliedCode = "";
    msg.style.color = "#B71C1C";
    msg.innerText = "❌ Invalid Code";
    cartTotalElement.innerText = '₵' + subtotal;
    return;
  }

  const newTotal = subtotal - currentDiscount;
  const finalTotal = newTotal > 0 ? newTotal : 0;

  cartTotalElement.innerHTML = `
    <span style="text-decoration: line-through; color: #999; font-size: 0.9em;">₵${subtotal}</span>
    <br>₵${finalTotal.toFixed(2)}
  `;
}

// --- CHECKOUT & PAYSTACK ---
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

  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  let totalAmount = subtotal - currentDiscount;
  if (totalAmount < 0) totalAmount = 0;

  payWithPaystack(customerName, customerPhone, customerAddress, totalAmount, isDelivery);
}

function payWithPaystack(name, phone, address, amount, isDelivery) {
  const paymentRef = '' + Math.floor((Math.random() * 1000000000) + 1);

  const orderData = {
    name: name,
    phone: phone,
    address: address,
    total: amount,
    isDelivery: isDelivery,
    deliveryFee: calculatedDeliveryFee,
    ref: paymentRef,
    items: cart,
    discount: currentDiscount,
    code: appliedCode,
    status: 'pending',
    timestamp: new Date().getTime()
  };
  localStorage.setItem('backup_order', JSON.stringify(orderData));

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

function sendToWhatsapp(orderData) {
  const phoneNumber = "233596620696";
  const orderType = orderData.isDelivery ? "DELIVERY" : "PICK UP";

  let message = `*NEW PAID ORDER - DE WRAP SQUARE* \n`;
  message += `✅ PAYMENT CONFIRMED\n`;
  message += `*Ref:* ${orderData.ref}\n`;
  message += ` *Name:* ${orderData.name}\n`;
  message += ` *Phone:* ${orderData.phone}\n`;
  message += ` *Type:* ${orderType}\n`;

  if (orderData.isDelivery) {
    message += ` *Location:* ${orderData.address}\n`;
    if (orderData.deliveryFee > 0) {
      message += ` *⚠️ DELIVERY FEE (CASH):* ₵${orderData.deliveryFee}\n`;
    }
  }

  message += `\n* ORDER DETAILS:\n`;
  orderData.items.forEach(item => {
    message += `- ${item.quantity}x ${item.name} (${item.size})\n`;
  });

  if (orderData.discount && orderData.discount > 0) {
    message += `\n *Discount (${orderData.code}):* -₵${orderData.discount.toFixed(2)}`;
  }

  message += `\n *FOOD TOTAL PAID ONLINE:* ₵${orderData.total}\n`;

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  cart = [];
  updateCartUI();
  document.getElementById('customer-name').value = "";
  document.getElementById('customer-phone').value = "";

  const addrInput = document.getElementById('customer-address');
  if (addrInput) addrInput.value = "";
  calculatedDeliveryFee = 0;
  const feeBox = document.getElementById('delivery-status-box');
  if (feeBox) feeBox.style.display = 'none';

  const sidebar = document.getElementById('cart-sidebar');
  if (sidebar.classList.contains('active')) toggleCart();

  orderData.status = 'sent';
  localStorage.setItem('backup_order', JSON.stringify(orderData));

  const actionsEl = document.getElementById('modal-actions');

  actionsEl.innerHTML = `
    <a href="${url}" target="_blank" class="modal-btn-primary btn-whatsapp" onclick="finishOrderProcess()" style="text-decoration:none;">
       <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
       Open WhatsApp & Send 🚀
    </a>
  `;

  showCustomAlert("Order Paid! 🎉", "Tap below to send details to the kitchen.", "success");
}

function finishOrderProcess() {
  document.getElementById('custom-alert').classList.remove('active');
  localStorage.removeItem('backup_order');
  showToast("Order Process Completed ✅");
}

// --- RECOVERY LOGIC ---
function checkPendingOrder() {
  const savedOrder = localStorage.getItem('backup_order');
  const btn = document.getElementById('recovery-btn');

  if (!savedOrder) {
    if (btn) btn.style.display = 'none';
    return;
  }

  const order = JSON.parse(savedOrder);
  const now = new Date().getTime();

  if (now - order.timestamp > 86400000) {
    localStorage.removeItem('backup_order');
    if (btn) btn.style.display = 'none';
    return;
  }

  const actionBtn = document.querySelector('.resend-btn');
  const msgSpan = document.querySelector('.recovery-box span');

  if (btn) {
    if (order.status === 'pending') {
      btn.style.display = 'flex';
      msgSpan.innerText = "Did your payment go through?";
      actionBtn.innerText = "Yes, I Paid! Send Order 📲";
      actionBtn.style.background = "#FF9800";
      actionBtn.onclick = function () {
        if (confirm("Only click OK if money was deducted.")) {
          order.status = 'verified';
          sendToWhatsapp(order);
        }
      };
    }
    else if (order.status === 'verified') {
      btn.style.display = 'flex';
      msgSpan.innerText = "⚠️ Order Not Sent?";
      actionBtn.innerText = "Resend to WhatsApp 📲";
      actionBtn.style.background = "#25D366";
      actionBtn.onclick = function () {
        sendToWhatsapp(order);
      };
    }
    else {
      btn.style.display = 'none';
    }
  }
}

function clearSavedOrder() {
  if (confirm("Clear this backup?")) {
    localStorage.removeItem('backup_order');
    document.getElementById('recovery-btn').style.display = 'none';
  }
}

// --- UI HELPERS ---
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

function checkShopStatus() {
  const badge = document.getElementById('status-badge');
  const text = document.getElementById('status-text');
  if (!badge || !text) return;

  const now = new Date();
  const hour = now.getUTCHours();
  const isOpen = hour >= 10 && hour < 22;

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
    if (calculatedDeliveryFee > 0) {
      document.getElementById('delivery-status-box').style.display = 'block';
    }
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

function searchMenu() {
  const input = document.getElementById('menu-search');
  const filter = input.value.toUpperCase();
  const menuGrid = document.getElementById('menu-grid');
  const cards = menuGrid.getElementsByClassName('pizza-card');

  for (let i = 0; i < cards.length; i++) {
    let title = cards[i].querySelector("h4");
    if (title.innerText.toUpperCase().indexOf(filter) > -1) {
      cards[i].style.display = "";
    } else {
      cards[i].style.display = "none";
    }
  }
}

async function shareWebsite() {
  const shareData = {
    title: "De Wrap Square",
    text: "Order the best Pizza in Accra! 🍕",
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link Copied to Clipboard! 📋");
    }
  } catch (err) {
    console.log('Error sharing:', err);
  }
}

function checkTuesdayPromo() {
  const date = new Date();
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, 2 is Tuesday...

  if (day === 2) {
    if (!sessionStorage.getItem('promoShown')) {

      const modal = document.getElementById('custom-alert');
      const titleEl = document.getElementById('modal-title');
      const msgEl = document.getElementById('modal-message');
      const iconContainer = document.getElementById('modal-icon-container');
      const actionsEl = document.getElementById('modal-actions');

      iconContainer.innerHTML = "🔥";
      iconContainer.style.fontSize = "3rem";

      titleEl.innerText = "It's Tera Tuesday! 🍕";

      msgEl.innerHTML = `
        <img src="promo.webp" style="width:100%; border-radius:10px; margin-bottom:10px;">
        <p>Buy 1 Get 1 Free on all Large Pizzas today!</p>
      `;

      actionsEl.innerHTML = `
        <button class="modal-btn-primary" onclick="closeAlert()">Order Now</button>
      `;

      modal.classList.add('active');
      sessionStorage.setItem('promoShown', 'true');
    }
  }
}

// ============================================================
//  BOLT-STYLE DELIVERY CALCULATOR 🛵
// ============================================================

const RESTAURANT_LOCATION = { lat: 5.6331968, lng: -0.3258539 };

const BASE_FARE = 15;
const RATE_PER_KM = 0.7;
const MIN_PRICE = 20;

window.initGooglePlaces = function () {
  const input = document.getElementById('customer-address');
  if (!input) return;

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') e.preventDefault();
  });

  input.addEventListener('input', function () {
    if (this.value === "") {
      calculatedDeliveryFee = 0;
      document.getElementById('delivery-status-box').style.display = 'none';
    }
  });

  try {
    const autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: "gh" },
      fields: ["geometry", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry) {
        showToast("Please select a location from the list.");
        return;
      }

      document.getElementById('cust-lat').value = place.geometry.location.lat();
      document.getElementById('cust-lng').value = place.geometry.location.lng();

      calculateDistance(place.geometry.location);
    });
  } catch (error) {
    console.error("Google Maps Error:", error);
  }
}

function calculateDistance(destination) {
  const service = new google.maps.DistanceMatrixService();

  document.getElementById('fee-val').innerText = "Calculating...";
  document.getElementById('delivery-status-box').style.display = 'block';

  service.getDistanceMatrix(
    {
      origins: [RESTAURANT_LOCATION],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK") {
        const results = response.rows[0].elements[0];

        if (results.status === "OK") {
          const distanceText = results.distance.text;
          const distanceInMeters = results.distance.value;
          const distanceInKm = distanceInMeters / 1000;

          // Pricing Logic
          let rawFee = BASE_FARE + (distanceInKm * RATE_PER_KM);
          if (rawFee < MIN_PRICE) {
            rawFee = MIN_PRICE;
          }
          calculatedDeliveryFee = Math.ceil(rawFee);

          document.getElementById('dist-val').innerText = distanceText;
          document.getElementById('fee-val').innerText = "₵" + calculatedDeliveryFee.toFixed(2);

          updateCartUI();
          showToast(`Delivery Fee: ₵${calculatedDeliveryFee}`);

        } else {
          showCustomAlert("Route Error", "We cannot calculate a driving route to this location.", "error");
          document.getElementById('fee-val').innerText = "Unknown";
        }
      } else {
        console.error("Distance Matrix Error:", status);
        showCustomAlert("System Error", "Map System is offline. Please call to order.", "error");
      }
    }
  );
}

window.onload = function () {
  checkPendingOrder();
  checkShopStatus();
  startAutoScroll();
  setTimeout(checkTuesdayPromo, 2000);
  initGooglePlaces();

  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }, 800);
  }
};

document.addEventListener('DOMContentLoaded', checkShopStatus);