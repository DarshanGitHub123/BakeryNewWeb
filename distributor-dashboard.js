// Distributor Dashboard JS
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const menuItems = document.querySelectorAll('.menu li');
    const sections = document.querySelectorAll('.content-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all menu items and sections
            menuItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked menu item
            item.classList.add('active');
            
            // Show corresponding section
            const sectionId = item.dataset.section;
            const targetSection = document.getElementById(sectionId);
            
            // Only try to add the active class if the section exists
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Load content if needed
                if (sectionId === 'retail-orders') {
                    loadRetailOrders();
                }
            } else {
                console.warn(`Section with ID "${sectionId}" not found in the DOM`);
            }
        });
    });
    
    // Logout functionality
    document.querySelector('.logout').addEventListener('click', function() {
        // Sign out using Firebase Auth
        firebase.signOut(firebase.auth).then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Error signing out:", error);
        });
    });
    
    // Raw Materials Functionality
    const rawMaterialsTableBody = document.getElementById('rawMaterialsTableBody');
    const availabilityTableBody = document.getElementById('availabilityTableBody');
    const savedStockTableBody = document.getElementById('savedStockTableBody');
    const availabilityForm = document.getElementById('availabilityForm');
    
    let rawMaterials = [];
    
    // Initialize by loading raw materials
    function loadRawMaterials() {
        const rawMaterialsRef = firebase.ref(firebase.database, 'raw');
        firebase.get(rawMaterialsRef).then((snapshot) => {
            if (snapshot.exists()) {
                rawMaterials = snapshot.val();
                populateRawMaterialsTable();
                populateAvailabilityTable();
                loadSavedStock();
            } else {
                console.log("No raw materials found in database");
            }
        }).catch((error) => {
            console.error("Error loading raw materials:", error);
        });
    }
    
    // Populate raw materials table
    function populateRawMaterialsTable() {
        rawMaterialsTableBody.innerHTML = '';
        
        rawMaterials.forEach((material, index) => {
            const row = document.createElement('tr');
            const imagePath = `images/${material.image || getDefaultImageName(material.name)}`;
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><img src="${imagePath}" alt="${material.name}" class="material-image"></td>
                <td>${material.name}</td>
                <td>${material.price}</td>
            `;
            
            rawMaterialsTableBody.appendChild(row);
        });
    }
    
    // Get default image name based on material name
    function getDefaultImageName(materialName) {
        const nameLower = materialName.toLowerCase();
        if (nameLower.includes('maida')) return 'maida.jpg';
        if (nameLower.includes('sugar')) return 'sugar.jpg';
        if (nameLower.includes('salt')) return 'salt.jpg';
        if (nameLower.includes('yeast')) return 'yeast.jpg';
        if (nameLower.includes('baking powder')) return 'baking_powder.jpg';
        if (nameLower.includes('baking soda')) return 'baking_soda.jpg';
        if (nameLower.includes('butter')) return 'butter.jpg';
        if (nameLower.includes('oil')) return 'oil.jpg';
        if (nameLower.includes('milk')) return 'milk.jpg';
        if (nameLower.includes('egg')) return 'eggs.jpg';
        if (nameLower.includes('cream')) return 'whipping_cream.jpg';
        if (nameLower.includes('cheese')) return 'cheese.jpg';
        if (nameLower.includes('cocoa')) return 'coco_powder.jpg';
        if (nameLower.includes('chocolate')) return 'chocolate_compounds.jpg';
        if (nameLower.includes('dry fruit')) return 'dry_fruits.jpg';
        if (nameLower.includes('besan')) return 'besan.jpg';
        if (nameLower.includes('jam')) return 'jam.jpg';
        if (nameLower.includes('garlic')) return 'garlic.jpg';
        if (nameLower.includes('potato')) return 'potato.jpg';
        return 'default_ingredient.jpg'; // Default image if no match
    }
    
    // Populate availability table for input
    function populateAvailabilityTable() {
        availabilityTableBody.innerHTML = '';
        
        rawMaterials.forEach((material, index) => {
            const row = document.createElement('tr');
            const imagePath = `images/${material.image || getDefaultImageName(material.name)}`;
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><img src="${imagePath}" alt="${material.name}" class="material-image"></td>
                <td>${material.name}</td>
                <td>${material.price}</td>
                <td><input type="number" min="0" class="quantity-input" data-material-index="${index}" name="quantity_${index}"></td>
                <td><input type="date" class="date-input" data-material-index="${index}" name="date_${index}" value="${new Date().toISOString().split('T')[0]}"></td>
            `;
            
            availabilityTableBody.appendChild(row);
        });
    }
    
    // Save availability
    availabilityForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get current user
        const user = firebase.auth.currentUser;
        if (!user) {
            alert('Please log in to save availability.');
            return;
        }
        
        const stockEntries = [];
        availabilityTableBody.querySelectorAll('tr').forEach((row, index) => {
            const quantityInput = row.querySelector('.quantity-input');
            const dateInput = row.querySelector('.date-input');
            
            if (quantityInput && dateInput && parseFloat(quantityInput.value) > 0) {
                stockEntries.push({
                    materialIndex: index,
                    materialName: rawMaterials[index].name,
                    materialPrice: rawMaterials[index].price,
                    quantity: parseFloat(quantityInput.value),
                    date: dateInput.value,
                    distributorId: user.uid,
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        if (stockEntries.length === 0) {
            alert('Please add quantity for at least one item.');
            return;
        }
        
        // Save to Firebase
        const stockRef = firebase.ref(firebase.database, 'stock');
        
        // Use Promise.all to save all stock entries
        Promise.all(stockEntries.map(entry => {
            const newStockRef = firebase.push(stockRef);
            return firebase.set(newStockRef, entry);
        }))
        .then(() => {
            alert('Stock availability saved successfully!');
            availabilityForm.reset();
            loadSavedStock();
        })
        .catch(error => {
            console.error("Error saving stock availability:", error);
            alert('Failed to save availability. Please try again.');
        });
    });
    
    // Load saved stock entries
    function loadSavedStock() {
        savedStockTableBody.innerHTML = '<tr><td colspan="6" class="loading">Loading saved stock entries...</td></tr>';
        
        // Get current user
        const user = firebase.auth.currentUser;
        if (!user) {
            savedStockTableBody.innerHTML = '<tr><td colspan="6">Please log in to view stock entries.</td></tr>';
            return;
        }
        
        // Query stock entries for this distributor
        const stockRef = firebase.ref(firebase.database, 'stock');
        firebase.get(stockRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Filter stock entries for current distributor and sort by date (newest first)
                const userStock = Object.entries(data)
                    .filter(([key, stock]) => stock.distributorId === user.uid)
                    .map(([key, stock]) => ({...stock, id: key}))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                if (userStock.length === 0) {
                    savedStockTableBody.innerHTML = '<tr><td colspan="6">You have no saved stock entries.</td></tr>';
                    return;
                }
                
                // Clear loading message
                savedStockTableBody.innerHTML = '';
                
                // Add stock entries to table
                userStock.forEach((stock, index) => {
                    const row = document.createElement('tr');
                    const imagePath = `images/${getDefaultImageName(stock.materialName)}`;
                    
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td><img src="${imagePath}" alt="${stock.materialName}" class="material-image"></td>
                        <td>${stock.materialName}</td>
                        <td>${stock.materialPrice}</td>
                        <td>${stock.quantity}</td>
                        <td>${stock.date}</td>
                    `;
                    savedStockTableBody.appendChild(row);
                });
            } else {
                savedStockTableBody.innerHTML = '<tr><td colspan="6">No stock entries found.</td></tr>';
            }
        }).catch((error) => {
            console.error("Error loading stock entries:", error);
            savedStockTableBody.innerHTML = `<tr><td colspan="6">Error loading stock entries: ${error.message}</td></tr>`;
        });
    }
    
    // Retail Orders Functionality
    function loadRetailOrders() {
        const retailOrdersSection = document.getElementById('retail-orders');
        retailOrdersSection.innerHTML = `
            <h2>Retail Orders</h2>
            <div class="order-table-container">
                <table class="order-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Products</th>
                            <th>Manager</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="retailOrdersTableBody">
                        <tr>
                            <td colspan="7" class="loading-message">Loading retail orders...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        const retailOrdersTableBody = document.getElementById('retailOrdersTableBody');
        
        // Get all retail orders from Firebase
        const retailOrdersRef = firebase.ref(firebase.database, 'retailOrders');
        firebase.get(retailOrdersRef).then((snapshot) => {
            if (snapshot.exists()) {
                retailOrdersTableBody.innerHTML = '';
                const orders = snapshot.val();
                
                // Convert object to array and sort by timestamp (newest first)
                const ordersArray = Object.entries(orders)
                    .map(([key, order]) => ({ ...order, id: key }))
                    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
                
                if (ordersArray.length === 0) {
                    retailOrdersTableBody.innerHTML = '<tr><td colspan="7">No retail orders found.</td></tr>';
                    return;
                }
                
                // Add each order to the table
                ordersArray.forEach(order => {
                    const row = document.createElement('tr');
                    
                    // Create material items list
                    const materialsList = order.items.map(item => 
                        `${item.material} (${item.quantity})`
                    ).join('<br>');
                    
                    // Format date
                    const orderDate = new Date(order.timestamp).toLocaleDateString();
                    
                    // Status class
                    const statusClass = getStatusClass(order.status);
                    
                    // Actions based on status
                    let actions = '';
                    if (order.status === 'pending') {
                        actions = `
                            <button class="action-btn accept-btn" data-id="${order.id}">Accept</button>
                            <button class="action-btn reject-btn" data-id="${order.id}">Reject</button>
                        `;
                    } else if (order.status === 'accepted') {
                        actions = `
                            <button class="action-btn complete-btn" data-id="${order.id}">Mark Complete</button>
                        `;
                    } else {
                        actions = `<span>No actions available</span>`;
                    }
                    
                    row.innerHTML = `
                        <td>${order.id.slice(-6)}</td>
                        <td>${orderDate}</td>
                        <td class="materials-list">${materialsList}</td>
                        <td>${order.managerName || 'Unknown'}</td>
                        <td>${calculateOrderTotal(order.items)} rupees</td>
                        <td class="${statusClass}">${order.status}</td>
                        <td>${actions}</td>
                    `;
                    
                    retailOrdersTableBody.appendChild(row);
                });
                
                // Add event listeners to buttons
                addRetailOrderEventListeners();
            } else {
                retailOrdersTableBody.innerHTML = '<tr><td colspan="7">No retail orders found.</td></tr>';
            }
        }).catch((error) => {
            console.error("Error loading retail orders:", error);
            retailOrdersTableBody.innerHTML = `<tr><td colspan="7">Error loading retail orders: ${error.message}</td></tr>`;
        });
    }
    
    // Calculate order total
    function calculateOrderTotal(items) {
        if (!items || !Array.isArray(items)) return 0;
        
        return items.reduce((total, item) => {
            // Extract numeric price from string (e.g., "400 rupees" -> 400)
            const price = parseInt(item.price?.toString().replace(/[^0-9]/g, '') || 0);
            return total + (price * (item.quantity || 0));
        }, 0);
    }
    
    // Get status class for styling
    function getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'accepted': return 'status-accepted';
            case 'completed': return 'status-completed';
            case 'rejected': return 'status-rejected';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    }
    
    // Add event listeners to retail order action buttons
    function addRetailOrderEventListeners() {
        // Accept Order
        document.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.dataset.id;
                updateOrderStatus(orderId, 'accepted');
            });
        });
        
        // Reject Order
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.dataset.id;
                const reason = prompt('Please provide a reason for rejecting this order:');
                if (reason !== null) {
                    updateOrderStatus(orderId, 'rejected', reason);
                }
            });
        });
        
        // Complete Order
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.dataset.id;
                updateOrderStatus(orderId, 'completed');
            });
        });
    }
    
    // Update order status in Firebase
    function updateOrderStatus(orderId, newStatus, reason = '') {
        if (!orderId) return;
        
        const orderRef = firebase.ref(firebase.database, `retailOrders/${orderId}`);
        
        firebase.get(orderRef).then((snapshot) => {
            if (snapshot.exists()) {
                const order = snapshot.val();
                
                // Update order with new status
                const updates = {
                    status: newStatus,
                    statusUpdatedAt: new Date().toISOString(),
                    distributorId: firebase.auth.currentUser.uid
                };
                
                // Add reason if rejecting
                if (newStatus === 'rejected' && reason) {
                    updates.rejectionReason = reason;
                }
                
                // Update in Firebase
                firebase.set(firebase.ref(firebase.database, `retailOrders/${orderId}`), {
                    ...order,
                    ...updates
                }).then(() => {
                    alert(`Order ${orderId.slice(-6)} has been ${newStatus}.`);
                    loadRetailOrders(); // Reload to reflect changes
                }).catch(error => {
                    console.error("Error updating order status:", error);
                    alert(`Failed to update order status: ${error.message}`);
                });
            } else {
                alert('Order not found.');
            }
        }).catch(error => {
            console.error("Error retrieving order:", error);
            alert(`Failed to retrieve order: ${error.message}`);
        });
    }
    
    // Initial load
    loadRawMaterials();
    
    // Check if we should load retail orders immediately (if that section is active)
    if (document.querySelector('.menu li.active').dataset.section === 'retail-orders') {
        loadRetailOrders();
    }
}); 