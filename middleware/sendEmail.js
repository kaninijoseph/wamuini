const nodemailer = require("nodemailer");
require("dotenv").config({ path: "../.env" });

module.exports = async (email, subject, verificationUrl) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: process.env.PORT,
      secure: process.env.SECURE,
      auth: {
        user: "joshngoci@gmail.com",
        pass: process.env.PASS,
      },
    });
    if (!process.env.user) {
      console.log(`This is process.env.user: ${process.env.user}`);
      console.log("couldnt access the user");
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #4CAF50;
            padding: 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
            text-align: center;
          }
          .content p {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
          }
          .verify-button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 16px;
            color: white;
            background-color: #4CAF50;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s ease;
          }
          .verify-button:hover {
            background-color: #45a049;
          }
          .footer {
            background-color: #f4f4f4;
            padding: 10px 20px;
            text-align: center;
            font-size: 12px;
            color: #aaa;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="verify-button">Verify Email</a>
            <p>If you didn’t request this email, you can safely ignore it.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 StickyTech. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"StickyTech" <${process.env.USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    });
    console.log("Email sent Successfully");
  } catch (error) {
    console.log("Email not sent");
    console.log(error);
    throw new Error("Email sending failed");
  }
};
