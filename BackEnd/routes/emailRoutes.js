import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  try {
// Konfiguracja transportera Nodemailer dla Gmaila
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

// Konfiguracja wiadomości
    const mailOptions = {
      from: `${name} <${email}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `FK NightMeets: ${name}`,
      text: `
        Imię: ${name}
        E-mail: ${email}
        Wiadomość: ${message}
      `,
      replyTo: email,
    };
    
// Wysłanie wiadomości
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Wiadomość została wysłana pomyślnie!' });
  } catch (error) {
    console.error('Błąd przy wysyłaniu wiadomości:', error);
    res.status(500).json({ message: 'Wystąpił błąd przy wysyłaniu wiadomości.' });
  }
});

export default router;