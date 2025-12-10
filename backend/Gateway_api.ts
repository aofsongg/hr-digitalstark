import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; 

dotenv.config();

const app = express();



app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.post('/api/send-mail', async (req, res) => {
    
  try {
    const { to, subject, text,fileBase64 } = req.body;

    const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // ใช้ STARTTLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,  // <<< จุดสำคัญ (dev เท่านั้น)
  },
});

await transporter.verify(); 
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html:text,
      attachments: [
  {
    filename: 'slip.pdf',
    content: fileBase64,
    encoding: 'base64',
  }
],
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});
// fallback สำหรับทุก GET ที่เหลือ (เช่น /, /xxx, /employee/1)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = process.cwd();

// static files (css/js)
app.use(express.static(path.join(rootDir, "dist")));

// SPA fallback (ทุก GET ที่ไม่ใช่ /api)
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(rootDir, "dist", "index.html"));
});
// static files (css/js)
// app.use(express.static(path.join(__dirname, "..", "..", "dist")));
// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(__dirname, "..", "..", "dist", "index.html"));
// });

app.listen(4000, () => {
  console.log('Email API running at http://localhost:4000');
});
