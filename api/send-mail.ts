// api/send-mail.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { to, cc, subject, text, fileBase64 } = req.body;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // ใช้แค่ dev ถ้า prod จริงๆควรเอาออก
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      cc,
      subject,
      html: text,
      attachments: fileBase64
        ? [
            {
              filename: subject +'.pdf',
              content: fileBase64,
              encoding: 'base64',
            },
          ]
        : [],
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
}
