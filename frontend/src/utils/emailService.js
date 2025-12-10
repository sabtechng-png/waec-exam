// utils/emailService.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
  try {
    return await resend.emails.send({
      from: "CBT Master <noreply@cbt-master.com.ng>",
      to,
      subject,
      html
    });
  } catch (err) {
    console.error("RESEND ERROR:", err);
    throw err;
  }
}

module.exports = { sendEmail };
