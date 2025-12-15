/**
 * ======================================================
 * JAVASCRIPT FOR KAYA STORE (PRE-ORDER LOGIC ADDED)
 * ======================================================
 */

// --- FIXED IMPORTS (Using stable version 10.8.0) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. FIREBASE KEYS ---
const firebaseConfig = {
  apiKey: "AIzaSyDAFC257zzL0Q0T1crkPaYojnIgZQfYqUA",
  authDomain: "kaya-store-31083.firebaseapp.com",
  projectId: "kaya-store-31083",
  storageBucket: "kaya-store-31083.firebasestorage.app",
  messagingSenderId: "935048383330",
  appId: "1:935048383330:web:7d7444406aefa975677a3b",
  measurementId: "G-Q05ZZFHSM3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const COLLECTION_NAME = 'kaya_orders'; 

signInAnonymously(auth).catch(e => console.error("Auth Error:", e));

// --- 2. PRODUCT DATABASE ---
const PRODUCTS_DB = {
    "1": {
        name: "KAYA: CARD GAME", price: 12.99, img: "pic/DEC.png",
        desc: "The essential financial literacy game! Learn budgeting in a fun, competitive way.",
        images: ["pic/DEC2.jpg", "pic/DEC.png", "pic/DEC1.jpg","pic/DEC3.jpg"]
    },
    "2": {
        name: "Stickers", price: 3.99, img: "pic/STICKER.PNG",
        desc: "High-quality, fun stickers featuring KAYA characters.",
        images: ["pic/STICKER1.JPG", "pic/STICKER.PNG"]
    },
    "3": {
        name: "Post Card", price: 2.99, img: "pic/POST CARD.PNG",
        desc: "Send a note to a friend. Beautifully illustrated KAYA artwork.",
        images: ["pic/POST CARD.PNG", "pic/POST CARD4.JPG"]
    }
};

// --- SHIPPING RATES ---
const SHIPPING_RATES = {
    "west_my": 1.80,
    "sabah": 2.25,
    "sarawak": 3.40,
    "intl": 18.00
};

let currentShipping = SHIPPING_RATES["west_my"]; 

// --- 3. INIT ---
document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('current-year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
    
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if(menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    injectCartModal();
    updateCartCount();
    
    const cartWrapper = document.querySelector('.cart-wrapper');
    if(cartWrapper) cartWrapper.addEventListener('click', openCart);

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId && document.getElementById('product-detail-section')) {
        loadProductDetails(productId);
    }
});

function loadProductDetails(id) {
    const product = PRODUCTS_DB[id];
    if (!product) return;

    document.getElementById('p-title').textContent = product.name;
    document.getElementById('p-price').textContent = "USD " + product.price.toFixed(2);
    document.getElementById('p-desc').textContent = product.desc;
    
    const mainImg = document.getElementById('main-image');
    const thumbsContainer = document.getElementById('thumbnail-container');
    
    let currentImgs = product.images;
    let currIdx = 0;
    mainImg.src = currentImgs[0];
    thumbsContainer.innerHTML = '';

    currentImgs.forEach((imgSrc, index) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.className = 'thumbnail';
        if(index === 0) thumb.classList.add('active');
        thumb.addEventListener('click', () => {
            mainImg.src = imgSrc;
            currIdx = index;
            updateActiveThumb();
        });
        thumbsContainer.appendChild(thumb);
    });

    document.getElementById('prev-img').addEventListener('click', () => {
        currIdx = (currIdx - 1 < 0) ? currentImgs.length - 1 : currIdx - 1;
        mainImg.src = currentImgs[currIdx];
        updateActiveThumb();
    });
    document.getElementById('next-img').addEventListener('click', () => {
        currIdx = (currIdx + 1 >= currentImgs.length) ? 0 : currIdx + 1;
        mainImg.src = currentImgs[currIdx];
        updateActiveThumb();
    });

    function updateActiveThumb() {
        document.querySelectorAll('.thumbnail').forEach((t, i) => {
            if (i === currIdx) t.classList.add('active'); else t.classList.remove('active');
        });
    }

    // --- PRE-ORDER LOGIC HERE ---
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    // Remove old listeners to prevent duplicates
    const newBtn = addToCartBtn.cloneNode(true);
    addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);

    if (id === "1") {
        // CASE: CARD GAME (PRE-ORDER)
        newBtn.innerHTML = '<i class="fas fa-clock"></i> Pre-order Now';
        newBtn.style.backgroundColor = "#FD4D0A"; // Keep Orange
        
        newBtn.addEventListener('click', () => {
            // We append (Pre-order) to the name so it shows in the cart clearly
            addToCart(id, product.name + " (Pre-order)", product.price);
        });
    } else {
        // CASE: OTHER ITEMS (NORMAL)
        newBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Kaya Cart';
        
        newBtn.addEventListener('click', () => {
            addToCart(id, product.name, product.price);
        });
    }
}

// --- 4. CART LOGIC ---
let cart = JSON.parse(localStorage.getItem('kayaCart')) || [];
function saveCart() { localStorage.setItem('kayaCart', JSON.stringify(cart)); updateCartCount(); renderCartItems(); }
function updateCartCount() {
    const badge = document.querySelector('.cart-badge');
    if(badge) { badge.textContent = cart.length; cart.length > 0 ? badge.classList.add('show') : badge.classList.remove('show'); }
}
function addToCart(id, name, price) { cart.push({ id, name, price }); saveCart(); openCart(); }
function removeFromCart(index) { cart.splice(index, 1); saveCart(); }
function getItemTotal() { 
    let t = 0; 
    cart.forEach(i => t += parseFloat(i.price)); 
    return t; 
}
function getGrandTotal() {
    return (getItemTotal() + currentShipping).toFixed(2);
}

// --- 5. MODAL UI ---
function injectCartModal() {
    if(document.querySelector('.cart-modal-overlay')) return;
    const modalHTML = `
    <div class="cart-modal-overlay">
        <div class="cart-modal">
            <div id="cart-view" style="display:flex; flex-direction:column; height:100%;">
                <div class="cart-header"><h3>Your Cart</h3><button class="close-cart"><i class="fas fa-times"></i></button></div>
                <div class="cart-body"><div class="cart-items"></div></div>
                <div class="cart-footer">
                    <div class="cart-total"><span>Total:</span><span class="total-price">USD 0.00</span></div>
                    <button class="btn btn-primary checkout-btn" style="width:100%">Checkout</button>
                </div>
            </div>
            <div id="checkout-view" style="display:none; height:100%; flex-direction:column;">
                <div class="cart-header">
                    <button class="back-to-cart"><i class="fas fa-arrow-left"></i> Back</button><h3>Secure Checkout</h3><button class="close-cart"><i class="fas fa-times"></i></button>
                </div>
                <div class="cart-body">
                    <form id="order-form">
                        <h4 class="checkout-section-title"><i class="fas fa-user"></i> Details</h4>
                        <div class="form-group"><label>Full Name</label><input type="text" id="name" required></div>
                        <div class="form-group"><label>Email</label><input type="email" id="email" required></div>
                        <div class="form-group"><label>Phone</label><input type="tel" id="phone" placeholder="+[Country] [Number]" required></div>

                        <h4 class="checkout-section-title" style="margin-top:20px;"><i class="fas fa-truck"></i> Shipping</h4>
                        <div class="form-group">
                            <label>Destination (Auto-Detected)</label>
                            <select id="shipping-region" disabled style="width:100%; padding:12px; border:2px solid #ddd; border-radius:8px; background-color: #f5f5f5; cursor: not-allowed; color: #555;">
                                <option value="west_my">West Malaysia (Peninsula) - $1.80</option>
                                <option value="sabah">Sabah - $2.25</option>
                                <option value="sarawak">Sarawak - $3.40</option>
                                <option value="intl">International - $18.00</option>
                            </select>
                        </div>

                        <h4 class="checkout-section-title" style="margin-top:20px;"><i class="fas fa-map-marker-alt"></i> Address</h4>
                        <div class="form-group"><input type="text" id="country" placeholder="Country" required></div>
                        <div class="form-row">
                            <div class="form-group" style="flex:2"><input type="text" id="street" placeholder="Street Address" required></div>
                            <div class="form-group" style="flex:1"><input type="text" id="unit" placeholder="Unit/Apt" required></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><input type="text" id="zip" placeholder="Zip/Postal Code" required></div>
                            <div class="form-group"><input type="text" id="city" placeholder="City" required></div>
                        </div>
                        
                        <div style="margin-top:20px; border-top:1px dashed #ccc; padding-top:10px; display:flex; justify-content:space-between; font-weight:bold; font-size:1.1rem;">
                            <span>Total to Pay:</span>
                            <span id="checkout-total-display">USD 0.00</span>
                        </div>

                        <h4 class="checkout-section-title" style="margin-top:20px;"><i class="fas fa-credit-card"></i> Payment</h4>
                        <div id="paypal-button-container" style="margin-top: 10px;"></div>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupEventListeners();
}

function setupEventListeners() {
    document.querySelectorAll('.close-cart').forEach(b => b.addEventListener('click', closeCart));
    document.querySelector('.checkout-btn').addEventListener('click', showCheckout);
    document.querySelector('.back-to-cart').addEventListener('click', showCartView);
    document.querySelector('.cart-modal-overlay').addEventListener('click', (e) => { if(e.target === document.querySelector('.cart-modal-overlay')) closeCart(); });
    
    // --- AUTO-DETECT SHIPPING FROM ADDRESS ---
    const countryInput = document.getElementById('country');
    const zipInput = document.getElementById('zip');
    const shippingSelect = document.getElementById('shipping-region');

    if (countryInput && zipInput && shippingSelect) {
        const detectShipping = () => {
            const country = countryInput.value.toLowerCase().trim();
            const zip = zipInput.value.trim();
            let detectedRegion = "intl"; 

            if (country === "malaysia" || country === "my" || country.includes("malaysia")) {
                detectedRegion = "west_my"; 
                if (zip.length >= 2) {
                    const prefix = parseInt(zip.substring(0, 2));
                    if (!isNaN(prefix)) {
                        if (prefix >= 87 && prefix <= 91) detectedRegion = "sabah";
                        else if (prefix >= 93 && prefix <= 98) detectedRegion = "sarawak";
                    }
                }
            }

            if (shippingSelect.value !== detectedRegion) {
                shippingSelect.value = detectedRegion;
                currentShipping = SHIPPING_RATES[detectedRegion];
                updateCheckoutTotal();
                renderPayPalButtons();
            }
        };
        countryInput.addEventListener('input', detectShipping);
        zipInput.addEventListener('input', detectShipping);
    }
}

function updateCheckoutTotal() {
    const totalEl = document.getElementById('checkout-total-display');
    if(totalEl) totalEl.textContent = 'USD ' + getGrandTotal();
}

function showCheckout() {
    if(cart.length === 0) return alert("Cart is empty");
    document.getElementById('cart-view').style.display = 'none';
    document.getElementById('checkout-view').style.display = 'flex';
    currentShipping = SHIPPING_RATES["west_my"];
    document.getElementById('shipping-region').value = "west_my";
    updateCheckoutTotal();
    renderPayPalButtons();
}

function renderPayPalButtons() {
    document.getElementById('paypal-button-container').innerHTML = ''; 
    if (window.paypal) {
        window.paypal.Buttons({
            createOrder: (data, actions) => actions.order.create({ purchase_units: [{ amount: { value: getGrandTotal() } }] }),
            onApprove: (data, actions) => actions.order.capture().then(details => { 
                saveOrderToFirebase(details); 
            })
        }).render('#paypal-button-container');
    } else {
        document.getElementById('paypal-button-container').innerHTML = '<p style="color:red;font-size:0.8rem;">PayPal SDK not loaded.</p>';
    }
}

function showCartView() { document.getElementById('checkout-view').style.display = 'none'; document.getElementById('cart-view').style.display = 'flex'; }

async function saveOrderToFirebase(paymentDetails) {
    const shippingRegion = document.getElementById('shipping-region').options[document.getElementById('shipping-region').selectedIndex].text;
    const customerEmail = document.getElementById('email').value || paymentDetails.payer.email_address;
    const customerName = document.getElementById('name').value || paymentDetails.payer.name.given_name;

    const orderData = {
        customer: {
            name: customerName,
            email: customerEmail,
            phone: document.getElementById('phone').value,
            address: { 
                country: document.getElementById('country').value,
                street: document.getElementById('street').value, 
                unit: document.getElementById('unit').value, 
                zip: document.getElementById('zip').value, 
                city: document.getElementById('city').value 
            }
        },
        items: cart,
        shipping: { region: shippingRegion, cost: currentShipping },
        subtotal: getItemTotal().toFixed(2),
        grandTotal: getGrandTotal(),
        status: "PAID", 
        paymentId: paymentDetails.id, 
        paymentMethod: "PayPal", 
        timestamp: serverTimestamp()
    };
    
    try {
        await addDoc(collection(db, COLLECTION_NAME), orderData);
        cart = []; saveCart(); closeCart(); showCartView(); document.getElementById('order-form').reset();
        alert(`🎉 Order Success! Payment ID: ${paymentDetails.id}`);
    } catch(e) { console.error(e); alert("Payment success, but DB save failed."); }
}

function openCart() { renderCartItems(); document.querySelector('.cart-modal-overlay').classList.add('open'); showCartView(); }
function closeCart() { document.querySelector('.cart-modal-overlay').classList.remove('open'); }
function renderCartItems() {
    const container = document.querySelector('.cart-items');
    if(cart.length === 0) { container.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Empty</p>'; document.querySelector('.total-price').textContent = 'USD 0.00'; return; }
    let html = '';
    cart.forEach((item, i) => { html += `<div class="cart-item"><div class="cart-item-info"><h4>${item.name}</h4><span>USD ${item.price}</span></div><i class="fas fa-trash remove-item" onclick="removeFromCart(${i})"></i></div>`; });
    container.innerHTML = html; document.querySelector('.total-price').textContent = 'USD ' + getItemTotal().toFixed(2);
}
window.removeFromCart = removeFromCart;