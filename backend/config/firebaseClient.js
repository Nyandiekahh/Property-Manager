import admin from 'firebase-admin';
import serviceAccount from '../path-to-service-account.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.firestore();

export { db };
