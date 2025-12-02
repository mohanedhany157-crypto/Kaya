/**
 * ======================================================
 * JAVASCRIPT FOR KAYA STORE (FIREBASE CONNECTED)
 * ======================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- 1. FIREBASE CONFIGURATION ---
// 🔴 ACTION REQUIRED: PASTE YOUR FIREBASE CONFIG INSIDE THESE BRACKETS 🔴
const MANUAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDAFC257zzL0Q0T1crkPaYojnIgZQfYqUA",
  authDomain: "kaya-store-31083.firebaseapp.com",
  projectId: "kaya-store-31083",
  storageBucket: "kaya-store-31083.firebasestorage.app",
  messagingSenderId: "935048383330",
  appId: "1:935048383330:web:7d7444406aefa975677a3b",
  measurementId: "G-Q05ZZFHSM3"
};

let db, auth;
// We try to connect. If you pasted the config above, it will work!
try {
    const app = initializeApp(MANUAL_FIREBASE_CONFIG);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Connect Anonymously to allow writing to DB
    signInAnonymously(auth)
        .then(() => console.log("🔥 Firebase Connected Successfully"))
        .catch(e => console.error("Auth Failed:", e));

} catch (e) {
    console.error("Firebase Connection Failed. Did you paste the config?", e);
}

// --- 2. CART STATE ---
let cart = JSON.parse(localStorage.getItem('kayaCart')) || [];

// --- 3. CART FUNCTIONS ---
function saveCart() {
    localStorage.setItem('kayaCart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function updateCartCount() {
    const badge = document.querySelector('.cart-badge');
    if(badge) badge.textContent = cart.length;
    if(badge && cart.length > 0) badge.classList.add('show');
    else if(badge) badge.classList.remove('show');
}

function addToCart(id, name, price) {
    cart.push({ id, name, price });
    saveCart();
    openCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

function getCartTotal() {
    let total = 0;
    cart.forEach(item => total += parseFloat(item.price));
    return Math.round(total).toFixed(2);
}

// --- 4. MODAL & UI ---
function injectCartModal() {
    if(document.querySelector('.cart-modal-overlay')) return;

    const modalHTML = `
    <div class="cart-modal-overlay">
        <div class="cart-modal">
            
            <!-- VIEW 1: CART -->
            <div id="cart-view">
                <div class="cart-header">
                    <h3>Your Cart</h3>
                    <button class="close-cart"><i class="fas fa-times"></i></button>
                </div>
                <div class="cart-body">
                    <div class="cart-items"></div>
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span class="total-price">USD 0.00</span>
                    </div>
                    <button class="btn btn-primary checkout-btn" style="width:100%">Checkout</button>
                </div>
            </div>

            <!-- VIEW 2: CHECKOUT FORM -->
            <div id="checkout-view" style="display:none; height:100%; flex-direction:column;">
                <div class="cart-header">
                    <button class="back-to-cart"><i class="fas fa-arrow-left"></i> Back</button>
                    <h3>Secure Checkout</h3>
                    <button class="close-cart"><i class="fas fa-times"></i></button>
                </div>
                <div class="cart-body">
                    <form id="order-form">
                        <h4 class="checkout-section-title"><i class="fas fa-user"></i> Details</h4>
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="name" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <div class="phone-group">
                                <select id="country-code">
                                    <option value="+1">+1 (US)</option>
                                    <option value="+60" selected>+60 (MY)</option>
                                    <option value="+44">+44 (UK)</option>
                                </select>
                                <input type="tel" id="phone" required>
                            </div>
                        </div>

                        <h4 class="checkout-section-title" style="margin-top:20px;"><i class="fas fa-map-marker-alt"></i> Address</h4>
                        <div class="form-row">
                            <div class="form-group" style="flex:2"><input type="text" id="street" placeholder="Street" required></div>
                            <div class="form-group" style="flex:1"><input type="text" id="unit" placeholder="Unit" required></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><input type="text" id="zip" placeholder="Zip" required></div>
                            <div class="form-group"><input type="text" id="city" placeholder="City" required></div>
                        </div>

                        <h4 class="checkout-section-title" style="margin-top:20px;"><i class="fas fa-credit-card"></i> Payment</h4>
                        
                        <!-- PAYPAL CONTAINER -->
                        <div id="paypal-button-container" style="margin-top: 10px;"></div>
                        
                        <!-- Manual Button (Always visible if PayPal fails or for testing) -->
                        <div id="manual-payment-section" style="margin-top:15px; border-top:1px solid #eee; padding-top:15px;">
                            <p style="font-size:0.9rem; color:#666; margin-bottom:10px; text-align:center;">Having trouble with PayPal? Use Manual Transfer.</p>
                            <button type="submit" id="manual-order-btn" class="btn btn-secondary" style="width:100%;">Place Order (Manual Transfer)</button>
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
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    if(checkoutBtn) checkoutBtn.addEventListener('click', showCheckout);
    
    const backBtn = document.querySelector('.back-to-cart');
    if(backBtn) backBtn.addEventListener('click', showCartView);
    
    const overlay = document.querySelector('.cart-modal-overlay');
    if(overlay) overlay.addEventListener('click', (e) => {
        if(e.target === document.querySelector('.cart-modal-overlay')) closeCart();
    });

    // Manual fallback submit
    const form = document.getElementById('order-form');
    if(form) form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveOrderToFirebase({ 
            id: "MANUAL-" + Math.floor(Math.random() * 100000), 
            method: "Manual/Local",
            payer: { name: { given_name: document.getElementById('name').value } }
        });
    });
}

function showCheckout() {
    if(cart.length === 0) return alert("Cart is empty");
    
    document.getElementById('cart-view').style.display = 'none';
    document.getElementById('checkout-view').style.display = 'flex';
    
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = ''; 
    
    // Check if PayPal loaded
    if (window.paypal) {
        window.paypal.Buttons({
            createOrder: function(data, actions) {
                const name = document.getElementById('name').value;
                if(!name) {
                    alert("Please fill in your Name first!");
                    return actions.reject();
                }
                return actions.order.create({
                    purchase_units: [{ amount: { value: getCartTotal() } }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    details.method = "PayPal";
                    saveOrderToFirebase(details);
                });
            },
            onError: function(err) {
                console.error("PayPal Error:", err);
                alert("PayPal failed to load. Please use Manual Transfer below.");
            }
        }).render('#paypal-button-container');
    }
}

async function saveOrderToFirebase(paymentDetails) {
    if (!db) {
        alert("⚠️ DATABASE NOT CONNECTED!\n\nPlease paste your Firebase Config into script.js (lines 13-19) to save orders.");
        return;
    }

    const orderData = {
        customer: {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('country-code').value + document.getElementById('phone').value,
            address: {
                street: document.getElementById('street').value,
                unit: document.getElementById('unit').value,
                zip: document.getElementById('zip').value,
                city: document.getElementById('city').value
            }
        },
        items: cart,
        total: getCartTotal(),
        status: paymentDetails.method === "PayPal" ? "PAID" : "PENDING (Manual)",
        paymentId: paymentDetails.id,
        paymentMethod: paymentDetails.method,
        timestamp: serverTimestamp()
    };

    try {
        await addDoc(collection(db, 'kaya_orders'), orderData);
        alert(`🎉 Order Placed Successfully!\n\nThank you, ${orderData.customer.name}.\nOrder ID: ${paymentDetails.id}`);
        cart = [];
        saveCart();
        closeCart();
        showCartView();
        document.getElementById('order-form').reset();
    } catch(e) {
        console.error("DB Error", e);
        // Fallback for permission errors
        if (e.code === 'permission-denied') {
            alert("Error: Database permission denied. \n\nGo to Firebase Console -> Firestore Database -> Rules -> Change 'allow read, write: if false;' to 'allow read, write: if true;'");
        } else {
            alert("Payment successful but failed to save order to database.");
        }
    }
}

function showCartView() {
    document.getElementById('checkout-view').style.display = 'none';
    document.getElementById('cart-view').style.display = 'flex';
}

function openCart() {
    renderCartItems();
    document.querySelector('.cart-modal-overlay').classList.add('open');
    showCartView();
}

function closeCart() {
    document.querySelector('.cart-modal-overlay').classList.remove('open');
}

function renderCartItems() {
    const container = document.querySelector('.cart-items');
    if(!container) return;

    if(cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Empty</p>';
        document.querySelector('.total-price').textContent = 'USD 0.00';
        return;
    }
    
    let html = '';
    cart.forEach((item, i) => {
        html += `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>USD ${item.price}</span>
            </div>
            <i class="fas fa-trash remove-item" onclick="removeFromCart(${i})"></i>
        </div>`;
    });
    container.innerHTML = html;
    document.querySelector('.total-price').textContent = 'USD ' + getCartTotal();
}

// Global Exports
window.removeFromCart = removeFromCart;

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

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            if(id) addToCart(id, name, price);
        });
    });

    const cartWrapper = document.querySelector('.cart-wrapper');
    if(cartWrapper) cartWrapper.addEventListener('click', openCart);
});