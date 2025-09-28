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
            coordinates: { lat: 48.8584, lng: 2.2945 },
            tourPrice: 45,
            tourDuration: "2 hours",
            tourIncludes: ["Skip-the-line access", "Professional guide", "Audio headset", "Small group (max 15 people)"],
            tourTimes: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"]
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
            coordinates: { lat: -13.1631, lng: -72.5450 },
            tourPrice: 120,
            tourDuration: "Full day",
            tourIncludes: ["Round-trip transportation", "Professional guide", "Lunch", "Entrance fees", "Small group (max 12 people)"],
            tourTimes: ["6:00 AM"]
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
            coordinates: { lat: -18.2871, lng: 147.6992 },
            tourPrice: 180,
            tourDuration: "8 hours",
            tourIncludes: ["Snorkeling equipment", "Lunch on boat", "Professional guide", "Underwater camera rental", "Small group (max 20 people)"],
            tourTimes: ["7:00 AM", "8:00 AM"]
        },
        {
            id: 4,
            name: "Santorini Sunset Tour",
            country: "Greece",
            city: "Santorini",
            category: "nature",
            description: "Experience the magical sunset from Oia village.",
            image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400",
            rating: 4.9,
            cost: "$$",
            coordinates: { lat: 36.3932, lng: 25.4615 },
            tourPrice: 85,
            tourDuration: "4 hours",
            tourIncludes: ["Transportation", "Professional guide", "Wine tasting", "Small group (max 10 people)"],
            tourTimes: ["4:00 PM"]
        },
        {
            id: 5,
            name: "Tokyo Food Tour",
            country: "Japan",
            city: "Tokyo",
            category: "cultural",
            description: "Explore authentic Japanese cuisine in local neighborhoods.",
            image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
            rating: 4.8,
            cost: "$$",
            coordinates: { lat: 35.6762, lng: 139.6503 },
            tourPrice: 95,
            tourDuration: "3 hours",
            tourIncludes: ["Food tastings", "Professional guide", "Cultural insights", "Small group (max 8 people)"],
            tourTimes: ["11:00 AM", "6:00 PM"]
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
            <div class="destination-pricing">
                <div class="tour-price">$${destination.tourPrice}</div>
                <div class="tour-duration">${destination.tourDuration}</div>
            </div>
            <div class="destination-actions">
                <button class="btn-secondary btn-small" onclick="event.stopPropagation(); showDestinationModal(${destination.id})">
                    <i class="fas fa-info-circle"></i> Details
                </button>
                <button class="btn-primary btn-small" onclick="event.stopPropagation(); openBookingModal(${destination.id})">
                    <i class="fas fa-calendar-plus"></i> Book Tour
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Show destination modal
function showDestinationModal(destinationId) {
    const destination = destinationsData.find(d => d.id === destinationId);
    if (!destination) return;
    
    const modal = document.getElementById('destinationModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h2>${destination.name}</h2>
        <img src="${destination.image}" alt="${destination.name}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px; margin: 1rem 0;">
        <div class="destination-details">
            <p><strong>Location:</strong> ${destination.city}, ${destination.country}</p>
            <p><strong>Category:</strong> ${destination.category}</p>
            <p><strong>Rating:</strong> ${destination.rating}/5 ⭐</p>
            <p><strong>Cost Level:</strong> ${destination.cost}</p>
            <p><strong>Description:</strong> ${destination.description}</p>
            
            <div class="tour-info">
                <h3>Tour Information</h3>
                <div class="tour-details">
                    <div class="tour-price-large">$${destination.tourPrice}</div>
                    <div class="tour-duration-large">${destination.tourDuration}</div>
                </div>
                
                <h4>What's Included:</h4>
                <ul class="tour-includes">
                    ${destination.tourIncludes.map(item => `<li><i class="fas fa-check"></i> ${item}</li>`).join('')}
                </ul>
                
                <h4>Available Times:</h4>
                <div class="tour-times">
                    ${destination.tourTimes.map(time => `<span class="time-slot">${time}</span>`).join('')}
                </div>
                
                <div class="modal-actions">
                    <button class="btn-primary btn-large" onclick="openBookingModal(${destination.id})">
                        <i class="fas fa-calendar-plus"></i> Book This Tour
                    </button>
                </div>
            </div>
        </div>
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
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });
    
    window.addEventListener('click', (e) => {
        const modals = ['destinationModal', 'bookingModal', 'paymentModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (e.target === modal) {
                closeModal();
            }
        });
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
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('paymentModal').style.display = 'none';
}

// Open booking modal
function openBookingModal(destinationId) {
    const destination = destinationsData.find(d => d.id === destinationId);
    if (!destination) return;
    
    // Check if user is logged in
    if (!currentUser) {
        showMessage('Please sign up or log in to book tours!', 'error');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000);
        return;
    }
    
    const modal = document.getElementById('bookingModal');
    const modalContent = document.getElementById('bookingContent');
    
    modalContent.innerHTML = `
        <div class="booking-header">
            <h2><i class="fas fa-calendar-plus"></i> Book Tour</h2>
            <div class="tour-summary">
                <img src="${destination.image}" alt="${destination.name}" class="booking-image">
                <div class="tour-info-summary">
                    <h3>${destination.name}</h3>
                    <p>${destination.city}, ${destination.country}</p>
                    <div class="tour-price-summary">$${destination.tourPrice} per person</div>
                    <div class="tour-duration-summary">${destination.tourDuration}</div>
                </div>
            </div>
        </div>
        
        <form id="bookingForm" class="booking-form">
            <div class="form-section">
                <h3>Tour Details</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="tourDate">Select Date:</label>
                        <input type="date" id="tourDate" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="tourTime">Select Time:</label>
                        <select id="tourTime" required>
                            <option value="">Choose a time</option>
                            ${destination.tourTimes.map(time => `<option value="${time}">${time}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="participants">Number of Participants:</label>
                        <select id="participants" required>
                            <option value="1">1 person</option>
                            <option value="2">2 people</option>
                            <option value="3">3 people</option>
                            <option value="4">4 people</option>
                            <option value="5">5 people</option>
                            <option value="6">6 people</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Contact Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="bookingName">Full Name:</label>
                        <input type="text" id="bookingName" value="${currentUser.displayName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="bookingEmail">Email:</label>
                        <input type="email" id="bookingEmail" value="${currentUser.email || ''}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="bookingPhone">Phone Number:</label>
                        <input type="tel" id="bookingPhone" placeholder="+1 (555) 123-4567" required>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Special Requests</h3>
                <div class="form-group">
                    <label for="specialRequests">Any special requests or dietary restrictions?</label>
                    <textarea id="specialRequests" rows="3" placeholder="Let us know if you have any special requirements..."></textarea>
                </div>
            </div>
            
            <div class="booking-summary">
                <h3>Booking Summary</h3>
                <div class="summary-item">
                    <span>Tour:</span>
                    <span>${destination.name}</span>
                </div>
                <div class="summary-item">
                    <span>Price per person:</span>
                    <span>$${destination.tourPrice}</span>
                </div>
                <div class="summary-item">
                    <span>Participants:</span>
                    <span id="summaryParticipants">1</span>
                </div>
                <div class="summary-item total">
                    <span>Total Amount:</span>
                    <span id="totalAmount">$${destination.tourPrice}</span>
                </div>
            </div>
            
            <div class="booking-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">
                    <i class="fas fa-credit-card"></i> Proceed to Payment
                </button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
    
    // Set up event listeners
    setupBookingFormListeners(destination);
}

// Setup booking form listeners
function setupBookingFormListeners(destination) {
    const participantsSelect = document.getElementById('participants');
    const summaryParticipants = document.getElementById('summaryParticipants');
    const totalAmount = document.getElementById('totalAmount');
    
    // Update total when participants change
    participantsSelect.addEventListener('change', function() {
        const participants = parseInt(this.value);
        const total = destination.tourPrice * participants;
        
        summaryParticipants.textContent = `${participants} ${participants === 1 ? 'person' : 'people'}`;
        totalAmount.textContent = `$${total}`;
    });
    
    // Handle form submission
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processBooking(destination);
    });
}

// Process booking
function processBooking(destination) {
    const formData = {
        tourDate: document.getElementById('tourDate').value,
        tourTime: document.getElementById('tourTime').value,
        participants: parseInt(document.getElementById('participants').value),
        name: document.getElementById('bookingName').value,
        email: document.getElementById('bookingEmail').value,
        phone: document.getElementById('bookingPhone').value,
        specialRequests: document.getElementById('specialRequests').value
    };
    
    // Validate form
    if (!formData.tourDate || !formData.tourTime || !formData.participants) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    // Calculate total
    const totalAmount = destination.tourPrice * formData.participants;
    
    // Store booking data
    const bookingData = {
        ...formData,
        destination: destination,
        totalAmount: totalAmount,
        bookingId: 'BK' + Date.now(),
        bookingDate: new Date().toISOString(),
        status: 'pending_payment'
    };
    
    // Store in localStorage for demo
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    
    // Close booking modal and open payment modal
    closeModal();
    openPaymentModal(bookingData);
}

// Open payment modal
function openPaymentModal(bookingData) {
    const modal = document.getElementById('paymentModal');
    const modalContent = document.getElementById('paymentContent');
    
    modalContent.innerHTML = `
        <div class="payment-header">
            <h2><i class="fas fa-credit-card"></i> Payment</h2>
            <div class="booking-reference">
                Booking Reference: <strong>${bookingData.bookingId}</strong>
            </div>
        </div>
        
        <div class="payment-summary">
            <h3>Payment Summary</h3>
            <div class="summary-item">
                <span>${bookingData.destination.name}</span>
                <span>${bookingData.participants} ${bookingData.participants === 1 ? 'person' : 'people'}</span>
            </div>
            <div class="summary-item">
                <span>Date:</span>
                <span>${new Date(bookingData.tourDate).toLocaleDateString()}</span>
            </div>
            <div class="summary-item">
                <span>Time:</span>
                <span>${bookingData.tourTime}</span>
            </div>
            <div class="summary-item total">
                <span>Total Amount:</span>
                <span>$${bookingData.totalAmount}</span>
            </div>
        </div>
        
        <form id="paymentForm" class="payment-form">
            <div class="form-section">
                <h3>Payment Method</h3>
                <div class="payment-methods">
                    <label class="payment-method">
                        <input type="radio" name="paymentMethod" value="card" checked>
                        <div class="payment-option">
                            <i class="fas fa-credit-card"></i>
                            <span>Credit/Debit Card</span>
                        </div>
                    </label>
                    <label class="payment-method">
                        <input type="radio" name="paymentMethod" value="paypal">
                        <div class="payment-option">
                            <i class="fab fa-paypal"></i>
                            <span>PayPal</span>
                        </div>
                    </label>
                    <label class="payment-method">
                        <input type="radio" name="paymentMethod" value="apple">
                        <div class="payment-option">
                            <i class="fab fa-apple-pay"></i>
                            <span>Apple Pay</span>
                        </div>
                    </label>
                </div>
            </div>
            
            <div class="form-section" id="cardDetails">
                <h3>Card Information</h3>
                <div class="form-group">
                    <label for="cardNumber">Card Number:</label>
                    <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="expiryDate">Expiry Date:</label>
                        <input type="text" id="expiryDate" placeholder="MM/YY" maxlength="5" required>
                    </div>
                    <div class="form-group">
                        <label for="cvv">CVV:</label>
                        <input type="text" id="cvv" placeholder="123" maxlength="4" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="cardName">Name on Card:</label>
                    <input type="text" id="cardName" placeholder="John Doe" required>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Billing Address</h3>
                <div class="form-group">
                    <label for="billingAddress">Address:</label>
                    <input type="text" id="billingAddress" placeholder="123 Main Street" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="billingCity">City:</label>
                        <input type="text" id="billingCity" placeholder="New York" required>
                    </div>
                    <div class="form-group">
                        <label for="billingZip">ZIP Code:</label>
                        <input type="text" id="billingZip" placeholder="10001" required>
                    </div>
                </div>
            </div>
            
            <div class="payment-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary btn-large">
                    <i class="fas fa-lock"></i> Pay $${bookingData.totalAmount}
                </button>
            </div>
            
            <div class="payment-security">
                <i class="fas fa-shield-alt"></i>
                <span>Your payment is secure and encrypted</span>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
    
    // Set up payment form listeners
    setupPaymentFormListeners(bookingData);
}

// Setup payment form listeners
function setupPaymentFormListeners(bookingData) {
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('cardDetails');
    
    // Show/hide card details based on payment method
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
    
    // Format card number input
    const cardNumberInput = document.getElementById('cardNumber');
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
    
    // Format expiry date input
    const expiryInput = document.getElementById('expiryDate');
    expiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
    
    // Handle form submission
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processPayment(bookingData);
    });
}

// Process payment (demo)
function processPayment(bookingData) {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Simulate payment processing
    showMessage('Processing payment...', 'info');
    
    setTimeout(() => {
        // Simulate successful payment
        const paymentData = {
            ...bookingData,
            paymentMethod: paymentMethod,
            paymentId: 'PAY' + Date.now(),
            paymentDate: new Date().toISOString(),
            status: 'confirmed'
        };
        
        // Store completed booking
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        bookings.push(paymentData);
        localStorage.setItem('userBookings', JSON.stringify(bookings));
        
        // Clear current booking
        localStorage.removeItem('currentBooking');
        
        // Close modal and show confirmation
        closeModal();
        showBookingConfirmation(paymentData);
        
    }, 2000);
}

// Show booking confirmation
function showBookingConfirmation(bookingData) {
    const modal = document.createElement('div');
    modal.className = 'modal confirmation-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content confirmation-content">
            <div class="confirmation-header">
                <i class="fas fa-check-circle success-icon"></i>
                <h2>Booking Confirmed!</h2>
                <p>Your tour has been successfully booked</p>
            </div>
            
            <div class="confirmation-details">
                <div class="detail-section">
                    <h3>Booking Information</h3>
                    <div class="detail-item">
                        <span>Booking Reference:</span>
                        <span><strong>${bookingData.bookingId}</strong></span>
                    </div>
                    <div class="detail-item">
                        <span>Tour:</span>
                        <span>${bookingData.destination.name}</span>
                    </div>
                    <div class="detail-item">
                        <span>Date:</span>
                        <span>${new Date(bookingData.tourDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <span>Time:</span>
                        <span>${bookingData.tourTime}</span>
                    </div>
                    <div class="detail-item">
                        <span>Participants:</span>
                        <span>${bookingData.participants} ${bookingData.participants === 1 ? 'person' : 'people'}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Payment Information</h3>
                    <div class="detail-item">
                        <span>Payment Method:</span>
                        <span>${bookingData.paymentMethod.toUpperCase()}</span>
                    </div>
                    <div class="detail-item">
                        <span>Payment ID:</span>
                        <span>${bookingData.paymentId}</span>
                    </div>
                    <div class="detail-item">
                        <span>Amount Paid:</span>
                        <span><strong>$${bookingData.totalAmount}</strong></span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>What's Next?</h3>
                    <ul class="next-steps">
                        <li><i class="fas fa-envelope"></i> You'll receive a confirmation email shortly</li>
                        <li><i class="fas fa-calendar"></i> Add this tour to your calendar</li>
                        <li><i class="fas fa-map-marker-alt"></i> Meet at the designated meeting point 15 minutes before the tour</li>
                        <li><i class="fas fa-phone"></i> Contact us if you have any questions</li>
                    </ul>
                </div>
            </div>
            
            <div class="confirmation-actions">
                <button class="btn-primary" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-download"></i> Download Receipt
                </button>
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 10000);
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
    
    /* Booking and Payment Modal Styles */
    .booking-modal, .payment-modal {
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .booking-header, .payment-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 10px 10px 0 0;
        margin: -1rem -1rem 2rem -1rem;
    }
    
    .booking-header h2, .payment-header h2 {
        margin: 0 0 1rem 0;
        font-size: 1.8rem;
    }
    
    .tour-summary {
        display: flex;
        gap: 1rem;
        align-items: center;
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 8px;
    }
    
    .booking-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .tour-info-summary h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.2rem;
    }
    
    .tour-price-summary {
        font-size: 1.1rem;
        font-weight: bold;
        color: #ffd700;
    }
    
    .booking-reference {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
    }
    
    .form-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #007bff;
    }
    
    .form-section h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.2rem;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #555;
    }
    
    .form-group input, .form-group select, .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e9ecef;
        border-radius: 6px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }
    
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
        outline: none;
        border-color: #007bff;
    }
    
    .booking-summary, .payment-summary {
        background: #e3f2fd;
        padding: 1.5rem;
        border-radius: 8px;
        margin: 1rem 0;
    }
    
    .booking-summary h3, .payment-summary h3 {
        margin: 0 0 1rem 0;
        color: #1976d2;
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #bbdefb;
    }
    
    .summary-item:last-child {
        border-bottom: none;
    }
    
    .summary-item.total {
        font-weight: bold;
        font-size: 1.1rem;
        color: #1976d2;
        border-top: 2px solid #1976d2;
        margin-top: 0.5rem;
        padding-top: 1rem;
    }
    
    .booking-actions, .payment-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
    }
    
    .btn-small {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
    
    .btn-large {
        padding: 1rem 2rem;
        font-size: 1.1rem;
    }
    
    .destination-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    
    .destination-pricing {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 1rem 0;
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 6px;
    }
    
    .tour-price {
        font-size: 1.2rem;
        font-weight: bold;
        color: #28a745;
    }
    
    .tour-duration {
        font-size: 0.9rem;
        color: #6c757d;
    }
    
    .tour-info {
        margin: 2rem 0;
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .tour-details {
        display: flex;
        gap: 2rem;
        margin: 1rem 0;
    }
    
    .tour-price-large {
        font-size: 2rem;
        font-weight: bold;
        color: #28a745;
    }
    
    .tour-duration-large {
        font-size: 1.2rem;
        color: #6c757d;
        display: flex;
        align-items: center;
    }
    
    .tour-includes {
        list-style: none;
        padding: 0;
    }
    
    .tour-includes li {
        padding: 0.5rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .tour-includes li i {
        color: #28a745;
    }
    
    .tour-times {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .time-slot {
        background: #007bff;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
    }
    
    .modal-actions {
        margin-top: 2rem;
        text-align: center;
    }
    
    /* Payment Method Styles */
    .payment-methods {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .payment-method {
        cursor: pointer;
    }
    
    .payment-method input[type="radio"] {
        display: none;
    }
    
    .payment-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        transition: all 0.3s ease;
        background: white;
    }
    
    .payment-option i {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: #6c757d;
    }
    
    .payment-method input[type="radio"]:checked + .payment-option {
        border-color: #007bff;
        background: #e3f2fd;
    }
    
    .payment-method input[type="radio"]:checked + .payment-option i {
        color: #007bff;
    }
    
    .payment-security {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1rem;
        padding: 1rem;
        background: #d4edda;
        border-radius: 6px;
        color: #155724;
        font-size: 0.9rem;
    }
    
    /* Confirmation Modal Styles */
    .confirmation-modal .modal-content {
        max-width: 600px;
    }
    
    .confirmation-content {
        text-align: center;
    }
    
    .confirmation-header {
        padding: 2rem;
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        border-radius: 10px 10px 0 0;
        margin: -1rem -1rem 2rem -1rem;
    }
    
    .success-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        color: #ffd700;
    }
    
    .confirmation-header h2 {
        margin: 0 0 0.5rem 0;
        font-size: 2rem;
    }
    
    .confirmation-details {
        text-align: left;
        margin: 2rem 0;
    }
    
    .detail-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .detail-section h3 {
        margin: 0 0 1rem 0;
        color: #333;
        border-bottom: 2px solid #007bff;
        padding-bottom: 0.5rem;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e9ecef;
    }
    
    .detail-item:last-child {
        border-bottom: none;
    }
    
    .next-steps {
        list-style: none;
        padding: 0;
    }
    
    .next-steps li {
        padding: 0.5rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .next-steps li i {
        color: #007bff;
    }
    
    .confirmation-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
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

