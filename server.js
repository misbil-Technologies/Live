const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// IMPORTANT: Landing page should be served at root
app.get('/', (req, res) => {
  console.log('Serving landing page at root /');
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// Interview setup page (the old index.html)
app.get('/interview-setup', (req, res) => {
  console.log('Serving interview setup page');
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

// Catch all other routes and redirect to landing
app.get('*', (req, res) => {
  console.log(`Unknown route ${req.path}, redirecting to landing page`);
  res.redirect('/');
});

// Start server
app.listen(port, () => {
  console.log(`
🚀 AI Interview Assistant Platform
================================
Server running on: http://localhost:${port}

IMPORTANT: Root URL serves the NEW landing page!
- Landing Page (NEW): http://localhost:${port}
- Interview Setup (OLD): http://localhost:${port}/interview-setup
- Interview Session: http://localhost:${port}/interview
- Results: http://localhost:${port}/results
- Login: http://localhost:${port}/login
- Register: http://localhost:${port}/register
- Dashboard: http://localhost:${port}/dashboard
- Agents Demo: http://localhost:${port}/agents
================================
  `);
});