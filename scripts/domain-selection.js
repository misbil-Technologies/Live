class DomainSelection {
    constructor() {
        this.selectedDomain = null;
        this.resumeData = null;
        this.settings = {
            difficulty: 'intermediate',
            duration: '30',
            focus: 'technical',
            voiceActivation: 'auto'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.setupResumeUpload();
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
        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        // Show processing state
        const dropZone = document.getElementById('resume-drop-zone');
        dropZone.classList.add('processing');

        try {
            // Simulate file processing (in real app, you'd send to backend)
            await this.processResume(file);
            
            // Show file preview
            this.showResumePreview(file);
            
            // Analyze resume content
            await this.analyzeResume(file);
            
        } catch (error) {
            console.error('Error processing resume:', error);
            alert('Error processing resume. Please try again.');
        } finally {
            dropZone.classList.remove('processing');
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

    async processResume(file) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Store file data
        this.resumeData = {
            file: file,
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString()
        };
    }

    showResumePreview(file) {
        const dropZone = document.getElementById('resume-drop-zone');
        const preview = document.getElementById('resume-preview');
        
        // Hide drop zone, show preview
        dropZone.style.display = 'none';
        preview.style.display = 'block';
        
        // Update file info
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = this.formatFileSize(file.size);
    }

    async analyzeResume(file) {
        // Simulate AI analysis of resume content
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock analysis results (in real app, this would be AI-powered)
        const analysis = this.generateMockAnalysis(file.name);
        
        // Update UI with analysis
        document.getElementById('experience-level').textContent = analysis.experienceLevel;
        document.getElementById('key-skills').textContent = analysis.keySkills;
        document.getElementById('suggested-domain').textContent = analysis.suggestedDomain;
        
        // Highlight suggested domain
        this.highlightSuggestedDomain(analysis.suggestedDomainKey);
        
        // Store analysis
        this.resumeData.analysis = analysis;
    }

    generateMockAnalysis(fileName) {
        // Mock analysis based on filename and random selection
        const analyses = [
            {
                experienceLevel: 'Mid-level (3-5 years)',
                keySkills: 'Python, Machine Learning, SQL, Data Visualization',
                suggestedDomain: 'Data Science',
                suggestedDomainKey: 'data-science'
            },
            {
                experienceLevel: 'Senior (5+ years)',
                keySkills: 'JavaScript, React, Node.js, System Design',
                suggestedDomain: 'Software Engineering',
                suggestedDomainKey: 'software-engineering'
            },
            {
                experienceLevel: 'Mid-level (2-4 years)',
                keySkills: 'Product Strategy, User Research, Analytics',
                suggestedDomain: 'Product Management',
                suggestedDomainKey: 'product-management'
            },
            {
                experienceLevel: 'Junior (1-3 years)',
                keySkills: 'Digital Marketing, SEO, Content Strategy',
                suggestedDomain: 'Digital Marketing',
                suggestedDomainKey: 'marketing'
            },
            {
                experienceLevel: 'Senior (5+ years)',
                keySkills: 'Financial Modeling, Investment Analysis, Risk Management',
                suggestedDomain: 'Finance',
                suggestedDomainKey: 'finance'
            },
            {
                experienceLevel: 'Senior (6+ years)',
                keySkills: 'Strategic Planning, Case Analysis, Client Management',
                suggestedDomain: 'Management Consulting',
                suggestedDomainKey: 'consulting'
            }
        ];
        
        // Select based on filename or random
        let selectedAnalysis;
        if (fileName.toLowerCase().includes('data') || fileName.toLowerCase().includes('science')) {
            selectedAnalysis = analyses[0];
        } else if (fileName.toLowerCase().includes('software') || fileName.toLowerCase().includes('engineer')) {
            selectedAnalysis = analyses[1];
        } else if (fileName.toLowerCase().includes('product')) {
            selectedAnalysis = analyses[2];
        } else if (fileName.toLowerCase().includes('marketing')) {
            selectedAnalysis = analyses[3];
        } else if (fileName.toLowerCase().includes('finance')) {
            selectedAnalysis = analyses[4];
        } else if (fileName.toLowerCase().includes('consult')) {
            selectedAnalysis = analyses[5];
        } else {
            selectedAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
        }
        
        return selectedAnalysis;
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
        
        // Save resume data if available
        if (this.resumeData) {
            // Don't save the actual file, just metadata and analysis
            const resumeMetadata = {
                name: this.resumeData.name,
                size: this.resumeData.size,
                uploadedAt: this.resumeData.uploadedAt,
                analysis: this.resumeData.analysis
            };
            localStorage.setItem('resumeData', JSON.stringify(resumeMetadata));
        }
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
            resumeData: this.resumeData,
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