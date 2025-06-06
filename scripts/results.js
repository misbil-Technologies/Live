class ResultsDisplay {
    constructor() {
        this.resultsData = null;
        this.init();
    }

    init() {
        this.loadResults();
        this.displayResults();
        this.bindEvents();
    }

    loadResults() {
        const resultsStr = localStorage.getItem('interviewResults');
        if (!resultsStr) {
            alert('No results found. Redirecting to home page.');
            window.location.href = '/';
            return;
        }
        
        this.resultsData = JSON.parse(resultsStr);
    }

    displayResults() {
        this.displayHeader();
        this.displayOverallScore();
        this.displayDetailedFeedback();
        this.displayRecommendations();
    }

    displayHeader() {
        const domainElement = document.getElementById('domain-completed');
        const timeElement = document.getElementById('completion-time');
        
        domainElement.textContent = this.resultsData.sessionData.domain
            .replace('-', ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        
        timeElement.textContent = `Completed in ${this.resultsData.duration} minutes`;
    }

    displayOverallScore() {
        const scoreElement = document.getElementById('overall-score');
        const score = this.resultsData.overallScore;
        
        // Animate score counting up
        let currentScore = 0;
        const increment = score / 50; // 50 steps
        
        const countUp = setInterval(() => {
            currentScore += increment;
            if (currentScore >= score) {
                currentScore = score;
                clearInterval(countUp);
            }
            scoreElement.textContent = Math.round(currentScore);
        }, 30);

        // Update breakdown scores
        this.updateBreakdownScores(score);
    }

    updateBreakdownScores(overallScore) {
        const breakdowns = [
            { label: 'Technical Knowledge', score: overallScore + Math.random() * 10 - 5 },
            { label: 'Communication', score: overallScore + Math.random() * 10 - 5 },
            { label: 'Problem Solving', score: overallScore + Math.random() * 10 - 5 },
            { label: 'Confidence', score: overallScore + Math.random() * 10 - 5 }
        ];

        breakdowns.forEach((breakdown, index) => {
            const score = Math.max(0, Math.min(100, Math.round(breakdown.score)));
            const fillElement = document.querySelectorAll('.breakdown-fill')[index];
            const scoreElement = document.querySelectorAll('.breakdown-score')[index];
            
            // Animate bar fill
            setTimeout(() => {
                fillElement.style.width = `${score}%`;
                scoreElement.textContent = `${score}%`;
            }, index * 200);
        });
    }

    displayDetailedFeedback() {
        const questionsContainer = document.getElementById('questions-feedback');
        
        this.resultsData.responses.forEach((response, index) => {
            const questionElement = this.createQuestionResult(response, index);
            questionsContainer.appendChild(questionElement);
        });
    }

    createQuestionResult(response, index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-result';
        
        const score = 70 + Math.random() * 25; // Mock score
        const feedback = this.generateFeedback(response.question, score);
        
        questionDiv.innerHTML = `
            <div class="question-header">
                <div class="question-title">Q${index + 1}: ${response.question.question}</div>
                <div class="question-score">${Math.round(score)}%</div>
            </div>
            <div class="question-feedback">${feedback}</div>
        `;
        
        return questionDiv;
    }

    generateFeedback(question, score) {
        const feedbackTemplates = {
            high: [
                "Excellent response! You demonstrated strong understanding and provided clear, well-structured examples.",
                "Outstanding answer. Your explanation was comprehensive and showed deep knowledge of the subject.",
                "Great job! You effectively communicated complex concepts and provided relevant real-world applications."
            ],
            medium: [
                "Good response overall. You showed solid understanding, though some areas could be expanded upon.",
                "Decent answer with good foundational knowledge. Consider providing more specific examples next time.",
                "You're on the right track. Your explanation was clear but could benefit from more detailed examples."
            ],
            low: [
                "Your response touched on key points but lacked depth. Consider studying this topic more thoroughly.",
                "Basic understanding demonstrated, but the explanation could be more comprehensive and detailed.",
                "You showed some knowledge but missed several important aspects. More preparation would be beneficial."
            ]
        };
        
        let category;
        if (score >= 85) category = 'high';
        else if (score >= 70) category = 'medium';
        else category = 'low';
        
        const templates = feedbackTemplates[category];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    displayRecommendations() {
        const domain = this.resultsData.sessionData.domain;
        const score = this.resultsData.overallScore;
        
        const recommendations = this.getRecommendations(domain, score);
        
        document.getElementById('strengths-list').innerHTML = 
            recommendations.strengths.map(item => `<li>${item}</li>`).join('');
        
        document.getElementById('improvements-list').innerHTML = 
            recommendations.improvements.map(item => `<li>${item}</li>`).join('');
        
        document.getElementById('resources-list').innerHTML = 
            recommendations.resources.map(item => `<li>${item}</li>`).join('');
    }

    getRecommendations(domain, score) {
        const recommendations = {
            'data-science': {
                strengths: [
                    'Strong technical foundation in machine learning algorithms',
                    'Clear explanation of complex statistical concepts',
                    'Good understanding of data preprocessing techniques',
                    'Effective use of real-world examples'
                ],
                improvements: [
                    'Practice explaining statistical concepts more concisely',
                    'Work on confidence when discussing advanced topics',
                    'Prepare more specific examples from past projects',
                    'Improve knowledge of latest ML frameworks'
                ],
                resources: [
                    'Review "Hands-On Machine Learning" by Aurélien Géron',
                    'Practice coding problems on Kaggle and LeetCode',
                    'Take Andrew Ng\'s Machine Learning course on Coursera',
                    'Join data science communities on Reddit and Discord'
                ]
            },
            'software-engineering': {
                strengths: [
                    'Solid understanding of software design principles',
                    'Good knowledge of system architecture concepts',
                    'Clear problem-solving approach',
                    'Understanding of development best practices'
                ],
                improvements: [
                    'Practice more system design problems',
                    'Strengthen knowledge of distributed systems',
                    'Work on explaining trade-offs more clearly',
                    'Improve understanding of scalability concepts'
                ],
                resources: [
                    'Read "Designing Data-Intensive Applications" by Martin Kleppmann',
                    'Practice on LeetCode and System Design Primer',
                    'Study cloud architecture patterns',
                    'Join engineering communities and forums'
                ]
            }
            // Add more domains as needed
        };
        
        return recommendations[domain] || recommendations['data-science'];
    }

    bindEvents() {
        document.getElementById('download-report-btn').addEventListener('click', () => {
            this.downloadReport();
        });
        
        document.getElementById('retake-interview-btn').addEventListener('click', () => {
            if (confirm('This will start a new interview session. Continue?')) {
                localStorage.removeItem('interviewResults');
                window.location.href = '/interview';
            }
        });
        
        document.getElementById('new-domain-btn').addEventListener('click', () => {
            localStorage.removeItem('interviewResults');
            localStorage.removeItem('currentSession');
            window.location.href = '/';
        });
    }

    downloadReport() {
        const reportData = {
            candidate: 'Interview Candidate',
            date: new Date().toLocaleDateString(),
            domain: this.resultsData.sessionData.domain,
            duration: this.resultsData.duration,
            overallScore: this.resultsData.overallScore,
            responses: this.resultsData.responses.length,
            recommendations: this.getRecommendations(
                this.resultsData.sessionData.domain, 
                this.resultsData.overallScore
            )
        };
        
        const reportText = this.generateReportText(reportData);
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateReportText(data) {
        return `
AI INTERVIEW ASSISTANT - DETAILED REPORT
========================================

Candidate: ${data.candidate}
Date: ${data.date}
Domain: ${data.domain.replace('-', ' ').toUpperCase()}
Duration: ${data.duration} minutes
Questions Answered: ${data.responses}

OVERALL PERFORMANCE
==================
Overall Score: ${data.overallScore}%

STRENGTHS
=========
${data.recommendations.strengths.map(item => `• ${item}`).join('\n')}

AREAS FOR IMPROVEMENT
====================
${data.recommendations.improvements.map(item => `• ${item}`).join('\n')}

RECOMMENDED RESOURCES
====================
${data.recommendations.resources.map(item => `• ${item}`).join('\n')}

Generated by AI Interview Assistant
Report Date: ${new Date().toISOString()}
        `.trim();
    }
}

// Initialize results display when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ResultsDisplay();
});