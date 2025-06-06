class InterviewSession {
    constructor() {
        this.sessionData = null;
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.responses = [];
        this.startTime = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        // D-ID Integration
        this.peerConnection = null;
        this.streamId = null;
        this.sessionId = null;
        this.agentId = null;
        this.chatId = null;
        this.isConnected = false;
        
        this.init();
    }

    async init() {
        this.loadSessionData();
        this.setupUI();
        this.setupAudioRecording();
        await this.initializeAIAgent();
        this.startTimer();
    }

    loadSessionData() {
        const sessionDataStr = localStorage.getItem('currentSession');
        if (!sessionDataStr) {
            alert('No session data found. Redirecting to home page.');
            window.location.href = '/';
            return;
        }
        
        this.sessionData = JSON.parse(sessionDataStr);
        this.startTime = new Date();
        this.generateQuestions();
    }

    setupUI() {
        // Update domain display
        document.getElementById('domain-display').textContent = 
            this.sessionData.domain.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Update question counter
        this.updateQuestionCounter();
        
        // Bind events
        document.getElementById('start-recording-btn').addEventListener('click', () => this.startRecording());
        document.getElementById('stop-recording-btn').addEventListener('click', () => this.stopRecording());
        document.getElementById('end-interview-btn').addEventListener('click', () => this.endInterview());
    }

    generateQuestions() {
        const questionSets = {
            'data-science': [
                {
                    question: "Explain the difference between supervised and unsupervised learning. Can you provide examples of algorithms for each?",
                    context: "This tests fundamental ML knowledge",
                    expectedDuration: 180
                },
                {
                    question: "How would you handle missing data in a dataset? Walk me through your approach.",
                    context: "Data preprocessing skills",
                    expectedDuration: 150
                },
                {
                    question: "Describe a time when you had to explain a complex data science concept to a non-technical stakeholder.",
                    context: "Communication skills",
                    expectedDuration: 120
                },
                {
                    question: "What is overfitting and how would you prevent it in your models?",
                    context: "Model validation understanding",
                    expectedDuration: 180
                },
                {
                    question: "How would you approach feature selection for a machine learning project?",
                    context: "Feature engineering skills",
                    expectedDuration: 150
                },
                {
                    question: "Explain the bias-variance tradeoff and its implications for model performance.",
                    context: "Advanced ML concepts",
                    expectedDuration: 200
                }
            ],
            'software-engineering': [
                {
                    question: "Explain the SOLID principles and how they improve code quality.",
                    context: "Software design principles",
                    expectedDuration: 180
                },
                {
                    question: "How would you design a URL shortener like bit.ly? Walk me through your system architecture.",
                    context: "System design skills",
                    expectedDuration: 300
                },
                {
                    question: "What's the difference between SQL and NoSQL databases? When would you use each?",
                    context: "Database knowledge",
                    expectedDuration: 150
                },
                {
                    question: "Describe your approach to debugging a performance issue in a web application.",
                    context: "Problem-solving skills",
                    expectedDuration: 180
                },
                {
                    question: "How do you ensure code quality in a team environment?",
                    context: "Development practices",
                    expectedDuration: 120
                }
            ],
            'product-management': [
                {
                    question: "How would you prioritize features for a new product release?",
                    context: "Product strategy",
                    expectedDuration: 180
                },
                {
                    question: "Describe a time when you had to make a difficult product decision with limited data.",
                    context: "Decision-making skills",
                    expectedDuration: 150
                },
                {
                    question: "How would you measure the success of a new feature launch?",
                    context: "Metrics and analytics",
                    expectedDuration: 120
                },
                {
                    question: "Walk me through how you would conduct user research for a mobile app.",
                    context: "User research skills",
                    expectedDuration: 180
                }
            ],
            'marketing': [
                {
                    question: "How would you develop a go-to-market strategy for a new SaaS product?",
                    context: "Marketing strategy",
                    expectedDuration: 200
                },
                {
                    question: "Explain how you would measure the ROI of a digital marketing campaign.",
                    context: "Analytics and measurement",
                    expectedDuration: 150
                },
                {
                    question: "Describe your approach to building brand awareness for a startup.",
                    context: "Brand marketing",
                    expectedDuration: 180
                }
            ],
            'finance': [
                {
                    question: "Walk me through a DCF model and its key assumptions.",
                    context: "Financial modeling",
                    expectedDuration: 200
                },
                {
                    question: "How would you evaluate the financial health of a company?",
                    context: "Financial analysis",
                    expectedDuration: 180
                },
                {
                    question: "Explain the concept of risk-adjusted returns and how you would calculate them.",
                    context: "Investment analysis",
                    expectedDuration: 150
                }
            ],
            'consulting': [
                {
                    question: "A retail client is experiencing declining sales. How would you approach this problem?",
                    context: "Case study analysis",
                    expectedDuration: 300
                },
                {
                    question: "How would you help a client decide whether to enter a new market?",
                    context: "Strategic thinking",
                    expectedDuration: 250
                },
                {
                    question: "Describe a time when you had to manage a difficult client relationship.",
                    context: "Client management",
                    expectedDuration: 150
                }
            ]
        };

        const domainQuestions = questionSets[this.sessionData.domain] || questionSets['data-science'];
        const duration = parseInt(this.sessionData.settings.duration);
        const questionsCount = Math.ceil(duration / 5); // Roughly 5 minutes per question
        
        this.questions = domainQuestions.slice(0, Math.min(questionsCount, domainQuestions.length));
        this.displayCurrentQuestion();
    }

    displayCurrentQuestion() {
        if (this.currentQuestionIndex < this.questions.length) {
            const question = this.questions[this.currentQuestionIndex];
            document.getElementById('current-question').textContent = question.question;
            document.getElementById('question-context').textContent = question.context;
            
            // Enable recording button
            document.getElementById('start-recording-btn').disabled = false;
        } else {
            this.completeInterview();
        }
    }

    updateQuestionCounter() {
        const counter = document.getElementById('question-counter');
        counter.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        
        // Update progress
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-percentage').textContent = `${Math.round(progress)}%`;
    }

    async setupAudioRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };
            
            // Setup audio level visualization
            this.setupAudioVisualization(stream);
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Please allow microphone access to continue with the interview.');
        }
    }

    setupAudioVisualization(stream) {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const updateAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const percentage = (average / 255) * 100;
            
            document.querySelector('.level-bar').style.width = `${percentage}%`;
            
            if (this.isRecording) {
                requestAnimationFrame(updateAudioLevel);
            }
        };
        
        this.audioLevelUpdater = updateAudioLevel;
    }

    startRecording() {
        if (!this.mediaRecorder) {
            alert('Microphone not available. Please refresh and allow microphone access.');
            return;
        }
        
        this.audioChunks = [];
        this.mediaRecorder.start();
        this.isRecording = true;
        
        // Update UI
        document.getElementById('start-recording-btn').disabled = true;
        document.getElementById('stop-recording-btn').disabled = false;
        document.getElementById('recording-indicator').classList.add('active');
        document.querySelector('.transcription-text').textContent = 'Recording in progress...';
        
        // Start audio level visualization
        this.audioLevelUpdater();
        
        // Auto-stop after 5 minutes
        this.recordingTimeout = setTimeout(() => {
            if (this.isRecording) {
                this.stopRecording();
            }
        }, 300000); // 5 minutes
    }

    stopRecording() {
        if (!this.isRecording) return;
        
        this.mediaRecorder.stop();
        this.isRecording = false;
        
        // Clear timeout
        if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
        }
        
        // Update UI
        document.getElementById('start-recording-btn').disabled = false;
        document.getElementById('stop-recording-btn').disabled = true;
        document.getElementById('recording-indicator').classList.remove('active');
        document.querySelector('.transcription-text').textContent = 'Processing your response...';
    }

    processRecording() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        
        // Store response
        const response = {
            questionIndex: this.currentQuestionIndex,
            question: this.questions[this.currentQuestionIndex],
            audioBlob: audioBlob,
            timestamp: new Date().toISOString(),
            duration: this.audioChunks.length // Approximate
        };
        
        this.responses.push(response);
        
        // Simulate transcription (in real app, you'd use speech-to-text API)
        setTimeout(() => {
            const mockTranscription = this.generateMockTranscription();
            document.querySelector('.transcription-text').textContent = mockTranscription;
            
            // Move to next question after a delay
            setTimeout(() => {
                this.nextQuestion();
            }, 2000);
        }, 1500);
    }

    generateMockTranscription() {
        const mockResponses = [
            "Thank you for the question. In my experience with machine learning, supervised learning involves training models with labeled data where we know the correct output...",
            "That's a great question about data preprocessing. When dealing with missing data, I typically start by understanding the nature and pattern of the missingness...",
            "Communication is crucial in data science. I remember a project where I had to explain our recommendation algorithm to the marketing team...",
            "Overfitting is definitely a common challenge. I usually address it through several techniques including cross-validation, regularization, and feature selection...",
            "Feature selection is critical for model performance. My approach typically involves both statistical methods and domain knowledge..."
        ];
        
        return mockResponses[this.currentQuestionIndex % mockResponses.length];
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.updateQuestionCounter();
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.displayCurrentQuestion();
            document.querySelector('.transcription-text').textContent = 'Ready for the next question. Click "Start Recording" when you\'re ready to respond.';
        } else {
            this.completeInterview();
        }
    }

    completeInterview() {
        // Calculate final results
        const endTime = new Date();
        const duration = Math.round((endTime - this.startTime) / 1000 / 60); // minutes
        
        const results = {
            sessionData: this.sessionData,
            responses: this.responses,
            duration: duration,
            completedAt: endTime.toISOString(),
            overallScore: this.calculateOverallScore()
        };
        
        localStorage.setItem('interviewResults', JSON.stringify(results));
        
        // Navigate to results page
        window.location.href = '/results';
    }

    calculateOverallScore() {
        // Mock scoring algorithm
        const baseScore = 70 + Math.random() * 25; // 70-95 range
        return Math.round(baseScore);
    }

    startTimer() {
        const duration = parseInt(this.sessionData.settings.duration) * 60; // Convert to seconds
        let timeLeft = duration;
        
        const timerElement = document.getElementById('timer');
        
        this.timerInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                this.endInterview();
            }
            
            timeLeft--;
        }, 1000);
    }

    endInterview() {
        if (confirm('Are you sure you want to end the interview? Your progress will be saved.')) {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }
            this.completeInterview();
        }
    }

    // D-ID Integration methods (simplified for demo)
    async initializeAIAgent() {
        try {
            // This would integrate with the existing D-ID agent code
            // For now, we'll simulate the connection
            setTimeout(() => {
                this.updateConnectionStatus('connected');
                this.askFirstQuestion();
            }, 2000);
        } catch (error) {
            console.error('Failed to initialize AI agent:', error);
            this.updateConnectionStatus('failed');
        }
    }

    updateConnectionStatus(status) {
        const statusElement = document.querySelector('.connection-status .status-text');
        const statusDot = document.querySelector('.status-dot');
        
        switch (status) {
            case 'connected':
                statusElement.textContent = 'Connected';
                statusDot.classList.add('connected');
                this.isConnected = true;
                break;
            case 'failed':
                statusElement.textContent = 'Connection Failed';
                statusDot.style.background = '#ef4444';
                break;
            default:
                statusElement.textContent = 'Connecting...';
        }
    }

    async askFirstQuestion() {
        if (this.isConnected && this.questions.length > 0) {
            // In a real implementation, this would send the question to the D-ID agent
            // The agent would then speak the question through the video stream
            console.log('AI Agent asking:', this.questions[0].question);
        }
    }
}

// Initialize interview session when page loads
document.addEventListener('DOMContentLoaded', () => {
    new InterviewSession();
});