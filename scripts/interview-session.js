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
        this.DID_API = null;
        this.statsIntervalId = null;
        this.lastBytesReceived = 0;
        this.videoIsPlaying = false;
        this.isStreamReady = false;
        
        this.init();
    }

    async init() {
        await this.loadDIDAPI();
        this.loadSessionData();
        this.setupUI();
        this.setupAudioRecording();
        await this.initializeAIAgent();
        this.startTimer();
    }

    async loadDIDAPI() {
        try {
            const response = await fetch('./api.json');
            this.DID_API = await response.json();
            
            if (this.DID_API.key === '🤫') {
                alert('Please put your D-ID API key inside ./api.json and restart the application');
                return;
            }
        } catch (error) {
            console.error('Failed to load D-ID API configuration:', error);
            alert('Please ensure api.json file exists with your D-ID API key');
        }
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
        
        // Set up video elements
        const idleVideo = document.getElementById('idle-video-element');
        const streamVideo = document.getElementById('stream-video-element');
        idleVideo.setAttribute('playsinline', '');
        streamVideo.setAttribute('playsinline', '');
        
        // Play idle video initially
        this.playIdleVideo();
    }

    generateQuestions() {
        const questionSets = {
            'data-science': [
                {
                    question: "Hello! Welcome to your Data Science interview. I'm Emma, your AI interviewer. Let's start with a fundamental question: Can you explain the difference between supervised and unsupervised learning, and provide examples of algorithms for each?",
                    context: "This tests fundamental ML knowledge",
                    expectedDuration: 180
                },
                {
                    question: "Great! Now, how would you handle missing data in a dataset? Walk me through your approach step by step.",
                    context: "Data preprocessing skills",
                    expectedDuration: 150
                },
                {
                    question: "Excellent. Can you describe a time when you had to explain a complex data science concept to a non-technical stakeholder? How did you approach it?",
                    context: "Communication skills",
                    expectedDuration: 120
                },
                {
                    question: "Perfect. Now let's talk about model validation. What is overfitting and how would you prevent it in your models?",
                    context: "Model validation understanding",
                    expectedDuration: 180
                },
                {
                    question: "Very good. How would you approach feature selection for a machine learning project? What techniques would you use?",
                    context: "Feature engineering skills",
                    expectedDuration: 150
                },
                {
                    question: "Finally, can you explain the bias-variance tradeoff and its implications for model performance?",
                    context: "Advanced ML concepts",
                    expectedDuration: 200
                }
            ],
            'software-engineering': [
                {
                    question: "Welcome to your Software Engineering interview! I'm Emma. Let's begin: Can you explain the SOLID principles and how they improve code quality?",
                    context: "Software design principles",
                    expectedDuration: 180
                },
                {
                    question: "Excellent! Now, how would you design a URL shortener like bit.ly? Walk me through your system architecture.",
                    context: "System design skills",
                    expectedDuration: 300
                },
                {
                    question: "Great approach! What's the difference between SQL and NoSQL databases? When would you use each?",
                    context: "Database knowledge",
                    expectedDuration: 150
                },
                {
                    question: "Perfect. Describe your approach to debugging a performance issue in a web application.",
                    context: "Problem-solving skills",
                    expectedDuration: 180
                },
                {
                    question: "Very thorough! How do you ensure code quality in a team environment?",
                    context: "Development practices",
                    expectedDuration: 120
                }
            ],
            'product-management': [
                {
                    question: "Hello and welcome! I'm Emma, your interviewer for this Product Management session. Let's start: How would you prioritize features for a new product release?",
                    context: "Product strategy",
                    expectedDuration: 180
                },
                {
                    question: "Great strategy! Can you describe a time when you had to make a difficult product decision with limited data?",
                    context: "Decision-making skills",
                    expectedDuration: 150
                },
                {
                    question: "Excellent decision-making process! How would you measure the success of a new feature launch?",
                    context: "Metrics and analytics",
                    expectedDuration: 120
                },
                {
                    question: "Perfect metrics approach! Walk me through how you would conduct user research for a mobile app.",
                    context: "User research skills",
                    expectedDuration: 180
                }
            ],
            'marketing': [
                {
                    question: "Welcome to your Digital Marketing interview! I'm Emma. Let's dive in: How would you develop a go-to-market strategy for a new SaaS product?",
                    context: "Marketing strategy",
                    expectedDuration: 200
                },
                {
                    question: "Excellent strategy! Now, explain how you would measure the ROI of a digital marketing campaign.",
                    context: "Analytics and measurement",
                    expectedDuration: 150
                },
                {
                    question: "Great analytical approach! Describe your approach to building brand awareness for a startup.",
                    context: "Brand marketing",
                    expectedDuration: 180
                }
            ],
            'finance': [
                {
                    question: "Hello! Welcome to your Finance interview. I'm Emma, and I'll be conducting your session today. Let's start: Walk me through a DCF model and its key assumptions.",
                    context: "Financial modeling",
                    expectedDuration: 200
                },
                {
                    question: "Excellent modeling knowledge! How would you evaluate the financial health of a company?",
                    context: "Financial analysis",
                    expectedDuration: 180
                },
                {
                    question: "Great analysis approach! Explain the concept of risk-adjusted returns and how you would calculate them.",
                    context: "Investment analysis",
                    expectedDuration: 150
                }
            ],
            'consulting': [
                {
                    question: "Welcome to your Management Consulting interview! I'm Emma. Here's your first case: A retail client is experiencing declining sales. How would you approach this problem?",
                    context: "Case study analysis",
                    expectedDuration: 300
                },
                {
                    question: "Excellent problem-solving approach! How would you help a client decide whether to enter a new market?",
                    context: "Strategic thinking",
                    expectedDuration: 250
                },
                {
                    question: "Great strategic framework! Describe a time when you had to manage a difficult client relationship.",
                    context: "Client management",
                    expectedDuration: 150
                }
            ]
        };

        const domainQuestions = questionSets[this.sessionData.domain] || questionSets['data-science'];
        const duration = parseInt(this.sessionData.settings.duration);
        const questionsCount = Math.ceil(duration / 5);
        
        this.questions = domainQuestions.slice(0, Math.min(questionsCount, domainQuestions.length));
        this.displayCurrentQuestion();
    }

    displayCurrentQuestion() {
        if (this.currentQuestionIndex < this.questions.length) {
            const question = this.questions[this.currentQuestionIndex];
            document.getElementById('current-question').textContent = question.question;
            document.getElementById('question-context').textContent = question.context;
            
            // Ask the question through the AI avatar
            if (this.isConnected) {
                this.askQuestionThroughAvatar(question.question);
            }
        } else {
            this.completeInterview();
        }
    }

    async askQuestionThroughAvatar(questionText) {
        if (!this.isConnected || !this.streamId || !this.sessionId) {
            console.log('Avatar not connected, cannot ask question');
            return;
        }

        try {
            const response = await this.fetchWithRetries(`${this.DID_API.url}/${this.DID_API.service}/streams/${this.streamId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${this.DID_API.key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    script: {
                        type: 'text',
                        provider: { type: 'microsoft', voice_id: 'en-US-JennyMultilingualV2Neural' },
                        input: questionText,
                        ssml: false
                    },
                    config: { stitch: true },
                    session_id: this.sessionId,
                }),
            });

            if (response.ok) {
                console.log('Question sent to avatar successfully');
                // Enable recording after avatar starts speaking
                setTimeout(() => {
                    document.getElementById('start-recording-btn').disabled = false;
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to send question to avatar:', error);
        }
    }

    updateQuestionCounter() {
        const counter = document.getElementById('question-counter');
        counter.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        
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
        
        document.getElementById('start-recording-btn').disabled = true;
        document.getElementById('stop-recording-btn').disabled = false;
        document.getElementById('recording-indicator').classList.add('active');
        document.querySelector('.transcription-text').textContent = 'Recording in progress...';
        
        this.audioLevelUpdater();
        
        this.recordingTimeout = setTimeout(() => {
            if (this.isRecording) {
                this.stopRecording();
            }
        }, 300000);
    }

    stopRecording() {
        if (!this.isRecording) return;
        
        this.mediaRecorder.stop();
        this.isRecording = false;
        
        if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
        }
        
        document.getElementById('start-recording-btn').disabled = false;
        document.getElementById('stop-recording-btn').disabled = true;
        document.getElementById('recording-indicator').classList.remove('active');
        document.querySelector('.transcription-text').textContent = 'Processing your response...';
    }

    processRecording() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        
        const response = {
            questionIndex: this.currentQuestionIndex,
            question: this.questions[this.currentQuestionIndex],
            audioBlob: audioBlob,
            timestamp: new Date().toISOString(),
            duration: this.audioChunks.length
        };
        
        this.responses.push(response);
        
        setTimeout(() => {
            const mockTranscription = this.generateMockTranscription();
            document.querySelector('.transcription-text').textContent = mockTranscription;
            
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
            document.querySelector('.transcription-text').textContent = 'Ready for the next question. The AI interviewer will ask you the next question shortly.';
        } else {
            this.completeInterview();
        }
    }

    completeInterview() {
        const endTime = new Date();
        const duration = Math.round((endTime - this.startTime) / 1000 / 60);
        
        const results = {
            sessionData: this.sessionData,
            responses: this.responses,
            duration: duration,
            completedAt: endTime.toISOString(),
            overallScore: this.calculateOverallScore()
        };
        
        localStorage.setItem('interviewResults', JSON.stringify(results));
        
        // Thank the candidate through avatar
        if (this.isConnected) {
            this.askQuestionThroughAvatar("Thank you for completing the interview! You did a great job. Your results are being processed and you'll see your detailed feedback shortly.");
        }
        
        setTimeout(() => {
            window.location.href = '/results';
        }, 5000);
    }

    calculateOverallScore() {
        const baseScore = 70 + Math.random() * 25;
        return Math.round(baseScore);
    }

    startTimer() {
        const duration = parseInt(this.sessionData.settings.duration) * 60;
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

    // D-ID Integration methods
    async initializeAIAgent() {
        if (!this.DID_API) {
            console.error('D-ID API not loaded');
            this.updateConnectionStatus('failed');
            return;
        }

        try {
            this.updateConnectionStatus('connecting');
            
            // Create stream
            const sessionResponse = await this.fetchWithRetries(`${this.DID_API.url}/${this.DID_API.service}/streams`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${this.DID_API.key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Emma_f/v1_image.jpeg',
                    stream_warmup: true
                }),
            });

            const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json();
            this.streamId = newStreamId;
            this.sessionId = newSessionId;

            // Create peer connection
            await this.createPeerConnection(offer, iceServers);

            // Send SDP answer
            const sdpResponse = await fetch(`${this.DID_API.url}/${this.DID_API.service}/streams/${this.streamId}/sdp`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${this.DID_API.key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answer: this.sessionClientAnswer,
                    session_id: this.sessionId,
                }),
            });

            console.log('D-ID stream initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize AI agent:', error);
            this.updateConnectionStatus('failed');
        }
    }

    async createPeerConnection(offer, iceServers) {
        const RTCPeerConnection = (
            window.RTCPeerConnection ||
            window.webkitRTCPeerConnection ||
            window.mozRTCPeerConnection
        ).bind(window);

        if (!this.peerConnection) {
            this.peerConnection = new RTCPeerConnection({ iceServers });
            this.peerConnection.addEventListener('icegatheringstatechange', this.onIceGatheringStateChange.bind(this), true);
            this.peerConnection.addEventListener('icecandidate', this.onIceCandidate.bind(this), true);
            this.peerConnection.addEventListener('iceconnectionstatechange', this.onIceConnectionStateChange.bind(this), true);
            this.peerConnection.addEventListener('connectionstatechange', this.onConnectionStateChange.bind(this), true);
            this.peerConnection.addEventListener('signalingstatechange', this.onSignalingStateChange.bind(this), true);
            this.peerConnection.addEventListener('track', this.onTrack.bind(this), true);
        }

        await this.peerConnection.setRemoteDescription(offer);
        console.log('Set remote SDP OK');

        this.sessionClientAnswer = await this.peerConnection.createAnswer();
        console.log('Create local SDP OK');

        await this.peerConnection.setLocalDescription(this.sessionClientAnswer);
        console.log('Set local SDP OK');

        return this.sessionClientAnswer;
    }

    onIceGatheringStateChange() {
        console.log('ICE gathering state:', this.peerConnection.iceGatheringState);
    }

    onIceCandidate(event) {
        if (event.candidate) {
            const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
            fetch(`${this.DID_API.url}/${this.DID_API.service}/streams/${this.streamId}/ice`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${this.DID_API.key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    candidate,
                    sdpMid,
                    sdpMLineIndex,
                    session_id: this.sessionId,
                }),
            });
        }
    }

    onIceConnectionStateChange() {
        console.log('ICE connection state:', this.peerConnection.iceConnectionState);
        document.getElementById('ice-status-label').textContent = this.peerConnection.iceConnectionState;
        
        if (this.peerConnection.iceConnectionState === 'failed' || this.peerConnection.iceConnectionState === 'closed') {
            this.stopAllStreams();
            this.closePC();
        }
    }

    onConnectionStateChange() {
        console.log('Peer connection state:', this.peerConnection.connectionState);
        document.getElementById('peer-status-label').textContent = this.peerConnection.connectionState;
        
        if (this.peerConnection.connectionState === 'connected') {
            this.updateConnectionStatus('connected');
            this.playIdleVideo();
            
            // Send welcome message
            setTimeout(() => {
                const welcomeMessage = `Hello! Welcome to your ${this.sessionData.domain.replace('-', ' ')} interview. I'm Emma, your AI interviewer. Are you ready to begin? I'll be asking you ${this.questions.length} questions today.`;
                this.askQuestionThroughAvatar(welcomeMessage);
                
                // Show first question after welcome
                setTimeout(() => {
                    this.displayCurrentQuestion();
                }, 8000);
            }, 3000);
        }
    }

    onSignalingStateChange() {
        console.log('Signaling state:', this.peerConnection.signalingState);
    }

    onTrack(event) {
        if (!event.track) return;

        this.statsIntervalId = setInterval(async () => {
            const stats = await this.peerConnection.getStats(event.track);
            stats.forEach((report) => {
                if (report.type === 'inbound-rtp' && report.kind === 'video') {
                    const videoStatusChanged = this.videoIsPlaying !== report.bytesReceived > this.lastBytesReceived;

                    if (videoStatusChanged) {
                        this.videoIsPlaying = report.bytesReceived > this.lastBytesReceived;
                        this.onVideoStatusChange(this.videoIsPlaying, event.streams[0]);
                    }
                    this.lastBytesReceived = report.bytesReceived;
                }
            });
        }, 500);
    }

    onVideoStatusChange(videoIsPlaying, stream) {
        let status;
        if (videoIsPlaying) {
            status = 'streaming';
            this.setStreamVideoElement(stream);
        } else {
            status = 'empty';
            this.playIdleVideo();
        }

        document.getElementById('streaming-status-label').textContent = status;
    }

    setStreamVideoElement(stream) {
        if (!stream) return;

        const streamVideo = document.getElementById('stream-video-element');
        const idleVideo = document.getElementById('idle-video-element');
        
        streamVideo.srcObject = stream;
        streamVideo.loop = false;
        streamVideo.muted = false;
        
        // Show stream video, hide idle
        streamVideo.style.opacity = '1';
        idleVideo.style.opacity = '0';

        if (streamVideo.paused) {
            streamVideo.play().catch(e => console.log('Video play error:', e));
        }
    }

    playIdleVideo() {
        const idleVideo = document.getElementById('idle-video-element');
        const streamVideo = document.getElementById('stream-video-element');
        
        idleVideo.src = 'emma_idle.mp4';
        idleVideo.loop = true;
        idleVideo.muted = true;
        
        // Show idle video, hide stream
        idleVideo.style.opacity = '1';
        streamVideo.style.opacity = '0';
        
        if (idleVideo.paused) {
            idleVideo.play().catch(e => console.log('Idle video play error:', e));
        }
    }

    stopAllStreams() {
        const streamVideo = document.getElementById('stream-video-element');
        if (streamVideo.srcObject) {
            console.log('Stopping video streams');
            streamVideo.srcObject.getTracks().forEach((track) => track.stop());
            streamVideo.srcObject = null;
        }
    }

    closePC() {
        if (!this.peerConnection) return;
        
        console.log('Stopping peer connection');
        this.peerConnection.close();
        clearInterval(this.statsIntervalId);
        this.peerConnection = null;
    }

    updateConnectionStatus(status) {
        const statusElement = document.querySelector('.connection-status .status-text');
        const statusDot = document.querySelector('.status-dot');
        
        switch (status) {
            case 'connecting':
                statusElement.textContent = 'Connecting...';
                statusDot.classList.remove('connected');
                break;
            case 'connected':
                statusElement.textContent = 'Connected';
                statusDot.classList.add('connected');
                this.isConnected = true;
                break;
            case 'failed':
                statusElement.textContent = 'Connection Failed';
                statusDot.style.background = '#ef4444';
                break;
        }
    }

    async fetchWithRetries(url, options, retries = 1) {
        const maxRetryCount = 3;
        const maxDelaySec = 4;
        
        try {
            return await fetch(url, options);
        } catch (err) {
            if (retries <= maxRetryCount) {
                const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));
                console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
                return this.fetchWithRetries(url, options, retries + 1);
            } else {
                throw new Error(`Max retries exceeded. error: ${err}`);
            }
        }
    }
}

// Initialize interview session when page loads
document.addEventListener('DOMContentLoaded', () => {
    new InterviewSession();
});