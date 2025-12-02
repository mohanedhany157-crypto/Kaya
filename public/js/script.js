/**
 * ======================================================
 * JAVASCRIPT FOR KAYA STORE (PAYPAL + MANUAL + FIREBASE)
 * ======================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let cart = JSON.parse(localStorage.getItem('kayaCart')) || [];
signInAnonymously(auth);

// --- CART FUNCTIONS ---
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

// --- MODAL & UI ---
function injectCartModal() {
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

                        <h4 class="checkout-section-title" style="margin-top:20px;"><i class="fas fa-credit-card"></i> Payment Method</h4>
                        
                        <div class="payment-options">
                            <div class="payment-option selected" onclick="selectPayment('paypal')">
                                <i class="fab fa-paypal"></i> <span>Card / PayPal</span>
                            </div>
                            <div class="payment-option" onclick="selectPayment('transfer')">
                                <i class="fas fa-university"></i> <span>Bank Transfer</span>
                            </div>
                        </div>

                        <!-- PAYPAL CONTAINER -->
                        <div id="paypal-section">
                            <div id="paypal-button-container" style="margin-top: 10px;"></div>
                        </div>

                        <!-- MANUAL TRANSFER INSTRUCTIONS -->
                        <div id="transfer-section" style="display:none; text-align:center; padding:15px; background:#f9f9f9; border-radius:8px;">
                            <p style="margin:0 0 10px 0;">Please transfer <strong>USD <span class="final-total"></span></strong> to:</p>
                            <p><strong>Bank:</strong> Maybank<br><strong>Acc:</strong> 1234567890<br><strong>Name:</strong> Kaya Games</p>
                            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">I Have Transferred</button>
                        </div>
                        
                    </form>
                </div>
            </div>

        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupEventListeners();
}

// Payment Switcher
window.selectPayment = function(method) {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    
    if(method === 'paypal') {
        document.querySelectorAll('.payment-option')[0].classList.add('selected');
        document.getElementById('paypal-section').style.display = 'block';
        document.getElementById('transfer-section').style.display = 'none';
    } else {
        document.querySelectorAll('.payment-option')[1].classList.add('selected');
        document.getElementById('paypal-section').style.display = 'none';
        document.getElementById('transfer-section').style.display = 'block';
        document.querySelector('.final-total').textContent = getCartTotal();
    }
}

function setupEventListeners() {
    document.querySelectorAll('.close-cart').forEach(b => b.addEventListener('click', closeCart));
    document.querySelector('.checkout-btn').addEventListener('click', showCheckout);
    document.querySelector('.back-to-cart').addEventListener('click', showCartView);
    document.querySelector('.cart-modal-overlay').addEventListener('click', (e) => {
        if(e.target === document.querySelector('.cart-modal-overlay')) closeCart();
    });
    
    // Manual Form Submit
    document.getElementById('order-form').addEventListener('submit', (e) => {
        e.preventDefault();
        // Manual Transfer Flow
        const name = document.getElementById('name').value;
        if(!name) return alert("Please fill in details");
        
        saveOrderToFirebase({
            id: "MANUAL-" + Math.floor(Math.random()*10000),
            payer: { name: { given_name: name } },
            method: "Bank Transfer"
        });
    });
}

function showCheckout() {
    if(cart.length === 0) return alert("Cart is empty");
    
    document.getElementById('cart-view').style.display = 'none';
    document.getElementById('checkout-view').style.display = 'flex';
    
    // Initial Render of PayPal
    document.getElementById('paypal-button-container').innerHTML = ''; 
    
    if (window.paypal) {
        window.paypal.Buttons({
            createOrder: function(data, actions) {
                const name = document.getElementById('name').value;
                if(!name) {
                    alert("Please fill in Name and Email first!");
                    return actions.reject();
                }
                return actions.order.create({
                    purchase_units: [{ amount: { value: getCartTotal() } }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    details.method = "PayPal/Card";
                    saveOrderToFirebase(details);
                });
            }
        }).render('#paypal-button-container');
    }
}

async function saveOrderToFirebase(paymentDetails) {
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
        status: paymentDetails.method === "Bank Transfer" ? "PENDING (Verify)" : "PAID",
        paymentId: paymentDetails.id,
        paymentMethod: paymentDetails.method,
        timestamp: serverTimestamp()
    };

    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
        alert(`Order Placed! Thank you, ${paymentDetails.payer.name.given_name}.`);
        cart = [];
        saveCart();
        closeCart();
        showCartView();
        document.getElementById('order-form').reset();
    } catch(e) {
        console.error("DB Error", e);
        alert("Error saving order. Please screenshot this.");
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