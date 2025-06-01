// Customer Dashboard JS
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar navigation
    const menuItems = document.querySelectorAll('.menu li');
    const sections = document.querySelectorAll('.content-section');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            const sectionId = item.dataset.section;
            const targetSection = document.getElementById(sectionId);
            
            // Only try to add the active class if the section exists
            if (targetSection) {
                targetSection.classList.add('active');
            } else {
                console.warn(`Section with ID "${sectionId}" not found in the DOM`);
            }
        });
    });

    // Logout
    document.querySelector('.logout').addEventListener('click', function() {
        // Sign out using Firebase Auth
        firebase.signOut(firebase.auth).then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Error signing out:", error);
        });
    });

    // --- Order Products ---
    const productImages = {
        'Bread': 'bread.jpg',
        'Cake': 'cake.jpg',
        'Pastry': 'pastry.jpg',
        'Cookies': 'cookies.jpg',
        'Brownie': 'brownie.jpg',
        'Croissant': 'croissant.jpg',
        'Cup Cake': 'cup_cake.jpg',
        'Dispasand': 'dilpasand.jpg',
        'Egg Puff': 'egg_puff.jpg',
        'Garlic Loaf': 'garlic_loaf.jpg',
        'Masala Bun': 'masala_bun.jpg',
        'Pav Bread': 'pav_bread.jpg',
        'Rusk': 'rusk.jpg',
        'Samosa': 'samosa.jpg',
        'Veg Puff': 'Veg_Puff.jpg',
        'Cheese Sandwich': 'cheese_sandwitch.jpg',
        'Bread Pakora': 'bread_pakora.jpg'
    };
    const productPrices = {
        'Bread': 35,
        'Cake': 350,
        'Pastry': 90,
        'Cookies': 75,
        'Brownie': 25,
        'Croissant': 70,
        'Cup Cake': 25,
        'Dispasand': 10,
        'Egg Puff': 23,
        'Garlic Loaf': 50,
        'Masala Bun': 18,
        'Pav Bread': 42,
        'Rusk': 135,
        'Samosa': 20,
        'Veg Puff': 18,
        'Cheese Sandwich': 70,
        'Bread Pakora': 40
    };
    const orderForm = document.getElementById('orderForm');
    const orderItemsDiv = document.getElementById('orderItems');
    const addOrderItemBtn = document.getElementById('addOrderItem');
    const orderTotalDisplay = document.getElementById('orderTotal');

    function calculateOrderTotal() {
        let total = 0;
        orderItemsDiv.querySelectorAll('.order-item').forEach(item => {
            const product = item.querySelector('.orderProduct').value;
            const quantity = parseInt(item.querySelector('.orderQuantity').value) || 0;
            if (product && quantity) {
                total += (productPrices[product] || 0) * quantity;
            }
        });
        orderTotalDisplay.textContent = total;
    }

    function attachOrderItemEvents(orderItemDiv) {
        const productSelect = orderItemDiv.querySelector('.orderProduct');
        const quantityInput = orderItemDiv.querySelector('.orderQuantity');
        productSelect.addEventListener('change', calculateOrderTotal);
        quantityInput.addEventListener('input', calculateOrderTotal);
    }

    function createOrderItem() {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `
            <div class="form-group">
                <label>Product</label>
                <select class="orderProduct" required>
                    <option value="">Select Product</option>
                    <option value="Bread">Bread</option>
                    <option value="Cake">Cake</option>
                    <option value="Pastry">Pastry</option>
                    <option value="Cookies">Cookies</option>
                    <option value="Brownie">Brownie</option>
                    <option value="Croissant">Croissant</option>
                    <option value="Cup Cake">Cup Cake</option>
                    <option value="Dispasand">Dispasand</option>
                    <option value="Egg Puff">Egg Puff</option>
                    <option value="Garlic Loaf">Garlic Loaf</option>
                    <option value="Masala Bun">Masala Bun</option>
                    <option value="Pav Bread">Pav Bread</option>
                    <option value="Rusk">Rusk</option>
                    <option value="Samosa">Samosa</option>
                    <option value="Veg Puff">Veg Puff</option>
                    <option value="Cheese Sandwich">Cheese Sandwich</option>
                    <option value="Bread Pakora">Bread Pakora</option>
                </select>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="orderQuantity" min="1" required>
            </div>
            <div class="form-group product-image-preview"></div>
            <button type="button" class="remove-item">×</button>
        `;
        // Remove button logic
        div.querySelector('.remove-item').addEventListener('click', function() {
            div.remove();
            calculateOrderTotal();
        });
        // Product image preview logic
        const productSelect = div.querySelector('.orderProduct');
        const imagePreview = div.querySelector('.product-image-preview');
        productSelect.addEventListener('change', function() {
            const img = productImages[productSelect.value];
            if (img) {
                imagePreview.innerHTML = `<img src="images/${img}" alt="${productSelect.value}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`;
            } else {
                imagePreview.innerHTML = '';
            }
        });
        // Attach total calculation events
        attachOrderItemEvents(div);
        return div;
    }

    // Initial image preview and total calculation for first item
    const firstOrderItem = orderItemsDiv.querySelector('.order-item');
    const firstProductSelect = firstOrderItem.querySelector('.orderProduct');
    const firstImagePreview = firstOrderItem.querySelector('.product-image-preview');
    firstProductSelect.addEventListener('change', function() {
        const img = productImages[firstProductSelect.value];
        if (img) {
            firstImagePreview.innerHTML = `<img src="images/${img}" alt="${firstProductSelect.value}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`;
        } else {
            firstImagePreview.innerHTML = '';
        }
        calculateOrderTotal();
    });
    firstOrderItem.querySelector('.orderQuantity').addEventListener('input', calculateOrderTotal);
    // Attach calculation events to first item
    attachOrderItemEvents(firstOrderItem);

    // Add item button logic (update to recalc total)
    addOrderItemBtn.addEventListener('click', function() {
        const newItem = createOrderItem();
        newItem.querySelector('.remove-item').style.display = 'inline-block';
        orderItemsDiv.appendChild(newItem);
        calculateOrderTotal();
    });

    // --- Place Order (multiple items) ---
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const orderItems = [];
        orderItemsDiv.querySelectorAll('.order-item').forEach(item => {
            const product = item.querySelector('.orderProduct').value;
            const quantity = item.querySelector('.orderQuantity').value;
            if (product && quantity) {
                orderItems.push({ 
                    product, 
                    quantity: parseInt(quantity),
                    unitPrice: productPrices[product] || 0,
                    total: (productPrices[product] || 0) * parseInt(quantity)
                });
            }
        });
        if (orderItems.length === 0) {
            alert('Please add at least one product to your order.');
            return;
        }
        
        // Update inventory immediately
        updateInventory(orderItems);
        
        // Get the current user's ID
        const user = firebase.auth.currentUser;
        if (!user) {
            alert('Please log in to place an order.');
            return;
        }
        
        const order = {
            customerId: user.uid,
            customerEmail: user.email,
            items: orderItems,
            totalAmount: orderItems.reduce((sum, item) => sum + item.total, 0),
            status: 'pending',
            timestamp: new Date().toISOString(),
            deliveryAddress: '',
            phoneNumber: '',
            paymentMethod: 'cash' // Default payment method
        };
        
        // Let's get some additional information
        const customerPhoneNumber = prompt('Please enter your phone number:');
        if (!customerPhoneNumber) {
            alert('Phone number is required to place an order.');
            return;
        }
        
        const deliveryAddress = prompt('Please enter your delivery address:');
        if (!deliveryAddress) {
            alert('Delivery address is required to place an order.');
            return;
        }
        
        // Update the order with the collected information
        order.phoneNumber = customerPhoneNumber;
        order.deliveryAddress = deliveryAddress;
        
        // Get order description from the new input field
        const orderDescriptionInput = document.getElementById('orderDescription');
        const orderDescription = orderDescriptionInput ? orderDescriptionInput.value : '';
        order.description = orderDescription;
        
        // Get payment method from dropdown
        const paymentMethodSelect = document.getElementById('paymentMethod');
        const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : 'cash';
        order.paymentMethod = paymentMethod;
        
        // Save order to Firebase
        const ordersRef = firebase.ref(firebase.database, 'orders');
        firebase.push(ordersRef, order)
            .then(() => {
                alert('Order placed successfully! It will be delivered to your address soon.');
                
                // Add ordered products to user's history for recommendations
                orderItems.forEach(item => {
                    updateUserProductHistory(user.uid, item.product);
                });
                
                // Clear the form
                clearOrderForm();
                
                // Update order history
                loadOrderHistory();
                
                // Update recommendations based on new order
                loadRecommended();
            })
            .catch(error => {
                console.error("Error placing order:", error);
                alert('Failed to place order. Please try again.');
            });
    });

    // Clear order form
    function clearOrderForm() {
        // Keep first item but clear its values
        const firstItem = orderItemsDiv.querySelector('.order-item');
        if (firstItem) {
            firstItem.querySelector('.orderProduct').value = '';
            firstItem.querySelector('.orderQuantity').value = '';
            firstItem.querySelector('.product-image-preview').innerHTML = '';
        }
        
        // Remove additional items
        const items = orderItemsDiv.querySelectorAll('.order-item');
        for (let i = 1; i < items.length; i++) {
            items[i].remove();
        }
        
        // Reset total
        calculateOrderTotal();
        // Clear overall order description
        const orderDescriptionInput = document.getElementById('orderDescription');
        if (orderDescriptionInput) orderDescriptionInput.value = '';
    }
    
    // Clear order button
    document.getElementById('clearOrder').addEventListener('click', clearOrderForm);

    // Update user's product history for recommendations
    function updateUserProductHistory(userId, productName) {
        // Reference to this user's product history
        const historyRef = firebase.ref(firebase.database, `customerProductHistory/${userId}`);
        
        // Get current history
        firebase.get(historyRef).then((snapshot) => {
            let history = {};
            if (snapshot.exists()) {
                history = snapshot.val();
            }
            
            // Update the count for this product
            if (history[productName]) {
                history[productName]++;
            } else {
                history[productName] = 1;
            }
            
            // Save updated history
            firebase.set(historyRef, history);
        }).catch(error => {
            console.error("Error updating product history:", error);
        });
    }

    // --- Order History ---
    function loadOrderHistory() {
        const orderHistoryBody = document.getElementById('orderHistoryBody');
        if (!orderHistoryBody) return;
        
        orderHistoryBody.innerHTML = '<tr><td colspan="6" class="loading-message">Loading your order history...</td></tr>';
        
        // Get current user
        const user = firebase.auth.currentUser;
        if (!user) {
            orderHistoryBody.innerHTML = '<tr><td colspan="6">Please log in to view your order history.</td></tr>';
            return;
        }
        
        // Get orders from Firebase
        const ordersRef = firebase.ref(firebase.database, 'orders');
        firebase.get(ordersRef).then((snapshot) => {
            if (snapshot.exists()) {
                const orders = snapshot.val();
                
                // Filter orders for this customer
                const customerOrders = Object.entries(orders)
                    .filter(([key, order]) => order.customerId === user.uid)
                    .map(([key, order]) => ({...order, id: key}))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                if (customerOrders.length === 0) {
                    orderHistoryBody.innerHTML = '<tr><td colspan="6">You have no orders yet.</td></tr>';
                    return;
                }
                
                // Clear loading message
                orderHistoryBody.innerHTML = '';
                
                // Add orders to table
                customerOrders.forEach(order => {
                    // Group products for display
                    let productsDisplay = order.items.map(item => 
                        `${item.product} x${item.quantity}`
                    ).join('<br>');
                    
                    // Format date
                    const orderDate = new Date(order.timestamp).toLocaleDateString();
                    
                    // Bill button for completed orders
                    let billButton = '';
                    if (order.status === 'completed' && order.billId) {
                        billButton = `<button class="view-bill-btn" data-bill-id="${order.billId}">View Bill</button>`;
                    } else {
                        billButton = 'Not available';
                    }
                    
                    // Create row
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order.id.slice(-6)}</td>
                        <td>${productsDisplay}</td>
                        <td>${order.items.reduce((sum, item) => sum + parseInt(item.quantity), 0)}</td>
                        <td>${orderDate}</td>
                        <td><span class="status-${order.status}">${order.status}</span></td>
                        <td>${billButton}</td>
                    `;
                    orderHistoryBody.appendChild(row);
                });
                
                // Add event listeners for bill buttons
                orderHistoryBody.querySelectorAll('.view-bill-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const billId = this.dataset.billId;
                        viewBill(billId);
                    });
                });
            } else {
                orderHistoryBody.innerHTML = '<tr><td colspan="6">No orders found.</td></tr>';
            }
        }).catch((error) => {
            console.error("Error loading order history:", error);
            orderHistoryBody.innerHTML = `<tr><td colspan="6">Error loading orders: ${error.message}</td></tr>`;
        });
    }

    // View bill for a completed order
    function viewBill(billId) {
        if (!billId) return;
        
        // Get bill from Firebase
        const billRef = firebase.ref(firebase.database, `bills/${billId}`);
        firebase.get(billRef).then((snapshot) => {
            if (snapshot.exists()) {
                const bill = snapshot.val();
                displayBill(bill);
            } else {
                alert('Bill not found.');
            }
        }).catch((error) => {
            console.error("Error loading bill:", error);
            alert(`Error loading bill: ${error.message}`);
        });
    }

    // Display bill in a modal
    function displayBill(bill) {
        // Create modal container if it doesn't exist
        let modalContainer = document.getElementById('billModal');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'billModal';
            modalContainer.className = 'modal';
            document.body.appendChild(modalContainer);
            
            // Add modal styles if not already in CSS
            if (!document.getElementById('modalStyles')) {
                const styles = document.createElement('style');
                styles.id = 'modalStyles';
                styles.textContent = `
                    .modal {
                        display: none;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0,0,0,0.7);
                        z-index: 1000;
                        overflow: auto;
                    }
                    .modal-content {
                        background-color: white;
                        margin: 5% auto;
                        padding: 20px;
                        width: 80%;
                        max-width: 600px;
                        border-radius: 5px;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    }
                    .close-btn {
                        float: right;
                        font-size: 24px;
                        font-weight: bold;
                        cursor: pointer;
                    }
                    .bill-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .bill-details {
                        margin-bottom: 20px;
                    }
                    .bill-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    .bill-table th, .bill-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .bill-table th {
                        background-color: #f2f2f2;
                    }
                    .bill-footer {
                        margin-top: 30px;
                        text-align: center;
                    }
                    .bill-total {
                        font-weight: bold;
                        text-align: right;
                        font-size: 18px;
                        margin: 10px 0;
                    }
                    .print-btn {
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 16px;
                        margin-top: 20px;
                    }
                    @media print {
                        .modal-content {
                            width: 100%;
                            max-width: none;
                            box-shadow: none;
                            margin: 0;
                            padding: 0;
                        }
                        .close-btn, .print-btn {
                            display: none;
                        }
                        body * {
                            visibility: hidden;
                        }
                        .modal, .modal-content, .bill-container, .bill-container * {
                            visibility: visible;
                        }
                        .modal {
                            position: absolute;
                            left: 0;
                            top: 0;
                            margin: 0;
                            padding: 15px;
                            background-color: white;
                        }
                    }
                `;
                document.head.appendChild(styles);
            }
        }
        
        // Format items for display
        const itemsHtml = bill.items.map(item => `
            <tr>
                <td>${item.product}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice || productPrices[item.product] || 0} rupees</td>
                <td>${item.total || (item.quantity * (item.unitPrice || productPrices[item.product] || 0))} rupees</td>
            </tr>
        `).join('');
        
        // Create bill HTML
        modalContainer.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <div class="bill-container">
                    <div class="bill-header">
                        <h2>BAKERY MANAGEMENT SYSTEM</h2>
                        <h3>INVOICE</h3>
                    </div>
                    <div class="bill-details">
                        <p><strong>Bill Number:</strong> ${bill.billNumber}</p>
                        <p><strong>Order ID:</strong> ${bill.orderId ? bill.orderId.slice(-6) : 'N/A'}</p>
                        <p><strong>Date:</strong> ${bill.completionDate || new Date(bill.timestamp).toLocaleDateString()}</p>
                        <p><strong>Customer:</strong> ${bill.customerEmail || 'Not specified'}</p>
                        ${bill.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${bill.deliveryAddress}</p>` : ''}
                        ${bill.phoneNumber ? `<p><strong>Phone:</strong> ${bill.phoneNumber}</p>` : ''}
                        <p><strong>Payment Method:</strong> ${bill.paymentMethod || 'Cash'}</p>
                    </div>
                    <table class="bill-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div class="bill-total">
                        <p>Total Amount: ${bill.totalAmount || 0} rupees</p>
                    </div>
                    <div class="bill-footer">
                        <p>Thank you for your order!</p>
                        <button class="print-btn" onclick="window.print()">Print Bill</button>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal
        modalContainer.style.display = 'block';
        
        // Close modal when clicking the X
        modalContainer.querySelector('.close-btn').addEventListener('click', function() {
            modalContainer.style.display = 'none';
        });
        
        // Close modal when clicking outside the content
        modalContainer.addEventListener('click', function(event) {
            if (event.target === modalContainer) {
                modalContainer.style.display = 'none';
            }
        });
    }

    // --- Recommendations ---
    function loadRecommended() {
        const recommendedList = document.getElementById('recommendedList');
        if (!recommendedList) return;
        
        // Add custom styles for recommended product cards (if not already present)
        if (!document.getElementById('specialCakeStyles')) {
            const style = document.createElement('style');
            style.id = 'specialCakeStyles';
            style.textContent = `
                .special-cake-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 24px;
                    margin-top: 18px;
                    justify-content: center;
                }
                .special-cake-card {
                    background: #fffdfa;
                    border: 1.5px solid #f7b500;
                    border-radius: 14px;
                    box-shadow: 0 4px 18px rgba(44,62,80,0.10);
                    width: 220px;
                    padding: 18px 16px 14px 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transition: box-shadow 0.2s, transform 0.2s;
                    position: relative;
                }
                .special-cake-card:hover {
                    box-shadow: 0 8px 32px rgba(44,62,80,0.18);
                    transform: translateY(-4px) scale(1.03);
                    border-color: #ff9800;
                }
                .special-cake-img {
                    width: 100%;
                    height: 140px;
                    object-fit: cover;
                    border-radius: 10px;
                    margin-bottom: 14px;
                    border: 1px solid #eee;
                    background: #f8f8f8;
                }
                .special-cake-code {
                    font-size: 1.15em;
                    font-weight: 700;
                    color: #f7b500;
                    letter-spacing: 1px;
                    margin-bottom: 6px;
                }
                .special-cake-price {
                    font-size: 1.08em;
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 4px;
                }
            `;
            document.head.appendChild(style);
        }
        recommendedList.innerHTML = '<div class="loading-message">Loading recommendations...</div>';
        // Use completed orders as sales
        const ordersRef = firebase.ref(firebase.database, 'orders');
        firebase.get(ordersRef).then((snapshot) => {
            if (snapshot.exists()) {
                const orders = snapshot.val();
                const completedOrders = Object.values(orders).filter(order => order.status === 'completed');
                const productSales = {};
                completedOrders.forEach(order => {
                    (order.items || []).forEach(item => {
                        if (productSales[item.product]) {
                            productSales[item.product] += item.quantity;
                        } else {
                            productSales[item.product] = item.quantity;
                        }
                    });
                });
                // Sort products by sales and limit to top 10
                const topProducts = Object.entries(productSales)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(entry => entry[0]);
                recommendedList.innerHTML = '';
                const grid = document.createElement('div');
                grid.className = 'special-cake-grid';
                topProducts.forEach(productName => {
                    const card = document.createElement('div');
                    card.className = 'special-cake-card';
                    const imagePath = `images/${productImages[productName] || 'default.jpg'}`;
                    card.innerHTML = `
                        <img src="${imagePath}" alt="${productName}" class="special-cake-img" onerror="this.onerror=null;this.src='images/default.jpg';">
                        <div class="special-cake-code">${productName}</div>
                        <div class="special-cake-price">${productPrices[productName] || 0} rupees</div>
                    `;
                    grid.appendChild(card);
                });
                recommendedList.appendChild(grid);
            } else {
                recommendedList.innerHTML = '<div>No completed orders available for recommendations.</div>';
            }
        }).catch((error) => {
            console.error("Error loading recommendations:", error);
            recommendedList.innerHTML = `<div>Error loading recommendations: ${error.message}</div>`;
        });
    }
    
    // --- Feedback Form ---
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get current user
            const user = firebase.auth.currentUser;
            if (!user) {
                alert('Please log in to submit feedback.');
                return;
            }
            
            const rating = document.getElementById('feedbackRating').value;
            const comment = document.getElementById('feedbackComment').value;
            
            if (!rating) {
                alert('Please select a rating.');
                return;
            }
            
            // Create feedback object
            const feedback = {
                customerId: user.uid,
                customerEmail: user.email,
                rating: parseInt(rating),
                comment: comment,
                timestamp: new Date().toISOString()
            };
            
            // Save to Firebase
            const feedbackRef = firebase.ref(firebase.database, 'feedback');
            firebase.push(feedbackRef, feedback)
                .then(() => {
                    alert('Thank you for your feedback!');
                    feedbackForm.reset();
                })
                .catch(error => {
                    console.error("Error submitting feedback:", error);
                    alert('Failed to submit feedback. Please try again.');
                });
        });
    }
    
    // --- Load Menu Cards ---
    function loadMenuCards() {
        const menuList = document.getElementById('menuList');
        if (!menuList) return;

        menuList.innerHTML = '<div class="loading-message">Loading menu...</div>';

        const inventoryRef = firebase.ref(firebase.database, 'inventory');
        firebase.get(inventoryRef).then((snapshot) => {
            if (snapshot.exists()) {
                const inventory = snapshot.val();
                const availableProducts = Object.values(inventory).filter(item => parseInt(item.quantity) > 0);
                menuList.innerHTML = '';

                availableProducts.forEach(product => {
                    const card = document.createElement('div');
                    card.className = 'menu-item-card';
                    const imagePath = `images/${productImages[product.name] || 'default.jpg'}`;
                    card.innerHTML = `
                        <img src="${imagePath}" alt="${product.name}" class="menu-item-img" onerror="this.onerror=null;this.src='images/default.jpg';">
                        <div class="menu-item-info">
                            <div class="menu-item-name">${product.name}</div>
                            <div class="menu-item-price">${productPrices[product.name] || 0} rupees</div>
                        </div>
                    `;
                    menuList.appendChild(card);
                });
            } else {
                menuList.innerHTML = '<div>No products available at the moment.</div>';
            }
        }).catch((error) => {
            console.error("Error loading menu:", error);
            menuList.innerHTML = `<div>Error loading menu: ${error.message}</div>`;
        });
    }
    
    // Load available products into order product dropdown
    function loadAvailableOrderProducts() {
        const inventoryRef = firebase.ref(firebase.database, 'inventory');
        firebase.get(inventoryRef).then((snapshot) => {
            if (snapshot.exists()) {
                const inventory = snapshot.val();
                const availableProducts = Object.values(inventory).filter(item => parseInt(item.quantity) > 0);
                const orderProductSelects = document.querySelectorAll('.orderProduct');
                orderProductSelects.forEach(select => {
                    select.innerHTML = '<option value="">Select Product</option>'; // Clear existing options
                    availableProducts.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.name;
                        option.textContent = product.name;
                        select.appendChild(option);
                    });
                });
            } else {
                console.log("No inventory data available");
            }
        }).catch((error) => {
            console.error("Error getting inventory data:", error);
        });
    }

    // Initial loading
    loadOrderHistory();
    loadRecommended();
    loadMenuCards();
    
    // Check if we need to create/populate products in Firebase (one-time setup)
    (function storeMenuProductsInFirebaseOnce() {
        const productsRef = firebase.ref(firebase.database, 'products');
        firebase.get(productsRef).then((snapshot) => {
            if (!snapshot.exists()) {
                // Create products in Firebase
                const products = Object.keys(productPrices).map(name => ({
                    name: name,
                    price: productPrices[name],
                    image: productImages[name] || 'default.jpg'
                }));
                
                firebase.set(productsRef, products)
                    .then(() => console.log("Products added to Firebase"))
                    .catch(error => console.error("Error adding products to Firebase:", error));
            }
        });
    })();

    // Call loadAvailableOrderProducts to populate the order product dropdown
    loadAvailableOrderProducts();

    // Listen for order completion and update inventory
    function listenForOrderCompletion() {
        const ordersRef = firebase.ref(firebase.database, 'orders');
        firebase.onValue(ordersRef, (snapshot) => {
            if (snapshot.exists()) {
                const orders = snapshot.val();
                Object.entries(orders).forEach(([orderId, order]) => {
                    if (order.status === 'completed' && !order.processed) {
                        // Update inventory for completed orders
                        updateInventory(order.items);
                        // Mark order as processed
                        const orderRef = firebase.ref(firebase.database, `orders/${orderId}`);
                        firebase.set(orderRef, { ...order, processed: true });
                    }
                });
            }
        });
    }

    function updateInventory(items) {
        const inventoryRef = firebase.ref(firebase.database, 'inventory');
        firebase.get(inventoryRef).then((snapshot) => {
            if (snapshot.exists()) {
                const inventory = snapshot.val();
                items.forEach(item => {
                    if (inventory[item.product]) {
                        inventory[item.product].quantity -= item.quantity;
                    }
                });
                firebase.set(inventoryRef, inventory);
            }
        }).catch((error) => {
            console.error("Error updating inventory:", error);
        });
    }

    // Call the function to start listening for order completion
    listenForOrderCompletion();

    // Add event listener for payment method dropdown to show/hide QR code
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    if (paymentMethodSelect && qrCodeContainer) {
        paymentMethodSelect.addEventListener('change', function() {
            qrCodeContainer.style.display = this.value === 'netbanking' ? 'block' : 'none';
        });
    }

    // --- Special Cake Order Button and Display ---
    function addSpecialCakeOrderButton() {
        const menuSection = document.getElementById('menu');
        if (!menuSection) return;
        let btn = document.getElementById('specialCakeOrderBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'specialCakeOrderBtn';
            btn.textContent = 'Click here for special CAKE order';
            btn.style = 'margin: 20px 0; padding: 10px 20px; font-size: 1.1em; background: #f7b500; color: #222; border: none; border-radius: 6px; cursor: pointer;';
            menuSection.insertBefore(btn, menuSection.querySelector('.menu-list'));
        }
        btn.onclick = function() {
            showSpecialCakes();
        };
    }

    function showSpecialCakes() {
        const menuList = document.getElementById('menuList');
        if (!menuList) return;
        menuList.innerHTML = '<div class="loading-message">Loading special cakes...</div>';
        // Add custom styles for special cake cards
        if (!document.getElementById('specialCakeStyles')) {
            const style = document.createElement('style');
            style.id = 'specialCakeStyles';
            style.textContent = `
                .special-cake-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 24px;
                    margin-top: 18px;
                    justify-content: center;
                }
                .special-cake-card {
                    background: #fffdfa;
                    border: 1.5px solid #f7b500;
                    border-radius: 14px;
                    box-shadow: 0 4px 18px rgba(44,62,80,0.10);
                    width: 220px;
                    padding: 18px 16px 14px 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transition: box-shadow 0.2s, transform 0.2s;
                    position: relative;
                }
                .special-cake-card:hover {
                    box-shadow: 0 8px 32px rgba(44,62,80,0.18);
                    transform: translateY(-4px) scale(1.03);
                    border-color: #ff9800;
                }
                .special-cake-img {
                    width: 100%;
                    height: 140px;
                    object-fit: cover;
                    border-radius: 10px;
                    margin-bottom: 14px;
                    border: 1px solid #eee;
                    background: #f8f8f8;
                }
                .special-cake-code {
                    font-size: 1.15em;
                    font-weight: 700;
                    color: #f7b500;
                    letter-spacing: 1px;
                    margin-bottom: 6px;
                }
                .special-cake-price {
                    font-size: 1.08em;
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 4px;
                }
            `;
            document.head.appendChild(style);
        }
        // Fetch cake prices from price.txt
        fetch('images/Cakes/price.txt').then(r => r.text()).then(text => {
            const priceMap = {};
            text.split(',').forEach(line => {
                const [code, price] = line.replace(/\s/g, '').split(':');
                if (code && price) priceMap[code] = price;
            });
            // List of cake codes
            const cakes = [
                'cake01','cake02','cake03','cake04','cake05','cake06','cake07','cake08','cake09'
            ];
            menuList.innerHTML = '<div style="margin-bottom:12px;font-weight:bold;color:#444;">Select a cake and enter its code in the description when ordering.</div>';
            const grid = document.createElement('div');
            grid.className = 'special-cake-grid';
            cakes.forEach(code => {
                const card = document.createElement('div');
                card.className = 'special-cake-card';
                card.innerHTML = `
                    <img src="images/Cakes/${code}.jpg" alt="${code}" class="special-cake-img" onerror="this.onerror=null;this.src='images/default.jpg';">
                    <div class="special-cake-code">${code.toUpperCase()}</div>
                    <div class="special-cake-price">${priceMap[code] ? priceMap[code] + ' rupees' : 'Price N/A'}</div>
                `;
                grid.appendChild(card);
            });
            menuList.appendChild(grid);
        });
    }
    // Call this after DOMContentLoaded
    addSpecialCakeOrderButton();
}); 