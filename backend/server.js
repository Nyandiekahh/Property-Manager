import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import tenantRoutes from './routes/tenantRoutes.js';
import landlordRoutes from './routes/landlordRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import admin from 'firebase-admin';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const credentials = require('./config/rental-management-b8516-firebase-adminsdk-fbsvc-43726bc1eb.json');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); // to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies

// Register routes
app.use('/api/tenants', tenantRoutes);
app.use('/api/landlords', landlordRoutes);
app.use('/api/payments', paymentRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Rent Manager API is running...');
});

admin.initializeApp({
  credential: admin.credential.cert(credentials),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password
    });
    res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
      email,
      password,
      returnSecureToken: true
    });
    const { idToken, refreshToken, localId } = response.data;
    res.status(200).json({
      message: 'User signed in successfully',
      uid: localId,
      idToken,
      refreshToken
    });
  } catch (error) {
    const errMsg = error?.response?.data?.error?.message || error.message;
    res.status(401).json({ error: errMsg });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
