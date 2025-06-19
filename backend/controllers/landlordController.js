// backend/controllers/landlordController.js
import admin from 'firebase-admin';

// GET /api/landlords/notifications
export const getNotifications = async (req, res) => {
  try {
    const uid = req.headers['authorization-uid']; // Expected to be provided securely in headers
    
    if (!uid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - authorization-uid header required' 
      });
    }

    // Get notifications from Firestore
    const snapshot = await admin.firestore()
      .collection('notifications')
      .where('landlordId', '==', uid) // Changed from 'userId' to 'landlordId' for consistency
      .orderBy('createdAt', 'desc')
      .limit(50) // Limit to prevent large responses
      .get();

    const notifications = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        title: data.title || 'Notification',
        message: data.message || 'No message',
        type: data.type || 'info',
        isRead: data.isRead || false,
        createdAt: data.createdAt || new Date(),
        data: data.data || null // Additional data like amounts, tenant names, etc.
      });
    });

    // If no notifications exist, create some sample ones for testing
    if (notifications.length === 0) {
      const sampleNotifications = [
        {
          id: 'sample-1',
          title: 'Welcome to Enhanced Property Management',
          message: 'Your enhanced property management system is ready to use!',
          type: 'success',
          isRead: false,
          createdAt: new Date(),
          data: null
        },
        {
          id: 'sample-2',
          title: 'Payment System Ready',
          message: 'M-Pesa integration is configured and ready for payments',
          type: 'info',
          isRead: false,
          createdAt: new Date(),
          data: null
        }
      ];
      
      return res.json({ 
        success: true, 
        data: sampleNotifications,
        count: sampleNotifications.length,
        message: 'Sample notifications (no real notifications found)'
      });
    }

    res.json({ 
      success: true, 
      data: notifications,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.isRead).length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch notifications'
    });
  }
};

// PATCH /api/landlords/notifications/:id/read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const uid = req.headers['authorization-uid'];
    
    if (!uid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - authorization-uid header required' 
      });
    }

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        error: 'Notification ID is required'
      });
    }

    // Update notification in Firestore
    const notificationRef = admin.firestore().collection('notifications').doc(notificationId);
    
    // Check if notification exists and belongs to user
    const notificationDoc = await notificationRef.get();
    if (!notificationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    const notificationData = notificationDoc.data();
    if (notificationData.landlordId !== uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this notification'
      });
    }

    // Mark as read
    await notificationRef.update({
      isRead: true,
      readAt: new Date()
    });

    res.json({ 
      success: true, 
      message: 'Notification marked as read',
      data: { id: notificationId, isRead: true }
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to mark notification as read'
    });
  }
};

// PUT /api/landlords/password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const uid = req.headers['authorization-uid'];
    
    if (!uid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - authorization-uid header required' 
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password and new password are required' 
      });
    }

    // Password validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    // Get user details
    const user = await admin.auth().getUser(uid);
    const email = user.email;

    // Verify current password using Firebase REST API
    const verifyResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password: currentPassword, 
          returnSecureToken: true 
        })
      }
    );

    if (!verifyResponse.ok) {
      return res.status(401).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }

    // Update password
    await admin.auth().updateUser(uid, { password: newPassword });
    
    res.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update password'
    });
  }
};

// GET /api/landlords/profile
export const getProfile = async (req, res) => {
  try {
    const uid = req.headers['authorization-uid'];
    
    if (!uid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - authorization-uid header required' 
      });
    }

    // Get user from Firebase Auth
    const user = await admin.auth().getUser(uid);
    
    // Get additional profile data from Firestore if it exists
    const profileDoc = await admin.firestore()
      .collection('landlords')
      .doc(uid)
      .get();

    const profileData = profileDoc.exists ? profileDoc.data() : {};

    const profile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || profileData.name || user.email?.split('@')[0],
      photoURL: user.photoURL || profileData.photoURL || null,
      phoneNumber: user.phoneNumber || profileData.phoneNumber || null,
      emailVerified: user.emailVerified,
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime,
      // Additional profile data from Firestore
      ...profileData
    };

    res.json({
      success: true,
      data: profile,
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch profile'
    });
  }
};

// Helper function to create notification
export const createNotification = async (landlordId, notificationData) => {
  try {
    const notification = {
      landlordId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      isRead: false,
      createdAt: new Date(),
      data: notificationData.data || null
    };

    const notificationRef = await admin.firestore()
      .collection('notifications')
      .add(notification);

    return { success: true, id: notificationRef.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
};