// ===== FIREBASE CONFIGURATION =====
const firebaseConfig = {
    apiKey: "AIzaSyCb_n1TtORgF07jI6FV4EopZuu_2jLwFbY",
    authDomain: "kleber-producer.firebaseapp.com",
    projectId: "kleber-producer",
    storageBucket: "kleber-producer.firebasestorage.app",
    messagingSenderId: "743475981821",
    appId: "1:743475981821:web:728e40eecae7c6c3d93d94"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ===== GLOBAL VARIABLES =====
let currentUser = null;
let cart = [];
let currentPlayingBeat = null;
let audioPlayer = null;

// ===== CURRENCY SYSTEM - USD ONLY =====
const CURRENCY_SYMBOL = '$';

// Currency formatting function - USD only
function formatPrice(priceInUSD) {
    // Format for USD with thousand separators and 2 decimals
    let formattedPrice;
    try {
        formattedPrice = priceInUSD.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } catch (e) {
        formattedPrice = priceInUSD.toFixed(2);
    }
    return `${CURRENCY_SYMBOL}${formattedPrice}`;
}

function updateCurrencyDisplay() {
    // Update all price displays in the app
    updateBeatsPrices();
    updateCartPrices();
    updatePaymentPrices();
}

function updateBeatsPrices() {
    // Update beats grid prices
    const beatPriceElements = document.querySelectorAll('.beat-price');
    beatPriceElements.forEach(element => {
        // Get price from dataset (stored in USD)
        let priceInUSD = element.dataset.originalPrice;
        
        if (!priceInUSD) {
            // Extract price from text content, handling USD format
            const textContent = element.textContent;
            // Remove currency symbols and separators, then parse
            const cleanPrice = textContent.replace(/[^0-9.,]/g, '');
            // Handle separators (remove commas, keep dots for decimals)
            const normalizedPrice = cleanPrice.replace(/,/g, '');
            priceInUSD = parseFloat(normalizedPrice);
        }
        
        if (!isNaN(priceInUSD)) {
            element.dataset.originalPrice = priceInUSD;
            element.textContent = formatPrice(priceInUSD);
        }
    });
}

function updateCartPrices() {
    // Update cart prices
    if (cart.length > 0) {
        updateCartUI();
    }
}

function updatePaymentPrices() {
    // Update payment section prices
    const orderSubtotal = document.getElementById('order-subtotal');
    const serviceFee = document.getElementById('service-fee');
    const orderTotal = document.getElementById('order-total');
    
    if (orderSubtotal && serviceFee && orderTotal) {
        loadOrderSummary();
    }
}


function initializeCurrency() {
    // USD only system - no currency selection needed
    
    // Test price formatting
    console.log('Testing USD price formatting:');
    console.log('USD 19.99:', formatPrice(19.99));
    console.log('USD 100.00:', formatPrice(100.00));
    console.log('USD 1500.50:', formatPrice(1500.50));
    console.log('USD 25000.00:', formatPrice(25000.00));
    
    // Update all prices
    updateCurrencyDisplay();
}


// ===== DOM ELEMENTS =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const exploreBeatsBtn = document.getElementById('explore-beats');
const authSection = document.getElementById('auth');
const authLink = document.getElementById('auth-link');
const profileLink = document.getElementById('profile-link');
const profileSection = document.getElementById('profile');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const uploadForm = document.getElementById('upload-form');
const beatCurrencySelect = document.getElementById('beat-currency');
const beatsGrid = document.getElementById('beats-grid');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const currencySelect = document.getElementById('currency-select');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const notificationClose = document.getElementById('notification-close');
const audioPlayerElement = document.getElementById('audio-player');
const audioElement = document.getElementById('audio-element');
const playPauseBtn = document.getElementById('play-pause-btn');
const playerTitle = document.getElementById('player-title');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const closePlayerBtn = document.getElementById('close-player');

// Profile elements
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const purchasedCount = document.getElementById('purchased-count');
const totalSpent = document.getElementById('total-spent');
const purchasedBeats = document.getElementById('purchased-beats');
const uploadedBeats = document.getElementById('uploaded-beats');
const purchasedEmpty = document.getElementById('purchased-empty');
const uploadedEmpty = document.getElementById('uploaded-empty');

// Public profile elements
const publicProfileSection = document.getElementById('public-profile');
const publicUsername = document.getElementById('public-username');
const publicBeatsCount = document.getElementById('public-beats-count');
const publicTimePlatform = document.getElementById('public-time-platform');
const publicBeatsGrid = document.getElementById('public-beats-grid');
const publicEmpty = document.getElementById('public-empty');
const publicDisplayName = document.getElementById('public-display-name');

// Search elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadCartFromStorage();
    initializeCurrency();
    loadBeatsFromFirestore();
    
    // Ensure only home section is visible initially
    switchSection('home');
});

function initializeApp() {
    // Check theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
    }
    
    // Check authentication state
    auth.onAuthStateChanged(user => {
        currentUser = user;
        updateAuthUI();
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Hamburger menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Navigation
    exploreBeatsBtn.addEventListener('click', () => {
        switchSection('beats');
    });
    
    // Search functionality
    searchInput.addEventListener('input', debounce(handleSearch, 50));
    searchBtn.addEventListener('click', handleSearch);
    
    // Show search results on focus
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 1) {
            handleSearch();
        }
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
    
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchAuthTab(e.target.dataset.tab);
        });
    });
    
    // Profile tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchProfileTab(e.target.dataset.tab);
        });
    });
    
    // Auth forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Upload form
    uploadForm.addEventListener('submit', handleUpload);
    
    // Cart
    checkoutBtn.addEventListener('click', handleCheckout);
    
    // Notification
    notificationClose.addEventListener('click', hideNotification);
    
    // Audio player
    playPauseBtn.addEventListener('click', togglePlayPause);
    closePlayerBtn.addEventListener('click', closeAudioPlayer);
    audioElement.addEventListener('timeupdate', updateProgress);
    progressBar.addEventListener('click', seekAudio);
    
    // Section switching for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Check if section should be visible for current user state
                if (currentUser) {
                    // Logged in user can access all sections
                    switchSection(targetId);
                } else {
                    // Non-logged in user restrictions
                    if (targetId === 'upload' || targetId === 'cart' || targetId === 'profile') {
                        showNotification('Debes iniciar sesión para acceder a esta sección', 'info');
                        switchSection('auth');
                    } else {
                        switchSection(targetId);
                    }
                }
                
                // Close mobile menu
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
}

// ===== THEME TOGGLE =====
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ===== AUTHENTICATION =====
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Clear previous errors
    clearAuthErrors('login');
    
    // Validation
    if (!validateEmail(email)) {
        showAuthError('login-email', 'Por favor, ingresa un email válido');
        return;
    }
    
    if (password.length < 6) {
        showAuthError('login-password', 'La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    // Firebase authentication
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            showNotification('¡Inicio de sesión exitoso!', 'success');
            loginForm.reset();
            
            // Session is automatically handled by onAuthStateChanged
            // No page reload needed
        })
        .catch(error => {
            handleAuthError(error, 'login');
        });
}

function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    // Clear previous errors
    clearAuthErrors('register');
    
    // Validation
    if (!validateEmail(email)) {
        showAuthError('register-email', 'Por favor, ingresa un email válido');
        return;
    }
    
    if (password.length < 6) {
        showAuthError('register-password', 'La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    // Firebase authentication
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Create user document in Firestore
            return db.collection('users').doc(userCredential.user.uid).set({
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            showNotification('¡Registro exitoso! Bienvenido a Kleber Producer', 'success');
            registerForm.reset();
            
            // Session is automatically handled by onAuthStateChanged
            // No page reload needed
        })
        .catch(error => {
            handleAuthError(error, 'register');
        });
}

function handleAuthError(error, formType) {
    let errorMessage = 'Error desconocido';
    
    switch (error.code) {
        case 'auth/user-not-found':
            errorMessage = 'Usuario no encontrado';
            break;
        case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta';
            break;
        case 'auth/email-already-in-use':
            errorMessage = 'El email ya está en uso';
            break;
        case 'auth/weak-password':
            errorMessage = 'La contraseña es muy débil';
            break;
        case 'auth/invalid-email':
            errorMessage = 'Email inválido';
            break;
        default:
            errorMessage = error.message;
    }
    
    showAuthMessage(formType, errorMessage, 'error');
}

function showAuthError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    errorElement.textContent = message;
}

function clearAuthErrors(formType) {
    document.querySelectorAll(`#${formType}-form .form-error`).forEach(error => {
        error.textContent = '';
    });
    showAuthMessage(formType, '', '');
}

function showAuthMessage(formType, message, type) {
    const messageElement = document.getElementById(`${formType}-message`);
    messageElement.textContent = message;
    messageElement.className = `auth-message ${type}`;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function updateAuthUI() {
    if (currentUser) {
        // Show user-specific navigation
        profileLink.style.display = 'block';
        authLink.style.display = 'none'; // Hide auth link completely for logged users
        
        // Show user sections, hide auth
        authSection.style.display = 'none';
        profileSection.style.display = 'block';
        
        // Hide public profile if showing
        publicProfileSection.style.display = 'none';
        
        // Show all sections for logged in user
        document.getElementById('upload').style.display = 'block';
        document.getElementById('cart').style.display = 'block';
        
        // Update profile info
        updateProfileInfo();
        loadUserProfileData();
        
        showNotification(`¡Bienvenido ${currentUser.email}!`, 'success');
    } else {
        // Show auth navigation only
        profileLink.style.display = 'none';
        authLink.style.display = 'block';
        authLink.textContent = 'Login / Registro';
        authLink.onclick = () => {
            document.getElementById('auth').scrollIntoView({ behavior: 'smooth' });
        };
        
        // Show auth, hide user sections
        authSection.style.display = 'block';
        profileSection.style.display = 'none';
        publicProfileSection.style.display = 'none';
        
        // Hide user-only sections for non-logged in users
        document.getElementById('upload').style.display = 'none';
        document.getElementById('cart').style.display = 'none';
    }
}

function handleLogout() {
    auth.signOut()
        .then(() => {
            showNotification('Sesión cerrada correctamente', 'success');
            // Clear profile data
            profileName.textContent = '--';
            profileEmail.textContent = '--';
            purchasedCount.textContent = '0';
            totalSpent.textContent = '$0.00';
            purchasedBeats.innerHTML = '';
            uploadedBeats.innerHTML = '';
            setTimeout(() => {
                document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        })
        .catch(error => {
            showNotification('Error al cerrar sesión', 'error');
        });
}

// ===== BEATS MANAGEMENT =====
function loadBeatsFromFirestore() {
    db.collection('beats').get()
        .then(snapshot => {
            beatsGrid.innerHTML = '';
            snapshot.forEach(doc => {
                const beat = doc.data();
                beat.id = doc.id;
                displayBeat(beat);
            });
            
            // Add profile buttons to beats after loading
            setTimeout(() => {
                updateBeatDisplayWithUploader();
                // Force price formatting update
                updateBeatsPrices();
            }, 100);
        })
        .catch(error => {
            console.error('Error loading beats:', error);
            showNotification('Error al cargar los beats', 'error');
        });
}

function displayBeat(beat) {
    const beatCard = document.createElement('div');
    beatCard.className = 'beat-card';
    beatCard.innerHTML = `
        <img src="${beat.coverUrl || 'https://picsum.photos/seed/beat/300/200.jpg'}" alt="${beat.name}" class="beat-cover">
        <div class="beat-info">
            <h3 class="beat-name">${beat.name}</h3>
            <p class="beat-price" data-original-price="${beat.price}">${formatPrice(beat.price)}</p>
            <div class="beat-actions">
                <button class="beat-btn play-btn" onclick="playBeat('${beat.id}', '${beat.name}', '${beat.audioUrl}')">
                    <i class="fas fa-play"></i> Reproducir
                </button>
                <button class="beat-btn buy-btn" onclick="addToCart('${beat.id}', '${beat.name}', ${beat.price}, '${beat.coverUrl}')">
                    <i class="fas fa-shopping-cart"></i> Comprar
                </button>
            </div>
        </div>
    `;
    beatsGrid.appendChild(beatCard);
}

// ===== UPLOAD BEAT =====
function handleUpload(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Debes iniciar sesión para subir beats', 'error');
        return;
    }
    
    const name = document.getElementById('beat-name').value;
    const priceInUSD = parseFloat(document.getElementById('beat-price').value);
    const audioFile = document.getElementById('beat-audio').files[0];
    const coverFile = document.getElementById('beat-cover').files[0];
    
    if (!audioFile || !coverFile) {
        showNotification('Por favor, selecciona ambos archivos', 'error');
        return;
    }
    
    // Show loading state with progress
    const uploadBtn = uploadForm.querySelector('button[type="submit"]');
    const originalText = uploadBtn.innerHTML;
    uploadBtn.innerHTML = '<span class="loading"></span> <span id="upload-progress">Iniciando...</span>';
    uploadBtn.disabled = true;
    
    // Track upload progress
    const progressElement = document.getElementById('upload-progress');
    
    // Upload files to Firebase Storage - clean implementation
    const audioRef = storage.ref(`beats/${Date.now()}_${audioFile.name}`);
    const coverRef = storage.ref(`covers/${Date.now()}_${coverFile.name}`);
    
    console.log('Starting upload:', {
        audioFile: audioFile.name,
        audioSize: audioFile.size,
        coverFile: coverFile.name,
        coverSize: coverFile.size
    });
    
    // Upload with proper progress tracking
    let audioProgress = 0;
    let coverProgress = 0;
    
    const audioUpload = audioRef.put(audioFile);
    const coverUpload = coverRef.put(coverFile);
    
    // Track audio progress
    audioUpload.on('state_changed', (snapshot) => {
        audioProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
        const totalProgress = audioProgress + coverProgress;
        if (progressElement) {
            progressElement.textContent = Math.round(totalProgress) + '%';
        }
        console.log('Audio progress:', Math.round(audioProgress * 2) + '%');
    });
    
    // Track cover progress
    coverUpload.on('state_changed', (snapshot) => {
        coverProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
        const totalProgress = audioProgress + coverProgress;
        if (progressElement) {
            progressElement.textContent = Math.round(totalProgress) + '%';
        }
        console.log('Cover progress:', Math.round(coverProgress * 2) + '%');
    });
    
    Promise.all([audioUpload, coverUpload])
    .then(() => Promise.all([
        audioRef.getDownloadURL(),
        coverRef.getDownloadURL()
    ]))
    .then(([audioUrl, coverUrl]) => {
        // Update progress for Firestore save
        if (progressElement) {
            progressElement.textContent = '90%';
        }
        
        // Save beat data to Firestore (store in USD)
        return db.collection('beats').add({
            name,
            price: priceInUSD, // Store in USD
            audioUrl,
            coverUrl,
            uploadedBy: currentUser.uid,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    })
    .then(() => {
        // Complete progress
        if (progressElement) {
            progressElement.textContent = '100%';
        }
        
        showNotification('Beat subido exitosamente', 'success');
        uploadForm.reset();
        loadBeatsFromFirestore(); // Reload beats
        
        // Reload profile data to show new uploaded beat
        if (currentUser) {
            loadUploadedBeats();
        }
    })
    .catch(error => {
        console.error('Error uploading beat:', error);
        showNotification('Error al subir el beat', 'error');
    })
    .finally(() => {
        uploadBtn.innerHTML = originalText;
        uploadBtn.disabled = false;
    });
}

// ===== SHOPPING CART =====
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('kleberCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function addToCart(beatId, beatName, beatPrice, beatCover) {
    const existingItem = cart.find(item => item.id === beatId);
    
    if (existingItem) {
        showNotification('Este beat ya está en tu carrito', 'info');
        return;
    }
    
    cart.push({
        id: beatId,
        name: beatName,
        price: beatPrice,
        cover: beatCover
    });
    
    saveCartToStorage();
    updateCartUI();
    showNotification('Beat añadido al carrito', 'success');
}

function removeFromCart(beatId) {
    cart = cart.filter(item => item.id !== beatId);
    saveCartToStorage();
    updateCartUI();
}

function saveCartToStorage() {
    localStorage.setItem('kleberCart', JSON.stringify(cart));
}

function updateCartUI() {
    cartItems.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--text-dark);">Tu carrito está vacío</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.cover || 'https://picsum.photos/seed/beat/60/60.jpg'}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <button class="beat-btn" onclick="removeFromCart('${item.id}')" style="background: var(--error-color); color: white;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(cartItem);
            total += item.price;
        });
    }
    
    cartTotal.textContent = formatPrice(total);
}


// ===== AUDIO PLAYER =====
function playBeat(beatId, beatName, beatUrl) {
    if (currentPlayingBeat === beatId && !audioElement.paused) {
        // Pause if clicking the same beat
        pauseAudio();
        return;
    }
    
    currentPlayingBeat = beatId;
    playerTitle.textContent = beatName;
    audioElement.src = beatUrl;
    audioElement.play();
    
    // Update play button
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    
    // Show player
    audioPlayerElement.classList.add('show');
    
    // Update all play buttons
    document.querySelectorAll('.play-btn').forEach(btn => {
        if (btn.onclick.toString().includes(beatId)) {
            btn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> Reproducir';
        }
    });
}

function togglePlayPause() {
    if (audioElement.paused) {
        audioElement.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        pauseAudio();
    }
}

function pauseAudio() {
    audioElement.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    
    // Update all play buttons
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.innerHTML = '<i class="fas fa-play"></i> Reproducir';
    });
}

function closeAudioPlayer() {
    audioElement.pause();
    audioPlayerElement.classList.remove('show');
    currentPlayingBeat = null;
    
    // Update all play buttons
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.innerHTML = '<i class="fas fa-play"></i> Reproducir';
    });
}

function updateProgress() {
    if (audioElement.duration) {
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        progressFill.style.width = `${progress}%`;
    }
}

function seekAudio(e) {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioElement.currentTime = percent * audioElement.duration;
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    notificationMessage.textContent = message;
    notification.className = `notification show ${type}`;
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        hideNotification();
    }, 3000);
}

function hideNotification() {
    notification.classList.remove('show');
}

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// ===== USER PROFILE FUNCTIONS =====
function updateProfileInfo() {
    if (currentUser) {
        profileName.textContent = currentUser.email.split('@')[0];
        profileEmail.textContent = currentUser.email;
    }
}

function loadUserProfileData() {
    if (!currentUser) return;
    
    // Load purchased beats
    loadPurchasedBeats();
    
    // Load uploaded beats
    loadUploadedBeats();
}

function loadPurchasedBeats() {
    if (!currentUser) return;
    
    db.collection('users').doc(currentUser.uid).collection('purchases').get()
        .then(snapshot => {
            purchasedBeats.innerHTML = '';
            let total = 0;
            let count = 0;
            
            if (snapshot.empty) {
                purchasedEmpty.style.display = 'block';
                purchasedBeats.style.display = 'none';
            } else {
                purchasedEmpty.style.display = 'none';
                purchasedBeats.style.display = 'grid';
                
                snapshot.forEach(doc => {
                    const purchase = doc.data();
                    const beatCard = createProfileBeatCard(purchase, 'purchased');
                    purchasedBeats.appendChild(beatCard);
                    total += purchase.price;
                    count++;
                });
            }
            
            purchasedCount.textContent = count;
            totalSpent.textContent = `$${total.toFixed(2)}`;
        })
        .catch(error => {
            console.error('Error loading purchased beats:', error);
            purchasedEmpty.style.display = 'block';
            purchasedBeats.style.display = 'none';
        });
}

function loadUploadedBeats() {
    if (!currentUser) return;
    
    db.collection('beats').where('uploadedBy', '==', currentUser.uid).get()
        .then(snapshot => {
            uploadedBeats.innerHTML = '';
            
            if (snapshot.empty) {
                uploadedEmpty.style.display = 'block';
                uploadedBeats.style.display = 'none';
            } else {
                uploadedEmpty.style.display = 'none';
                uploadedBeats.style.display = 'grid';
                
                snapshot.forEach(doc => {
                    const beat = doc.data();
                    beat.id = doc.id;
                    const beatCard = createProfileBeatCard(beat, 'uploaded');
                    uploadedBeats.appendChild(beatCard);
                });
            }
        })
        .catch(error => {
            console.error('Error loading uploaded beats:', error);
            uploadedEmpty.style.display = 'block';
            uploadedBeats.style.display = 'none';
        });
}

function createProfileBeatCard(beat, type) {
    const beatCard = document.createElement('div');
    beatCard.className = 'beat-card';
    
    const actionButtons = type === 'purchased' 
        ? `<button class="beat-btn play-btn" onclick="playBeat('${beat.id}', '${beat.name}', '${beat.audioUrl}')">
               <i class="fas fa-play"></i> Reproducir
           </button>`
        : `<button class="beat-btn play-btn" onclick="playBeat('${beat.id}', '${beat.name}', '${beat.audioUrl}')">
               <i class="fas fa-play"></i> Reproducir
           </button>
           <button class="beat-btn buy-btn" onclick="deleteBeat('${beat.id}')">
               <i class="fas fa-trash"></i> Eliminar
           </button>`;
    
    beatCard.innerHTML = `
        <img src="${beat.coverUrl || 'https://picsum.photos/seed/beat/300/200.jpg'}" alt="${beat.name}" class="beat-cover">
        <div class="beat-info">
            <h3 class="beat-name">${beat.name}</h3>
            <p class="beat-price" data-original-price="${beat.price}">${formatPrice(beat.price)}</p>
            <div class="beat-actions">
                ${actionButtons}
            </div>
        </div>
    `;
    
    return beatCard;
}

function switchProfileTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
}

function deleteBeat(beatId) {
    if (!currentUser) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar este beat?')) {
        db.collection('beats').doc(beatId).delete()
            .then(() => {
                showNotification('Beat eliminado exitosamente', 'success');
                loadUploadedBeats(); // Reload uploaded beats
                loadBeatsFromFirestore(); // Reload main beats grid
            })
            .catch(error => {
                console.error('Error deleting beat:', error);
                showNotification('Error al eliminar el beat', 'error');
            });
    }
}

// Update checkout function to use new payment system
function handleCheckout() {
    // Redirect to payment section
    showPaymentSection();
}

// ===== PUBLIC PROFILE FUNCTIONS =====
function showPublicProfile(userId) {
    if (!userId) {
        showNotification('Error: ID de usuario no válido', 'error');
        return;
    }
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show public profile
    publicProfileSection.style.display = 'block';
    
    // Load public user data
    loadPublicProfileData(userId);
}

function loadPublicProfileData(userId) {
    // Load user's beats
    db.collection('beats').where('uploadedBy', '==', userId).get()
        .then(snapshot => {
            publicBeatsGrid.innerHTML = '';
            
            if (snapshot.empty) {
                publicEmpty.style.display = 'block';
                publicBeatsGrid.style.display = 'none';
                publicBeatsCount.textContent = '0';
            } else {
                publicEmpty.style.display = 'none';
                publicBeatsGrid.style.display = 'grid';
                
                snapshot.forEach(doc => {
                    const beat = doc.data();
                    beat.id = doc.id;
                    const beatCard = createPublicBeatCard(beat);
                    publicBeatsGrid.appendChild(beatCard);
                });
                
                publicBeatsCount.textContent = snapshot.size;
            }
        })
        .catch(error => {
            console.error('Error loading public beats:', error);
            publicEmpty.style.display = 'block';
            publicBeatsGrid.style.display = 'none';
        });
    
    // Get user info (username from email)
    db.collection('users').doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                const username = userData.email ? userData.email.split('@')[0] : 'Usuario';
                publicUsername.textContent = username;
                publicDisplayName.textContent = username;
                
                // Calculate time on platform
                if (userData.createdAt) {
                    const createdDate = userData.createdAt.toDate();
                    const now = new Date();
                    const diffTime = Math.abs(now - createdDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 1) {
                        publicTimePlatform.textContent = '1 día';
                    } else if (diffDays < 30) {
                        publicTimePlatform.textContent = `${diffDays} días`;
                    } else if (diffDays < 365) {
                        const months = Math.floor(diffDays / 30);
                        publicTimePlatform.textContent = `${months} mes${months > 1 ? 'es' : ''}`;
                    } else {
                        const years = Math.floor(diffDays / 365);
                        publicTimePlatform.textContent = `${years} año${years > 1 ? 's' : ''}`;
                    }
                } else {
                    publicTimePlatform.textContent = 'Reciente';
                }
            } else {
                publicUsername.textContent = 'Usuario';
                publicDisplayName.textContent = 'Usuario';
                publicTimePlatform.textContent = 'Reciente';
            }
        })
        .catch(error => {
            console.error('Error loading user data:', error);
            publicUsername.textContent = 'Usuario';
            publicDisplayName.textContent = 'Usuario';
            publicTimePlatform.textContent = 'Reciente';
        });
}

function createPublicBeatCard(beat) {
    const beatCard = document.createElement('div');
    beatCard.className = 'beat-card';
    
    beatCard.innerHTML = `
        <img src="${beat.coverUrl || 'https://picsum.photos/seed/beat/300/200.jpg'}" alt="${beat.name}" class="beat-cover">
        <div class="beat-info">
            <h3 class="beat-name">${beat.name}</h3>
            <p class="beat-price" data-original-price="${beat.price}">${formatPrice(beat.price)}</p>
            <div class="beat-actions">
                <button class="beat-btn play-btn" onclick="playBeat('${beat.id}', '${beat.name}', '${beat.audioUrl}')">
                    <i class="fas fa-play"></i> Reproducir
                </button>
                <button class="beat-btn buy-btn" onclick="addToCart('${beat.id}', '${beat.name}', ${beat.price}, '${beat.coverUrl}')">
                    <i class="fas fa-shopping-cart"></i> Comprar
                </button>
            </div>
        </div>
    `;
    
    return beatCard;
}

function showMainContent() {
    // Hide public profile
    publicProfileSection.style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update beat display to show uploader info
function updateBeatDisplayWithUploader() {
    const beatCards = document.querySelectorAll('#beats-grid .beat-card');
    
    beatCards.forEach(card => {
        // Add "Ver Perfil" button to each beat
        const actionsDiv = card.querySelector('.beat-actions');
        if (actionsDiv && !actionsDiv.querySelector('.profile-btn')) {
            const profileBtn = document.createElement('button');
            profileBtn.className = 'beat-btn profile-btn';
            profileBtn.innerHTML = '<i class="fas fa-user"></i> Perfil';
            profileBtn.style.background = 'var(--tertiary-color)';
            profileBtn.style.color = 'var(--text-light)';
            profileBtn.onclick = () => {
                // Get beat ID from the card
                const beatName = card.querySelector('.beat-name').textContent;
                showNotification(`Cargando perfil del productor de "${beatName}"...`, 'info');
                
                // Find the beat data to get uploader ID
                const beatId = card.querySelector('.play-btn').getAttribute('onclick').match(/'([^']+)'/)[1];
                
                // Get beat data from Firestore to find uploader
                db.collection('beats').doc(beatId).get()
                    .then(doc => {
                        if (doc.exists) {
                            const beatData = doc.data();
                            showPublicProfile(beatData.uploadedBy);
                        } else {
                            showNotification('Beat no encontrado', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error getting beat data:', error);
                        showNotification('Error al cargar perfil', 'error');
                    });
            };
            
            actionsDiv.appendChild(profileBtn);
        }
    });
}

function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    }
}

// ===== SEARCH FUNCTIONALITY =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length < 1) {
        searchResults.style.display = 'none';
        return;
    }
    
    // Clear previous results
    searchResults.innerHTML = '';
    
    // Search users first (prioritized)
    searchUsers(query);
    
    // Then search beats if no users found
    setTimeout(() => {
        const userResults = searchResults.querySelectorAll('.search-result-item').length;
        if (userResults < 3) {
            searchBeats(query);
        }
    }, 50);
}

function searchBeats(query) {
    // Search by name (contains) - optimized
    db.collection('beats')
        .orderBy('name')
        .startAt(query)
        .endAt(query + '\uf8ff')
        .limit(3)
        .get()
        .then(nameSnapshot => {
            displayResults('beats', nameSnapshot.docs);
            
            // If no results with name, try partial match only if query is longer
            if (nameSnapshot.empty && query.length >= 3) {
                return db.collection('beats')
                    .limit(10) // Limit to reduce processing
                    .get()
                    .then(allSnapshot => {
                        const matches = allSnapshot.docs.filter(doc => {
                            const name = doc.data().name || '';
                            const genre = doc.data().genre || '';
                            return name.toLowerCase().includes(query) || 
                                   genre.toLowerCase().includes(query);
                        }).slice(0, 3);
                        
                        if (matches.length > 0) {
                            displayResults('beats', matches);
                        }
                    });
            }
        })
        .catch(error => {
            console.error('Error searching beats:', error);
        });
}

function searchUsers(query) {
    // Search by email (contains) - optimized
    db.collection('users')
        .orderBy('email')
        .startAt(query)
        .endAt(query + '\uf8ff')
        .limit(3)
        .get()
        .then(emailSnapshot => {
            displayResults('users', emailSnapshot.docs);
            
            // If no results with email, try partial match only if query is longer
            if (emailSnapshot.empty && query.length >= 3) {
                return db.collection('users')
                    .limit(10) // Limit to reduce processing
                    .get()
                    .then(allSnapshot => {
                        const matches = allSnapshot.docs.filter(doc => {
                            const email = doc.data().email || '';
                            return email.toLowerCase().includes(query);
                        }).slice(0, 3);
                        
                        if (matches.length > 0) {
                            displayResults('users', matches);
                        }
                    });
            }
        })
        .catch(error => {
            console.error('Error searching users:', error);
        });
}

function displayResults(type, docs) {
    if (docs.length === 0) {
        if (searchResults.children.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No se encontraron resultados</div>';
        }
        searchResults.style.display = 'block';
        return;
    }
    
    docs.forEach(doc => {
        const data = doc.data();
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        if (type === 'beats') {
            resultItem.innerHTML = `
                <div class="search-result-type">Beat</div>
                <div>
                    <div class="search-result-name">${data.name}</div>
                    <div class="search-result-details">$${data.price.toFixed(2)} • ${data.genre || 'Sin género'}</div>
                </div>
            `;
            resultItem.onclick = () => {
                switchSection('beats');
                searchResults.style.display = 'none';
                searchInput.value = '';
            };
        } else if (type === 'users') {
            const username = data.email ? data.email.split('@')[0] : 'Usuario';
            resultItem.innerHTML = `
                <div class="search-result-type">Usuario</div>
                <div>
                    <div class="search-result-name">${username}</div>
                    <div class="search-result-details">${data.email}</div>
                </div>
            `;
            resultItem.onclick = () => {
                showPublicProfile(doc.id);
                searchResults.style.display = 'none';
                searchInput.value = '';
            };
        }
        
        // Remove no results message if exists
        const noResults = searchResults.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
        
        searchResults.appendChild(resultItem);
    });
    
    searchResults.style.display = 'block';
}

// ===== PAYMENT PROCESSING =====
// Initialize Stripe (replace with your publishable key)
const stripe = Stripe('pk_test_51234567890abcdef'); // Replace with actual Stripe publishable key

// Payment DOM Elements
const paymentForm = document.getElementById('payment-form');
const cardNumberInput = document.getElementById('card-number');
const cardExpiryInput = document.getElementById('card-expiry');
const cardCvvInput = document.getElementById('card-cvv');
const cardNameInput = document.getElementById('card-name');
const billingEmailInput = document.getElementById('billing-email');
const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
const cardPaymentForm = document.getElementById('card-payment-form');
const paypalPaymentForm = document.getElementById('paypal-payment-form');

// Payment processing functions
function initPaymentSystem() {
    // Add event listeners for payment method selection
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });
    
    // Add event listeners for card input formatting
    cardNumberInput.addEventListener('input', formatCardNumber);
    cardExpiryInput.addEventListener('input', formatCardExpiry);
    cardCvvInput.addEventListener('input', formatCardCvv);
    
    // Add submit event listener for payment form
    paymentForm.addEventListener('submit', handlePaymentSubmit);
    
    // Initialize PayPal buttons if needed
    if (window.paypal) {
        initPayPalButtons();
    }
}

function handlePaymentMethodChange(e) {
    const paymentMethod = e.target.value;
    
    // Update UI
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('active');
    });
    e.target.closest('.payment-method').classList.add('active');
    
    // Show/hide appropriate form
    if (paymentMethod === 'card') {
        cardPaymentForm.style.display = 'block';
        paypalPaymentForm.style.display = 'none';
    } else if (paymentMethod === 'paypal') {
        cardPaymentForm.style.display = 'none';
        paypalPaymentForm.style.display = 'block';
    }
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
}

function formatCardExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
}

function formatCardCvv(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
}

function showPaymentSection() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }
    
    // Load order summary
    loadOrderSummary();
    
    // Show payment section
    switchSection('payment');
}

function loadOrderSummary() {
    const orderItems = document.getElementById('order-items');
    const orderSubtotal = document.getElementById('order-subtotal');
    const serviceFee = document.getElementById('service-fee');
    const orderTotal = document.getElementById('order-total');
    
    // Clear existing items
    orderItems.innerHTML = '';
    
    // Add cart items to order summary
    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <img src="${item.coverUrl}" alt="${item.name}">
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-price">${formatPrice(item.price)}</div>
            </div>
        `;
        orderItems.appendChild(orderItem);
    });
    
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + item.price, 0);
    const feeAmount = subtotal * 0.05; // 5% service fee
    const total = subtotal + feeAmount;
    
    // Update totals display
    orderSubtotal.textContent = formatPrice(subtotal);
    serviceFee.textContent = formatPrice(feeAmount);
    orderTotal.textContent = formatPrice(total);
}

async function handlePaymentSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Debes iniciar sesión para realizar una compra', 'error');
        showSection('auth');
        return;
    }
    
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    if (paymentMethod === 'card') {
        await processCardPayment();
    } else if (paymentMethod === 'paypal') {
        // PayPal is handled by their SDK
        showNotification('Por favor completa el pago con PayPal', 'info');
    }
}

async function processCardPayment() {
    const submitBtn = document.getElementById('submit-payment');
    const originalText = submitBtn.innerHTML;
    
    try {
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        submitBtn.disabled = true;
        
        // Get form data
        const cardData = {
            number: cardNumberInput.value.replace(/\s/g, ''),
            expiry: cardExpiryInput.value,
            cvv: cardCvvInput.value,
            name: cardNameInput.value,
            email: billingEmailInput.value
        };
        
        // Validate card data (basic validation)
        if (!validateCardData(cardData)) {
            throw new Error('Por favor completa todos los campos correctamente');
        }
        
        // Calculate totals
        const subtotal = cart.reduce((total, item) => total + item.price, 0);
        const feeAmount = subtotal * 0.05;
        const total = subtotal + feeAmount;
        
        // Create payment intent (in a real app, this would call your backend)
        const paymentResult = await createPaymentIntent({
            amount: Math.round(total * 100), // Convert to cents
            currency: 'usd',
            customer_email: cardData.email,
            metadata: {
                user_id: currentUser.uid,
                items: JSON.stringify(cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price
                })))
            }
        });
        
        if (paymentResult.success) {
            // Save order to Firebase
            await saveOrderToFirebase(paymentResult.orderId, total, cardData.email);
            
            // Clear cart
            cart = [];
            updateCartUI();
            saveCartToLocalStorage();
            
            // Show success page
            showPaymentSuccess(paymentResult.orderId, total);
        } else {
            throw new Error(paymentResult.error || 'Error al procesar el pago');
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        showNotification(error.message || 'Error al procesar el pago', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function validateCardData(cardData) {
    // Basic validation
    if (!cardData.number || cardData.number.length < 13) return false;
    if (!cardData.expiry || !cardData.expiry.includes('/')) return false;
    if (!cardData.cvv || cardData.cvv.length < 3) return false;
    if (!cardData.name || cardData.name.trim() === '') return false;
    if (!cardData.email || !cardData.email.includes('@')) return false;
    
    return true;
}

async function createPaymentIntent(paymentData) {
    // Simulate payment processing (in production, this would call Stripe API)
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate successful payment
            resolve({
                success: true,
                orderId: 'ORDER_' + Date.now(),
                clientSecret: 'pi_' + Math.random().toString(36).substr(2, 9)
            });
        }, 2000);
    });
}

async function saveOrderToFirebase(orderId, total, email) {
    const orderData = {
        id: orderId,
        user_id: currentUser.uid,
        user_email: email,
        items: cart.map(item => ({
            beat_id: item.id,
            beat_name: item.name,
            producer_id: item.producerId,
            price: item.price
        })),
        total: total,
        status: 'completed',
        created_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Save order to Firestore
    await db.collection('orders').add(orderData);
    
    // Update purchased beats for user
    for (const item of cart) {
        await db.collection('users').doc(currentUser.uid).collection('purchased_beats').add({
            beat_id: item.id,
            beat_name: item.name,
            producer_id: item.producerId,
            price: item.price,
            purchased_at: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}

function showPaymentSuccess(orderId, total) {
    const orderDetails = document.getElementById('order-details');
    
    orderDetails.innerHTML = `
        <div class="order-summary">
            <h4>Orden #${orderId}</h4>
            <p><strong>Total pagado:</strong> ${formatPrice(total)}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Método de pago:</strong> Tarjeta de crédito</p>
            <p><strong>Divisa:</strong> ${currentCurrency}</p>
        </div>
        <div class="purchased-items">
            <h5>Beats comprados:</h5>
            ${cart.map(item => `
                <div class="purchased-item">
                    <span>${item.name}</span>
                    <span>${formatPrice(item.price)}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    showSection('payment-success');
    showNotification('¡Compra realizada con éxito!', 'success');
}

function initPayPalButtons() {
    if (document.getElementById('paypal-button-container')) {
        paypal.Buttons({
            createOrder: function(data, actions) {
                const subtotal = cart.reduce((total, item) => total + item.price, 0);
                const feeAmount = subtotal * 0.05;
                const total = subtotal + feeAmount;
                
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: total.toFixed(2)
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(async function(details) {
                    // Save order to Firebase
                    await saveOrderToFirebase(details.id, details.purchase_units[0].amount.value, details.payer.email_address);
                    
                    // Clear cart
                    cart = [];
                    updateCartUI();
                    saveCartToLocalStorage();
                    
                    // Show success page
                    showPaymentSuccess(details.id, details.purchase_units[0].amount.value);
                });
            },
            onError: function(err) {
                console.error('PayPal error:', err);
                showNotification('Error al procesar el pago con PayPal', 'error');
            }
        }).render('#paypal-button-container');
    }
}

// Initialize payment system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Previous initialization code...
    
    // Initialize payment system
    initPaymentSystem();
});

// Test function for price formatting
function testPriceFormatting() {
    console.log('=== PRICE FORMATTING TEST ===');
    console.log('Current currency:', currentCurrency);
    
    const testPrices = [19.99, 100, 1500, 25000, 100000];
    
    testPrices.forEach(price => {
        console.log(`Price ${price}:`);
        console.log(`  USD: ${formatPrice(price, 'USD')}`);
        console.log(`  COP: ${formatPrice(price, 'COP')}`);
        console.log(`  EUR: ${formatPrice(price, 'EUR')}`);
    });
    
    // Test current display
    const beatPrices = document.querySelectorAll('.beat-price');
    console.log(`Found ${beatPrices.length} beat price elements`);
    
    beatPrices.forEach((element, index) => {
        console.log(`Beat ${index + 1}: ${element.textContent} | Original: ${element.dataset.originalPrice}`);
    });
    
    showNotification('Prueba de formato ejecutada - revisa la consola', 'info');
}

// Make functions globally accessible
window.playBeat = playBeat;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.deleteBeat = deleteBeat;
window.showPublicProfile = showPublicProfile;
window.showMainContent = showMainContent;
window.switchSection = switchSection;
window.showPaymentSection = showPaymentSection;
window.testPriceFormatting = testPriceFormatting;
