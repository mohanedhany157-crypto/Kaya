/**
 * ======================================================
 * JAVASCRIPT FOR KAYA STORE (PRE-ORDER + SUCCESS POPUP + TEST BTN)
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
        images: ["pic/STICKER.PNG", "pic/STICKER.PNG", "pic/STICKER.PNG"]
    },
    "3": {
        name: "Post Card", price: 2.99, img: "pic/POST CARD.PNG",
        desc: "Send a note to a friend. Beautifully illustrated KAYA artwork.",
        images: ["pic/POST CARD.PNG", "pic/POST CARD.PNG", "pic/POST CARD.PNG"]
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
                        
                        <!-- TEST BUTTON -->
                        <button type="button" id="test-order-btn" style="width:100%; margin-top:20px; padding:12px; background-color:#333; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">
                            🛠️ TEST ORDER (No Payment)
                        </button>

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

    // --- TEST BUTTON LISTENER ---
    const testBtn = document.getElementById('test-order-btn');
    if(testBtn) {
        testBtn.addEventListener('click', () => {
            // Mock Data for Testing
            const dummyPayment = {
                id: "TEST-" + Math.floor(Math.random() * 100000),
                method: "TEST_BUTTON",
                payer: {
                    name: { given_name: "Test User" },
                    email_address: "test@example.com"
                }
            };
            saveOrderToFirebase(dummyPayment);
        });
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
        paymentMethod: paymentDetails.method === "TEST_BUTTON" ? "Test (No Payment)" : "PayPal", 
        timestamp: serverTimestamp()
    };
    
    try {
        await addDoc(collection(db, COLLECTION_NAME), orderData);
        cart = []; 
        saveCart(); 
        closeCart(); 
        showCartView(); 
        document.getElementById('order-form').reset();
        
        // --- CALL NEW SUCCESS MODAL ---
        showSuccessModal(paymentDetails.id);
        
    } catch(e) { console.error(e); alert("Payment success, but DB save failed."); }
}

// --- NEW SUCCESS MODAL FUNCTION ---
function showSuccessModal(orderId) {
    // CSS Keyframes for Full Screen Rocket Animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes rocket-circle-exit {
            0% {
                transform: translate(-50%, 120vh) rotate(-45deg); /* Start below */
                opacity: 1;
            }
            15% {
                transform: translate(-50%, 80vh) rotate(-45deg); /* Enter */
            }
            /* Start Circle: Bottom -> Left -> Top -> Right -> Bottom */
            30% {
                transform: translate(-80vw, 50vh) rotate(-90deg); /* Left */
            }
            45% {
                transform: translate(-50%, 10vh) rotate(45deg); /* Top */
            }
            60% {
                transform: translate(30vw, 50vh) rotate(135deg); /* Right */
            }
            75% {
                transform: translate(-50%, 80vh) rotate(225deg); /* Bottom again */
            }
            /* Exit */
            100% {
                transform: translate(120vw, -120vh) rotate(45deg); /* Exit Top Right */
                opacity: 0;
            }
        }
        @keyframes modal-fade-in {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
        }
        .fullscreen-rocket {
            position: fixed;
            left: 50%;
            bottom: 0;
            font-size: 10rem;
            z-index: 10000;
            pointer-events: none;
            /* Start below screen centered horizontally */
            transform: translate(-50%, 120vh);
            animation: rocket-circle-exit 4s ease-in-out forwards;
        }
        .success-backdrop {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 9999;
            display: flex; justify-content: center; align-items: center;
            backdrop-filter: blur(5px);
            opacity: 0; /* Start hidden */
            animation: modal-fade-in 0.6s ease-out forwards;
            animation-delay: 2.5s; /* Wait for rocket circle to finish mostly */
        }
    `;
    document.head.appendChild(style);

    // Create the HTML elements
    const successHTML = `
    <!-- The Flying Rocket -->
    <div class="fullscreen-rocket">🚀</div>

    <!-- The Modal (appears after delay) -->
    <div id="success-overlay" class="success-backdrop">
        <div style="background:#FEF6EC; padding:40px; border-radius:24px; text-align:center; max-width:500px; width:90%; border:4px solid #FD4D0A; box-shadow:0 25px 60px rgba(0,0,0,0.5);">
            <h2 style="color:#FD4D0A; font-family:'Chelsea Market', cursive; margin-bottom:15px; font-size:2.2rem;">Order Confirmed!</h2>
            <div style="width: 50px; height: 4px; background: #FFBC00; margin: 0 auto 20px auto; border-radius: 2px;"></div>
            <p style="font-size:1.15rem; color:#333; margin-bottom:20px; line-height:1.6;">
                <strong>Thank you for your order!</strong><br>
                We have received your details. Our team is preparing your package and will ship it on the <strong>31st of Jan</strong>!
            </p>
            <div style="background: white; padding: 10px; border-radius: 8px; border: 1px dashed #ccc; margin-bottom: 25px; display: inline-block;">
                <p style="font-size:0.9rem; color:#555; margin:0;"><strong>Order ID:</strong> <span style="font-family:monospace; font-size: 1rem; color: #333;">${orderId}</span></p>
            </div>
            <br>
            <button onclick="document.getElementById('success-overlay').remove(); document.querySelector('.fullscreen-rocket').remove();" class="btn" style="padding:14px 35px; font-size:1.1rem; border:none; border-radius:50px; background:#FD4D0A; color:white; cursor:pointer; font-weight: 700; box-shadow: 0 5px 15px rgba(253, 77, 10, 0.4); transition: transform 0.2s;">
                Back to Store
            </button>
        </div>
    </div>
    `;
    
    // Inject into body
    document.body.insertAdjacentHTML('beforeend', successHTML);
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