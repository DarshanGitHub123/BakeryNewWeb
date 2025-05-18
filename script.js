document.addEventListener('DOMContentLoaded', function() {
    // Get all necessary elements
    const typeButtons = document.querySelectorAll('.type-btn');
    const forms = {
        manager: document.getElementById('managerForm'),
        distributor: document.getElementById('distributorForm'),
        customer: document.getElementById('customerForm'),
        customerSignup: document.getElementById('customerSignupForm'),
        register: document.getElementById('registerForm')
    };
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const showRegisterLink = document.getElementById('showRegister');
    const showRegisterDistributorLink = document.getElementById('showRegisterDistributor');
    const backToLoginLink = document.getElementById('backToLogin');

    // Handle user type selection
    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            typeButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all forms
            Object.values(forms).forEach(form => {
                if (form) form.classList.add('hidden');
            });
            
            // Show selected form
            const type = button.dataset.type;
            if (type === 'customer' && forms.customerSignup && forms.customerSignup.classList.contains('hidden')) {
                forms.customer.classList.remove('hidden');
            } else if (type !== 'customer' && forms[type]) {
                forms[type].classList.remove('hidden');
            }
        });
    });

    // Handle signup/login toggle for customers
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            forms.customer.classList.add('hidden');
            forms.customerSignup.classList.remove('hidden');
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            forms.customerSignup.classList.add('hidden');
            forms.customer.classList.remove('hidden');
        });
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Hide all current forms
            Object.values(forms).forEach(form => {
                if (form) form.classList.add('hidden');
            });
            // Show registration form
            forms.register.classList.remove('hidden');
            // Pre-select manager role if coming from manager form
            if (document.getElementById('registerRole')) {
                document.getElementById('registerRole').value = 'manager';
            }
        });
    }

    if (showRegisterDistributorLink) {
        showRegisterDistributorLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Hide all current forms
            Object.values(forms).forEach(form => {
                if (form) form.classList.add('hidden');
            });
            // Show registration form
            forms.register.classList.remove('hidden');
            // Pre-select distributor role if coming from distributor form
            if (document.getElementById('registerRole')) {
                document.getElementById('registerRole').value = 'distributor';
            }
        });
    }

    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Hide registration form
            forms.register.classList.add('hidden');
            // Show the first form (manager)
            forms.manager.classList.remove('hidden');
            // Reset active button to manager
            typeButtons.forEach(btn => btn.classList.remove('active'));
            typeButtons[0].classList.add('active');
        });
    }

    // Handle form submissions
    if (forms.manager) {
        forms.manager.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('managerUsername').value;
            const password = document.getElementById('managerPassword').value;

            try {
                // Authenticate with Firebase
                const userCredential = await firebase.signInWithEmailAndPassword(
                    firebase.auth,
                    email,
                    password
                );
                
                // Check if user is a manager in the database
                const userId = userCredential.user.uid;
                const managerRef = firebase.ref(firebase.database, 'managers/' + userId);
                const snapshot = await firebase.get(managerRef);
                
                if (snapshot.exists()) {
                    // Store user role in session storage for dashboard verification
                    sessionStorage.setItem('userRole', 'manager');
                    window.location.href = 'manager-dashboard.html';
                } else {
                    await firebase.signOut(firebase.auth);
                    alert('You do not have manager permissions!');
                }
            } catch (error) {
                console.error("Login error:", error);
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    alert('Invalid email or password. Please try again.');
                } else if (error.code === 'auth/too-many-requests') {
                    alert('Too many failed login attempts. Please try again later.');
                } else {
                    alert('Login failed: ' + error.message);
                }
            }
        });
    }

    if (forms.distributor) {
        forms.distributor.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('distributorUsername').value;
            const password = document.getElementById('distributorPassword').value;

            try {
                // Authenticate with Firebase
                const userCredential = await firebase.signInWithEmailAndPassword(
                    firebase.auth,
                    email,
                    password
                );
                
                // Check if user is a distributor in the database
                const userId = userCredential.user.uid;
                const distributorRef = firebase.ref(firebase.database, 'distributors/' + userId);
                const snapshot = await firebase.get(distributorRef);
                
                if (snapshot.exists()) {
                    // Store user role in session storage for dashboard verification
                    sessionStorage.setItem('userRole', 'distributor');
                    window.location.href = 'distributor-dashboard.html';
                } else {
                    await firebase.signOut(firebase.auth);
                    alert('You do not have distributor permissions!');
                }
            } catch (error) {
                console.error("Login error:", error);
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    alert('Invalid email or password. Please try again.');
                } else if (error.code === 'auth/too-many-requests') {
                    alert('Too many failed login attempts. Please try again later.');
                } else {
                    alert('Login failed: ' + error.message);
                }
            }
        });
    }

    if (forms.customer) {
        forms.customer.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('customerUsername').value;
            const password = document.getElementById('customerMobile').value;

            try {
                // Authenticate with Firebase
                const userCredential = await firebase.signInWithEmailAndPassword(
                    firebase.auth,
                    email,
                    password
                );
                
                // Check if user is a customer in the database
                const userId = userCredential.user.uid;
                const customerRef = firebase.ref(firebase.database, 'customers/' + userId);
                const snapshot = await firebase.get(customerRef);
                
                if (snapshot.exists()) {
                    // Store user role in session storage for dashboard verification
                    sessionStorage.setItem('userRole', 'customer');
                    window.location.href = 'customer-dashboard.html';
                } else {
                    await firebase.signOut(firebase.auth);
                    alert('You do not have customer permissions!');
                }
            } catch (error) {
                console.error("Login error:", error);
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    alert('Invalid email or password. Please try again.');
                } else if (error.code === 'auth/too-many-requests') {
                    alert('Too many failed login attempts. Please try again later.');
                } else {
                    alert('Login failed: ' + error.message);
                }
            }
        });
    }

    if (forms.customerSignup) {
        forms.customerSignup.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signupUsername').value;
            const password = document.getElementById('signupMobile').value;

            // Validate password minimum length
            if (password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }

            try {
                console.log("Attempting to create customer user with Firebase Authentication...");
                console.log("Email:", email);
                console.log("Password length:", password.length);
                
                // Create new user with Firebase Authentication
                const userCredential = await firebase.createUserWithEmailAndPassword(
                    firebase.auth,
                    email,
                    password
                );
                
                console.log("Customer user created successfully:", userCredential.user.uid);
                
                // Store additional customer data
                const userId = userCredential.user.uid;
                const customerRef = firebase.ref(firebase.database, 'customers/' + userId);
                await firebase.set(customerRef, {
                    email: email,
                    mobile: password, // Using password for simplicity
                    role: 'customer'
                });
                
                alert('Signup successful! Please login.');
                // Sign out the new user (they need to log in properly)
                await firebase.signOut(firebase.auth);
                
                // Switch to login form
                forms.customerSignup.classList.add('hidden');
                forms.customer.classList.remove('hidden');
                
                // Clear signup form
                document.getElementById('signupUsername').value = '';
                document.getElementById('signupMobile').value = '';
            } catch (error) {
                console.error("Customer signup failed:", error);
                
                // More specific error messages
                if (error.code === 'auth/email-already-in-use') {
                    alert('This email is already in use. Please try a different email.');
                } else if (error.code === 'auth/invalid-email') {
                    alert('Please enter a valid email address.');
                } else if (error.code === 'auth/weak-password') {
                    alert('Password is too weak. Please use a stronger password.');
                } else if (error.code === 'auth/operation-not-allowed') {
                    alert('Email/password accounts are not enabled. Please contact the administrator.');
                } else {
                    alert('Signup failed: ' + error.message);
                }
            }
        });
    }

    if (forms.register) {
        forms.register.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const role = document.getElementById('registerRole').value;

            // Validate password match
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            // Validate role
            if (!role) {
                alert('Please select a role!');
                return;
            }

            // Validate password minimum length
            if (password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }

            try {
                console.log("Attempting to create user with Firebase Authentication...");
                console.log("Email:", email);
                console.log("Password length:", password.length);
                
                // Create new user with Firebase Authentication
                const userCredential = await firebase.createUserWithEmailAndPassword(
                    firebase.auth,
                    email,
                    password
                );
                
                console.log("User created successfully:", userCredential.user.uid);
                
                // Store additional user data based on role
                const userId = userCredential.user.uid;
                
                // Create record in the appropriate collection based on role
                const userRef = firebase.ref(firebase.database, role + 's/' + userId);
                await firebase.set(userRef, {
                    name: name,
                    email: email,
                    role: role
                });
                
                alert('Registration successful! Please login.');
                // Sign out the new user (they need to log in properly)
                await firebase.signOut(firebase.auth);
                
                // Switch to login form
                forms.register.classList.add('hidden');
                forms.manager.classList.remove('hidden');
                
                // Reset active button to manager
                typeButtons.forEach(btn => btn.classList.remove('active'));
                typeButtons[0].classList.add('active');
                
                // Clear registration form
                document.getElementById('registerName').value = '';
                document.getElementById('registerEmail').value = '';
                document.getElementById('registerPassword').value = '';
                document.getElementById('registerConfirmPassword').value = '';
                document.getElementById('registerRole').value = '';
            } catch (error) {
                console.error("Registration failed:", error);
                
                // More specific error messages
                if (error.code === 'auth/email-already-in-use') {
                    alert('This email is already in use. Please try a different email.');
                } else if (error.code === 'auth/invalid-email') {
                    alert('Please enter a valid email address.');
                } else if (error.code === 'auth/weak-password') {
                    alert('Password is too weak. Please use a stronger password.');
                } else if (error.code === 'auth/operation-not-allowed') {
                    alert('Email/password accounts are not enabled. Please contact the administrator.');
                } else {
                    alert('Registration failed: ' + error.message);
                }
            }
        });
    }
}); 