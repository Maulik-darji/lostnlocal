// LostnLocal Authentication System with PHP Backend
let currentUser = null;
let isAdmin = false;
let authToken = null;

// API Configuration
const API_BASE_URL = '/lostnlocal/api';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

// Initialize authentication
function initializeAuth() {
    setupAuthUI();
    setupEventListeners();
    
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        authToken = savedToken;
        isAdmin = currentUser.isAdmin || false;
        
        // Verify token is still valid
        verifyToken().then(isValid => {
            if (isValid) {
                console.log('User restored from localStorage:', currentUser.email);
                // Redirect to main page if already logged in
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                // Token is invalid, clear storage
                clearAuthData();
            }
        }).catch(error => {
            console.error('Token verification failed:', error);
            clearAuthData();
        });
    }
    
    console.log('Authentication initialized successfully');
}

// Set up authentication UI
function setupAuthUI() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // Switch tab links
    document.querySelectorAll('.switch-tab').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(e.target.dataset.tab);
        });
    });

    // Form submissions
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('signupFormElement').addEventListener('submit', handleSignup);
    
    // Guest login
    document.getElementById('guestLogin').addEventListener('click', handleGuestLogin);
    
    // Password strength checking
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
    
    // Real-time password confirmation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
}

// Switch between login and signup tabs
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tab}Form`).classList.add('active');
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        showLoading('Signing in...');
        
        console.log('Attempting to sign in with:', { email });
        
        const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.data.user;
            authToken = data.data.token;
            isAdmin = currentUser.isAdmin || false;
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('authToken', authToken);
            
            console.log('Sign in successful');
            showMessage('Successfully signed in! Redirecting...', 'success');
            
            // Redirect to main page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage(data.message || 'Login failed. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please check your connection and try again.', 'error');
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const adminCode = document.getElementById('adminCode').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match.', 'error');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long.', 'error');
        return;
    }
    
    try {
        showLoading('Creating account...');
        
        console.log('Attempting to create user with:', { email, name });
        console.log('API URL:', `${API_BASE_URL}/auth/signup.php`);
        
        // Add cache-busting parameter
        const url = `${API_BASE_URL}/auth/signup.php?t=${Date.now()}`;
        console.log('Full URL with cache-busting:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            body: JSON.stringify({ name, email, password, adminCode })
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', [...response.headers.entries()]);
        
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        console.log('Response text length:', responseText.length);
        
        if (!responseText) {
            throw new Error('Empty response from server');
        }
        
        const data = JSON.parse(responseText);
        
        if (data.success) {
            currentUser = data.data.user;
            authToken = data.data.token;
            isAdmin = currentUser.isAdmin || false;
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('authToken', authToken);
            
            console.log('User created successfully:', currentUser.uid);
            showMessage('Account created successfully! Redirecting...', 'success');
            
            // Redirect to main page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            showMessage(data.message || 'Signup failed. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('Signup failed. Please check your connection and try again.', 'error');
    }
}

// Handle guest login
function handleGuestLogin() {
    try {
        showLoading('Signing in as guest...');
        
        console.log('Attempting guest login...');
        
        // Create guest user
        currentUser = {
            uid: 'guest_' + Date.now(),
            email: 'guest@example.com',
            displayName: 'Guest User',
            isAnonymous: true
        };
        isAdmin = false;
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        console.log('Guest login successful');
        showMessage('Signed in as guest! Redirecting...', 'success');
        
        // Redirect to main page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Guest login error:', error);
        showMessage('Guest login failed. Please try again.', 'error');
    }
}

// Verify JWT token
async function verifyToken() {
    if (!authToken) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile.php`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
}

// Clear authentication data
function clearAuthData() {
    currentUser = null;
    authToken = null;
    isAdmin = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
}

// Show loading state
function showLoading(message) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'message loading-message';
    loadingMessage.innerHTML = `
        <div class="loading"></div>
        <span>${message}</span>
    `;
    
    document.body.insertBefore(loadingMessage, document.body.firstChild);
}

// Show message
function showMessage(text, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insert at the top of the page
    document.body.insertBefore(message, document.body.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Password strength checking
function checkPasswordStrength(e) {
    const password = e.target.value;
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let strengthLabel = '';
    
    // Length check
    if (password.length >= 8) strength += 25;
    else if (password.length >= 6) strength += 15;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    // Update strength bar
    strengthBar.style.width = strength + '%';
    
    // Update strength text and color
    if (strength < 30) {
        strengthLabel = 'Weak';
        strengthBar.style.background = '#dc3545';
    } else if (strength < 60) {
        strengthLabel = 'Fair';
        strengthBar.style.background = '#ffc107';
    } else if (strength < 90) {
        strengthLabel = 'Good';
        strengthBar.style.background = '#17a2b8';
    } else {
        strengthLabel = 'Strong';
        strengthBar.style.background = '#28a745';
    }
    
    strengthText.textContent = `Password strength: ${strengthLabel}`;
}

// Password match checking
function checkPasswordMatch(e) {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = e.target.value;
    
    if (confirmPassword && password !== confirmPassword) {
        e.target.style.borderColor = '#dc3545';
        e.target.style.background = '#f8d7da';
    } else {
        e.target.style.borderColor = '#e9ecef';
        e.target.style.background = '#f8f9fa';
    }
}

// Add CSS for messages and loading states
const authStyles = document.createElement('style');
authStyles.textContent = `
    .message {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideDown 0.3s ease-out;
    }
    
    .message.success {
        background: #28a745;
    }
    
    .message.error {
        background: #dc3545;
    }
    
    .message.info {
        background: #17a2b8;
    }
    
    .loading-message {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: #6c757d;
    }
    
    .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #ffffff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(authStyles);

console.log('Authentication page loaded successfully!');