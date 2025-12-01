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

// 2. Inject Cart Modal HTML
function injectCartModal() {
    const modalHTML = `
    <div class="cart-modal-overlay">
        <div class="cart-modal">
            <div class="cart-header">
                <h3>Your Shopping Cart</h3>
                <button class="close-cart"><i class="fas fa-times"></i></button>
            </div>
            <div class="cart-items">
                <p style="text-align:center; color:#999; margin-top:20px;">Your cart is empty.</p>
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total (Rounded):</span>
                    <span class="total-price">USD 0.00</span>
                </div>
                <button class="btn btn-primary checkout-btn">Checkout on WhatsApp</button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Bind Close Events
    const closeBtn = document.querySelector('.close-cart');
    if(closeBtn) closeBtn.addEventListener('click', closeCart);
    
    const overlay = document.querySelector('.cart-modal-overlay');
    if(overlay) overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCart();
    });
    
    // Bind Checkout Function
    const checkoutBtn = document.querySelector('.checkout-btn');
    if(checkoutBtn) checkoutBtn.addEventListener('click', processCheckout);
}

function openCart() {
    const modal = document.querySelector('.cart-modal-overlay');
    if (modal) {
        renderCartItems();
        modal.classList.add('open');
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
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Your cart is empty.</p>';
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

    // --- ROUNDING LOGIC ---
    // Rounds to the nearest whole number (e.g., 16.98 -> 17.00)
    let roundedTotal = Math.round(exactTotal);

    container.innerHTML = html;
    totalEl.textContent = 'USD ' + roundedTotal.toFixed(2);
}

// 3. Functional Checkout (WhatsApp Integration)
function processCheckout() {
    if(cart.length === 0) {
        alert("Your cart is empty! Add some items first.");
        return;
    }

    // 1. Calculate final rounded total again
    let exactTotal = 0;
    let messageItems = "";
    
    cart.forEach(item => {
        exactTotal += parseFloat(item.price);
        messageItems += `- ${item.name} (USD ${item.price})\n`;
    });

    let roundedTotal = Math.round(exactTotal);

    // 2. Construct WhatsApp Message
    // %0a creates a new line in the URL
    let message = `Hi Kaya Team! 👋%0aI would like to place an order:%0a%0a${encodeURIComponent(messageItems)}%0a*Total Price (Rounded): USD ${roundedTotal.toFixed(2)}*`;

    // 3. Open WhatsApp with your number (from links.html)
    // Using number: 601116898234
    window.open(`https://wa.me/601116898234?text=${message}`, '_blank');

    // 4. Clear Cart and Close
    cart = [];
    saveCart();
    closeCart();
}

// 4. Page Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Year
    const yearElement = document.getElementById('current-year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();

    // Mobile Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    // Inject Cart
    injectCartModal();
    updateCartCount();

    // Bind "Add to Cart" Buttons
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

    // Bind Cart Icon Open
    const cartWrapper = document.querySelector('.cart-wrapper');
    if(cartWrapper) {
        cartWrapper.addEventListener('click', openCart);
    } else {
        const rawIcon = document.querySelector('.cart-icon');
        if(rawIcon) rawIcon.addEventListener('click', openCart);
    }
});