// /backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Crear transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Opciones del mensaje
    const message = {
      from: `"Sistema Artes Marciales" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message
    };

    // Enviar email
    const info = await transporter.sendMail(message);
    
    console.log('Email enviado exitosamente:', info.messageId);
    return info;

  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
};

module.exports = sendEmail;