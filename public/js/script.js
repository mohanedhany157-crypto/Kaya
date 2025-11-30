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
// We do this via JS so you don't have to edit every HTML file
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
                    <span class="total-price">RM 0.00</span>
                </div>
                <button class="btn btn-primary checkout-btn">Checkout Now</button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Bind Close Events
    document.querySelector('.close-cart').addEventListener('click', closeCart);
    document.querySelector('.cart-modal-overlay').addEventListener('click', (e) => {
        if (e.target === document.querySelector('.cart-modal-overlay')) closeCart();
    });
    
    // Bind Checkout
    document.querySelector('.checkout-btn').addEventListener('click', () => {
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
        totalEl.textContent = 'RM 0.00';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += parseFloat(item.price);
        html += `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="cart-item-price">RM ${parseFloat(item.price).toFixed(2)}</span>
            </div>
            <i class="fas fa-trash remove-item" onclick="removeFromCart(${index})"></i>
        </div>
        `;
    });

    container.innerHTML = html;
    totalEl.textContent = 'RM ' + total.toFixed(2);
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
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            addToCart(id, name, price);
        });
    });

    // Bind Cart Icon Open
    const cartIcon = document.querySelector('.cart-wrapper'); // We will change html to wrap icon
    if(cartIcon) {
        cartIcon.addEventListener('click', openCart);
    } else {
        // Fallback if wrapper not found, try raw icon
        const rawIcon = document.querySelector('.cart-icon');
        if(rawIcon) rawIcon.addEventListener('click', openCart);
    }
});