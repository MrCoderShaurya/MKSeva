import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shauryaomm@gmail.com',
    pass: 'jgqjmxyhctodgqdg'
  }
});

// Send approval email
app.post('/api/send-approval', async (req, res) => {
  const { userEmail, userName, eventName, eventDate, department, role, depinc, depphno, r_id } = req.body;

  const mailOptions = {
    from: 'shauryaomm@gmail.com',
    to: userEmail,
    subject: `Registration Approved - ${eventName}`,
    html: `
      <h2>🎉 Registration Approved!</h2>
      <p>Dear ${userName},</p>
      <p>Your registration has been <strong>APPROVED</strong> for the following event:</p>
      <ul>
        <li><strong>Registration ID:</strong> ${r_id}</li>
        <li><strong>Event:</strong> ${eventName}</li>
        <li><strong>Date:</strong> ${eventDate}</li>
        <li><strong>Role:</strong> ${role}</li>
        <li><strong>Department:</strong> ${department}</li>
        <li><strong>Department In-charge:</strong> ${depinc}</li>
        <li><strong>In-charge Phone:</strong> ${depphno}</li>

      </ul>
      <p>Please keep this email for your records.</p>
      <p>Thank you!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Email service running on port 3001');
});