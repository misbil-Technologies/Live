const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Routes - Landing page should be served at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// Interview setup page (the one currently showing)
app.get('/interview-setup', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Other routes
app.get('/interview', (req, res) => {
  res.sendFile(path.join(__dirname, 'interview.html'));
});

app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, 'results.html'));
});

app.get('/agents', (req, res) => {
  res.sendFile(path.join(__dirname, 'index-agents.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth/register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard/dashboard.html'));
});

// Start server
app.listen(port, () => {
  console.log(`
🚀 AI Interview Assistant Platform
================================
Server running on: http://localhost:${port}

Available Routes:
- Landing Page: http://localhost:${port}
- Interview Setup: http://localhost:${port}/interview-setup
- Interview Session: http://localhost:${port}/interview
- Results: http://localhost:${port}/results
- Login: http://localhost:${port}/login
- Register: http://localhost:${port}/register
- Dashboard: http://localhost:${port}/dashboard
- Agents Demo: http://localhost:${port}/agents
================================
  `);
});