import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

app.post('/api/send-mail', async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to,
      subject,
      text,
    });

    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ ok: false });
  }
});

app.listen(8080, () => console.log('Email API running on http://localhost:8080'));