// Global variables for LostnLocal data
let destinationsData = [];
let culturalData = [];
let hotelsData = [];
let hiddenGemsData = [];
let filteredDestinations = [];
let filteredHotels = [];
let currentUser = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
async function initializeApp() {
    setupNavigation();
    setupEventListeners();
    
    // Set up authentication
    setupAuthentication();
    
    // Load sample data
    loadSampleData();
    
    // Populate UI with loaded data
    populateDestinations();
    populateCulturalInsights();
    populateHotels();
    populateHiddenGems();
    populateFilterOptions();
}

// Set up user authentication
function setupAuthentication() {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isAdmin = currentUser.isAdmin || false;
        updateAuthUI(currentUser);
        
        if (currentUser) {
            console.log('User signed in:', currentUser.uid);
        }
    } else {
        console.log('User signed out');
        isAdmin = false;
        updateAuthUI(null);
    }
}

// Update authentication UI
function updateAuthUI(user) {
    const authLink = document.getElementById('authLink');
    const authNavItem = document.getElementById('authNavItem');
    
    if (user) {
        // Update the auth link to show user info
        if (user.isAnonymous) {
            authLink.textContent = 'Guest';
            authLink.href = '#';
            authLink.onclick = (e) => {
                e.preventDefault();
                showMessage('You are browsing as a guest. Sign up to submit hidden gems!', 'info');
            };
        } else {
            authLink.textContent = user.displayName || 'Profile';
            authLink.href = '#';
            authLink.onclick = (e) => {
                e.preventDefault();
                showUserMenu();
            };
        }
        
        // Add logout button to navigation
        addLogoutButton();
    } else {
        // Show the login button when user is not logged in
        authLink.textContent = 'Login';
        authLink.href = 'auth.html';
        authLink.onclick = null;
        
        // Remove logout button
        removeLogoutButton();
    }
}

// Add logout button to navigation
function addLogoutButton() {
    // Check if logout button already exists
    if (document.getElementById('logoutNavItem')) {
        return;
    }
    
    const navMenu = document.querySelector('.nav-menu');
    const authNavItem = document.getElementById('authNavItem');
    
    // Create a container for user info and admin/logout buttons
    const userContainer = document.createElement('li');
    userContainer.className = 'nav-item user-container';
    userContainer.id = 'logoutNavItem';
    
    // Create user info display
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    
    // Welcome message
    const welcomeText = document.createElement('span');
    welcomeText.className = 'welcome-text';
    welcomeText.textContent = `Welcome, ${currentUser.displayName || 'User'}`;
    
    // Admin Dashboard button (if user is admin)
    let adminButton = '';
    if (currentUser.isAdmin && currentUser.isAdmin === true) {
        adminButton = `
            <button class="admin-dashboard-btn" onclick="showAdminPanel()">
                Admin Dashboard
            </button>
        `;
    }
    
    // Logout button
    const logoutButton = `
        <button class="logout-btn" onclick="signOut()">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
    
    userInfo.innerHTML = `
        ${welcomeText.outerHTML}
        ${adminButton}
        ${logoutButton}
    `;
    
    userContainer.appendChild(userInfo);
    
    // Insert user container right after the auth item
    if (authNavItem && authNavItem.nextSibling) {
        navMenu.insertBefore(userContainer, authNavItem.nextSibling);
    } else {
        navMenu.appendChild(userContainer);
    }
}

// Remove logout button from navigation
function removeLogoutButton() {
    const logoutNavItem = document.getElementById('logoutNavItem');
    if (logoutNavItem) {
        logoutNavItem.remove();
    }
}

// Check if user is admin (frontend only)
function checkAdminStatus(userId) {
    // In frontend-only mode, admin status is determined by the user object
    if (currentUser && currentUser.isAdmin) {
        isAdmin = true;
        console.log('Admin status:', isAdmin);
        showMessage('Welcome back, Admin!', 'success');
    } else {
        isAdmin = false;
    }
}

// Show user menu
function showUserMenu() {
    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = `
        <div class="user-menu-content">
            <h4>Welcome, ${currentUser.displayName || 'User'}!</h4>
            <p>${(currentUser.isAdmin && currentUser.isAdmin === true) ? 'Admin Account' : 'Regular User'}</p>
            <div class="user-menu-actions">
                ${(currentUser.isAdmin && currentUser.isAdmin === true) ? '<button onclick="showAdminPanel()" class="btn-admin">Admin Panel</button>' : ''}
                <button onclick="signOut()" class="btn-logout">Sign Out</button>
            </div>
        </div>
    `;
    
    // Position menu
    menu.style.position = 'fixed';
    menu.style.top = '70px';
    menu.style.right = '20px';
    menu.style.zIndex = '1000';
    menu.style.background = 'white';
    menu.style.borderRadius = '10px';
    menu.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
    menu.style.padding = '1rem';
    menu.style.minWidth = '200px';
    
    document.body.appendChild(menu);
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !document.getElementById('authLink').contains(e.target)) {
                menu.remove();
            }
        }, { once: true });
    }, 100);
}

// Show admin panel
function showAdminPanel() {
    const adminSection = document.getElementById('admin');
    if (adminSection) {
        adminSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        showMessage('Admin panel is loading...', 'info');
    }
}

// Sign out user
function signOut() {
    try {
        currentUser = null;
        isAdmin = false;
        localStorage.removeItem('currentUser');
        updateAuthUI(null);
        showMessage('Signed out successfully!', 'success');
    } catch (error) {
        console.error('Sign out error:', error);
        showMessage('Error signing out', 'error');
    }
}

// Load sample data for demo purposes
function loadSampleData() {
    // Sample destinations data
    destinationsData = [
        {
            id: 1,
            name: "Eiffel Tower",
            country: "France",
            city: "Paris",
            category: "landmarks",
            description: "Iconic iron lattice tower and symbol of Paris.",
            image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400",
            rating: 4.8,
            cost: "$$$",
            coordinates: { lat: 48.8584, lng: 2.2945 }
        },
        {
            id: 2,
            name: "Machu Picchu",
            country: "Peru",
            city: "Cusco",
            category: "cultural",
            description: "Ancient Incan citadel high in the Andes Mountains.",
            image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400",
            rating: 4.9,
            cost: "$$",
            coordinates: { lat: -13.1631, lng: -72.5450 }
        },
        {
            id: 3,
            name: "Great Barrier Reef",
            country: "Australia",
            city: "Cairns",
            category: "nature",
            description: "World's largest coral reef system.",
            image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400",
            rating: 4.7,
            cost: "$$$",
            coordinates: { lat: -18.2871, lng: 147.6992 }
        }
    ];
    
    // Sample cultural insights data
    culturalData = [
        {
            id: 1,
            title: "Japanese Tea Ceremony",
            description: "Experience the traditional art of Japanese tea preparation.",
            destination: "Kyoto, Japan",
            icon: "fas fa-leaf"
        },
        {
            id: 2,
            title: "Flamenco Dancing",
            description: "Immerse yourself in the passionate art of Spanish flamenco.",
            destination: "Seville, Spain",
            icon: "fas fa-music"
        },
        {
            id: 3,
            title: "Tango Lessons",
            description: "Learn the sensual dance of Argentina in Buenos Aires.",
            destination: "Buenos Aires, Argentina",
            icon: "fas fa-heart"
        }
    ];
    
    // Sample hotels data
    hotelsData = [
        {
            id: 1,
            name: "Hotel Plaza",
            location: "Paris, France",
            type: "hotel",
            description: "Luxury hotel in the heart of Paris.",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
            rating: 4.5,
            price: 250,
            amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
            bookingLink: "https://example.com/book"
        },
        {
            id: 2,
            name: "Mountain Lodge",
            location: "Swiss Alps, Switzerland",
            type: "resort",
            description: "Cozy mountain retreat with stunning views.",
            image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
            rating: 4.8,
            price: 180,
            amenities: ["WiFi", "Spa", "Restaurant", "Skiing"],
            bookingLink: "https://example.com/book"
        }
    ];
    
    // Sample hidden gems data
    hiddenGemsData = [
        {
            id: 1,
            name: "Secret Garden Cafe",
            location: "Tokyo, Japan",
            description: "Hidden cafe in a traditional Japanese garden.",
            category: "food",
            submittedBy: "Local Explorer"
        },
        {
            id: 2,
            name: "Crystal Cave",
            location: "Iceland",
            description: "Natural ice cave with incredible formations.",
            category: "nature",
            submittedBy: "Adventure Seeker"
        }
    ];
    
    filteredDestinations = [...destinationsData];
    filteredHotels = [...hotelsData];
    
    console.log("Sample data loaded successfully");
}

// Frontend-only data management (no backend required)

// Setup navigation
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

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

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Populate filter options
function populateFilterOptions() {
    const countryFilter = document.getElementById('countryFilter');
    const cityFilter = document.getElementById('cityFilter');
    
    // Get unique countries and cities
    const countries = [...new Set(destinationsData.map(dest => dest.country))];
    const cities = [...new Set(destinationsData.map(dest => dest.city))];
    
    // Populate country filter
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
    
    // Populate city filter
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });
}

// Populate destinations
function populateDestinations() {
    const grid = document.getElementById('destinationsGrid');
    grid.innerHTML = '';
    
    filteredDestinations.forEach(destination => {
        const card = createDestinationCard(destination);
        grid.appendChild(card);
    });
}

// Create destination card
function createDestinationCard(destination) {
    const card = document.createElement('div');
    card.className = 'destination-card';
    card.innerHTML = `
        <img src="${destination.image}" alt="${destination.name}" loading="lazy">
        <div class="destination-card-content">
            <h3>${destination.name}</h3>
            <p>${destination.description}</p>
            <div class="destination-meta">
                <span class="category-badge">${destination.category}</span>
                <span>${destination.country}, ${destination.city}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => showDestinationModal(destination));
    return card;
}

// Show destination modal
function showDestinationModal(destination) {
    const modal = document.getElementById('destinationModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h2>${destination.name}</h2>
        <img src="${destination.image}" alt="${destination.name}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px; margin: 1rem 0;">
        <p><strong>Location:</strong> ${destination.city}, ${destination.country}</p>
        <p><strong>Category:</strong> ${destination.category}</p>
        <p><strong>Rating:</strong> ${destination.rating}/5</p>
        <p><strong>Cost Level:</strong> ${destination.cost}</p>
        <p><strong>Description:</strong> ${destination.description}</p>
        <div id="map" style="height: 300px; margin: 1rem 0; border-radius: 10px;"></div>
    `;
    
    modal.style.display = 'block';
    
    // Initialize map (placeholder for now)
    setTimeout(() => {
        const mapDiv = document.getElementById('map');
        if (mapDiv) {
            mapDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; border-radius: 10px; color: #666;">
                    <i class="fas fa-map-marker-alt" style="font-size: 2rem; margin-right: 1rem;"></i>
                    <span>Map of ${destination.name} - ${destination.city}, ${destination.country}</span>
                </div>
            `;
        }
    }, 100);
}

// Populate cultural insights
function populateCulturalInsights() {
    const grid = document.getElementById('culturalGrid');
    grid.innerHTML = '';
    
    culturalData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'cultural-card';
        card.innerHTML = `
            <i class="${item.icon}"></i>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <small>${item.destination}</small>
        `;
        grid.appendChild(card);
    });
}

// Populate hotels
function populateHotels() {
    const grid = document.getElementById('hotelsGrid');
    grid.innerHTML = '';
    
    filteredHotels.forEach(hotel => {
        const card = document.createElement('div');
        card.className = 'hotel-card';
        card.innerHTML = `
            <img src="${hotel.image}" alt="${hotel.name}" loading="lazy">
            <div class="hotel-card-content">
                <h3>${hotel.name}</h3>
                <p>${hotel.location}</p>
                <div class="hotel-rating">
                    <div class="stars">
                        ${'★'.repeat(Math.floor(hotel.rating))}${'☆'.repeat(5 - Math.floor(hotel.rating))}
                    </div>
                    <span>${hotel.rating}/5</span>
                </div>
                <div class="hotel-price">$${hotel.price}/night</div>
                <div class="amenities">
                    ${hotel.amenities.map(amenity => `<span class="amenity">${amenity}</span>`).join('')}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Populate hidden gems
function populateHiddenGems() {
    const grid = document.getElementById('hiddenGemsGrid');
    grid.innerHTML = '';
    
    hiddenGemsData.forEach(gem => {
        const card = document.createElement('div');
        card.className = 'hidden-gem-card';
        card.innerHTML = `
            <h3>${gem.name}</h3>
            <div class="location">${gem.location}</div>
            <p>${gem.description}</p>
            <div class="gem-meta">
                <span class="category-badge">${gem.category}</span>
                <small>Submitted by: ${gem.submittedBy}</small>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const mainSearch = document.getElementById('mainSearch');
    mainSearch.addEventListener('input', handleMainSearch);
    
    // Destination filters
    document.getElementById('countryFilter').addEventListener('change', filterDestinations);
    document.getElementById('categoryFilter').addEventListener('change', filterDestinations);
    document.getElementById('cityFilter').addEventListener('change', filterDestinations);
    
    // Hotel filters
    document.getElementById('searchHotels').addEventListener('click', filterHotels);
    
    // Budget calculators
    document.getElementById('expenseCalculator').addEventListener('submit', calculateExpenses);
    document.getElementById('budgetEstimator').addEventListener('submit', estimateBudget);
    
    // Hidden gems form
    document.getElementById('contributeForm').addEventListener('submit', submitHiddenGem);
    
    // Contact form
    document.getElementById('contactForm').addEventListener('submit', submitContactForm);
    
    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('destinationModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Handle main search
function handleMainSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredDestinations = destinationsData.filter(dest => 
        dest.name.toLowerCase().includes(searchTerm) ||
        dest.country.toLowerCase().includes(searchTerm) ||
        dest.city.toLowerCase().includes(searchTerm) ||
        dest.category.toLowerCase().includes(searchTerm) ||
        dest.description.toLowerCase().includes(searchTerm)
    );
    populateDestinations();
}

// Filter destinations
function filterDestinations() {
    const country = document.getElementById('countryFilter').value;
    const category = document.getElementById('categoryFilter').value;
    const city = document.getElementById('cityFilter').value;
    
    filteredDestinations = destinationsData.filter(dest => {
        return (!country || dest.country === country) &&
               (!category || dest.category === category) &&
               (!city || dest.city === city);
    });
    
    populateDestinations();
}

// Filter hotels
function filterHotels() {
    const location = document.getElementById('hotelLocation').value.toLowerCase();
    const priceRange = document.getElementById('priceRange').value;
    const rating = document.getElementById('ratingFilter').value;
    
    filteredHotels = hotelsData.filter(hotel => {
        const locationMatch = !location || hotel.location.toLowerCase().includes(location);
        const priceMatch = !priceRange || (
            (priceRange === 'budget' && hotel.price <= 100) ||
            (priceRange === 'mid-range' && hotel.price > 100 && hotel.price <= 300) ||
            (priceRange === 'luxury' && hotel.price > 300)
        );
        const ratingMatch = !rating || hotel.rating >= parseFloat(rating);
        
        return locationMatch && priceMatch && ratingMatch;
    });
    
    populateHotels();
}

// Calculate expenses
function calculateExpenses(e) {
    e.preventDefault();
    
    const travelers = parseInt(document.getElementById('travelers').value);
    const days = parseInt(document.getElementById('travelDays').value);
    const dailyExpenses = parseFloat(document.getElementById('dailyExpenses').value);
    const activities = parseFloat(document.getElementById('activities').value);
    
    const totalExpenses = (travelers * days * dailyExpenses) + activities;
    
    const resultDiv = document.getElementById('expenseResult');
    resultDiv.innerHTML = `
        <h4>Travel Expense Calculation</h4>
        <p><strong>Number of Travelers:</strong> ${travelers}</p>
        <p><strong>Travel Days:</strong> ${days}</p>
        <p><strong>Daily Expenses per Person:</strong> $${dailyExpenses}</p>
        <p><strong>Activities Cost:</strong> $${activities}</p>
        <hr>
        <p><strong>Total Estimated Cost:</strong> $${totalExpenses.toFixed(2)}</p>
        <p><strong>Cost per Person:</strong> $${(totalExpenses / travelers).toFixed(2)}</p>
    `;
    resultDiv.classList.add('show');
}

// Estimate budget
function estimateBudget(e) {
    e.preventDefault();
    
    const destination = document.getElementById('destination').value;
    const style = document.getElementById('travelStyle').value;
    const duration = parseInt(document.getElementById('tripDuration').value);
    
    // Base costs per day by travel style
    const baseCosts = {
        'budget': 50,
        'mid-range': 150,
        'luxury': 400
    };
    
    const baseCost = baseCosts[style];
    const totalBudget = baseCost * duration;
    
    // Add destination multiplier
    const destinationMultipliers = {
        'paris': 1.5,
        'tokyo': 1.3,
        'new york': 1.4,
        'london': 1.3,
        'dubai': 1.2
    };
    
    const multiplier = destinationMultipliers[destination.toLowerCase()] || 1.0;
    const adjustedBudget = totalBudget * multiplier;
    
    const resultDiv = document.getElementById('budgetResult');
    resultDiv.innerHTML = `
        <h4>Budget Estimation for ${destination}</h4>
        <p><strong>Travel Style:</strong> ${style.charAt(0).toUpperCase() + style.slice(1)}</p>
        <p><strong>Duration:</strong> ${duration} days</p>
        <p><strong>Base Cost per Day:</strong> $${baseCost}</p>
        <p><strong>Destination Multiplier:</strong> ${multiplier}x</p>
        <hr>
        <p><strong>Estimated Total Budget:</strong> $${adjustedBudget.toFixed(2)}</p>
        <p><strong>Daily Budget:</strong> $${(adjustedBudget / duration).toFixed(2)}</p>
        <div class="budget-breakdown">
            <h5>Budget Breakdown:</h5>
            <ul>
                <li>Accommodation: $${(adjustedBudget * 0.4).toFixed(2)} (40%)</li>
                <li>Food: $${(adjustedBudget * 0.3).toFixed(2)} (30%)</li>
                <li>Activities: $${(adjustedBudget * 0.2).toFixed(2)} (20%)</li>
                <li>Transportation: $${(adjustedBudget * 0.1).toFixed(2)} (10%)</li>
            </ul>
        </div>
    `;
    resultDiv.classList.add('show');
}

// Submit hidden gem (frontend only)
function submitHiddenGem(e) {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!currentUser || currentUser.isAnonymous) {
        showMessage('Please sign up or log in to submit hidden gems!', 'error');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000);
        return;
    }
    
    const name = document.getElementById('gemName').value;
    const location = document.getElementById('gemLocation').value;
    const description = document.getElementById('gemDescription').value;
    const category = document.getElementById('gemCategory').value;
    
    try {
        // Add to local data for immediate display
        const newGem = {
            id: Date.now(),
            name: name,
            location: location,
            description: description,
            category: category,
            submittedBy: currentUser.displayName || 'User'
        };
        
        hiddenGemsData.push(newGem);
        
        // Update display
        populateHiddenGems();
        
        showMessage('Hidden gem submitted successfully! (Demo mode)', 'success');
        
        // Reset form
        e.target.reset();
        
    } catch (error) {
        console.error('Error saving hidden gem:', error);
        showMessage('Error submitting hidden gem. Please try again.', 'error');
    }
}

// Submit contact form (frontend only)
function submitContactForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    try {
        // Simulate form submission
        console.log('Contact form submitted:', { name, email, subject, message });
        
        showMessage('Message sent successfully! (Demo mode)', 'success');
        
        // Reset form
        e.target.reset();
        
    } catch (error) {
        console.error('Error saving contact form:', error);
        showMessage('Error sending message. Please try again.', 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('destinationModal').style.display = 'none';
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

// Add some CSS for amenities and logout button
const style = document.createElement('style');
style.textContent = `
    .amenities {
        margin-top: 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .amenity {
        background: #e3f2fd;
        color: #1976d2;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .gem-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        font-size: 0.9rem;
    }
    
    .budget-breakdown {
        margin-top: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .budget-breakdown ul {
        list-style: none;
        padding: 0;
    }
    
    .budget-breakdown li {
        padding: 0.25rem 0;
        border-bottom: 1px solid #e9ecef;
    }
    
    .budget-breakdown li:last-child {
        border-bottom: none;
    }
    
    /* Logout button styling */
    .logout-link {
        color: #dc3545 !important;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .logout-link:hover {
        color: #c82333 !important;
        background-color: rgba(220, 53, 69, 0.1);
        border-radius: 5px;
    }
    
    .logout-link i {
        margin-right: 5px;
    }
    
    /* User container styling */
    .user-container {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .welcome-text {
        font-size: 0.9rem;
        color: #333;
        font-weight: 500;
        white-space: nowrap;
    }
    
    .admin-dashboard-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
    }
    
    .admin-dashboard-btn:hover {
        background: #0056b3;
        transform: translateY(-1px);
    }
    
    .logout-btn {
        background: transparent;
        color: #dc3545;
        border: 1px solid #dc3545;
        padding: 0.5rem;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
    }
    
    .logout-btn:hover {
        background: #dc3545;
        color: white;
        transform: translateY(-1px);
    }
    
    /* User menu styling improvements */
    .user-menu {
        animation: slideDown 0.3s ease-out;
    }
    
    .user-menu-content {
        padding: 1rem;
    }
    
    .user-menu-content h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.1rem;
    }
    
    .user-menu-content p {
        margin: 0 0 1rem 0;
        color: #666;
        font-size: 0.9rem;
    }
    
    .user-menu-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .btn-logout {
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.3s ease;
    }
    
    .btn-logout:hover {
        background: #c82333;
    }
    
    .btn-admin {
        background: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.3s ease;
    }
    
    .btn-admin:hover {
        background: #0056b3;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Add loading states and error handling
function showLoading(element) {
    element.innerHTML = '<div class="loading"></div>';
}

function hideLoading(element) {
    const loading = element.querySelector('.loading');
    if (loading) {
        loading.remove();
    }
}

// Add intersection observer for lazy loading
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
}, observerOptions);

// Observe all lazy images
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
});

// Add admin features after everything is loaded
setTimeout(() => {
    addAdminFeatures();
}, 2000);

// Frontend-only admin features (no backend required)
function addAdminFeatures() {
    // Only add admin features if user is admin and properly authenticated
    if (!isAdmin || !currentUser || !currentUser.isAdmin) {
        return;
    }
    
    // Double-check admin status from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        return;
    }
    
    const user = JSON.parse(savedUser);
    if (!user.isAdmin) {
        return;
    }
    
    // Add admin panel button to navigation
    const navMenu = document.querySelector('.nav-menu');
    const adminButton = document.createElement('li');
    adminButton.className = 'nav-item';
    adminButton.innerHTML = '<a href="#admin" class="nav-link">Admin</a>';
    navMenu.appendChild(adminButton);
    
    // Add admin section
    const adminSection = document.createElement('section');
    adminSection.id = 'admin';
    adminSection.className = 'admin-section';
    adminSection.innerHTML = `
        <div class="container">
            <h2>Admin Panel (Demo Mode)</h2>
            <div class="admin-content">
                <div class="admin-card">
                    <h3>Add New Destination</h3>
                    <form id="addDestinationForm">
                        <div class="form-group">
                            <label for="destName">Name:</label>
                            <input type="text" id="destName" required>
                        </div>
                        <div class="form-group">
                            <label for="destCountry">Country:</label>
                            <input type="text" id="destCountry" required>
                        </div>
                        <div class="form-group">
                            <label for="destCity">City:</label>
                            <input type="text" id="destCity" required>
                        </div>
                        <div class="form-group">
                            <label for="destCategory">Category:</label>
                            <select id="destCategory" required>
                                <option value="landmarks">Landmarks</option>
                                <option value="nature">Nature</option>
                                <option value="cultural">Cultural</option>
                                <option value="adventure">Adventure</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="destDescription">Description:</label>
                            <textarea id="destDescription" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="destImage">Image URL:</label>
                            <input type="url" id="destImage" required>
                        </div>
                        <div class="form-group">
                            <label for="destRating">Rating:</label>
                            <input type="number" id="destRating" min="1" max="5" step="0.1" required>
                        </div>
                        <div class="form-group">
                            <label for="destCost">Cost Level:</label>
                            <select id="destCost" required>
                                <option value="$">$</option>
                                <option value="$$">$$</option>
                                <option value="$$$">$$$</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-primary">Add Destination</button>
                    </form>
                </div>
                <div class="admin-card">
                    <h3>Add New Hotel/Stay</h3>
                    <form id="addHotelForm">
                        <div class="form-group">
                            <label for="hotelName">Hotel Name:</label>
                            <input type="text" id="hotelName" required>
                        </div>
                        <div class="form-group">
                            <label for="hotelLocation">Location:</label>
                            <input type="text" id="hotelLocation" required>
                        </div>
                        <div class="form-group">
                            <label for="hotelType">Type:</label>
                            <select id="hotelType" required>
                                <option value="hotel">Hotel</option>
                                <option value="resort">Resort</option>
                                <option value="hostel">Hostel</option>
                                <option value="apartment">Apartment</option>
                                <option value="villa">Villa</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="hotelDescription">Description:</label>
                            <textarea id="hotelDescription" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="hotelImage">Image URL:</label>
                            <input type="url" id="hotelImage" required>
                        </div>
                        <div class="form-group">
                            <label for="hotelRating">Rating:</label>
                            <input type="number" id="hotelRating" min="1" max="5" step="0.1" required>
                        </div>
                        <div class="form-group">
                            <label for="hotelPrice">Price per Night ($):</label>
                            <input type="number" id="hotelPrice" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="hotelAmenities">Amenities (comma-separated):</label>
                            <input type="text" id="hotelAmenities" placeholder="WiFi, Pool, Gym, Restaurant">
                        </div>
                        <button type="submit" class="btn-primary">Add Hotel</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Insert admin section before footer
    const footer = document.querySelector('.footer');
    document.body.insertBefore(adminSection, footer);
    
    // Set up admin forms
    document.getElementById('addDestinationForm').addEventListener('submit', addNewDestination);
    document.getElementById('addHotelForm').addEventListener('submit', addNewHotel);
}

// Add new destination (frontend only)
function addNewDestination(e) {
    e.preventDefault();
    
    const destination = {
        id: Date.now(),
        name: document.getElementById('destName').value,
        country: document.getElementById('destCountry').value,
        city: document.getElementById('destCity').value,
        category: document.getElementById('destCategory').value,
        description: document.getElementById('destDescription').value,
        image: document.getElementById('destImage').value,
        rating: parseFloat(document.getElementById('destRating').value),
        cost: document.getElementById('destCost').value,
        coordinates: { lat: 0, lng: 0 } // Default coordinates
    };
    
    try {
        destinationsData.push(destination);
        filteredDestinations = [...destinationsData];
        populateDestinations();
        populateFilterOptions();
        showMessage('Destination added successfully! (Demo mode)', 'success');
        e.target.reset();
    } catch (error) {
        console.error('Error adding destination:', error);
        showMessage('Error adding destination', 'error');
    }
}

// Add new hotel (frontend only)
function addNewHotel(e) {
    e.preventDefault();
    
    const hotel = {
        id: Date.now(),
        name: document.getElementById('hotelName').value,
        location: document.getElementById('hotelLocation').value,
        type: document.getElementById('hotelType').value,
        description: document.getElementById('hotelDescription').value,
        image: document.getElementById('hotelImage').value,
        rating: parseFloat(document.getElementById('hotelRating').value),
        price: parseFloat(document.getElementById('hotelPrice').value),
        amenities: document.getElementById('hotelAmenities').value.split(',').map(a => a.trim()),
        bookingLink: "https://example.com/book"
    };
    
    try {
        hotelsData.push(hotel);
        filteredHotels = [...hotelsData];
        populateHotels();
        showMessage('Hotel added successfully! (Demo mode)', 'success');
        e.target.reset();
    } catch (error) {
        console.error('Error adding hotel:', error);
        showMessage('Error adding hotel', 'error');
    }
}

console.log('LostnLocal Website loaded successfully (Frontend Only)!');

