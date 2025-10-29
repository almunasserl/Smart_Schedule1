const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // إعداد الـ transporter (SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",                   // مثال: smtp.gmail.com
      auth: {
        user: process.env.SMTP_USER,    // بريدك
        pass: process.env.SMTP_PASS,
      },
    });

    // إرسال الرسالة
    const info = await transporter.sendMail({
      from: `"SmartSchedule" <${process.env.SMTP_USER}>`, // اسم المرسل
      to,       // البريد المستقبل
      subject,  // عنوان الرسالة
      text,     // نص عادي
      html,     // نسخة HTML
    });

    console.log("✅ Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    return false;
  }
};

module.exports = sendEmail;
