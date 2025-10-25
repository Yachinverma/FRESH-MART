// API Base URL - Change this to your backend URL
const API_URL = 'http://localhost:5000/api';

// Store orders and products
let allOrders = [];
let allProducts = [];
let isLoggedIn = false;

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
});

// Check if user is logged in
function checkLoginStatus() {
    const loggedIn = sessionStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
        isLoggedIn = true;
        showDashboard();
        loadOrders();
        loadProducts();
    }
}

// Login function
function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple authentication (In production, use backend authentication)
    if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        isLoggedIn = true;
        showDashboard();
        loadOrders();
        loadProducts();
    } else {
        alert('Invalid username or password!');
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    isLoggedIn = false;
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

// Show dashboard
function showDashboard() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
}

// Load orders from backend
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`);
        allOrders = await response.json();
        displayOrders(allOrders);
        updateStatistics();
    } catch (error) {
        console.error('Error loading orders:', error);
        // Load demo orders if backend is not available
        loadDemoOrders();
    }
}

// Demo orders for testing
function loadDemoOrders() {
    allOrders = [
        {
            _id: '1',
            orderId: 'ORD001',
            items: [
                { name: 'Apple', quantity: 2, price: 120 },
                { name: 'Tomato', quantity: 1, price: 30 }
            ],
            deliveryAddress: '123 Main Street, City',
            phone: '9876543210',
            deliverySlot: 'morning',
            status: 'pending',
            totalAmount: 270,
            createdAt: new Date().toISOString()
        },
        {
            _id: '2',
            orderId: 'ORD002',
            items: [
                { name: 'Banana', quantity: 1, price: 40 },
                { name: 'Potato', quantity: 3, price: 25 }
            ],
            deliveryAddress: '456 Park Avenue, City',
            phone: '9876543211',
            deliverySlot: 'afternoon',
            status: 'preparing',
            totalAmount: 115,
            createdAt: new Date().toISOString()
        },
        {
            _id: '3',
            orderId: 'ORD003',
            items: [
                { name: 'Mango', quantity: 2, price: 150 }
            ],
            deliveryAddress: '789 Hill Road, City',
            phone: '9876543212',
            deliverySlot: 'evening',
            status: 'delivered',
            totalAmount: 300,
            createdAt: new Date().toISOString()
        }
    ];
    displayOrders(allOrders);
    updateStatistics();
}

// Display orders
function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No orders found</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Order #${order.orderId}</span>
                <span class="order-status status-${order.status}">${order.status}</span>
            </div>
            
            <div class="order-details">
                <div class="order-info">
                    <strong>Customer Phone:</strong>
                    ${order.phone}
                </div>
                <div class="order-info">
                    <strong>Delivery Slot:</strong>
                    ${formatSlot(order.deliverySlot)}
                </div>
                <div class="order-info">
                    <strong>Total Amount:</strong>
                    ₹${order.totalAmount}
                </div>
                <div class="order-info">
                    <strong>Order Time:</strong>
                    ${new Date(order.createdAt).toLocaleString()}
                </div>
            </div>
            
            <div class="order-info">
                <strong>Delivery Address:</strong>
                ${order.deliveryAddress}
            </div>
            
            <div class="order-items">
                <h4>Items:</h4>
                <ul>
                    ${order.items.map(item => `
                        <li>${item.name} - Qty: ${item.quantity} - ₹${item.price * item.quantity}</li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="order-actions">
                <select id="status-${order._id}">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="out-for-delivery" ${order.status === 'out-for-delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
                <button class="btn-update" onclick="updateOrderStatus('${order._id}')">Update Status</button>
                <button class="btn-view" onclick="viewOrderDetails('${order._id}')">View Details</button>
            </div>
        </div>
    `).join('');
}

// Format slot text
function formatSlot(slot) {
    const slots = {
        'morning': 'Morning (8 AM - 12 PM)',
        'afternoon': 'Afternoon (12 PM - 4 PM)',
        'evening': 'Evening (4 PM - 8 PM)',
        'immediate': 'Immediate Delivery'
    };
    return slots[slot] || slot;
}

// Update order status
async function updateOrderStatus(orderId) {
    const newStatus = document.getElementById(`status-${orderId}`).value;
    
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            alert('Order status updated successfully!');
            loadOrders();
        }
    } catch (error) {
        console.error('Error updating order:', error);
        // Update locally if backend fails
        const order = allOrders.find(o => o._id === orderId);
        if (order) {
            order.status = newStatus;
            displayOrders(allOrders);
            updateStatistics();
            alert('Order status updated!');
        }
    }
}

// View order details in modal
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (!order) return;
    
    const modalContent = document.getElementById('order-modal-content');
    modalContent.innerHTML = `
        <div style="line-height: 1.8;">
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Status:</strong> <span class="order-status status-${order.status}">${order.status}</span></p>
            <p><strong>Customer Phone:</strong> ${order.phone}</p>
            <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
            <p><strong>Delivery Slot:</strong> ${formatSlot(order.deliverySlot)}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
            <p><strong>Order Time:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            
            <h3 style="margin-top: 20px; color: #4CAF50;">Items:</h3>
            <ul style="list-style: none; padding: 0;">
                ${order.items.map(item => `
                    <li style="padding: 10px; background: #f9f9f9; margin: 5px 0; border-radius: 5px;">
                        ${item.name} - Quantity: ${item.quantity} - Price: ₹${item.price} - Total: ₹${item.price * item.quantity}
                    </li>
                `).join('')}
            </ul>
            
            <h3 style="margin-top: 20px; font-size: 20px; color: #4CAF50;">Total Amount: ₹${order.totalAmount}</h3>
        </div>
    `;
    
    document.getElementById('order-modal').style.display = 'block';
}

// Close order modal
function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
}

// Filter orders
function filterOrders() {
    const slotFilter = document.getElementById('slot-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let filteredOrders = allOrders;
    
    if (slotFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.deliverySlot === slotFilter);
    }
    
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    displayOrders(filteredOrders);
}

// Refresh orders
function refreshOrders() {
    loadOrders();
    alert('Orders refreshed!');
}

// Update statistics
function updateStatistics() {
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const completedOrders = allOrders.filter(o => o.status === 'delivered' && isToday(new Date(o.createdAt))).length;
    const revenue = allOrders
        .filter(o => o.status === 'delivered' && isToday(new Date(o.createdAt)))
        .reduce((sum, order) => sum + order.totalAmount, 0);
    
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('completed-orders').textContent = completedOrders;
    document.getElementById('revenue').textContent = revenue;
}

// Check if date is today
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// Load products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        allProducts = await response.json();
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        loadDemoProducts();
    }
}

// Demo products
function loadDemoProducts() {
    allProducts = [
        { _id: '1', name: 'Apple', category: 'fruits', price: 120, unit: 'per kg', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300' },
        { _id: '2', name: 'Banana', category: 'fruits', price: 40, unit: 'per dozen', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300' },
        { _id: '3', name: 'Tomato', category: 'vegetables', price: 30, unit: 'per kg', image: 'https://images.unsplash.com/photo-1546470427-227f5e55e736?w=300' },
        { _id: '4', name: 'Potato', category: 'vegetables', price: 25, unit: 'per kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300' }
    ];
    displayProducts();
}

// Display products
function displayProducts() {
    const productsList = document.getElementById('products-list');
    
    if (!productsList) return;
    
    productsList.innerHTML = allProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <span class="category">${product.category}</span>
            <p class="price">₹${product.price}</p>
            <p style="color: #666; font-size: 14px;">${product.unit}</p>
            <button onclick="deleteProduct('${product._id}')">Delete Product</button>
        </div>
    `).join('');
}

// Add new product
async function addProduct(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        unit: document.getElementById('product-unit').value,
        image: document.getElementById('product-image').value
    };
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert('Product added successfully!');
            document.querySelector('.product-form').reset();
            loadProducts();
        }
    } catch (error) {
        console.error('Error adding product:', error);
        // Add locally if backend fails
        const newProduct = {
            _id: Date.now().toString(),
            ...productData
        };
        allProducts.push(newProduct);
        displayProducts();
        document.querySelector('.product-form').reset();
        alert('Product added!');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Product deleted successfully!');
            loadProducts();
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        // Delete locally if backend fails
        allProducts = allProducts.filter(p => p._id !== productId);
        displayProducts();
        alert('Product deleted!');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const orderModal = document.getElementById('order-modal');
    
    if (event.target === orderModal) {
        closeOrderModal();
    }
}