const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Initialize SQLite database (persistent)
const db = new Database(path.join(__dirname, 'data.db'));

// Create tables if not exists
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS balances (
  user_id INTEGER PRIMARY KEY,
  balance REAL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  txRef TEXT NOT NULL UNIQUE,
  user_id INTEGER,
  amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);

// Helpers
function getUserByEmail(email) {
  return db.prepare('SELECT id, email, password_hash, created_at FROM users WHERE email = ?').get(email);
}

function createUser(email, passwordHash) {
  const info = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, passwordHash);
  const userId = info.lastInsertRowid;
  db.prepare('INSERT OR IGNORE INTO balances (user_id, balance) VALUES (?, 0)').run(userId);
  return db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(userId);
}

function getBalanceByUserId(userId) {
  const r = db.prepare('SELECT balance FROM balances WHERE user_id = ?').get(userId);
  return r ? r.balance : 0;
}

function creditBalance(userId, amount, txRef) {
  // Idempotent: insert transaction with unique txRef
  try {
    const insert = db.prepare('INSERT INTO transactions (txRef, user_id, amount) VALUES (?, ?, ?)');
    insert.run(txRef, userId, amount);
  } catch (err) {
    if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      // txRef already applied
      return { applied: false };
    }
    throw err;
  }
  db.prepare('UPDATE balances SET balance = balance + ? WHERE user_id = ?').run(amount, userId);
  return { applied: true, newBalance: getBalanceByUserId(userId) };
}

// Routes
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ status: 'error', message: 'email and password required' });
  const existing = getUserByEmail(email);
  if (existing) return res.status(409).json({ status: 'error', message: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const user = createUser(email, hash);
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ status: 'success', user: { id: user.id, email: user.email }, token });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ status: 'error', message: 'email and password required' });
  const user = getUserByEmail(email);
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ status: 'success', user: { id: user.id, email: user.email }, token });
});

// Initiate payment (returns a link to payment-success page similar to your existing flow)
app.post('/api/flutterwave-pay', (req, res) => {
  const { amount, email } = req.body;
  if (!amount || !email) return res.status(400).json({ status: 'error', message: 'amount and email required' });
  const txRef = 'tx-' + Date.now();
  const link = `/payment-success.html?email=${encodeURIComponent(email)}&amount=${encodeURIComponent(amount)}&txRef=${txRef}`;
  return res.json({ status: 'success', data: { link } });
});

// Get balance: supports either query ?email= or authenticated request
app.get('/api/balance', (req, res) => {
  // If Authorization header present, use token
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(auth.slice(7), JWT_SECRET);
      const bal = getBalanceByUserId(payload.id);
      return res.json({ status: 'success', balance: bal });
    } catch (err) {
      return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
  }
  const email = req.query.email;
  if (!email) return res.status(400).json({ status: 'error', message: 'email required' });
  const user = getUserByEmail(email);
  if (!user) return res.json({ status: 'success', balance: 0 });
  const bal = getBalanceByUserId(user.id);
  res.json({ status: 'success', balance: bal });
});

// Credit endpoint: will credit user by email and txRef. Idempotent (txRef unique)
app.post('/api/credit', (req, res) => {
  const { email, amount, txRef } = req.body;
  if (!email || !amount) return res.status(400).json({ status: 'error', message: 'email and amount required' });
  const a = parseFloat(amount);
  if (isNaN(a) || a <= 0) return res.status(400).json({ status: 'error', message: 'invalid amount' });
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'user not found' });
  }
  try {
    const result = creditBalance(user.id, a, txRef || ('tx-' + Date.now()));
    if (!result.applied) {
      return res.json({ status: 'success', message: 'txRef already applied', balance: getBalanceByUserId(user.id) });
    }
    return res.json({ status: 'success', balance: result.newBalance });
  } catch (err) {
    console.error('Error crediting:', err);
    return res.status(500).json({ status: 'error', message: 'internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Database file:', path.join(__dirname, 'data.db'));
});
