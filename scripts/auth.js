class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordStrength();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Demo credentials button
        const useDemoBtn = document.getElementById('use-demo');
        if (useDemoBtn) {
            useDemoBtn.addEventListener('click', () => this.useDemoCredentials());
        }

        // Password confirmation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
        }
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        if (passwordInput && strengthFill && strengthText) {
            passwordInput.addEventListener('input', (e) => {
                const password = e.target.value;
                const strength = this.calculatePasswordStrength(password);
                
                strengthFill.style.width = `${strength.percentage}%`;
                strengthFill.style.background = strength.color;
                strengthText.textContent = strength.text;
            });
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) score += 25;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) score += 25;
        else feedback.push('Lowercase letter');

        if (/[A-Z]/.test(password)) score += 25;
        else feedback.push('Uppercase letter');

        if (/[0-9]/.test(password)) score += 25;
        else feedback.push('Number');

        if (/[^A-Za-z0-9]/.test(password)) score += 10;

        let strength = {
            percentage: Math.min(score, 100),
            color: '#ef4444',
            text: 'Weak'
        };

        if (score >= 75) {
            strength.color = '#22c55e';
            strength.text = 'Strong';
        } else if (score >= 50) {
            strength.color = '#fbbf24';
            strength.text = 'Medium';
        }

        return strength;
    }

    validatePasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmInput = document.getElementById('confirmPassword');

        if (confirmPassword && password !== confirmPassword) {
            confirmInput.setCustomValidity('Passwords do not match');
            confirmInput.style.borderColor = '#ef4444';
        } else {
            confirmInput.setCustomValidity('');
            confirmInput.style.borderColor = '#e2e8f0';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const loginBtn = document.getElementById('login-btn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.btn-loader');

        // Show loading state
        this.setLoadingState(loginBtn, btnText, btnLoader, true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password')
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                this.showMessage(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState(loginBtn, btnText, btnLoader, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const registerBtn = document.getElementById('register-btn');
        const btnText = registerBtn.querySelector('.btn-text');
        const btnLoader = registerBtn.querySelector('.btn-loader');

        // Validate password match
        if (formData.get('password') !== formData.get('confirmPassword')) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(registerBtn, btnText, btnLoader, true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    company: formData.get('company'),
                    password: formData.get('password')
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                this.showMessage(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState(registerBtn, btnText, btnLoader, false);
        }
    }

    useDemoCredentials() {
        document.getElementById('email').value = 'demo@example.com';
        document.getElementById('password').value = 'demo123';
    }

    setLoadingState(button, textElement, loaderElement, isLoading) {
        if (isLoading) {
            button.disabled = true;
            textElement.style.display = 'none';
            loaderElement.style.display = 'block';
        } else {
            button.disabled = false;
            textElement.style.display = 'block';
            loaderElement.style.display = 'none';
        }
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert before form
        const form = document.querySelector('.auth-form');
        form.parentNode.insertBefore(messageDiv, form);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    checkAuthStatus() {
        // Check if user is already logged in
        fetch('/api/user/profile')
            .then(response => {
                if (response.ok) {
                    // User is logged in, redirect to dashboard
                    window.location.href = '/dashboard';
                }
            })
            .catch(() => {
                // User is not logged in, stay on auth page
            });
    }
}

// Initialize auth manager
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});