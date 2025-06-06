class LandingPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupAnimations();
        this.setupDemoCredentials();
    }

    setupNavigation() {
        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileToggle.classList.toggle('active');
            });
        }

        // Smooth scrolling for anchor links
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

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    setupScrollEffects() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.feature-card, .step, .pricing-card').forEach(el => {
            observer.observe(el);
        });
    }

    setupAnimations() {
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            .feature-card,
            .step,
            .pricing-card {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease;
            }

            .feature-card.animate-in,
            .step.animate-in,
            .pricing-card.animate-in {
                opacity: 1;
                transform: translateY(0);
            }

            .mobile-menu-toggle.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }

            .mobile-menu-toggle.active span:nth-child(2) {
                opacity: 0;
            }

            .mobile-menu-toggle.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -6px);
            }

            .nav-menu.active {
                display: flex;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                flex-direction: column;
                padding: 2rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                z-index: 1000;
            }

            @media (max-width: 768px) {
                .nav-menu {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);

        // Counter animation for stats
        this.animateCounters();
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                const suffix = counter.textContent.includes('+') ? '+' : 
                              counter.textContent.includes('%') ? '%' : '';
                counter.textContent = Math.floor(current).toLocaleString() + suffix;
            }, 16);
        };

        // Animate counters when they come into view
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    setupDemoCredentials() {
        // Add demo credentials info for login button
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                // Show demo credentials tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'demo-tooltip';
                tooltip.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        padding: 2rem;
                        border-radius: 12px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                        z-index: 10000;
                        text-align: center;
                        max-width: 400px;
                    ">
                        <h3 style="margin-bottom: 1rem; color: #1a202c;">Demo Credentials</h3>
                        <p style="margin-bottom: 1rem; color: #4a5568;">Use these credentials to try the platform:</p>
                        <div style="background: #f7fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <strong>Email:</strong> demo@example.com<br>
                            <strong>Password:</strong> demo123
                        </div>
                        <button onclick="this.parentElement.parentElement.remove()" style="
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                        ">Got it!</button>
                    </div>
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.5);
                        z-index: 9999;
                    " onclick="this.parentElement.remove()"></div>
                `;
                document.body.appendChild(tooltip);
            });
        }
    }
}

// Initialize landing page
document.addEventListener('DOMContentLoaded', () => {
    new LandingPage();
});