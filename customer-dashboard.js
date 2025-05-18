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
        
        // Confirm order with payment method selection
        const paymentMethod = confirm('Would you like to pay with cash on delivery?\nPress OK for cash, Cancel for online payment (not implemented yet)') ? 'cash' : 'online';
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
        
        recommendedList.innerHTML = '<div class="loading-message">Loading recommendations...</div>';
        
        // Get current user
        const user = firebase.auth.currentUser;
        if (!user) {
            recommendedList.innerHTML = '<div>Please log in to view recommendations.</div>';
            return;
        }
        
        // Get user's product history
        const historyRef = firebase.ref(firebase.database, `customerProductHistory/${user.uid}`);
        firebase.get(historyRef).then((snapshot) => {
            if (snapshot.exists()) {
                const history = snapshot.val();
                
                // Sort products by purchase frequency
                const sortedProducts = Object.entries(history)
                    .sort((a, b) => b[1] - a[1]) // Sort by count, descending
                    .map(entry => entry[0]); // Get just the product names
                
                if (sortedProducts.length === 0) {
                    recommendedList.innerHTML = '<div>Start ordering to get personalized recommendations!</div>';
                    return;
                }
                
                // Generate recommendations based on:
                // 1. User's past purchases (top 2 most ordered)
                // 2. Related products (complementary items)
                // 3. Popular items (hardcoded for now, would use aggregated data in production)
                
                const userTopChoices = sortedProducts.slice(0, 2);
                const relatedProducts = getRelatedProducts(userTopChoices);
                const popularItems = ['Cake', 'Bread', 'Cookies', 'Pastry']; // Sample popular items
                
                // Combine all recommendation sources, ensuring no duplicates
                let recommendedProducts = [
                    ...userTopChoices,
                    ...relatedProducts.filter(p => !userTopChoices.includes(p)),
                    ...popularItems.filter(p => !userTopChoices.includes(p) && !relatedProducts.includes(p))
                ].slice(0, 6); // Show at most 6 recommendations
                
                // Clear loading message
                recommendedList.innerHTML = '';
                
                // Add recommendations to the UI as cards
                recommendedProducts.forEach(productName => {
                    const card = document.createElement('div');
                    card.className = 'menu-item-card';
                    const imagePath = `images/${productImages[productName] || 'default.jpg'}`;
                    card.innerHTML = `
                        <img src="${imagePath}" alt="${productName}" class="menu-item-img" onerror="this.onerror=null;this.src='images/default.jpg';">
                        <div class="menu-item-info">
                            <div class="menu-item-name">${productName}</div>
                            <div class="menu-item-price">${productPrices[productName] || 0} rupees</div>
                            <button class="add-to-order" data-product="${productName}" style="margin-top:10px;background:#27ae60;color:#fff;border:none;border-radius:5px;padding:8px 16px;cursor:pointer;">Add to Order</button>
                        </div>
                    `;
                    recommendedList.appendChild(card);
                });
                
                // Add event listeners to "Add to Order" buttons
                recommendedList.querySelectorAll('.add-to-order').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const productName = this.dataset.product;
                        addRecommendedToOrder(productName);
                    });
                });
            } else {
                recommendedList.innerHTML = '<div>Start ordering to get personalized recommendations!</div>';
            }
        }).catch((error) => {
            console.error("Error loading recommendations:", error);
            recommendedList.innerHTML = `<div>Error loading recommendations: ${error.message}</div>`;
        });
    }
    
    // Get related products (complementary items)
    function getRelatedProducts(productList) {
        // Product relationships (what goes well together)
        const productRelations = {
            'Bread': ['Butter', 'Jam', 'Cheese Sandwich'],
            'Cake': ['Pastry', 'Cup Cake'],
            'Cookies': ['Brownie', 'Bread'],
            'Pastry': ['Cake', 'Cup Cake'],
            'Brownie': ['Cookies', 'Cup Cake'],
            'Croissant': ['Bread', 'Cheese Sandwich'],
            'Cup Cake': ['Pastry', 'Cake'],
            'Dispasand': ['Egg Puff', 'Veg Puff'],
            'Egg Puff': ['Veg Puff', 'Samosa'],
            'Garlic Loaf': ['Bread', 'Cheese Sandwich'],
            'Masala Bun': ['Pav Bread', 'Bread Pakora'],
            'Pav Bread': ['Masala Bun', 'Bread'],
            'Rusk': ['Bread', 'Cup Cake'],
            'Samosa': ['Bread Pakora', 'Veg Puff'],
            'Veg Puff': ['Egg Puff', 'Samosa'],
            'Cheese Sandwich': ['Bread', 'Bread Pakora'],
            'Bread Pakora': ['Samosa', 'Cheese Sandwich']
        };
        
        // Collect related products for each product in the list
        let relatedProducts = [];
        productList.forEach(product => {
            if (productRelations[product]) {
                relatedProducts = [...relatedProducts, ...productRelations[product]];
            }
        });
        
        // Remove duplicates
        return [...new Set(relatedProducts)];
    }
    
    // Add a recommended product to the order form
    function addRecommendedToOrder(productName) {
        // Check if any empty order item slot exists
        let emptyItem = null;
        const orderItems = orderItemsDiv.querySelectorAll('.order-item');
        
        for (const item of orderItems) {
            const productSelect = item.querySelector('.orderProduct');
            if (!productSelect.value) {
                emptyItem = item;
                break;
            }
        }
        
        // If no empty slot, add a new item
        if (!emptyItem) {
            const newItem = createOrderItem();
            newItem.querySelector('.remove-item').style.display = 'inline-block';
            orderItemsDiv.appendChild(newItem);
            emptyItem = newItem;
        }
        
        // Set product and default quantity
        const productSelect = emptyItem.querySelector('.orderProduct');
        const quantityInput = emptyItem.querySelector('.orderQuantity');
        const imagePreview = emptyItem.querySelector('.product-image-preview');
        
        productSelect.value = productName;
        quantityInput.value = 1;
        
        // Update the image preview
        const img = productImages[productName];
        if (img) {
            imagePreview.innerHTML = `<img src="images/${img}" alt="${productName}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`;
        }
        
        // Update total
        calculateOrderTotal();
        
        // Scroll to the order section
        document.querySelector('.menu li[data-section="order"]').click();
        document.getElementById('orderForm').scrollIntoView({ behavior: 'smooth' });
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

        // Create cards for each product
        const products = Object.keys(productPrices).sort();
        menuList.innerHTML = '';

        products.forEach((product) => {
            const card = document.createElement('div');
            card.className = 'menu-item-card';
            const imagePath = `images/${productImages[product] || 'default.jpg'}`;
            card.innerHTML = `
                <img src="${imagePath}" alt="${product}" class="menu-item-img" onerror="this.onerror=null;this.src='images/default.jpg';">
                <div class="menu-item-info">
                    <div class="menu-item-name">${product}</div>
                    <div class="menu-item-price">${productPrices[product]} rupees</div>
                </div>
            `;
            menuList.appendChild(card);
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
}); 