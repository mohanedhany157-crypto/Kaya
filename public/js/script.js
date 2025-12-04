/**
 * ======================================================
 * JAVASCRIPT FOR KAYA STORE (UPDATED)
 * ======================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

// --- 2. SPACE BACKGROUND (KAYA THEMED STARS) ---
function initSpaceBackground() {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    const numStars = 400; 
    let mouseX = 0, mouseY = 0;
    
    // KAYA BRAND COLORS
    const kayaColors = ['#FD4D0A', '#FFBC00', '#4D9222', '#0094E8'];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - width / 2) * 0.02;
        mouseY = (e.clientY - height / 2) * 0.02;
    });

    class Star {
        constructor() { this.reset(); }
        reset() {
            this.x = (Math.random() - 0.5) * width * 2;
            this.y = (Math.random() - 0.5) * height * 2;
            this.z = Math.random() * width; 
            this.size = Math.random() * 2;
            this.color = kayaColors[Math.floor(Math.random() * kayaColors.length)];
        }
        update() {
            this.z -= 2; // Speed
            if (this.z <= 0) this.reset();
        }
        draw() {
            const x = (this.x - mouseX) * (width / this.z) + width / 2;
            const y = (this.y - mouseY) * (width / this.z) + height / 2;
            const s = (1 - this.z / width) * this.size * 2.5;
            if (x > 0 && x < width && y > 0 && y < height) {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(x, y, s, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    for (let i = 0; i < numStars; i++) stars.push(new Star());

    function animate() {
        ctx.clearRect(0, 0, width, height);
        stars.forEach(star => { star.update(); star.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}

// --- 3. PRODUCT DATABASE ---
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

// --- 4. INIT ---
document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('current-year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
    
    initSpaceBackground(); 

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
    
    // --- RANDOM COLOR GENERATOR FOR DESCRIPTION ---
    // User requested "randomly same colors as kaya" for the black text
    const descText = product.desc;
    const words = descText.split(' ');
    // Kaya Colors Classes: k (Orange), a1 (Yellow), y (Green), a2 (Blue)
    const colorClasses = ['k', 'a1', 'y', 'a2', 'a2']; // Added blue twice for balance or just random
    
    // We rebuild the description paragraph with spans
    let colorfulDesc = '';
    words.forEach(word => {
        // Pick random class
        const randomClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
        colorfulDesc += `<span class="${randomClass}">${word}</span> `;
    });
    
    document.getElementById('p-desc').innerHTML = colorfulDesc;
    
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

    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        addToCart(id, product.name, product.price);
    });
}

// --- 5. CART LOGIC ---
let cart = JSON.parse(localStorage.getItem('kayaCart')) || [];
function saveCart() { localStorage.setItem('kayaCart', JSON.stringify(cart)); updateCartCount(); renderCartItems(); }
function updateCartCount() {
    const badge = document.querySelector('.cart-badge');
    if(badge) { badge.textContent = cart.length; cart.length > 0 ? badge.classList.add('show') : badge.classList.remove('show'); }
}
function addToCart(id, name, price) { cart.push({ id, name, price }); saveCart(); openCart(); }
function removeFromCart(index) { cart.splice(index, 1); saveCart(); }
function getCartTotal() { let t = 0; cart.forEach(i => t += parseFloat(i.price)); return Math.round(t).toFixed(2); }

// --- 6. MODAL UI ---
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
                        <div class="form-group"><label>Phone</label><div class="phone-group">
                            <select id="country-code"><option value="+1">+1 (US)</option><option value="+60" selected>+60 (MY)</option></select>
                            <input type="tel" id="phone" required></div></div>
                        <h4 class="checkout-section-title" style="margin-top:20px;"><i class="fas fa-map-marker-alt"></i> Address</h4>
                        <div class="form-row"><div class="form-group" style="flex:2"><input type="text" id="street" placeholder="Street" required></div><div class="form-group" style="flex:1"><input type="text" id="unit" placeholder="Unit" required></div></div>
                        <div class="form-row"><div class="form-group"><input type="text" id="zip" placeholder="Zip" required></div><div class="form-group"><input type="text" id="city" placeholder="City" required></div></div>
                        <h4 class="checkout-section-title" style="margin-top:20px;"><i class="fas fa-credit-card"></i> Payment</h4>
                        <div id="paypal-button-container" style="margin-top: 10px;"></div>
                        <div id="manual-payment-section" style="margin-top:15px; border-top:1px solid #ddd; padding-top:15px;">
                            <p style="font-size:0.9rem; color:#666; margin-bottom:10px; text-align:center;">Having trouble? Use Manual Transfer.</p>
                            <button type="submit" id="manual-order-btn" class="btn btn-secondary" style="width:100%;">Confirm (Manual)</button>
                        </div>
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
    const form = document.getElementById('order-form');
    if(form) form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveOrderToFirebase({ id: "MANUAL-" + Math.floor(Math.random() * 100000), method: "Manual/Local", payer: { name: { given_name: document.getElementById('name').value } } });
    });
}
function showCheckout() {
    if(cart.length === 0) return alert("Cart is empty");
    document.getElementById('cart-view').style.display = 'none';
    document.getElementById('checkout-view').style.display = 'flex';
    document.getElementById('paypal-button-container').innerHTML = ''; 
    if (window.paypal) {
        window.paypal.Buttons({
            createOrder: (data, actions) => actions.order.create({ purchase_units: [{ amount: { value: getCartTotal() } }] }),
            onApprove: (data, actions) => actions.order.capture().then(details => { details.method = "PayPal"; saveOrderToFirebase(details); })
        }).render('#paypal-button-container');
    }
}
function showCartView() { document.getElementById('checkout-view').style.display = 'none'; document.getElementById('cart-view').style.display = 'flex'; }
async function saveOrderToFirebase(paymentDetails) {
    const orderData = {
        customer: {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('country-code').value + document.getElementById('phone').value,
            address: { street: document.getElementById('street').value, unit: document.getElementById('unit').value, zip: document.getElementById('zip').value, city: document.getElementById('city').value }
        },
        items: cart, total: getCartTotal(), status: "PAID", paymentId: paymentDetails.id, paymentMethod: paymentDetails.method, timestamp: serverTimestamp()
    };
    try {
        await addDoc(collection(db, COLLECTION_NAME), orderData);
        alert(`🎉 Order Success! ID: ${paymentDetails.id}`);
        cart = []; saveCart(); closeCart(); showCartView(); document.getElementById('order-form').reset();
    } catch(e) { console.error(e); alert("Payment success, but DB save failed."); }
}
function openCart() { renderCartItems(); document.querySelector('.cart-modal-overlay').classList.add('open'); showCartView(); }
function closeCart() { document.querySelector('.cart-modal-overlay').classList.remove('open'); }
function renderCartItems() {
    const container = document.querySelector('.cart-items');
    if(cart.length === 0) { container.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Empty</p>'; document.querySelector('.total-price').textContent = 'USD 0.00'; return; }
    let html = '';
    cart.forEach((item, i) => { html += `<div class="cart-item"><div class="cart-item-info"><h4>${item.name}</h4><span>USD ${item.price}</span></div><i class="fas fa-trash remove-item" onclick="removeFromCart(${i})"></i></div>`; });
    container.innerHTML = html; document.querySelector('.total-price').textContent = 'USD ' + getCartTotal();
}
window.removeFromCart = removeFromCart;