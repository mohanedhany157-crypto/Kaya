/**
 * ======================================================
 * JAVASCRIPT FOR KAYA ADMIN DASHBOARD (CRASH-PROOF)
 * ======================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- 1. YOUR REAL KEYS ---
const firebaseConfig = {
  apiKey: "AIzaSyDAFC257zzL0Q0T1crkPaYojnIgZQfYqUA",
  authDomain: "kaya-store-31083.firebaseapp.com",
  projectId: "kaya-store-31083",
  storageBucket: "kaya-store-31083.firebasestorage.app",
  messagingSenderId: "935048383330",
  appId: "1:935048383330:web:7d7444406aefa975677a3b",
  measurementId: "G-Q05ZZFHSM3"
};

// --- 2. INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const COLLECTION_NAME = 'kaya_orders'; 
const ADMIN_PASSWORD = "admin"; 

// START
injectLoginScreen();

function injectLoginScreen() {
    if(document.getElementById('login-overlay')) return;

    const loginHTML = `
    <div id="login-overlay" style="
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #34495E; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column; color: white; font-family: sans-serif;
    ">
        <div style="text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); color: #333; max-width:90%;">
            <h2 style="margin-top: 0; color: #FD4D0A;">Admin Access</h2>
            <p>Enter password to view orders.</p>
            <input type="password" id="admin-pass" placeholder="Password" style="
                padding: 10px; border: 2px solid #eee; border-radius: 6px; width: 100%; margin-bottom: 15px; font-size: 1rem;
            ">
            <button id="login-btn" style="
                background: #FD4D0A; color: white; border: none; padding: 10px 20px; 
                border-radius: 50px; font-weight: bold; cursor: pointer; width: 100%; font-size: 1rem;
            ">Login</button>
            <p id="login-error" style="color: red; display: none; margin-top: 10px;">Incorrect Password</p>
        </div>
    </div>
    `;
    document.documentElement.insertAdjacentHTML('beforeend', loginHTML);

    const check = () => {
        const val = document.getElementById('admin-pass').value;
        if(val === ADMIN_PASSWORD) {
            document.getElementById('login-overlay').remove();
            document.body.style.display = 'block'; 
            loadOrders();
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    };

    document.getElementById('login-btn').addEventListener('click', check);
    document.getElementById('admin-pass').addEventListener('keypress', (e) => { if(e.key === 'Enter') check(); });
}

async function loadOrders() {
    const container = document.getElementById('orders-container');
    if(!container) return;
    
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>Loading...</p>';

    try {
        await signInAnonymously(auth);
        
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));

        if (snapshot.empty) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No orders found in database.</p>';
            return;
        }

        const orders = [];
        snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
        
        // Sort newest first
        orders.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

        container.innerHTML = '';
        
        orders.forEach(order => {
            // --- SAFETY CHECK START ---
            // If order data is broken, skip rendering it or fill with placeholders
            // This prevents the "undefined reading name" error
            const cust = order.customer || {};
            const addr = cust.address || {};
            const items = order.items || [];
            
            const name = cust.name || "Unknown Customer";
            const email = cust.email || "No Email";
            const phone = cust.phone || "No Phone";
            const total = order.total || "0.00";
            const status = order.status || "UNKNOWN";
            const method = order.paymentMethod || "Unknown";
            
            // Format Address Safely
            const addressStr = addr.city 
                ? `${addr.unit || ''} ${addr.street || ''}<br>${addr.zip || ''} ${addr.city || ''}`
                : "No Address Provided";

            // Format Date Safely
            let dateStr = "Unknown Date";
            if(order.timestamp) {
                dateStr = new Date(order.timestamp.seconds * 1000).toLocaleString();
            }
            
            // Format Items Safely
            let itemsHtml = items.map(i => `<li><span>${i.name || 'Item'}</span> <span>${i.price || '0'}</span></li>`).join('');
            // --- SAFETY CHECK END ---

            container.innerHTML += `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">#${order.id.slice(0,6)}</span>
                    <span class="status-badge">${status}</span>
                </div>
                <div class="customer-section">
                    <div class="customer-name">${name}</div>
                    <div class="customer-contact">${email}</div>
                    <div class="customer-contact">${phone}</div>
                    
                    <div class="customer-address">
                        <strong><i class="fas fa-shipping-fast"></i> Ship To:</strong><br>
                        ${addressStr}
                    </div>
                </div>

                <div style="font-size: 0.85rem; color: #888; margin-bottom: 5px;">Payment: ${method}</div>
                <div class="order-time">${dateStr}</div>

                <ul class="items-list">
                    ${itemsHtml}
                </ul>

                <div class="order-total">
                    USD ${total}
                </div>
            </div>
            `;
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="color: red; grid-column: 1/-1;">Error loading data: ${error.message}<br>Check Console for details.</p>`;
    }
}

const refreshBtn = document.getElementById('refresh-btn');
if(refreshBtn) refreshBtn.addEventListener('click', loadOrders);