/**
 * ======================================================
 * JAVASCRIPT FOR KAYA STORE
 * ======================================================
 */

// 1. Setup Cart Logic
let cart = JSON.parse(localStorage.getItem('kayaCart')) || [];

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

// 2. Inject Cart & Professional Checkout Modal HTML
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
            <div id="checkout-view" style="display:none; height: 100%; display: flex; flex-direction: column;">
                <div class="cart-header">
                    <button class="back-to-cart"><i class="fas fa-arrow-left"></i> Back</button>
                    <h3>Secure Checkout</h3>
                    <button class="close-cart"><i class="fas fa-times"></i></button>
                </div>
                <div class="cart-body">
                    <form id="order-form">
                        
                        <h4 class="checkout-section-title"><i class="fas fa-shipping-fast"></i> Shipping Details</h4>
                        <div class="checkout-grid">
                            <div class="form-group">
                                <label for="name">Full Name</label>
                                <input type="text" id="name" placeholder="e.g. John Doe" required>
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" placeholder="e.g. +60 12-345 6789" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" placeholder="e.g. john@example.com" required>
                        </div>

                        <div class="form-group">
                            <label for="address">Shipping Address</label>
                            <input type="text" id="address" placeholder="Street, City, Zip Code" required>
                        </div>
                        
                        <h4 class="checkout-section-title" style="margin-top: 25px;"><i class="fas fa-credit-card"></i> Payment Method</h4>
                        <div class="payment-options">
                            <div class="payment-option selected" onclick="selectPayment(this, 'credit-card')">
                                <i class="fab fa-cc-visa"></i>
                                <span>Credit Card</span>
                            </div>
                            <div class="payment-option" onclick="selectPayment(this, 'paypal')">
                                <i class="fab fa-paypal"></i>
                                <span>PayPal</span>
                            </div>
                            <div class="payment-option" onclick="selectPayment(this, 'transfer')">
                                <i class="fas fa-university"></i>
                                <span>Bank Transfer</span>
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

    // Initial view state management manually to ensure it's hidden correctly
    document.getElementById('checkout-view').style.display = 'none';

    // Bind Event Listeners
    document.querySelectorAll('.close-cart').forEach(btn => btn.addEventListener('click', closeCart));
    
    const overlay = document.querySelector('.cart-modal-overlay');
    if(overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCart();
    });
    
    // Switch between Cart and Checkout
    document.querySelector('.checkout-btn').addEventListener('click', showCheckout);
    document.querySelector('.back-to-cart').addEventListener('click', showCartView);

    // Handle Form Submission
    document.getElementById('order-form').addEventListener('submit', handlePlaceOrder);
}

// Global function for payment selection
window.selectPayment = function(element, method) {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

function showCheckout() {
    if(cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    document.getElementById('cart-view').style.display = 'none';
    document.getElementById('checkout-view').style.display = 'flex'; // Use flex to maintain layout
    
    // Update total in checkout view
    const totalEl = document.querySelector('.total-price').textContent;
    document.querySelector('.checkout-total-price').textContent = totalEl;
}

function showCartView() {
    document.getElementById('checkout-view').style.display = 'none';
    document.getElementById('cart-view').style.display = 'block';
}

function handlePlaceOrder(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    
    if(name && address && email) {
        // Simulate Processing
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert(`🎉 Order Success!\n\nThank you, ${name}.\nA confirmation email has been sent to ${email}.\nYour order will ship to: ${address}`);
            cart = [];
            saveCart();
            closeCart();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            showCartView(); // Reset view for next time
        }, 2000);
    }
}

function openCart() {
    const modal = document.querySelector('.cart-modal-overlay');
    if (modal) {
        renderCartItems();
        modal.classList.add('open');
        showCartView(); // Always start on cart view
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

    // Rounding Logic
    let roundedTotal = Math.round(exactTotal);

    container.innerHTML = html;
    totalEl.textContent = 'USD ' + roundedTotal.toFixed(2);
}

// 3. Page Initialization
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
            
            if(id && name && price) {
                addToCart(id, name, price);
            }
        });
    });

    const cartWrapper = document.querySelector('.cart-wrapper');
    if(cartWrapper) {
        cartWrapper.addEventListener('click', openCart);
    } else {
        const rawIcon = document.querySelector('.cart-icon');
        if(rawIcon) rawIcon.addEventListener('click', openCart);
    }
});