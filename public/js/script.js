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

// 2. Inject Cart & Granular Checkout Modal HTML
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
                                    <option value="+1">🇺🇸 +1 (US)</option>
                                    <option value="+60" selected>🇲🇾 +60 (MY)</option>
                                    <option value="+65">🇸🇬 +65 (SG)</option>
                                    <option value="+44">🇬🇧 +44 (UK)</option>
                                    <option value="+61">🇦🇺 +61 (AU)</option>
                                    <option value="+62">🇮🇩 +62 (ID)</option>
                                    <option value="+63">🇵🇭 +63 (PH)</option>
                                    <option value="+66">🇹🇭 +66 (TH)</option>
                                    <option value="+81">🇯🇵 +81 (JP)</option>
                                    <option value="+86">🇨🇳 +86 (CN)</option>
                                    <option value="">Other</option>
                                </select>
                                <input type="tel" id="phone" placeholder="12-345 6789" required>
                            </div>
                        </div>

                        <h4 class="checkout-section-title" style="margin-top: 25px;"><i class="fas fa-map-marker-alt"></i> Shipping Address</h4>
                        
                        <!-- Row 1: Street & House No -->
                        <div class="form-row">
                            <div class="form-group" style="flex: 2;">
                                <label for="street">Street Name</label>
                                <input type="text" id="street" placeholder="e.g. Jalan Kaya" required>
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label for="house-number">House/Unit No.</label>
                                <input type="text" id="house-number" placeholder="e.g. No. 8" required>
                            </div>
                        </div>

                        <!-- Row 2: Zip & City -->
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

                        <div class="cart-total" style="font-size: 1.2rem; border-top: 1px solid #ddd; padding-top: 15px;">
                            <span>Total to Pay:</span>
                            <span class="checkout-total-price">USD 0.00</span>
                        </div>

                        <button type="submit" class="btn btn-primary" style="width:100%; margin-top: 15px; font-size: 1.1rem;">
                            <i class="fas fa-lock"></i> Pay Securely
                        </button>
                    </form>
                </div>
            </div>

        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Initial View
    document.getElementById('checkout-view').style.display = 'none';

    // Bind Event Listeners
    document.querySelectorAll('.close-cart').forEach(btn => btn.addEventListener('click', closeCart));
    
    const overlay = document.querySelector('.cart-modal-overlay');
    if(overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCart();
    });
    
    // View Switching
    document.querySelector('.checkout-btn').addEventListener('click', showCheckout);
    document.querySelector('.back-to-cart').addEventListener('click', showCartView);

    // Form Submission
    document.getElementById('order-form').addEventListener('submit', handlePlaceOrder);
}

// Global payment selection helper
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
    document.getElementById('checkout-view').style.display = 'flex';
    
    // Sync total
    const totalEl = document.querySelector('.total-price').textContent;
    document.querySelector('.checkout-total-price').textContent = totalEl;
}

function showCartView() {
    document.getElementById('checkout-view').style.display = 'none';
    document.getElementById('cart-view').style.display = 'block';
}

function handlePlaceOrder(e) {
    e.preventDefault();
    
    // Gather Granular Data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const countryCode = document.getElementById('country-code').value;
    const phone = document.getElementById('phone').value;
    
    const street = document.getElementById('street').value;
    const houseNo = document.getElementById('house-number').value;
    const zip = document.getElementById('zip').value;
    const city = document.getElementById('city').value;
    
    // Construct full details string for the alert
    const fullAddress = `${houseNo}, ${street}, ${zip} ${city}`;
    const fullPhone = `${countryCode} ${phone}`;

    // Simulate Processing
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    setTimeout(() => {
        alert(`🎉 Payment Successful!\n\nThank you, ${name}.\n\nConfirmation sent to: ${email}\nMobile: ${fullPhone}\n\nShipping to:\n${fullAddress}`);
        
        // Reset Cart
        cart = [];
        saveCart();
        closeCart();
        
        // Reset Form
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        e.target.reset();
        showCartView(); 
    }, 2000);
}

function openCart() {
    const modal = document.querySelector('.cart-modal-overlay');
    if (modal) {
        renderCartItems();
        modal.classList.add('open');
        showCartView(); // Default to cart view
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