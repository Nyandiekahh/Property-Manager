import { getAllTenants } from './tenantController.js';
import { sendEmail } from '../utils/sendEmail.js';
import { db } from '../config/firebaseClient.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const sendRentReminders = async (req, res) => {
  try {
    const tenants = await getAllTenants();
    const remindersSent = [];
    const now = new Date();

    for (const tenant of tenants) {
      const { id: tenantId, email, name, houseNumber, rentDueDate, rentAmount } = tenant;

      const due = new Date(rentDueDate);
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

      // ✅ Only continue if rent is due in 3 days or less
      if (diffDays <= 3 && diffDays >= 0) {
        // ✅ Get payments by this tenant for the current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const paymentsRef = collection(db, 'Payments');
        const q = query(
          paymentsRef,
          where('tenantId', '==', tenantId),
          where('createdAt', '>=', startOfMonth),
          where('status', '==', 'completed')
        );

        const snapshot = await getDocs(q);

        // ✅ Skip if tenant has already paid this month
        if (!snapshot.empty) {
          console.log(`Skipping ${email} — payment already made this month.`);
          continue;
        }

        // ✅ Send reminder
        await sendEmail({
          to: email,
          subject: 'Rent Due Reminder',
          html: `
            <p>Hi ${name},</p>
            <p>This is a friendly reminder that your rent for <strong>House ${houseNumber}</strong> is due on <strong>${due.toDateString()}</strong>, amount <strong>Ksh. ${rentAmount}</strong>.</p>
            <p>Please make payment via M-Pesa Paybill and use your House Number as the account number.</p>
            <p>If you have already made the payment, please ignore this message.</p>
            <p>Thank you,<br/>RentFlow Team</p>
          `
        });

        remindersSent.push(email);
      }
    }

    res.json({ success: true, remindersSent });
  } catch (err) {
    console.error('Error sending rent reminders:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
