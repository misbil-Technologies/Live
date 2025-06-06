class DomainSelection {
    constructor() {
        this.selectedDomain = null;
        this.settings = {
            difficulty: 'intermediate',
            duration: '30',
            focus: 'technical'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
    }

    bindEvents() {
        // Domain card selection
        const domainCards = document.querySelectorAll('.domain-card');
        domainCards.forEach(card => {
            card.addEventListener('click', () => this.selectDomain(card));
        });

        // Settings change
        const settingSelects = document.querySelectorAll('.setting-item select');
        settingSelects.forEach(select => {
            select.addEventListener('change', (e) => this.updateSetting(e.target.id, e.target.value));
        });

        // Start interview button
        const startBtn = document.getElementById('start-interview-btn');
        startBtn.addEventListener('click', () => this.startInterview());
    }

    selectDomain(selectedCard) {
        // Remove previous selection
        document.querySelectorAll('.domain-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        selectedCard.classList.add('selected');
        this.selectedDomain = selectedCard.dataset.domain;

        // Update start button
        this.updateStartButton();
    }

    updateSetting(settingId, value) {
        this.settings[settingId] = value;
        console.log('Settings updated:', this.settings);
    }

    updateStartButton() {
        const startBtn = document.getElementById('start-interview-btn');
        const btnText = startBtn.querySelector('.btn-text');

        if (this.selectedDomain) {
            startBtn.disabled = false;
            btnText.textContent = 'Start Interview';
            startBtn.classList.add('ready');
        } else {
            startBtn.disabled = true;
            btnText.textContent = 'Select a domain to start';
            startBtn.classList.remove('ready');
        }
    }

    loadSettings() {
        // Load saved settings from localStorage if available
        const savedSettings = localStorage.getItem('interviewSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            
            // Update UI
            Object.keys(this.settings).forEach(key => {
                const select = document.getElementById(key);
                if (select) {
                    select.value = this.settings[key];
                }
            });
        }
    }

    saveSettings() {
        localStorage.setItem('interviewSettings', JSON.stringify(this.settings));
        localStorage.setItem('selectedDomain', this.selectedDomain);
    }

    startInterview() {
        if (!this.selectedDomain) {
            alert('Please select a domain first');
            return;
        }

        // Save current settings
        this.saveSettings();

        // Create interview session data
        const sessionData = {
            domain: this.selectedDomain,
            settings: this.settings,
            startTime: new Date().toISOString(),
            sessionId: this.generateSessionId()
        };

        localStorage.setItem('currentSession', JSON.stringify(sessionData));

        // Navigate to interview page
        window.location.href = '/interview';
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize domain selection when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DomainSelection();
});