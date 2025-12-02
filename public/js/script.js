/**
 * ======================================================
 * JAVASCRIPT FOR KAYA STORE (FIREBASE BACKEND)
 * ======================================================
 */

// 1. IMPORT FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// 2. CONFIGURE FIREBASE
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// 3. CART STATE
let cart = JSON.parse(localStorage.getItem('kayaCart')) || [];
let user = null;

// 4. AUTHENTICATE
signInAnonymously(auth)
    .then((userCredential) => {
        user = userCredential.user;
        console.log("Connected to Backend as:", user.uid);
    })
    .catch((error) => {
        console.error("Backend Error:", error);
    });

// --- CORE FUNCTIONS ---

function saveCart() {
    localStorage.setItem('kayaCart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function updateCartCount() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.textContent = cart.length;
        if (cart.length > 0) {
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }
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

// --- MODAL & UI ---

function injectCartModal() {
    const modalHTML = `
    <div class="cart-modal-overlay">
        <div class="cart-modal">
            
            <!-- CART VIEW -->
            <div id="cart-view">
                <div class="cart-header">
                    <h3>Your Shopping Cart</h3>
                    <button class="close-cart"><i class="fas fa-times"></i></button>
                </div>
                <div class="cart-body">
                    <div class="cart-items">
                        <p style="text-align:center; color:#666; margin-top:20px;">Your cart is empty.</p>
                    </div>
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total (Rounded):</span>
                        <span class="total-price">USD 0.00</span>
                    </div>
                    <button class="btn btn-primary checkout-btn" style="width:100%">Proceed to Checkout</button>
                </div>
            </div>

            <!-- CHECKOUT FORM VIEW -->
            <div id="checkout-view" style="display:none;">
                <div class="cart-header">
                    <button class="back-to-cart"><i class="fas fa-arrow-left"></i> Back</button>
                    <h3>Secure Checkout</h3>
                    <button class="close-cart"><i class="fas fa-times"></i></button>
                </div>
                <div class="cart-body">
                    <form id="order-form">
                        
                        <h4 class="checkout-section-title"><i class="fas fa-user-circle"></i> Contact Info</h4>
                        <div class="form-group">
                            <label for="name">Full Name</label>
                            <input type="text" id="name" placeholder="e.g. John Doe" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" placeholder="e.g. john@example.com" required>
                        </div>

                        <div class="form-group">
                            <label>Phone Number</label>
                            <div class="phone-group">
                                <select id="country-code" required>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+60" selected>🇲🇾 +60</option>
                                    <option value="+65">🇸🇬 +65</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+61">🇦🇺 +61</option>
                                    <option value="">Other</option>
                                </select>
                                <input type="tel" id="phone" placeholder="12-345 6789" required>
                            </div>
                        </div>

                        <h4 class="checkout-section-title" style="margin-top: 25px;"><i class="fas fa-map-marker-alt"></i> Shipping Address</h4>
                        
                        <div class="form-row">
                            <div class="form-group" style="flex: 2;">
                                <label for="street">Street Name</label>
                                <input type="text" id="street" placeholder="e.g. Jalan Kaya" required>
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label for="house-number">Unit No.</label>
                                <input type="text" id="house-number" placeholder="e.g. No. 8" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="zip">Zip Code</label>
                                <input type="text" id="zip" placeholder="e.g. 50000" required>
                            </div>
                            <div class="form-group">
                                <label for="city">City</label>
                                <input type="text" id="city" placeholder="e.g. Kuala Lumpur" required>
                            </div>
                        </div>
                        
                        <h4 class="checkout-section-title" style="margin-top: 25px;"><i class="fas fa-credit-card"></i> Payment Method</h4>
                        <div class="payment-options">
                            <div class="payment-option selected" onclick="selectPayment(this, 'credit-card')">
                                <i class="fab fa-cc-visa"></i>
                                <span>Card</span>
                            </div>
                            <div class="payment-option" onclick="selectPayment(this, 'paypal')">
                                <i class="fab fa-paypal"></i>
                                <span>PayPal</span>
                            </div>
                            <div class="payment-option" onclick="selectPayment(this, 'transfer')">
                                <i class="fas fa-university"></i>
                                <span>Transfer</span>
                            </div>
                        </div>

                        <!-- CREDIT CARD FORM (Only Shows if Card Selected) -->
                        <div id="credit-card-form" class="credit-card-form active">
                            <div class="form-group">
                                <label>Card Number</label>
                                <div style="position: relative;">
                                    <input type="text" id="card-number" placeholder="0000 0000 0000 0000" maxlength="19">
                                    <div class="card-icons" style="position: absolute; right: 10px; top: 10px;">
                                        <i class="fab fa-cc-visa"></i> <i class="fab fa-cc-mastercard"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Expiry Date</label>
                                    <input type="text" id="card-expiry" placeholder="MM/YY" maxlength="5">
                                </div>
                                <div class="form-group">
                                    <label>CVV</label>
                                    <input type="text" id="card-cvv" placeholder="123" maxlength="3">
                                </div>
                            </div>
                        </div>

                        <div class="cart-total" style="font-size: 1.2rem; border-top: 1px solid #ddd; padding-top: 15px;">
                            <span>Total to Pay:</span>
                            <span class="checkout-total-price">USD 0.00</span>
                        </div>

                        <button type="submit" class="btn btn-primary" style="width:100%; margin-top: 15px; font-size: 1.1rem;">
                            <i class="fas fa-lock"></i> Place Secure Order
                        </button>
                    </form>
                </div>
            </div>

        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('checkout-view').style.display = 'none';

    // Event Listeners
    document.querySelectorAll('.close-cart').forEach(btn => btn.addEventListener('click', closeCart));
    const overlay = document.querySelector('.cart-modal-overlay');
    if(overlay) overlay.addEventListener('click', (e) => { if(e.target === overlay) closeCart(); });
    
    document.querySelector('.checkout-btn').addEventListener('click', showCheckout);
    document.querySelector('.back-to-cart').addEventListener('click', showCartView);
    document.getElementById('order-form').addEventListener('submit', handlePlaceOrder);
}

// Global Payment Selector
window.selectPayment = function(element, method) {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    
    // Toggle Card Form
    const cardForm = document.getElementById('credit-card-form');
    if(method === 'credit-card') {
        cardForm.classList.add('active');
        // Require fields
        document.getElementById('card-number').required = true;
    } else {
        cardForm.classList.remove('active');
        document.getElementById('card-number').required = false;
    }
}

function showCheckout() {
    if(cart.length === 0) return alert("Cart empty");
    document.getElementById('cart-view').style.display = 'none';
    document.getElementById('checkout-view').style.display = 'flex';
    document.querySelector('.checkout-total-price').textContent = document.querySelector('.total-price').textContent;
}

function showCartView() {
    document.getElementById('checkout-view').style.display = 'none';
    document.getElementById('cart-view').style.display = 'flex';
}

async function handlePlaceOrder(e) {
    e.preventDefault();
    if(!user) return alert("Connecting to server... please wait.");

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
    submitBtn.disabled = true;

    // Collect Data
    const orderData = {
        customer: {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('country-code').value + " " + document.getElementById('phone').value,
            address: {
                street: document.getElementById('street').value,
                unit: document.getElementById('house-number').value,
                zip: document.getElementById('zip').value,
                city: document.getElementById('city').value
            }
        },
        items: cart,
        total: document.querySelector('.checkout-total-price').textContent,
        status: "PAID",
        paymentMethod: document.querySelector('.payment-option.selected').textContent.trim(),
        timestamp: serverTimestamp()
    };

    try {
        // SAVE TO FIREBASE BACKEND
        const orderRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
        await addDoc(orderRef, orderData);

        // Success
        setTimeout(() => {
            alert(`🎉 Payment Approved!\n\nOrder ID: #${Math.floor(Math.random()*10000)}\n\nThank you, ${orderData.customer.name}. We will ship to ${orderData.customer.address.city}.`);
            cart = [];
            saveCart();
            closeCart();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            e.target.reset();
            showCartView();
        }, 1500);

    } catch (error) {
        console.error("Order Failed", error);
        alert("Transaction Failed. Please try again.");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function openCart() {
    const modal = document.querySelector('.cart-modal-overlay');
    if (modal) {
        renderCartItems();
        modal.classList.add('open');
        showCartView();
    }
}

function closeCart() {
    const modal = document.querySelector('.cart-modal-overlay');
    if (modal) modal.classList.remove('open');
}

function renderCartItems() {
    const container = document.querySelector('.cart-items');
    const totalEl = document.querySelector('.total-price');
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666; margin-top:20px;">Your cart is empty.</p>';
        totalEl.textContent = 'USD 0.00';
        return;
    }

    let html = '';
    let exactTotal = 0;

    cart.forEach((item, index) => {
        let priceVal = parseFloat(item.price);
        exactTotal += priceVal;
        
        html += `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="cart-item-price">USD ${priceVal.toFixed(2)}</span>
            </div>
            <i class="fas fa-trash remove-item" onclick="removeFromCart(${index})"></i>
        </div>
        `;
    });

    let roundedTotal = Math.round(exactTotal);
    container.innerHTML = html;
    totalEl.textContent = 'USD ' + roundedTotal.toFixed(2);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();

    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    injectCartModal();
    updateCartCount();

    const addBtns = document.querySelectorAll('.add-to-cart-btn');
    addBtns.forEach(btn => {
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