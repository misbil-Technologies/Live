class Dashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.selectedDomain = null;
        this.resumeData = null;
        this.userProfile = null;
        this.interviews = [];
        
        this.init();
    }

    async init() {
        await this.loadUserProfile();
        this.setupNavigation();
        this.setupInterviewSetup();
        this.setupResumeUpload();
        this.loadInterviews();
        this.updateDashboardStats();
        this.setupEventListeners();
    }

    async loadUserProfile() {
        try {
            const response = await fetch('/api/user/profile');
            if (response.ok) {
                this.userProfile = await response.json();
                this.updateUserInterface();
            } else {
                // User not authenticated, redirect to login
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            window.location.href = '/login';
        }
    }

    updateUserInterface() {
        if (!this.userProfile) return;

        // Update user info in sidebar
        document.getElementById('user-name').textContent = 
            `${this.userProfile.firstName} ${this.userProfile.lastName}`;
        document.getElementById('user-plan').textContent = 
            this.userProfile.subscription.charAt(0).toUpperCase() + this.userProfile.subscription.slice(1) + ' Plan';

        // Update welcome message
        document.getElementById('welcome-name').textContent = this.userProfile.firstName;

        // Update interviews remaining
        document.getElementById('interviews-remaining').textContent = this.userProfile.interviewsRemaining;

        // Update profile form
        document.getElementById('profile-firstName').value = this.userProfile.firstName;
        document.getElementById('profile-lastName').value = this.userProfile.lastName;
        document.getElementById('profile-email').value = this.userProfile.email;
        document.getElementById('profile-company').value = this.userProfile.company || '';

        // Update subscription info
        document.getElementById('current-plan').textContent = 
            this.userProfile.subscription.charAt(0).toUpperCase() + this.userProfile.subscription.slice(1) + ' Plan';
        document.getElementById('plan-interviews').textContent = this.userProfile.interviewsRemaining;
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const actionButtons = document.querySelectorAll('.action-btn');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const section = button.dataset.section;
                if (section) {
                    this.showSection(section);
                }
            });
        });
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        this.currentSection = sectionName;
    }

    setupInterviewSetup() {
        // Domain selection
        const domainCards = document.querySelectorAll('.domain-card');
        domainCards.forEach(card => {
            card.addEventListener('click', () => this.selectDomain(card));
        });

        // Settings change
        const settingSelects = document.querySelectorAll('.setting-item select');
        settingSelects.forEach(select => {
            select.addEventListener('change', () => this.updateStartButton());
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

    async startInterview() {
        if (!this.selectedDomain) {
            alert('Please select a domain first');
            return;
        }

        if (this.userProfile.interviewsRemaining <= 0 && this.userProfile.subscription === 'free') {
            alert('You have reached your interview limit. Please upgrade your subscription.');
            return;
        }

        try {
            // Collect settings
            const settings = {
                difficulty: document.getElementById('difficulty').value,
                duration: document.getElementById('duration').value,
                focus: document.getElementById('focus').value,
                voiceActivation: document.getElementById('voice-activation').value
            };

            // Create interview session
            const response = await fetch('/api/interviews/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domain: this.selectedDomain,
                    settings: settings,
                    resumeData: this.resumeData
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store interview data and redirect
                localStorage.setItem('currentInterview', JSON.stringify(data.interview));
                window.location.href = '/interview-session';
            } else {
                alert(data.error || 'Failed to create interview session');
            }
        } catch (error) {
            console.error('Error starting interview:', error);
            alert('Error starting interview. Please try again.');
        }
    }

    setupResumeUpload() {
        const dropZone = document.getElementById('resume-drop-zone');
        const fileInput = document.getElementById('resume-upload');
        const browseBtn = document.querySelector('.browse-btn');
        const removeBtn = document.getElementById('remove-resume');

        // Click to browse
        browseBtn.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        // Remove resume
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeResume();
        });
    }

    async handleFileUpload(file) {
        if (!this.validateFile(file)) {
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch('/api/resume/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                this.resumeData = data;
                this.showResumePreview(file, data.analysis);
            } else {
                alert(data.error || 'Failed to upload resume');
            }
        } catch (error) {
            console.error('Error uploading resume:', error);
            alert('Error uploading resume. Please try again.');
        }
    }

    validateFile(file) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF, DOC, or DOCX file.');
            return false;
        }

        if (file.size > maxSize) {
            alert('File size must be less than 5MB.');
            return false;
        }

        return true;
    }

    showResumePreview(file, analysis) {
        const dropZone = document.getElementById('resume-drop-zone');
        const preview = document.getElementById('resume-preview');
        
        // Hide drop zone, show preview
        dropZone.style.display = 'none';
        preview.style.display = 'block';
        
        // Update file info
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = this.formatFileSize(file.size);

        // Update analysis
        document.getElementById('experience-level').textContent = analysis.experienceLevel;
        document.getElementById('key-skills').textContent = analysis.keySkills;
        document.getElementById('suggested-domain').textContent = analysis.suggestedDomain;

        // Highlight suggested domain
        this.highlightSuggestedDomain(analysis.suggestedDomainKey);
    }

    highlightSuggestedDomain(domainKey) {
        // Remove previous suggestions
        document.querySelectorAll('.domain-card').forEach(card => {
            card.classList.remove('suggested');
        });
        
        // Highlight suggested domain
        const suggestedCard = document.querySelector(`[data-domain="${domainKey}"]`);
        if (suggestedCard) {
            suggestedCard.classList.add('suggested');
        }
    }

    removeResume() {
        const dropZone = document.getElementById('resume-drop-zone');
        const preview = document.getElementById('resume-preview');
        const fileInput = document.getElementById('resume-upload');
        
        // Reset file input
        fileInput.value = '';
        
        // Show drop zone, hide preview
        dropZone.style.display = 'block';
        preview.style.display = 'none';
        
        // Remove suggestions
        document.querySelectorAll('.domain-card').forEach(card => {
            card.classList.remove('suggested');
        });
        
        // Clear data
        this.resumeData = null;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async loadInterviews() {
        try {
            const response = await fetch('/api/user/interviews');
            if (response.ok) {
                this.interviews = await response.json();
                this.updateInterviewHistory();
                this.updateRecentInterviews();
            }
        } catch (error) {
            console.error('Error loading interviews:', error);
        }
    }

    updateInterviewHistory() {
        const historyList = document.getElementById('interview-history-list');
        
        if (this.interviews.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📝</span>
                    <p>No interviews found</p>
                    <span>Start your first interview to see history here</span>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.interviews.map(interview => `
            <div class="history-item">
                <div class="interview-info">
                    <div class="interview-title">
                        ${interview.domain.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Interview
                    </div>
                    <div class="interview-meta">
                        <span>📅 ${new Date(interview.createdAt).toLocaleDateString()}</span>
                        <span>⏱️ ${interview.settings.duration} minutes</span>
                        <span>📊 ${interview.status}</span>
                        ${interview.results ? `<span>🎯 ${interview.results.overallScore}%</span>` : ''}
                    </div>
                </div>
                <div class="interview-actions">
                    ${interview.status === 'completed' ? 
                        `<button class="action-btn-small view-btn" onclick="dashboard.viewResults('${interview.id}')">View Results</button>` : 
                        `<button class="action-btn-small view-btn" onclick="dashboard.resumeInterview('${interview.id}')">Resume</button>`
                    }
                    <button class="action-btn-small delete-btn" onclick="dashboard.deleteInterview('${interview.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    updateRecentInterviews() {
        const recentList = document.getElementById('recent-interviews-list');
        const recentInterviews = this.interviews.slice(0, 3);
        
        if (recentInterviews.length === 0) {
            recentList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📝</span>
                    <p>No interviews yet</p>
                    <span>Start your first interview to see results here</span>
                </div>
            `;
            return;
        }

        recentList.innerHTML = recentInterviews.map(interview => `
            <div class="history-item">
                <div class="interview-info">
                    <div class="interview-title">
                        ${interview.domain.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div class="interview-meta">
                        <span>${new Date(interview.createdAt).toLocaleDateString()}</span>
                        <span>${interview.status}</span>
                        ${interview.results ? `<span>${interview.results.overallScore}%</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateDashboardStats() {
        const completedInterviews = this.interviews.filter(i => i.status === 'completed');
        const totalScore = completedInterviews.reduce((sum, i) => sum + (i.results?.overallScore || 0), 0);
        const avgScore = completedInterviews.length > 0 ? Math.round(totalScore / completedInterviews.length) : 0;
        const totalTime = completedInterviews.reduce((sum, i) => sum + parseInt(i.settings.duration), 0);

        document.getElementById('total-interviews').textContent = this.interviews.length;
        document.getElementById('avg-score').textContent = avgScore + '%';
        document.getElementById('total-time').textContent = Math.round(totalTime / 60) + 'h';
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Profile form
        document.getElementById('profile-form').addEventListener('submit', (e) => this.updateProfile(e));

        // Upgrade button
        document.querySelector('.upgrade-btn').addEventListener('click', () => {
            alert('Upgrade functionality coming soon!');
        });
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Error logging out:', error);
            window.location.href = '/login';
        }
    }

    async updateProfile(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const profileData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            company: formData.get('company')
        };

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                alert('Profile updated successfully!');
                await this.loadUserProfile();
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    }

    viewResults(interviewId) {
        localStorage.setItem('viewInterviewId', interviewId);
        window.location.href = '/interview-results';
    }

    resumeInterview(interviewId) {
        const interview = this.interviews.find(i => i.id === interviewId);
        if (interview) {
            localStorage.setItem('currentInterview', JSON.stringify(interview));
            window.location.href = '/interview-session';
        }
    }

    async deleteInterview(interviewId) {
        if (confirm('Are you sure you want to delete this interview?')) {
            try {
                const response = await fetch(`/api/interviews/${interviewId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadInterviews();
                    this.updateDashboardStats();
                } else {
                    alert('Failed to delete interview');
                }
            } catch (error) {
                console.error('Error deleting interview:', error);
                alert('Error deleting interview');
            }
        }
    }
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
});