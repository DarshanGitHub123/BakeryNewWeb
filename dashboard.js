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
            } else {
                console.warn(`Section with ID "${sectionId}" not found in the DOM`);
            }
        });
    });

    // Logout functionality: direct event listener for reliability
    document.querySelector('.logout').addEventListener('click', function() {
        // Sign out using Firebase Auth
        firebase.signOut(firebase.auth).then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Error signing out:", error);
        });
    });

    // Inventory Management
    const inventoryForm = document.getElementById('addInventoryForm');
    const productSelect = document.getElementById('productName');
    const imagePreview = document.getElementById('imagePreview');
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    let inventoryItems = [];

    // Product data with images
    const products = [
        { name: 'Bread', image: 'bread.jpg' },
        { name: 'Bread Pakora', image: 'bread_pakora.jpg' },
        { name: 'Brownie', image: 'brownie.jpg' },
        { name: 'Cake', image: 'cake.jpg' },
        { name: 'Cheese Sandwich', image: 'cheese_sandwitch.jpg' },
        { name: 'Cookies', image: 'cookies.jpg' },
        { name: 'Croissant', image: 'croissant.jpg' },
        { name: 'Cup Cake', image: 'cup_cake.jpg' },
        { name: 'Dispasand', image: 'dilpasand.jpg' },
        { name: 'Egg Puff', image: 'egg_puff.jpg' },
        { name: 'Garlic Loaf', image: 'garlic_loaf.jpg' },
        { name: 'Masala Bun', image: 'masala_bun.jpg' },
        { name: 'Pastry', image: 'pastry.jpg' },
        { name: 'Pav Bread', image: 'pav_bread.jpg' },
        { name: 'Rusk', image: 'rusk.jpg' },
        { name: 'Samosa', image: 'samosa.jpg' },
        { name: 'Veg Puff', image: 'Veg_Puff.jpg' }
    ];

    // Product prices
    const productPrices = {
        'Bread': 35,
        'Bread Pakora': 40,
        'Brownie': 25,
        'Cake': 350,
        'Cheese Sandwich': 70,
        'Cookies': 75,
        'Croissant': 70,
        'Cup Cake': 25,
        'Dispasand': 10,
        'Egg Puff': 23,
        'Garlic Loaf': 50,
        'Masala Bun': 18,
        'Pastry': 90,
        'Pav Bread': 42,
        'Rusk': 135,
        'Samosa': 20,
        'Veg Puff': 18
    };

    // Load products into dropdown
    function loadProducts() {
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
    }

    // Generate random 8-digit batch number
    function generateBatchNumber() {
        return Math.floor(10000000 + Math.random() * 90000000).toString();
    }

    // Calculate expiry date (3 days after manufacture date)
    function calculateExpiryDate(manufactureDate) {
        const date = new Date(manufactureDate);
        date.setDate(date.getDate() + 3);
        return date.toISOString().split('T')[0];
    }

    // Check product status
    function checkProductStatus(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: 'Expired', class: 'status-expired' };
        } else if (diffDays <= 1) {
            return { text: 'Expiring Soon', class: 'status-expiring' };
        } else {
            return { text: 'Good', class: 'status-good' };
        }
    }

    // Update image preview when product is selected
    productSelect.addEventListener('change', () => {
        const selectedProduct = products.find(p => p.name === productSelect.value);
        if (selectedProduct) {
            imagePreview.innerHTML = `<img src="images/${selectedProduct.image}" alt="${selectedProduct.name}">`;
        } else {
            imagePreview.innerHTML = '';
        }
    });

    // Handle inventory form submission
    inventoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const productName = document.getElementById('productName').value;
        const selectedProduct = products.find(p => p.name === productName);
        const quantity = document.getElementById('quantity').value;
        const manufactureDate = document.getElementById('manufactureDate').value;
        const batchNumber = generateBatchNumber();
        const expiryDate = calculateExpiryDate(manufactureDate);
        const status = checkProductStatus(expiryDate);
        const timestamp = new Date().toISOString();

        // Check if an item with this batch number already exists
        const existingItem = inventoryItems.find(item => item.batchNumber === batchNumber);
        if (existingItem) {
            alert('An item with this batch number already exists. Please try again.');
            return;
        }

        // Create inventory item
        const newItem = {
            name: productName,
            image: selectedProduct.image,
            quantity,
            manufactureDate,
            batchNumber,
            expiryDate,
            status: status.text,
            statusClass: status.class,
            timestamp
        };

        // Store in Firebase
        const inventoryRef = firebase.ref(firebase.database, 'inventory');
        const newInventoryRef = firebase.push(inventoryRef);
        
        firebase.set(newInventoryRef, newItem)
            .then(() => {
                alert('Inventory item added successfully!');
                // Update table
                updateInventoryTable();
                // Reset form
                inventoryForm.reset();
                imagePreview.innerHTML = '';
            })
            .catch(error => {
                console.error("Error adding inventory item:", error);
                alert('Failed to add inventory item. Please try again.');
            });
    });

    // Update inventory table - load from Firebase
    function updateInventoryTable() {
        // Clear the table first
        inventoryTableBody.innerHTML = '';
        
        // Get inventory from Firebase
        const inventoryRef = firebase.ref(firebase.database, 'inventory');
        firebase.get(inventoryRef).then((snapshot) => {
            if (snapshot.exists()) {
                // Clear local array and repopulate with Firebase data
                inventoryItems = [];
                const data = snapshot.val();
                
                // Track batch numbers to avoid duplicates
                const batchNumbers = new Set();
                
                // Convert object to array and filter duplicates
                Object.keys(data).forEach(key => {
                    const item = data[key];
                    item.key = key; // Save Firebase key for future updates
                    
                    // Only add if this batch number hasn't been seen
                    if (!batchNumbers.has(item.batchNumber)) {
                        batchNumbers.add(item.batchNumber);
                    inventoryItems.push(item);
                    } else {
                        console.warn(`Duplicate batch number found: ${item.batchNumber}. Skipping duplicate item.`);
                    }
                });
                
                // Sort by timestamp if available, otherwise by id
                inventoryItems.sort((a, b) => {
                    if (a.timestamp && b.timestamp) {
                        return new Date(b.timestamp) - new Date(a.timestamp);
                    }
                    return a.id - b.id;
                });
                
                // Populate table with correct serial numbers
                inventoryItems.forEach((item, index) => {
                    const row = document.createElement('tr');
                    const serialNumber = index + 1; // Generate sequential serial numbers
                    
                    row.innerHTML = `
                        <td>${serialNumber}</td>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.manufactureDate}</td>
                        <td>${item.batchNumber}</td>
                        <td>${item.expiryDate}</td>
                        <td class="${item.statusClass}">${item.status}</td>
                        <td>
                            <button class="edit-btn" data-id="${item.key}">Edit</button>
                            <button class="delete-btn" data-id="${item.key}">Delete</button>
                        </td>
                    `;
                    inventoryTableBody.appendChild(row);
                    
                    // Add event listeners for edit and delete buttons
                    row.querySelector('.edit-btn').addEventListener('click', function() {
                        editInventoryItem(item.key);
                    });
                    
                    row.querySelector('.delete-btn').addEventListener('click', function() {
                        deleteInventoryItem(item.key);
                    });
                });
            } else {
                console.log("No inventory data available");
            }
        }).catch((error) => {
            console.error("Error getting inventory data:", error);
        });
    }
    
    // Edit inventory item
    function editInventoryItem(key) {
        const item = inventoryItems.find(item => item.key === key);
        if (!item) return;
        
        // Populate form with item data
        document.getElementById('productName').value = item.name;
        document.getElementById('quantity').value = item.quantity;
        document.getElementById('manufactureDate').value = item.manufactureDate;
        
        // Show image preview
        const selectedProduct = products.find(p => p.name === item.name);
        if (selectedProduct) {
            imagePreview.innerHTML = `<img src="images/${selectedProduct.image}" alt="${selectedProduct.name}">`;
        }
        
        // Change submit button to update
        const submitBtn = inventoryForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Update Item';
        
        // Store key for update
        inventoryForm.dataset.editKey = key;
        
        // Change form submit handler to update item
        inventoryForm.onsubmit = function(e) {
            e.preventDefault();
            
            const productName = document.getElementById('productName').value;
            const selectedProduct = products.find(p => p.name === productName);
            const quantity = document.getElementById('quantity').value;
            const manufactureDate = document.getElementById('manufactureDate').value;
            const expiryDate = calculateExpiryDate(manufactureDate);
            const status = checkProductStatus(expiryDate);
            
            // Update item
            const updatedItem = {
                ...item,
                name: productName,
                image: selectedProduct.image,
                quantity,
                manufactureDate,
                expiryDate,
                status: status.text,
                statusClass: status.class,
                updated: new Date().toISOString()
            };
            
            // Update in Firebase
            const itemRef = firebase.ref(firebase.database, `inventory/${key}`);
            firebase.set(itemRef, updatedItem)
                .then(() => {
                    alert('Inventory item updated successfully!');
                    
                    // Reset form
                    inventoryForm.reset();
                    imagePreview.innerHTML = '';
                    
                    // Reset submit button and handler
                    submitBtn.textContent = 'Add to Inventory';
                    inventoryForm.onsubmit = null;
                    delete inventoryForm.dataset.editKey;
                    
                    // Restore original submit handler
                    inventoryForm.addEventListener('submit', inventoryForm.originalSubmitHandler);
                    
                    // Update table
                    updateInventoryTable();
                })
                .catch(error => {
                    console.error("Error updating inventory item:", error);
                    alert('Failed to update inventory item. Please try again.');
                });
        };
        
        // Store original handler if not already stored
        if (!inventoryForm.originalSubmitHandler) {
            // This should be the original function, but we'll ensure it's properly registered
            inventoryForm.originalSubmitHandler = inventoryForm.onsubmit;
        }
    }
    
    // Delete inventory item
    function deleteInventoryItem(key) {
        if (confirm('Are you sure you want to delete this item?')) {
            const itemRef = firebase.ref(firebase.database, `inventory/${key}`);
            firebase.set(itemRef, null)
                .then(() => {
                    alert('Inventory item deleted successfully!');
                    updateInventoryTable();
                })
                .catch(error => {
                    console.error("Error deleting inventory item:", error);
                    alert('Failed to delete inventory item. Please try again.');
                });
        }
    }
    
    // Initial load from Firebase
    updateInventoryTable();

    // Clean up duplicate inventory items in Firebase
    function cleanupDuplicateInventoryItems() {
        const inventoryRef = firebase.ref(firebase.database, 'inventory');
        firebase.get(inventoryRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const batchNumberMap = new Map(); // Maps batch numbers to Firebase keys
                const keysToRemove = []; // Keys of duplicate items to remove
                
                // Identify duplicates
                Object.entries(data).forEach(([key, item]) => {
                    if (batchNumberMap.has(item.batchNumber)) {
                        // This is a duplicate - add it to the remove list
                        keysToRemove.push(key);
                    } else {
                        // First occurrence of this batch number
                        batchNumberMap.set(item.batchNumber, key);
                    }
                });
                
                // Remove duplicates
                if (keysToRemove.length > 0) {
                    console.log(`Removing ${keysToRemove.length} duplicate inventory items`);
                    
                    // Create a batch of promises to remove all duplicates
                    const removePromises = keysToRemove.map(key => {
                        const itemRef = firebase.ref(firebase.database, `inventory/${key}`);
                        return firebase.set(itemRef, null);
                    });
                    
                    // Execute all deletions
                    Promise.all(removePromises)
                        .then(() => {
                            console.log('Successfully removed all duplicate inventory items');
                            // Refresh the inventory table
                            updateInventoryTable();
                        })
                        .catch(error => {
                            console.error('Error removing duplicate items:', error);
                        });
                } else {
                    console.log('No duplicate inventory items found');
                }
            }
        }).catch((error) => {
            console.error("Error getting inventory data for cleanup:", error);
        });
    }

    // Clean up any existing duplicates when the page loads
    cleanupDuplicateInventoryItems();

    // Initialize Sales Chart
    const ctx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Sales',
                data: [0, 0, 0, 0, 0, 0, 0],
                borderColor: '#3498db',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Initialize sales data from Firebase
    initSalesChart();
    
    // Initialize Sales Chart with data from Firebase
    function initSalesChart() {
        const salesRef = firebase.ref(firebase.database, 'sales');
        firebase.get(salesRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const salesData = {
                    'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
                };
                
                // Process sales data
                Object.values(data).forEach(sale => {
                    const saleDate = new Date(sale.date);
                    const day = saleDate.toLocaleDateString('en-US', { weekday: 'short' });
                    
                    if (salesData[day] !== undefined) {
                        salesData[day] += parseFloat(sale.total);
                    }
                });
                
                // Update chart
                salesChart.data.datasets[0].data = Object.values(salesData);
                salesChart.update();
                
                // Update sales stats cards
                updateSalesStats(data);
            }
        }).catch((error) => {
            console.error("Error getting sales data:", error);
        });
    }
    
    // Update sales stats on dashboard
    function updateSalesStats(salesData) {
        const today = new Date().toISOString().split('T')[0];
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];
        
        let todaySales = 0;
        let weekSales = 0;
        let monthSales = 0;
        
        Object.values(salesData).forEach(sale => {
            const saleDate = sale.date;
            const saleTotal = parseFloat(sale.total);
            
            if (saleDate === today) {
                todaySales += saleTotal;
            }
            
            if (saleDate >= oneWeekAgoStr) {
                weekSales += saleTotal;
            }
            
            if (saleDate >= oneMonthAgoStr) {
                monthSales += saleTotal;
            }
        });
        
        // Update UI
        document.querySelector('.sales-stats .stat-card:nth-child(1) .amount').textContent = `₹${todaySales.toFixed(2)}`;
        document.querySelector('.sales-stats .stat-card:nth-child(2) .amount').textContent = `₹${weekSales.toFixed(2)}`;
        document.querySelector('.sales-stats .stat-card:nth-child(3) .amount').textContent = `₹${monthSales.toFixed(2)}`;
    }
    
    // Expense Form with Firebase integration
    const expenseForm = document.getElementById('addExpenseForm');
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const expenseType = expenseForm.querySelector('select').value;
        const amount = expenseForm.querySelector('input[type="number"]').value;
        const date = expenseForm.querySelector('input[type="date"]').value;
        
        // Create expense object
        const expense = {
            type: expenseType,
            amount: parseFloat(amount),
            date: date,
            timestamp: new Date().toISOString()
        };
        
        // Save to Firebase
        const expensesRef = firebase.ref(firebase.database, 'expenses');
        const newExpenseRef = firebase.push(expensesRef);
        
        firebase.set(newExpenseRef, expense)
            .then(() => {
                alert('Expense added successfully!');
                expenseForm.reset();
                loadExpenses(); // Function to load expenses (implement below)
            })
            .catch(error => {
                console.error("Error adding expense:", error);
                alert('Failed to add expense. Please try again.');
            });
    });
    
    // Load expenses from Firebase
    function loadExpenses() {
        // Check if expenses table exists
        const expensesTable = document.querySelector('#expenses table tbody');
        if (!expensesTable) {
            console.log("Expenses table not found in DOM");
            return;
        }
        
        expensesTable.innerHTML = ''; // Clear existing data
        
        const expensesRef = firebase.ref(firebase.database, 'expenses');
        firebase.get(expensesRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Convert object to array and sort by date (newest first)
                const expenses = Object.entries(data).map(([key, expense]) => ({
                    key,
                    ...expense
                })).sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // Populate table
                expenses.forEach(expense => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${expense.type}</td>
                        <td>₹${expense.amount.toFixed(2)}</td>
                        <td>${expense.date}</td>
                        <td>
                            <button class="edit-btn" data-id="${expense.key}">Edit</button>
                            <button class="delete-btn" data-id="${expense.key}">Delete</button>
                        </td>
                    `;
                    expensesTable.appendChild(row);
                    
                    // Add event listeners
                    row.querySelector('.edit-btn').addEventListener('click', function() {
                        editExpense(expense.key);
                    });
                    
                    row.querySelector('.delete-btn').addEventListener('click', function() {
                        deleteExpense(expense.key);
                    });
                });
            } else {
                console.log("No expenses data available");
                // If no expenses table exists, create a message
                expensesTable.innerHTML = `<tr><td colspan="4" style="text-align:center;">No expenses recorded</td></tr>`;
            }
        }).catch((error) => {
            console.error("Error getting expenses data:", error);
        });
    }
    
    // Edit expense
    function editExpense(key) {
        const expensesRef = firebase.ref(firebase.database, `expenses/${key}`);
        firebase.get(expensesRef).then((snapshot) => {
            if (snapshot.exists()) {
                const expense = snapshot.val();
                
                // Populate form
                expenseForm.querySelector('select').value = expense.type;
                expenseForm.querySelector('input[type="number"]').value = expense.amount;
                expenseForm.querySelector('input[type="date"]').value = expense.date;
                
                // Change submit button
                const submitBtn = expenseForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Update Expense';
                
                // Store key for update
                expenseForm.dataset.editKey = key;
                
                // Change form handler
                expenseForm.onsubmit = function(e) {
                    e.preventDefault();
                    
                    const updatedExpense = {
                        type: expenseForm.querySelector('select').value,
                        amount: parseFloat(expenseForm.querySelector('input[type="number"]').value),
                        date: expenseForm.querySelector('input[type="date"]').value,
                        timestamp: new Date().toISOString(),
                        updated: true
                    };
                    
                    // Update in Firebase
                    firebase.set(expensesRef, updatedExpense)
                        .then(() => {
                            alert('Expense updated successfully!');
                            
                            // Reset form
                            expenseForm.reset();
                            
                            // Reset submit button and handler
                            submitBtn.textContent = 'Add Expense';
                            expenseForm.onsubmit = null;
                            delete expenseForm.dataset.editKey;
                            
                            // Restore original submit handler
                            expenseForm.addEventListener('submit', expenseForm.originalSubmitHandler);
                            
                            // Reload expenses
                            loadExpenses();
                        })
                        .catch(error => {
                            console.error("Error updating expense:", error);
                            alert('Failed to update expense. Please try again.');
                        });
                };
                
                // Store original handler if not already stored
                if (!expenseForm.originalSubmitHandler) {
                    expenseForm.originalSubmitHandler = expenseForm.onsubmit;
                }
            }
        }).catch((error) => {
            console.error("Error getting expense:", error);
        });
    }
    
    // Delete expense
    function deleteExpense(key) {
        if (confirm('Are you sure you want to delete this expense?')) {
            const expenseRef = firebase.ref(firebase.database, `expenses/${key}`);
            firebase.set(expenseRef, null)
                .then(() => {
                    alert('Expense deleted successfully!');
                    loadExpenses();
                })
                .catch(error => {
                    console.error("Error deleting expense:", error);
                    alert('Failed to delete expense. Please try again.');
                });
        }
    }
    
    // Load expenses on page load
    loadExpenses();
    
    // Bill Generation with Firebase integration
    const billForm = document.getElementById('generateBillForm');
    const billItems = document.getElementById('billItems');
    const billTotal = document.getElementById('billTotal');
    const addItemBtn = document.getElementById('addItem');
    
    // Bill item template
    function createBillItem() {
        const div = document.createElement('div');
        div.className = 'bill-item';
        div.innerHTML = `
            <select required>
                <option value="">Select Item</option>
                ${products.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
            </select>
            <input type="number" placeholder="Quantity" required min="1">
            <span class="item-price">₹0.00</span>
            <button type="button" class="remove-item">×</button>
        `;
        
        // Add event listeners
        const select = div.querySelector('select');
        const quantity = div.querySelector('input[type="number"]');
        const priceSpan = div.querySelector('.item-price');
        
        // Update price on change
        function updateItemPrice() {
            const product = select.value;
            const qty = parseInt(quantity.value) || 0;
            
            if (product && products.find(p => p.name === product)) {
                const price = productPrices[product] || 0;
                priceSpan.textContent = `₹${(price * qty).toFixed(2)}`;
                updateBillTotal();
            } else {
                priceSpan.textContent = '₹0.00';
            }
        }
        
        select.addEventListener('change', updateItemPrice);
        quantity.addEventListener('input', updateItemPrice);
        
        // Remove button
        div.querySelector('.remove-item').addEventListener('click', function() {
            div.remove();
            updateBillTotal();
        });
        
        return div;
    }
    
    function updateBillTotal() {
        let total = 0;
        const items = billItems.querySelectorAll('.bill-item');
        
        items.forEach(item => {
            const product = item.querySelector('select').value;
            const qty = parseInt(item.querySelector('input[type="number"]').value) || 0;
            
            if (product && qty > 0) {
                const price = productPrices[product] || 0;
                total += price * qty;
            }
        });
        
        billTotal.textContent = `₹${total.toFixed(2)}`;
    }

    // Add item button
    addItemBtn.addEventListener('click', function() {
        billItems.appendChild(createBillItem());
    });
    
    // Bill form submission
    billForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const customerName = billForm.querySelector('input[type="text"]').value;
        const items = [];
        let total = 0;
        
        // Collect items
        billItems.querySelectorAll('.bill-item').forEach(item => {
            const product = item.querySelector('select').value;
            const quantity = parseInt(item.querySelector('input[type="number"]').value) || 0;
            
            if (product && quantity > 0) {
                const unitPrice = productPrices[product] || 0;
                const itemTotal = unitPrice * quantity;
                total += itemTotal;
                
                items.push({
                    product,
                    quantity,
                    unitPrice,
                    total: itemTotal
                });
            }
        });
        
        if (items.length === 0) {
            alert('Please add at least one item to the bill.');
            return;
        }
        
        // Create bill object
        const bill = {
            customerName,
            items,
            total,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        };
        
        // Save bill to Firebase
        const billsRef = firebase.ref(firebase.database, 'bills');
        const newBillRef = firebase.push(billsRef);
        
        // Also save as sale for sales tracking
        const salesRef = firebase.ref(firebase.database, 'sales');
        const newSaleRef = firebase.push(salesRef);
        
        // Save both bill and sale
        Promise.all([
            firebase.set(newBillRef, bill),
            firebase.set(newSaleRef, {
                source: 'direct',
                customerName,
                items: items.length,
                total,
                date: bill.date,
                timestamp: bill.timestamp,
                billId: newBillRef.key
            })
        ]).then(() => {
            alert('Bill generated successfully!');
            
            // Generate printable receipt or display bill number
            alert(`Bill #${newBillRef.key.slice(-6)} generated. Total: ₹${total.toFixed(2)}`);
            
            // Reset form
            billForm.reset();
            
            // Clear all items except first
            const allItems = billItems.querySelectorAll('.bill-item');
            for (let i = 1; i < allItems.length; i++) {
                allItems[i].remove();
            }
            
            // Clear first item selections
            const firstItem = billItems.querySelector('.bill-item');
            if (firstItem) {
                firstItem.querySelector('select').value = '';
                firstItem.querySelector('input').value = '';
                firstItem.querySelector('.item-price').textContent = '₹0.00';
            }
            
            // Update total
            updateBillTotal();
            
            // Update sales chart
            initSalesChart();
            
        }).catch(error => {
            console.error("Error generating bill:", error);
            alert('Failed to generate bill. Please try again.');
        });
    });
    
    // Initialize products for bills
    function initBillProducts() {
        // Add product options to first bill item
        const firstItem = billItems.querySelector('.bill-item');
        const select = firstItem.querySelector('select');
        
        // Clear existing options except first
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add product options
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = product.name;
            select.appendChild(option);
        });
        
        // Add event listeners to first item
        select.addEventListener('change', function() {
            updateItemPrice(firstItem);
        });
        
        firstItem.querySelector('input').addEventListener('input', function() {
            updateItemPrice(firstItem);
        });
        
        function updateItemPrice(item) {
            const product = item.querySelector('select').value;
            const qty = parseInt(item.querySelector('input').value) || 0;
            const priceSpan = item.querySelector('.item-price');
            
            if (product && qty > 0) {
                const price = productPrices[product] || 0;
                priceSpan.textContent = `₹${(price * qty).toFixed(2)}`;
            } else {
                priceSpan.textContent = '₹0.00';
            }
            
            updateBillTotal();
        }
    }
    
    // Initialize bill products
    initBillProducts();

    // Initialize products
    loadProducts();
    
    // Retail Orders Functionality
    const retailOrderForm = document.getElementById('retailOrderForm');
    const retailOrderItems = document.getElementById('retailOrderItems');
    const addRetailOrderItemBtn = document.getElementById('addRetailOrderItem');
    const retailOrdersHistory = document.getElementById('retailOrdersHistory');
    
    // Load raw materials for retail orders from Firebase
    function loadRawMaterials() {
        const materialSelect = document.querySelector('.material-select');
        if (!materialSelect) return;
        
        // Clear existing options except the first one
        Array.from(materialSelect.options).forEach((option, index) => {
            if (index !== 0) materialSelect.removeChild(option);
        });
        
        // Load raw materials from Firebase
        const rawRef = firebase.ref(firebase.database, 'raw');
        firebase.get(rawRef).then((snapshot) => {
            if (snapshot.exists()) {
                const materials = snapshot.val();
                
                // Add materials to select
                materials.forEach((material, index) => {
                        const option = document.createElement('option');
                        option.value = index;
                    option.textContent = `${material.name} - ${material.price}`;
                        option.dataset.price = material.price;
                    option.dataset.name = material.name;
                    materialSelect.appendChild(option);
                });
            } else {
                console.log("No raw materials found");
            }
        }).catch((error) => {
            console.error("Error loading raw materials:", error);
        });
    }
    
    // Create new retail order item row
    function createRetailOrderItem() {
        const retailOrderItems = document.getElementById('retailOrderItems');
        if (!retailOrderItems) return;
        
        const newItem = document.createElement('div');
        newItem.className = 'retail-order-item';
        
        // Clone the first material select for the new item
        const firstSelect = document.querySelector('.material-select');
        const selectClone = firstSelect.cloneNode(true);
        selectClone.value = ""; // Reset selection
        
        newItem.innerHTML = `
            <div class="form-group">
                <label>Raw Material</label>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="material-quantity" min="1" required>
            </div>
            <button type="button" class="remove-item">×</button>
        `;
        
        // Insert the cloned select into the first form-group
        newItem.querySelector('.form-group').appendChild(selectClone);
        
        // Add event listener to remove button
        newItem.querySelector('.remove-item').addEventListener('click', function() {
            newItem.remove();
        });
        
        retailOrderItems.appendChild(newItem);
    }
    
    // Add retail order item button
    if (addRetailOrderItemBtn) {
        addRetailOrderItemBtn.addEventListener('click', createRetailOrderItem);
    }

    // Handle retail order form submission
    if (retailOrderForm) {
        retailOrderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get current manager information
            const user = firebase.auth.currentUser;
            if (!user) {
                alert('Please log in to place a retail order.');
                return;
            }
            
            // Get manager details
            const managerRef = firebase.ref(firebase.database, 'managers/' + user.uid);
            const managerSnapshot = await firebase.get(managerRef);
            
            if (!managerSnapshot.exists()) {
                alert('Manager profile not found. Please log out and log in again.');
                return;
            }
            
            const managerData = managerSnapshot.val();
            
            // Get all order items
            const orderItems = [];
            const items = document.querySelectorAll('.retail-order-item');
            
            items.forEach(item => {
                const materialSelect = item.querySelector('.material-select');
                const quantityInput = item.querySelector('.material-quantity');
                
                if (materialSelect.value && quantityInput.value) {
                    const selectedOption = materialSelect.options[materialSelect.selectedIndex];
                    
                    orderItems.push({
                        material: selectedOption.dataset.name,
                        price: selectedOption.dataset.price,
                        quantity: parseInt(quantityInput.value)
                    });
                }
            });
            
            if (orderItems.length === 0) {
                alert('Please add at least one item to the order.');
                return;
            }
            
            // Create the order object
            const newOrder = {
                items: orderItems,
                managerId: user.uid,
                managerName: managerData.name || user.email,
                managerEmail: user.email,
                status: 'pending',
                timestamp: new Date().toISOString()
            };
            
            // Save to Firebase
            const retailOrdersRef = firebase.ref(firebase.database, 'retailOrders');
            const newOrderRef = firebase.push(retailOrdersRef);
            
            firebase.set(newOrderRef, newOrder)
                .then(() => {
                    alert('Retail order placed successfully!');
                    retailOrderForm.reset();
                    
                    // Reset to one empty item
                    const retailOrderItems = document.getElementById('retailOrderItems');
                    retailOrderItems.innerHTML = `
                        <div class="retail-order-item">
                            <div class="form-group">
                                <label>Raw Material</label>
                                <select class="material-select" required>
                                    <option value="">Select Material</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Quantity</label>
                                <input type="number" class="material-quantity" min="1" required>
                            </div>
                            <button type="button" class="remove-item">×</button>
                        </div>
                    `;
                    
                    // Reload materials list
                    loadRawMaterials();
                    
                    // Update orders history
                    loadRetailOrdersHistory();
                })
                .catch(error => {
                    console.error("Error placing retail order:", error);
                    alert('Failed to place retail order: ' + error.message);
                });
        });
    }
    
    // Load retail orders history for manager
    function loadRetailOrdersHistory() {
        const retailOrdersTableBody = document.getElementById('retailOrdersHistory');
        if (!retailOrdersTableBody) return;
        
        retailOrdersTableBody.innerHTML = '<tr><td colspan="6" class="loading-message">Loading order history...</td></tr>';
        
        // Get current user
        const user = firebase.auth.currentUser;
        if (!user) {
            retailOrdersTableBody.innerHTML = '<tr><td colspan="6">Please log in to view order history.</td></tr>';
            return;
        }
        
        // Query retail orders for this manager
        const retailOrdersRef = firebase.ref(firebase.database, 'retailOrders');
        firebase.get(retailOrdersRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Filter orders for current manager and sort by date (newest first)
                const managerOrders = Object.entries(data)
                    .filter(([key, order]) => order.managerId === user.uid)
                    .map(([key, order]) => ({...order, id: key}))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                if (managerOrders.length === 0) {
                    retailOrdersTableBody.innerHTML = '<tr><td colspan="6">You have no retail orders.</td></tr>';
                    return;
                }
                
                // Clear loading message
                retailOrdersTableBody.innerHTML = '';
                
                // Add orders to table
                managerOrders.forEach(order => {
                    const row = document.createElement('tr');
                    
                    // Format materials for display
                    const materialsList = order.items.map(item => 
                        `${item.material} (${item.quantity})`
                    ).join('<br>');
                    
                    // Calculate total cost
                    const totalCost = order.items.reduce((total, item) => {
                        let price = 0;
                        if (item.price !== undefined && item.price !== null) {
                            if (typeof item.price === 'number') {
                                price = item.price;
                            } else if (typeof item.price === 'string') {
                                price = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
                            }
                        }
                        return total + (price * (item.quantity || 0));
                    }, 0);
                    
                    // Format date
                    const orderDate = new Date(order.timestamp).toLocaleDateString();
                    
                    // Get status display class
                    const statusClass = getStatusClass(order.status);
                    
                    // Build the row
                    row.innerHTML = `
                        <td>${order.id.slice(-6)}</td>
                        <td>${orderDate}</td>
                        <td class="materials-list">${materialsList}</td>
                        <td>${totalCost} rupees</td>
                        <td class="${statusClass}">${order.status}</td>
                        <td>
                            ${order.status === 'pending' ? 
                                `<button class="cancel-btn" data-id="${order.id}">Cancel</button>` : 
                                order.status === 'rejected' && order.rejectionReason ? 
                                `<span class="rejection-reason" title="${order.rejectionReason}">Reason: ${order.rejectionReason}</span>` : 
                                order.status === 'completed' ? 
                                `<button class="reorder-btn" data-id="${order.id}">Reorder</button>` : 
                                ''}
                        </td>
                    `;
                    
                    retailOrdersTableBody.appendChild(row);
                });
                    
                    // Add event listeners for action buttons
                retailOrdersTableBody.querySelectorAll('.cancel-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        cancelRetailOrder(this.dataset.id);
                    });
                });
                
                retailOrdersTableBody.querySelectorAll('.reorder-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const orderId = this.dataset.id;
                        const order = managerOrders.find(o => o.id === orderId);
                        if (order) {
                            reorderRetailOrder(order);
                        }
                    });
                });
            } else {
                retailOrdersTableBody.innerHTML = '<tr><td colspan="6">No retail orders found.</td></tr>';
            }
        }).catch((error) => {
            console.error("Error loading retail orders:", error);
            retailOrdersTableBody.innerHTML = `<tr><td colspan="6">Error loading orders: ${error.message}</td></tr>`;
        });
    }

    // Helper function to get status class
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

    // Cancel a retail order
    function cancelRetailOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            const orderRef = firebase.ref(firebase.database, `retailOrders/${orderId}`);
            
            firebase.get(orderRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const order = snapshot.val();
                    
                    // Only allow cancellation of pending orders
                    if (order.status.toLowerCase() !== 'pending') {
                        alert('Only pending orders can be cancelled.');
                        return;
                    }
                    
                    // Update status to cancelled
                    order.status = 'cancelled';
                    order.statusUpdatedAt = new Date().toISOString();
                    
                    // Save the updated order
                    firebase.set(orderRef, order)
                .then(() => {
                            alert('Order has been cancelled.');
                            loadRetailOrdersHistory(); // Reload orders
                })
                .catch(error => {
                    console.error("Error cancelling order:", error);
                    alert('Failed to cancel order. Please try again.');
                });
                } else {
                    alert('Order not found.');
                }
            }).catch(error => {
                console.error("Error getting order:", error);
                alert('Failed to get order. Please try again.');
            });
        }
    }
    
    // Reorder a completed retail order
    function reorderRetailOrder(order) {
        if (confirm('Would you like to place a new order with the same items?')) {
            // Create a new order with the same items
            const newOrder = {
                items: order.items,
                managerId: firebase.auth.currentUser.uid,
                managerName: order.managerName,
                managerEmail: order.managerEmail,
                status: 'pending',
                timestamp: new Date().toISOString(),
                reorderedFrom: order.id
            };
            
            // Save to Firebase
            const retailOrdersRef = firebase.ref(firebase.database, 'retailOrders');
            const newOrderRef = firebase.push(retailOrdersRef);
            
            firebase.set(newOrderRef, newOrder)
                .then(() => {
                    alert('Reorder placed successfully!');
                    loadRetailOrdersHistory(); // Reload orders
                })
                .catch(error => {
                    console.error("Error placing reorder:", error);
                    alert('Failed to place reorder. Please try again.');
                });
        }
    }
    
    // Initial loading of various sections
    loadProducts();
    loadRawMaterials();
    updateInventoryTable();
    loadRetailOrdersHistory();
    loadCustomerOrders();
    loadCustomerFeedback();
    loadProductExpiry();
    loadBills(); // Load bills for Bills & Invoices section

    // Load bills from Firebase for the Bills & Invoices section
    function loadBills() {
        const billsTableBody = document.getElementById('billsTableBody');
        if (!billsTableBody) return;
        
        billsTableBody.innerHTML = '<tr><td colspan="6" class="loading-message">Loading bills...</td></tr>';
        
        // Get bills from Firebase
        const billsRef = firebase.ref(firebase.database, 'bills');
        firebase.get(billsRef).then((snapshot) => {
            if (snapshot.exists()) {
                const bills = snapshot.val();
                
                // Convert to array and sort by timestamp (newest first)
                const billsArray = Object.entries(bills)
                    .map(([key, bill]) => ({...bill, key}))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                if (billsArray.length === 0) {
                    billsTableBody.innerHTML = '<tr><td colspan="6">No bills found.</td></tr>';
                    return;
                }
                
                // Clear loading message
                billsTableBody.innerHTML = '';
                
                // Add bills to table
                billsArray.forEach(bill => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${bill.billNumber || bill.key.slice(-6)}</td>
                        <td>${bill.orderId ? bill.orderId.slice(-6) : 'N/A'}</td>
                        <td>${bill.customerEmail || bill.customerName || 'Walk-in Customer'}</td>
                        <td>${bill.completionDate || new Date(bill.timestamp).toLocaleDateString()}</td>
                        <td>${bill.totalAmount || bill.total || 0} rupees</td>
                        <td>
                            <button class="view-bill-btn" data-id="${bill.key}">View</button>
                            <button class="print-bill-btn" data-id="${bill.key}">Print</button>
                        </td>
                    `;
                    
                    billsTableBody.appendChild(row);
                });
                
                // Add event listeners to action buttons
                billsTableBody.querySelectorAll('.view-bill-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const billKey = this.dataset.id;
                        const bill = billsArray.find(b => b.key === billKey);
                        if (bill) {
                            displayBill(bill);
                        }
                    });
                });
                
                billsTableBody.querySelectorAll('.print-bill-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const billKey = this.dataset.id;
                        const bill = billsArray.find(b => b.key === billKey);
                        if (bill) {
                            displayBill(bill, true); // true indicates to auto-trigger print
                        }
                    });
                });
            } else {
                billsTableBody.innerHTML = '<tr><td colspan="6">No bills found.</td></tr>';
            }
        }).catch((error) => {
            console.error("Error loading bills:", error);
            billsTableBody.innerHTML = `<tr><td colspan="6">Error loading bills: ${error.message}</td></tr>`;
        });
    }

    // Display bill in a modal with option to auto-print
    function displayBill(bill, autoPrint = false) {
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
                        <p><strong>Bill Number:</strong> ${bill.billNumber || bill.key.slice(-6)}</p>
                        <p><strong>Order ID:</strong> ${bill.orderId ? bill.orderId.slice(-6) : 'N/A'}</p>
                        <p><strong>Date:</strong> ${bill.completionDate || new Date(bill.timestamp).toLocaleDateString()}</p>
                        <p><strong>Customer:</strong> ${bill.customerEmail || bill.customerName || 'Walk-in Customer'}</p>
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
                        <p>Total Amount: ${bill.totalAmount || bill.total || 0} rupees</p>
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
        
        // Auto-print if requested
        if (autoPrint) {
            setTimeout(() => {
                window.print();
            }, 500); // Short delay to ensure modal is fully rendered
        }
    }

    // Load customer feedback
    function loadCustomerFeedback() {
        const feedbackContainer = document.querySelector('.feedback-list');
        if (!feedbackContainer) return;
        feedbackContainer.innerHTML = '<p class="loading-message">Loading customer feedback...</p>';
        // Get feedback from Firebase
        const feedbackRef = firebase.ref(firebase.database, 'feedback');
        firebase.get(feedbackRef).then((snapshot) => {
            if (snapshot.exists()) {
                const feedback = snapshot.val();
                // Convert to array and sort by timestamp (newest first)
                const feedbackArray = Object.entries(feedback)
                    .map(([key, item]) => ({...item, id: key}))
                    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
                if (feedbackArray.length === 0) {
                    feedbackContainer.innerHTML = '<p>No customer feedback found.</p>';
                    return;
                }
                // Calculate overall rating
                const totalRatings = feedbackArray.length;
                const sumRatings = feedbackArray.reduce((sum, item) => sum + (parseInt(item.rating) || 0), 0);
                const avgRating = (sumRatings / totalRatings).toFixed(2);
                // Count per star
                const starCounts = [0, 0, 0, 0, 0]; // index 0 = 1 star, 4 = 5 star
                feedbackArray.forEach(item => {
                    const r = parseInt(item.rating);
                    if (r >= 1 && r <= 5) starCounts[r-1]++;
                });
                // Build overall rating HTML (like Amazon)
                let overallHtml = `<div class="overall-rating" style="margin-bottom:24px;padding:18px 20px;background:#f8f9fa;border-radius:8px;box-shadow:0 1px 6px rgba(44,62,80,0.07);">
                <div style="display:flex;align-items:center;gap:16px;">
                    <span style="font-size:2.2em;font-weight:700;color:#f7b500;">${avgRating}</span>
                    <span style="font-size:1.5em;color:#f7b500;">${'★'.repeat(Math.round(avgRating))}${'☆'.repeat(5-Math.round(avgRating))}</span>
                    <span style="font-size:1.1em;color:#555;">out of 5</span>
                </div>
                <div style="margin-top:8px;font-size:1em;color:#666;">${totalRatings} ratings</div>
                <div style="margin-top:12px;">
                    ${[5,4,3,2,1].map(star => {
                        const count = starCounts[star-1];
                        const percent = totalRatings ? (count/totalRatings*100).toFixed(1) : 0;
                        return `<div style='display:flex;align-items:center;gap:8px;margin-bottom:2px;'>
                            <span style='width:32px;'>${star} star</span>
                            <div style='flex:1;background:#eee;height:10px;border-radius:5px;overflow:hidden;'><div style='background:#f7b500;width:${percent}%;height:100%;'></div></div>
                            <span style='width:40px;text-align:right;'>${count}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
            // Clear loading message and add overall rating
            feedbackContainer.innerHTML = overallHtml;
            // Add feedback items
            feedbackArray.forEach(item => {
                const feedbackItem = document.createElement('div');
                feedbackItem.className = 'feedback-item';
                // Generate star rating display
                const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
                // Format date
                const feedbackDate = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Unknown date';
                feedbackItem.innerHTML = `
                    <div class="feedback-header">
                        <div class="customer-info">
                            <span class="customer-email">${item.customerEmail}</span>
                            <span class="feedback-date">${feedbackDate}</span>
                        </div>
                        <div class="rating">${stars}</div>
                    </div>
                    <div class="feedback-comment">${item.comment || 'No comment provided.'}</div>
                `;
                feedbackContainer.appendChild(feedbackItem);
            });
        } else {
            feedbackContainer.innerHTML = '<p>No customer feedback found.</p>';
        }
    }).catch((error) => {
        console.error("Error loading customer feedback:", error);
        feedbackContainer.innerHTML = `<p>Error loading feedback: ${error.message}</p>`;
    });
    }

    // Load product expiry information
    function loadProductExpiry() {
        const expiryTableBody = document.querySelector('#expiry table tbody');
        if (!expiryTableBody) return;
        
        expiryTableBody.innerHTML = '<tr><td colspan="5" class="loading-message">Loading expiry data...</td></tr>';
        
        // Get inventory from Firebase
        const inventoryRef = firebase.ref(firebase.database, 'inventory');
        firebase.get(inventoryRef).then((snapshot) => {
            if (snapshot.exists()) {
                const inventory = snapshot.val();
                const inventoryArray = Object.values(inventory);
                const productGroups = {};
                const today = new Date();
                inventoryArray.forEach(item => {
                    if (!productGroups[item.name]) {
                        productGroups[item.name] = {
                            name: item.name,
                            quantity: 0,
                            expirySoon: 0,
                            expired: 0,
                            nearestExpiry: null,
                            expiredBatches: [],
                            expiringSoonBatches: []
                        };
                    }
                    const group = productGroups[item.name];
                    const quantity = parseInt(item.quantity);
                    group.quantity += quantity;
                    const expiryDate = new Date(item.expiryDate);
                    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) {
                        group.expired += quantity;
                        group.expiredBatches.push(item.batchNumber);
                    } else if (diffDays <= 1) {
                        group.expirySoon += quantity;
                        group.expiringSoonBatches.push(item.batchNumber);
                    }
                    if (!group.nearestExpiry || expiryDate < new Date(group.nearestExpiry)) {
                        group.nearestExpiry = item.expiryDate;
                    }
                });
                const sortedProducts = Object.values(productGroups).sort((a, b) => {
                    if (a.expired > 0 && b.expired === 0) return -1;
                    if (a.expired === 0 && b.expired > 0) return 1;
                    if (a.expirySoon > 0 && b.expirySoon === 0) return -1;
                    if (a.expirySoon === 0 && b.expirySoon > 0) return 1;
                    return new Date(a.nearestExpiry) - new Date(b.nearestExpiry);
                });
                if (sortedProducts.length === 0) {
                    expiryTableBody.innerHTML = '<tr><td colspan="5">No inventory items found.</td></tr>';
                    return;
                }
                expiryTableBody.innerHTML = '';
                sortedProducts.forEach(product => {
                    const row = document.createElement('tr');
                    let statusText, statusClass, actionBtn = '', batchNumbersHtml = '';
                    if (product.expired > 0) {
                        statusText = 'Expired';
                        statusClass = 'status-expired';
                        actionBtn = `<button class='discard-btn' data-name='${product.name}' data-expiry='${product.nearestExpiry}'>Discarded</button>`;
                        batchNumbersHtml = product.expiredBatches.length > 0 ? product.expiredBatches.join(', ') : '-';
                    } else if (product.expirySoon > 0) {
                        statusText = 'Expiring Soon';
                        statusClass = 'status-expiring';
                        batchNumbersHtml = product.expiringSoonBatches.length > 0 ? product.expiringSoonBatches.join(', ') : '-';
                    } else {
                        statusText = 'Good';
                        statusClass = 'status-good';
                        batchNumbersHtml = '-';
                    }
                    row.innerHTML = `
                        <td>${product.name}</td>
                        <td>${product.quantity}</td>
                        <td>${batchNumbersHtml}</td>
                        <td>${product.nearestExpiry}</td>
                        <td class="${statusClass}">${statusText}</td>
                        <td>${actionBtn}</td>
                    `;
                    expiryTableBody.appendChild(row);
                });
                expiryTableBody.querySelectorAll('.discard-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const name = this.dataset.name;
                        const expiry = this.dataset.expiry;
                        discardExpiredItem(name, expiry);
                    });
                });
            } else {
                expiryTableBody.innerHTML = '<tr><td colspan="5">No inventory items found.</td></tr>';
            }
        }).catch((error) => {
            console.error("Error loading expiry data:", error);
            expiryTableBody.innerHTML = `<tr><td colspan="5">Error loading expiry data: ${error.message}</td></tr>`;
        });
    }

    // --- Overview Section Logic ---
    function updateOverviewSalesStats(salesData) {
        const today = new Date().toISOString().split('T')[0];
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];

        let todaySales = 0;
        let weekSales = 0;
        let monthSales = 0;

        Object.values(salesData).forEach(sale => {
            const saleDate = sale.date;
            const saleTotal = parseFloat(sale.total);
            if (saleDate === today) {
                todaySales += saleTotal;
            }
            if (saleDate >= oneWeekAgoStr) {
                weekSales += saleTotal;
            }
            if (saleDate >= oneMonthAgoStr) {
                monthSales += saleTotal;
            }
        });
        // Update Overview stat cards
        const todayEl = document.getElementById('overviewTodaySales');
        const weekEl = document.getElementById('overviewWeekSales');
        const monthEl = document.getElementById('overviewMonthSales');
        if (todayEl) todayEl.textContent = `₹${todaySales.toFixed(2)}`;
        if (weekEl) weekEl.textContent = `₹${weekSales.toFixed(2)}`;
        if (monthEl) monthEl.textContent = `₹${monthSales.toFixed(2)}`;
    }

    function updateLowStockNotifications(inventoryItems) {
        const lowStockDiv = document.getElementById('lowStockNotifications');
        if (!lowStockDiv) return;
        const threshold = 10;
        const lowStockItems = inventoryItems.filter(item => parseInt(item.quantity) <= threshold);
        if (lowStockItems.length === 0) {
            lowStockDiv.innerHTML = '<span>No low stock items at the moment.</span>';
        } else {
            lowStockDiv.innerHTML = lowStockItems.map(item =>
                `<div><strong>${item.name}</strong> (Batch: ${item.batchNumber || 'N/A'}) - <span style="color:#e74c3c;font-weight:600;">${item.quantity} left</span></div>`
            ).join('');
        }
    }

    // Load sales data for overview
    function loadOverviewSales() {
        const salesRef = firebase.ref(firebase.database, 'sales');
        firebase.get(salesRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                updateOverviewSalesStats(data);
            }
        });
    }
    // Load inventory for low stock notifications
    function loadOverviewLowStock() {
        const inventoryRef = firebase.ref(firebase.database, 'inventory');
        firebase.get(inventoryRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const inventoryItems = Object.values(data);
                updateLowStockNotifications(inventoryItems);
            }
        });
    }
    // On page load, update overview if section exists
    if (document.getElementById('overview')) {
        loadOverviewSales();
        loadOverviewLowStock();
    }

    // Initial loading of various sections
    loadProducts();
    loadRawMaterials();
    updateInventoryTable();
    loadRetailOrdersHistory();
    loadCustomerOrders();
    loadCustomerFeedback();
    loadProductExpiry();
    loadBills(); // Load bills for Bills & Invoices section

    // Load bills from Firebase for the Bills & Invoices section
    function loadBills() {
        const billsTableBody = document.getElementById('billsTableBody');
        if (!billsTableBody) return;
        
        billsTableBody.innerHTML = '<tr><td colspan="6" class="loading-message">Loading bills...</td></tr>';
        
        // Get bills from Firebase
        const billsRef = firebase.ref(firebase.database, 'bills');
        firebase.get(billsRef).then((snapshot) => {
            if (snapshot.exists()) {
                const bills = snapshot.val();
                
                // Convert to array and sort by timestamp (newest first)
                const billsArray = Object.entries(bills)
                    .map(([key, bill]) => ({...bill, key}))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                if (billsArray.length === 0) {
                    billsTableBody.innerHTML = '<tr><td colspan="6">No bills found.</td></tr>';
                    return;
                }
                
                // Clear loading message
                billsTableBody.innerHTML = '';
                
                // Add bills to table
                billsArray.forEach(bill => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${bill.billNumber || bill.key.slice(-6)}</td>
                        <td>${bill.orderId ? bill.orderId.slice(-6) : 'N/A'}</td>
                        <td>${bill.customerEmail || bill.customerName || 'Walk-in Customer'}</td>
                        <td>${bill.completionDate || new Date(bill.timestamp).toLocaleDateString()}</td>
                        <td>${bill.totalAmount || bill.total || 0} rupees</td>
                        <td>
                            <button class="view-bill-btn" data-id="${bill.key}">View</button>
                            <button class="print-bill-btn" data-id="${bill.key}">Print</button>
                        </td>
                    `;
                    
                    billsTableBody.appendChild(row);
                });
                
                // Add event listeners to action buttons
                billsTableBody.querySelectorAll('.view-bill-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const billKey = this.dataset.id;
                        const bill = billsArray.find(b => b.key === billKey);
                        if (bill) {
                            displayBill(bill);
                        }
                    });
                });
                
                billsTableBody.querySelectorAll('.print-bill-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const billKey = this.dataset.id;
                        const bill = billsArray.find(b => b.key === billKey);
                        if (bill) {
                            displayBill(bill, true); // true indicates to auto-trigger print
                        }
                    });
                });
            } else {
                billsTableBody.innerHTML = '<tr><td colspan="6">No bills found.</td></tr>';
            }
        }).catch((error) => {
            console.error("Error loading bills:", error);
            billsTableBody.innerHTML = `<tr><td colspan="6">Error loading bills: ${error.message}</td></tr>`;
        });
    }

    // Display bill in a modal with option to auto-print
    function displayBill(bill, autoPrint = false) {
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
                        <p><strong>Bill Number:</strong> ${bill.billNumber || bill.key.slice(-6)}</p>
                        <p><strong>Order ID:</strong> ${bill.orderId ? bill.orderId.slice(-6) : 'N/A'}</p>
                        <p><strong>Date:</strong> ${bill.completionDate || new Date(bill.timestamp).toLocaleDateString()}</p>
                        <p><strong>Customer:</strong> ${bill.customerEmail || bill.customerName || 'Walk-in Customer'}</p>
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
                        <p>Total Amount: ${bill.totalAmount || bill.total || 0} rupees</p>
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
        
        // Auto-print if requested
        if (autoPrint) {
            setTimeout(() => {
                window.print();
            }, 500); // Short delay to ensure modal is fully rendered
        }
    }

    // Load customer feedback
    function loadCustomerFeedback() {
        const feedbackContainer = document.querySelector('.feedback-list');
        if (!feedbackContainer) return;
        feedbackContainer.innerHTML = '<p class="loading-message">Loading customer feedback...</p>';
        // Get feedback from Firebase
        const feedbackRef = firebase.ref(firebase.database, 'feedback');
        firebase.get(feedbackRef).then((snapshot) => {
            if (snapshot.exists()) {
                const feedback = snapshot.val();
                // Convert to array and sort by timestamp (newest first)
                const feedbackArray = Object.entries(feedback)
                    .map(([key, item]) => ({...item, id: key}))
                    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
                if (feedbackArray.length === 0) {
                    feedbackContainer.innerHTML = '<p>No customer feedback found.</p>';
                    return;
                }
                // Calculate overall rating
                const totalRatings = feedbackArray.length;
                const sumRatings = feedbackArray.reduce((sum, item) => sum + (parseInt(item.rating) || 0), 0);
                const avgRating = (sumRatings / totalRatings).toFixed(2);
                // Count per star
                const starCounts = [0, 0, 0, 0, 0]; // index 0 = 1 star, 4 = 5 star
                feedbackArray.forEach(item => {
                    const r = parseInt(item.rating);
                    if (r >= 1 && r <= 5) starCounts[r-1]++;
                });
                // Build overall rating HTML (like Amazon)
                let overallHtml = `<div class="overall-rating" style="margin-bottom:24px;padding:18px 20px;background:#f8f9fa;border-radius:8px;box-shadow:0 1px 6px rgba(44,62,80,0.07);">
                <div style="display:flex;align-items:center;gap:16px;">
                    <span style="font-size:2.2em;font-weight:700;color:#f7b500;">${avgRating}</span>
                    <span style="font-size:1.5em;color:#f7b500;">${'★'.repeat(Math.round(avgRating))}${'☆'.repeat(5-Math.round(avgRating))}</span>
                    <span style="font-size:1.1em;color:#555;">out of 5</span>
                </div>
                <div style="margin-top:8px;font-size:1em;color:#666;">${totalRatings} ratings</div>
                <div style="margin-top:12px;">
                    ${[5,4,3,2,1].map(star => {
                        const count = starCounts[star-1];
                        const percent = totalRatings ? (count/totalRatings*100).toFixed(1) : 0;
                        return `<div style='display:flex;align-items:center;gap:8px;margin-bottom:2px;'>
                            <span style='width:32px;'>${star} star</span>
                            <div style='flex:1;background:#eee;height:10px;border-radius:5px;overflow:hidden;'><div style='background:#f7b500;width:${percent}%;height:100%;'></div></div>
                            <span style='width:40px;text-align:right;'>${count}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
            // Clear loading message and add overall rating
            feedbackContainer.innerHTML = overallHtml;
            // Add feedback items
            feedbackArray.forEach(item => {
                const feedbackItem = document.createElement('div');
                feedbackItem.className = 'feedback-item';
                // Generate star rating display
                const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
                // Format date
                const feedbackDate = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Unknown date';
                feedbackItem.innerHTML = `
                    <div class="feedback-header">
                        <div class="customer-info">
                            <span class="customer-email">${item.customerEmail}</span>
                            <span class="feedback-date">${feedbackDate}</span>
                        </div>
                        <div class="rating">${stars}</div>
                    </div>
                    <div class="feedback-comment">${item.comment || 'No comment provided.'}</div>
                `;
                feedbackContainer.appendChild(feedbackItem);
            });
        } else {
            feedbackContainer.innerHTML = '<p>No customer feedback found.</p>';
        }
    }).catch((error) => {
        console.error("Error loading customer feedback:", error);
        feedbackContainer.innerHTML = `<p>Error loading feedback: ${error.message}</p>`;
    });
    }

    // Load product expiry information
    function loadProductExpiry() {
        const expiryTableBody = document.querySelector('#expiry table tbody');
        if (!expiryTableBody) return;
        
        expiryTableBody.innerHTML = '<tr><td colspan="5" class="loading-message">Loading expiry data...</td></tr>';
        
        // Get inventory from Firebase
        const inventoryRef = firebase.ref(firebase.database, 'inventory');
        firebase.get(inventoryRef).then((snapshot) => {
            if (snapshot.exists()) {
                const inventory = snapshot.val();
                const inventoryArray = Object.values(inventory);
                const productGroups = {};
                const today = new Date();
                inventoryArray.forEach(item => {
                    if (!productGroups[item.name]) {
                        productGroups[item.name] = {
                            name: item.name,
                            quantity: 0,
                            expirySoon: 0,
                            expired: 0,
                            nearestExpiry: null,
                            expiredBatches: [],
                            expiringSoonBatches: []
                        };
                    }
                    const group = productGroups[item.name];
                    const quantity = parseInt(item.quantity);
                    group.quantity += quantity;
                    const expiryDate = new Date(item.expiryDate);
                    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) {
                        group.expired += quantity;
                        group.expiredBatches.push(item.batchNumber);
                    } else if (diffDays <= 1) {
                        group.expirySoon += quantity;
                        group.expiringSoonBatches.push(item.batchNumber);
                    }
                    if (!group.nearestExpiry || expiryDate < new Date(group.nearestExpiry)) {
                        group.nearestExpiry = item.expiryDate;
                    }
                });
                const sortedProducts = Object.values(productGroups).sort((a, b) => {
                    if (a.expired > 0 && b.expired === 0) return -1;
                    if (a.expired === 0 && b.expired > 0) return 1;
                    if (a.expirySoon > 0 && b.expirySoon === 0) return -1;
                    if (a.expirySoon === 0 && b.expirySoon > 0) return 1;
                    return new Date(a.nearestExpiry) - new Date(b.nearestExpiry);
                });
                if (sortedProducts.length === 0) {
                    expiryTableBody.innerHTML = '<tr><td colspan="5">No inventory items found.</td></tr>';
                    return;
                }
                expiryTableBody.innerHTML = '';
                sortedProducts.forEach(product => {
                    const row = document.createElement('tr');
                    let statusText, statusClass, actionBtn = '', batchNumbersHtml = '';
                    if (product.expired > 0) {
                        statusText = 'Expired';
                        statusClass = 'status-expired';
                        actionBtn = `<button class='discard-btn' data-name='${product.name}' data-expiry='${product.nearestExpiry}'>Discarded</button>`;
                        batchNumbersHtml = product.expiredBatches.length > 0 ? product.expiredBatches.join(', ') : '-';
                    } else if (product.expirySoon > 0) {
                        statusText = 'Expiring Soon';
                        statusClass = 'status-expiring';
                        batchNumbersHtml = product.expiringSoonBatches.length > 0 ? product.expiringSoonBatches.join(', ') : '-';
                    } else {
                        statusText = 'Good';
                        statusClass = 'status-good';
                        batchNumbersHtml = '-';
                    }
                    row.innerHTML = `
                        <td>${product.name}</td>
                        <td>${product.quantity}</td>
                        <td>${batchNumbersHtml}</td>
                        <td>${product.nearestExpiry}</td>
                        <td class="${statusClass}">${statusText}</td>
                        <td>${actionBtn}</td>
                    `;
                    expiryTableBody.appendChild(row);
                });
                expiryTableBody.querySelectorAll('.discard-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const name = this.dataset.name;
                        const expiry = this.dataset.expiry;
                        discardExpiredItem(name, expiry);
                    });
                });
            } else {
                expiryTableBody.innerHTML = '<tr><td colspan="5">No inventory items found.</td></tr>';
            }
        }).catch((error) => {
            console.error("Error loading expiry data:", error);
            expiryTableBody.innerHTML = `<tr><td colspan="5">Error loading expiry data: ${error.message}</td></tr>`;
        });
    }

    // --- Customer Orders for Manager ---
    function loadCustomerOrders() {
        const ordersTableBody = document.querySelector('#orders .orders-list tbody');
        if (!ordersTableBody) return;

        ordersTableBody.innerHTML = '<tr><td colspan="6" class="loading-message">Loading customer orders...</td></tr>';

        // Get all orders from Firebase
        const ordersRef = firebase.ref(firebase.database, 'orders');
        firebase.get(ordersRef).then((snapshot) => {
            if (snapshot.exists()) {
                const orders = snapshot.val();
                // Convert to array and sort by timestamp (newest first)
                const ordersArray = Object.entries(orders)
                    .map(([key, order]) => ({...order, id: key}))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                if (ordersArray.length === 0) {
                    ordersTableBody.innerHTML = '<tr><td colspan="6">No customer orders found.</td></tr>';
                    return;
                }

                // Clear loading message
                ordersTableBody.innerHTML = '';

                // Add orders to table
                ordersArray.forEach(order => {
                    // Group products for display
                    let productsDisplay = order.items.map(item => 
                        `${item.product} x${item.quantity}`
                    ).join('<br>');
                    // Format date
                    const orderDate = new Date(order.timestamp).toLocaleDateString();
                    // Total
                    const total = order.totalAmount || (order.items ? order.items.reduce((sum, item) => sum + (item.total || 0), 0) : 0);
                    // Status
                    const status = order.status || 'pending';
                    // Action (View Bill if available or Execute Order)
                    let action = '';
                    if (order.billId) {
                        action = `<button class="view-bill-btn" data-bill-id="${order.billId}">View Bill</button>`;
                    } else if (order.status !== 'completed' && order.status !== 'cancelled') {
                        action = `<button class="execute-order-btn" data-order-id="${order.id}">Execute Order</button>`;
                    } else {
                        action = 'N/A';
                    }
                    // Create row
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order.id.slice(-6)}</td>
                        <td>${order.customerEmail || 'N/A'}</td>
                        <td>${productsDisplay}</td>
                        <td>₹${total}</td>
                        <td><span class="status-${status}">${status}</span></td>
                        <td>${action}</td>
                    `;
                    ordersTableBody.appendChild(row);
                });

                // Add event listeners for bill buttons
                ordersTableBody.querySelectorAll('.view-bill-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const billId = this.dataset.billId;
                        displayBillById(billId);
                    });
                });
                // Add event listeners for execute order buttons
                ordersTableBody.querySelectorAll('.execute-order-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const orderId = this.dataset.orderId;
                        executeOrder(orderId);
                    });
                });
            } else {
                ordersTableBody.innerHTML = '<tr><td colspan="6">No customer orders found.</td></tr>';
            }
        }).catch((error) => {
            console.error("Error loading customer orders:", error);
            ordersTableBody.innerHTML = `<tr><td colspan="6">Error loading orders: ${error.message}</td></tr>`;
        });
    }
    // Execute order: set status to completed and generate bill if not present
    function executeOrder(orderId) {
        if (!orderId) return;
        const orderRef = firebase.ref(firebase.database, `orders/${orderId}`);
        firebase.get(orderRef).then((snapshot) => {
            if (snapshot.exists()) {
                const order = snapshot.val();
                if (order.status === 'completed') {
                    alert('Order is already completed.');
                    return;
                }
                order.status = 'completed';
                // If order does not have a bill, generate one
                if (!order.billId) {
                    // Prepare bill object
                    const bill = {
                        orderId: orderId,
                        customerEmail: order.customerEmail || '',
                        items: order.items || [],
                        totalAmount: order.totalAmount || (order.items ? order.items.reduce((sum, item) => sum + (item.total || 0), 0) : 0),
                        deliveryAddress: order.deliveryAddress || '',
                        phoneNumber: order.phoneNumber || '',
                        paymentMethod: order.paymentMethod || 'Cash',
                        status: 'completed',
                        timestamp: new Date().toISOString(),
                        completionDate: new Date().toLocaleDateString()
                    };
                    // Save bill to Firebase
                    const billsRef = firebase.ref(firebase.database, 'bills');
                    const newBillRef = firebase.push(billsRef);
                    firebase.set(newBillRef, bill)
                        .then(() => {
                            // Update order with billId
                            order.billId = newBillRef.key;
                            return firebase.set(orderRef, order);
                        })
                        .then(() => {
                            alert('Order marked as completed and bill generated!');
                            loadCustomerOrders();
                        })
                        .catch(error => {
                            console.error('Error generating bill or updating order:', error);
                            alert('Failed to execute order and generate bill.');
                        });
                } else {
                    // Just update status if bill already exists
                    firebase.set(orderRef, order)
                        .then(() => {
                            alert('Order marked as completed!');
                            loadCustomerOrders();
                        })
                        .catch(error => {
                            console.error('Error updating order:', error);
                            alert('Failed to execute order.');
                        });
                }
            } else {
                alert('Order not found.');
            }
        }).catch((error) => {
            console.error('Error fetching order:', error);
            alert('Failed to fetch order.');
        });
    }
    // Helper to display bill by id
    function displayBillById(billId) {
        if (!billId) return;
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

    // Add the discardExpiredItem function
    function discardExpiredItem(name, expiry) {
        if (!name || !expiry) return;
        const inventoryRef = firebase.ref(firebase.database, 'inventory');
        firebase.get(inventoryRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Find the key(s) for the expired item(s)
                const toDelete = Object.entries(data).filter(([key, item]) => item.name === name && item.expiryDate === expiry);
                if (toDelete.length === 0) {
                    alert('No matching expired item found.');
                    return;
                }
                // Remove all matching items
                Promise.all(toDelete.map(([key]) => firebase.set(firebase.ref(firebase.database, `inventory/${key}`), null)))
                    .then(() => {
                        alert('Expired item(s) discarded!');
                        loadProductExpiry();
                        updateInventoryTable();
                    })
                    .catch(error => {
                        console.error('Error discarding item:', error);
                        alert('Failed to discard item.');
                    });
            }
        });
    }

    // Initial loading of various sections
    // Remove direct call to loadRetailOrdersHistory();
    // Instead, use onAuthStateChanged to call it only after login state is known
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.onAuthStateChanged) {
        firebase.onAuthStateChanged(firebase.auth, function(user) {
            if (user) {
                loadRetailOrdersHistory();
            } else {
                // Optionally clear the table or show login message
                const retailOrdersTableBody = document.getElementById('retailOrdersHistory');
                if (retailOrdersTableBody) {
                    retailOrdersTableBody.innerHTML = '<tr><td colspan="6">Please log in to view order history.</td></tr>';
                }
            }
        });
    } else {
        // Fallback: call directly (old behavior)
        loadRetailOrdersHistory();
    }
}); 