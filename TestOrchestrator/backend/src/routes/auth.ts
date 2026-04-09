import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../services/db';
import crypto from 'crypto';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Valid Name, Email, and minimum 6-char password required.' });
    }

    // Check if user exists
    const existingResult = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists with this email.' });
    }

    // Hash Password & Save User
    const hash = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();
    
    await sql`INSERT INTO users (id, name, email, password_hash) VALUES (${userId}, ${name}, ${email}, ${hash})`;

    // Create empty integration record
    await sql`INSERT INTO user_integrations (user_id) VALUES (${userId})`;

    // Generate JWT
    const token = jwt.sign({ userId, email, name }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ message: 'User created successfully', token, user: { name, email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    
    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ message: 'Login successful', token, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
