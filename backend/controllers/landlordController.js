import admin from 'firebase-admin';

// GET /api/landlords/notifications
export const getNotifications = async (req, res) => {
  const uid = req.headers['authorization-uid']; // Expected to be provided securely in headers
  if (!uid) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const snapshot = await admin.firestore()
      .collection('notifications')
      .where('userId', '==', uid)
      .orderBy('timestamp', 'desc')
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/landlords/notifications/:id/read
export const markNotificationAsRead = async (req, res) => {
  const notificationId = req.params.id;
  try {
    await admin.firestore().collection('notifications').doc(notificationId).update({
      read: true
    });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/landlords/password
export const updatePassword = async (req, res) => {
  const { uid, currentPassword, newPassword } = req.body;
  if (!uid || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'All fields required' });
  }

  try {
    const user = await admin.auth().getUser(uid);
    const email = user.email;

    // Verify current password using Firebase REST API
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: currentPassword, returnSecureToken: true })
      }
    );

    if (!verifyRes.ok) {
      return res.status(401).json({ success: false, error: 'Current password incorrect' });
    }

    await admin.auth().updateUser(uid, { password: newPassword });
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/landlords/profile
export const getProfile = async (req, res) => {
  const uid = req.headers['authorization-uid']; // Expected to be passed securely
  if (!uid) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const user = await admin.auth().getUser(uid);
    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
