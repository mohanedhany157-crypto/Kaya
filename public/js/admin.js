/**
 * ======================================================
 * JAVASCRIPT FOR KAYA ADMIN DASHBOARD
 * ======================================================
 */

// 1. IMPORT FIREBASE (Same as Store)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// 2. CONFIGURE (Must match Store Config)
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- SECURITY SETTINGS ---
const ADMIN_PASSWORD = "admin123"; // CHANGE THIS TO YOUR SECRET PASSWORD!

// 3. LOGIN GATE
function injectLoginScreen() {
    const loginHTML = `
    <div id="login-overlay" style="
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #34495E; z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column; color: white;
    ">
        <div style="text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); color: #333;">
            <h2 style="margin-top: 0; color: #FD4D0A;">Admin Access</h2>
            <p>Please enter your password to view orders.</p>
            <input type="password" id="admin-pass" placeholder="Password" style="
                padding: 10px; border: 2px solid #eee; border-radius: 6px; width: 100%; margin-bottom: 15px; font-size: 1rem;
            ">
            <button id="login-btn" class="btn btn-primary" style="
                background: #FD4D0A; color: white; border: none; padding: 10px 20px; 
                border-radius: 50px; font-weight: bold; cursor: pointer; width: 100%;
            ">Login</button>
            <p id="login-error" style="color: red; display: none; margin-top: 10px;">Incorrect Password</p>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loginHTML);

    document.getElementById('login-btn').addEventListener('click', checkPassword);
    document.getElementById('admin-pass').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
}

function checkPassword() {
    const input = document.getElementById('admin-pass').value;
    if (input === ADMIN_PASSWORD) {
        // Success: Remove overlay and load data
        document.getElementById('login-overlay').remove();
        loadOrders();
    } else {
        // Fail
        document.getElementById('login-error').style.display = 'block';
    }
}

// 4. FETCH & DISPLAY ORDERS
async function loadOrders() {
    const container = document.getElementById('orders-container');
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; margin-top: 50px;"><i class="fas fa-spinner fa-spin fa-2x"></i><br><br>Loading...</p>';

    try {
        // Authenticate (Admin)
        await signInAnonymously(auth);

        // Fetch Orders
        // Note: In Firestore, simple queries are best. We fetch all from 'orders' collection.
        // We will sort them in Javascript to avoid index errors.
        const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
        const snapshot = await getDocs(ordersRef);

        if (snapshot.empty) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No orders found yet.</p>';
            return;
        }

        // Sort by timestamp (newest first)
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        // Sorting Logic: Newest date first
        orders.sort((a, b) => {
            const dateA = a.timestamp ? a.timestamp.seconds : 0;
            const dateB = b.timestamp ? b.timestamp.seconds : 0;
            return dateB - dateA;
        });

        // Render HTML
        container.innerHTML = '';
        orders.forEach(order => {
            const card = createOrderCard(order);
            container.innerHTML += card;
        });

    } catch (error) {
        console.error("Error loading orders:", error);
        container.innerHTML = `<p style="color: red; text-align: center;">Error loading data: ${error.message}</p>`;
    }
}

function createOrderCard(order) {
    const cust = order.customer;
    const addr = cust.address;
    
    // Format Date
    let dateStr = "Just now";
    if(order.timestamp) {
        dateStr = new Date(order.timestamp.seconds * 1000).toLocaleString();
    }

    // Format Items
    let itemsHtml = '';
    order.items.forEach(item => {
        itemsHtml += `<li><span>${item.name}</span> <span>${item.price}</span></li>`;
    });

    return `
    <div class="order-card">
        <div class="order-header">
            <span class="order-id">#${order.id.slice(0, 6).toUpperCase()}</span>
            <span class="status-badge">${order.status || 'PAID'}</span>
        </div>
        
        <div class="customer-section">
            <div class="customer-name">${cust.name}</div>
            <div class="customer-contact"><i class="fas fa-envelope"></i> ${cust.email}</div>
            <div class="customer-contact"><i class="fas fa-phone"></i> ${cust.phone}</div>
            
            <div class="customer-address">
                <strong><i class="fas fa-shipping-fast"></i> Ship To:</strong><br>
                ${addr.unit}, ${addr.street}<br>
                ${addr.zip} ${addr.city}
            </div>
        </div>

        <div style="font-size: 0.85rem; color: #888; margin-bottom: 5px;">Payment: ${order.paymentMethod || 'Credit Card'}</div>
        <div class="order-time">${dateStr}</div>

        <ul class="items-list">
            ${itemsHtml}
        </ul>

        <div class="order-total">
            ${order.total}
        </div>
    </div>
    `;
}

// 5. INIT
document.addEventListener('DOMContentLoaded', () => {
    // Instead of loading orders immediately, we inject the login screen first
    injectLoginScreen();
    
    // The refresh button still works, but only after login screen is removed
    document.getElementById('refresh-btn').addEventListener('click', loadOrders);
});