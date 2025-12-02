import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// PASSWORD
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
            document.body.style.display = 'block'; // UNHIDE BODY
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
        const snapshot = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));

        if (snapshot.empty) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No orders yet.</p>';
            return;
        }

        const orders = [];
        snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
        
        // Sort newest first
        orders.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

        container.innerHTML = '';
        orders.forEach(order => {
            let itemsHtml = order.items.map(i => `<li>${i.name} (${i.price})</li>`).join('');
            
            let dateStr = "Unknown Date";
            if(order.timestamp) dateStr = new Date(order.timestamp.seconds * 1000).toLocaleString();

            container.innerHTML += `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">#${order.id.slice(0,6)}</span>
                    <span class="status-badge">${order.status}</span>
                </div>
                <div class="customer-section">
                    <div class="customer-name">${order.customer.name}</div>
                    <div class="customer-contact">${order.customer.email}</div>
                    <div class="customer-contact">${order.customer.phone}</div>
                    <div class="customer-address">
                        ${order.customer.address.unit}, ${order.customer.address.street}<br>
                        ${order.customer.address.zip} ${order.customer.address.city}
                    </div>
                </div>
                <div class="order-time">${dateStr}</div>
                <ul class="items-list">${itemsHtml}</ul>
                <div class="order-total">USD ${order.total}</div>
                <div style="font-size:0.8rem; color:#666; margin-top:5px;">Method: ${order.paymentMethod}</div>
            </div>`;
        });

    } catch (error) {
        container.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

const refreshBtn = document.getElementById('refresh-btn');
if(refreshBtn) refreshBtn.addEventListener('click', loadOrders);