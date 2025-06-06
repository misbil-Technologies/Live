const express = require('express');
const http = require('http');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root directory
app.use(express.static(__dirname));

// Session configuration
app.use(session({
  secret: 'misbil-ai-interview-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// In-memory database (replace with real database in production)
const users = new Map();
const interviews = new Map();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.session.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, 'misbil-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Routes

// Landing page (main homepage) - NEW PROFESSIONAL LANDING PAGE
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// Interview setup page (original functionality)
app.get('/interview-setup', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Interview session page
app.get('/interview', (req, res) => {
  res.sendFile(path.join(__dirname, 'interview.html'));
});

// Interview results page
app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, 'results.html'));
});

// Agents demo page
app.get('/agents', (req, res) => {
  res.sendFile(path.join(__dirname, 'index-agents.html'));
});

// WebSocket streaming demo
app.get('/ws-streaming', (req, res) => {
  res.sendFile(path.join(__dirname, 'index-ws.html'));
});

// Authentication pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth/register.html'));
});

// Dashboard (protected)
app.get('/dashboard', (req, res) => {
  if (!req.session.token) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'dashboard/dashboard.html'));
});

// Protected interview pages
app.get('/interview-session', (req, res) => {
  if (!req.session.token) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'interview.html'));
});

app.get('/interview-results', (req, res) => {
  if (!req.session.token) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'results.html'));
});

// API Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, company } = req.body;

    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      company: company || '',
      createdAt: new Date().toISOString(),
      subscription: 'free',
      interviewsRemaining: 3
    };

    users.set(email, user);

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'misbil-secret-key',
      { expiresIn: '24h' }
    );

    req.session.token = token;

    res.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'misbil-secret-key',
      { expiresIn: '24h' }
    );

    req.session.token = token;

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        subscription: user.subscription,
        interviewsRemaining: user.interviewsRemaining
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// Get user profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = users.get(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    company: user.company,
    subscription: user.subscription,
    interviewsRemaining: user.interviewsRemaining,
    createdAt: user.createdAt
  });
});

// Get user interviews
app.get('/api/user/interviews', authenticateToken, (req, res) => {
  const userInterviews = Array.from(interviews.values())
    .filter(interview => interview.userId === req.user.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userInterviews);
});

// Create interview session
app.post('/api/interviews/create', authenticateToken, (req, res) => {
  try {
    const user = users.get(req.user.email);
    
    if (user.interviewsRemaining <= 0 && user.subscription === 'free') {
      return res.status(403).json({ 
        error: 'Interview limit reached. Please upgrade your subscription.' 
      });
    }

    const { domain, settings, resumeData } = req.body;

    const interview = {
      id: uuidv4(),
      userId: req.user.userId,
      domain,
      settings,
      resumeData,
      status: 'created',
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      results: null
    };

    interviews.set(interview.id, interview);

    // Decrease remaining interviews for free users
    if (user.subscription === 'free') {
      user.interviewsRemaining--;
      users.set(req.user.email, user);
    }

    res.json({
      message: 'Interview session created',
      interview: interview
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating interview session' });
  }
});

// Start interview
app.post('/api/interviews/:id/start', authenticateToken, (req, res) => {
  const interview = interviews.get(req.params.id);
  
  if (!interview || interview.userId !== req.user.userId) {
    return res.status(404).json({ error: 'Interview not found' });
  }

  interview.status = 'in-progress';
  interview.startedAt = new Date().toISOString();
  interviews.set(interview.id, interview);

  res.json({ message: 'Interview started', interview });
});

// Complete interview
app.post('/api/interviews/:id/complete', authenticateToken, (req, res) => {
  const interview = interviews.get(req.params.id);
  
  if (!interview || interview.userId !== req.user.userId) {
    return res.status(404).json({ error: 'Interview not found' });
  }

  const { results } = req.body;

  interview.status = 'completed';
  interview.completedAt = new Date().toISOString();
  interview.results = results;
  interviews.set(interview.id, interview);

  res.json({ message: 'Interview completed', interview });
});

// Upload resume
app.post('/api/resume/upload', authenticateToken, upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Mock resume analysis (replace with actual AI analysis)
    const analysis = {
      experienceLevel: 'Mid-level (3-5 years)',
      keySkills: 'JavaScript, React, Node.js, Python',
      suggestedDomain: 'Software Engineering',
      suggestedDomainKey: 'software-engineering'
    };

    res.json({
      message: 'Resume uploaded successfully',
      file: {
        name: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      },
      analysis
    });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading resume' });
  }
});

// Create default admin user
const createDefaultUsers = async () => {
  if (!users.has('admin@misbil.com')) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    users.set('admin@misbil.com', {
      id: uuidv4(),
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@misbil.com',
      password: hashedPassword,
      company: 'Misbil Technologies',
      createdAt: new Date().toISOString(),
      subscription: 'enterprise',
      interviewsRemaining: 999
    });
  }

  // Demo user
  if (!users.has('demo@example.com')) {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    users.set('demo@example.com', {
      id: uuidv4(),
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      password: hashedPassword,
      company: 'Demo Company',
      createdAt: new Date().toISOString(),
      subscription: 'free',
      interviewsRemaining: 3
    });
  }
};

const server = http.createServer(app);

server.listen(port, async () => {
  await createDefaultUsers();
  console.log(`
🚀 Misbil AI Interview Assistant SaaS Platform
===============================================
Server running on: http://localhost:${port}

Available Routes:
- Landing Page: http://localhost:${port}
- Login: http://localhost:${port}/login
- Register: http://localhost:${port}/register
- Dashboard: http://localhost:${port}/dashboard
- Interview Setup: http://localhost:${port}/interview-setup
- Agents Demo: http://localhost:${port}/agents
- WebSocket Demo: http://localhost:${port}/ws-streaming

Demo Credentials:
- Email: demo@example.com
- Password: demo123

Admin Credentials:
- Email: admin@misbil.com
- Password: admin123
===============================================
  `);
});