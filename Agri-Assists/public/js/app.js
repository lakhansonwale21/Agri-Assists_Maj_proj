const API_URL = 'http://localhost:3000/api';

// --- Utility Functions ---
const getToken = () => localStorage.getItem('token');
const getUserRole = () => localStorage.getItem('role');
const getUserData = () => JSON.parse(localStorage.getItem('user') || '{}');

const setAuth = (token, role, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(user));
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

// --- API Calls ---
const apiCall = async (endpoint, method = 'GET', body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    showLoader();
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();
        hideLoader();
        if (!response.ok && response.status === 401) {
            logout();
        }
        return data;
    } catch (error) {
        hideLoader();
        console.error('API Error:', error);
        return { success: false, message: translations['js_net_err'] || translations['js_net_err'] || translations['js_net_err'] || 'Network error' };
    }
};

// --- Language Management ---
let currentLang = localStorage.getItem('lang') || 'en';
let translations = {};

const loadTranslations = async (lang) => {
    try {
        const res = await fetch(`/lang/${lang}.json`);
        translations = await res.json();
        applyTranslations();
        localStorage.setItem('lang', lang);
    } catch (error) {
        console.error('Failed to load translations');
    }
};

const applyTranslations = () => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });
};

const changeLanguage = (lang) => {
    currentLang = lang;
    loadTranslations(lang);
};

// --- UI Helpers ---
const showLoader = () => {
    let loader = document.getElementById('loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.className = 'loader-overlay';
        loader.innerHTML = '<div class="spinner-border text-success" role="status"><span class="visually-hidden">Loading...</span></div>';
        document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
};

const hideLoader = () => {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
};

const showAlert = (message, type = 'success') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3 z-3`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
};

// --- Form Handlers ---
const handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await apiCall('/auth/login', 'POST', { email, password });
    if (res.success) {
        setAuth(res.token, res.role, res.user);
        if (res.role === 'admin') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/dashboard';
        }
    } else {
        showAlert(res.message, 'danger');
    }
};

const handleRegisterFarmer = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.role = 'farmer';

    const res = await apiCall('/auth/register', 'POST', data);
    if (res.success) {
        showAlert(translations['js_reg_succ'] || translations['js_reg_succ'] || translations['js_reg_succ'] || 'Registration successful! Please login.', 'success');
        setTimeout(() => window.location.href = '/login', 2000);
    } else {
        showAlert(res.message, 'danger');
    }
};

const handleRegisterShopkeeper = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.role = 'shopkeeper';

    const res = await apiCall('/auth/register', 'POST', data);
    if (res.success) {
        showAlert(translations['js_reg_succ'] || translations['js_reg_succ'] || translations['js_reg_succ'] || 'Registration successful! Please login.', 'success');
        setTimeout(() => window.location.href = '/login', 2000);
    } else {
        showAlert(res.message, 'danger');
    }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadTranslations(currentLang);

    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const farmerRegisterForm = document.getElementById('farmerRegisterForm');
    if (farmerRegisterForm) farmerRegisterForm.addEventListener('submit', handleRegisterFarmer);

    const shopRegisterForm = document.getElementById('shopRegisterForm');
    if (shopRegisterForm) shopRegisterForm.addEventListener('submit', handleRegisterShopkeeper);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Dynamic navbar based on auth state
    const navGuest = document.getElementById('nav-guest');
    const navAuth = document.getElementById('nav-auth');
    if (getToken()) {
        if(navGuest) navGuest.style.display = 'none';
        if(navAuth) {
            navAuth.style.display = 'flex';
            const user = getUserData();
            const userNameDisplay = document.getElementById('userNameDisplay');
            if(userNameDisplay) userNameDisplay.textContent = `Welcome, ${user.name}`;
        }
    } else {
        if(navGuest) navGuest.style.display = 'flex';
        if(navAuth) navAuth.style.display = 'none';
    }
});
