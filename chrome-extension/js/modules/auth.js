export class AuthModule {
    constructor() {
        this.currentUser = null;
        this.onAuthChange = null;
    }

    async init() {
        const storage = await chrome.storage.local.get(['user', 'token']);
        if (storage.user && storage.token) {
        this.currentUser = storage.user;
        return true;
        }
        return false;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAdmin() {
        return this.currentUser?.roles?.includes('ADMIN') || false;
    }

    setupAuthUI() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.getElementById(`${tab}Form`).classList.add('active');
        });
        });
        
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleLogin();
        });
        
        document.getElementById('signupBtn').addEventListener('click', () => this.handleSignup());
        document.getElementById('signupPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleSignup();
        });
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        
        if (!username || !password) {
        this.showError(errorDiv, 'Please fill all fields');
        return;
        }
        
        const btn = document.getElementById('loginBtn');
        this.setButtonLoading(btn, true, 'Logging in...');
        
        try {
        const response = await chrome.runtime.sendMessage({
            action: 'login',
            credentials: { username, password }
        });
        
        if (response.success) {
            this.currentUser = response.data;
            if (this.onAuthChange) {
            this.onAuthChange(true);
            }
        } else {
            this.showError(errorDiv, response.error || 'Login failed');
        }
        } catch (error) {
        this.showError(errorDiv, error.message || 'Login failed');
        } finally {
        this.setButtonLoading(btn, false, 'Login');
        }
    }

    async handleSignup() {
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const errorDiv = document.getElementById('signupError');
        
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        
        if (!username || !email || !password) {
        this.showError(errorDiv, 'Please fill all fields');
        return;
        }
        
        if (password.length < 6) {
        this.showError(errorDiv, 'Password must be at least 6 characters');
        return;
        }
        
        const btn = document.getElementById('signupBtn');
        this.setButtonLoading(btn, true, 'Creating account...');
        
        try {
        const response = await chrome.runtime.sendMessage({
            action: 'signup',
            userData: { username, email, password }
        });
        
        if (response.success) {
            this.currentUser = response.data;
            if (this.onAuthChange) {
            this.onAuthChange(true);
            }
        } else {
            this.showError(errorDiv, response.error || 'Signup failed');
        }
        } catch (error) {
        this.showError(errorDiv, error.message || 'Signup failed');
        } finally {
        this.setButtonLoading(btn, false, 'Sign Up');
        }
    }

    async handleLogout() {
        await chrome.runtime.sendMessage({ action: 'logout' });
        this.currentUser = null;
        if (this.onAuthChange) {
        this.onAuthChange(false);
        }
    }

    showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }

    setButtonLoading(button, loading, text) {
        button.disabled = loading;
        button.textContent = text;
    }
}