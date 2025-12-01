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
    // Add item to cart array
    cart.push({ id, name, price });
    saveCart();
    // Open cart to show user
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
                <!-- Items injected here -->
                <p style="text-align:center; color:#999; margin-top:20px;">Your cart is empty.</p>
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total:</span>
                    <span class="total-price">USD 0.00</span>
                </div>
                <button class="btn btn-primary checkout-btn">Checkout Now</button>
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
    
    // Bind Checkout
    const checkoutBtn = document.querySelector('.checkout-btn');
    if(checkoutBtn) checkoutBtn.addEventListener('click', () => {
        if(cart.length === 0) {
            alert("Cart is empty!");
        } else {
            alert("Proceeding to checkout... (This is a demo)");
        }
    });
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
    let total = 0;

    cart.forEach((item, index) => {
        // Ensure price is treated as a float
        let priceVal = parseFloat(item.price);
        total += priceVal;
        
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

    container.innerHTML = html;
    totalEl.textContent = 'USD ' + total.toFixed(2);
}

// 3. Page Initialization
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
            // Get data from the clicked button
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            
            if(id && name && price) {
                addToCart(id, name, price);
            } else {
                console.error("Missing data attributes on button", btn);
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