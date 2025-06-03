const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',   // Replace with your SMTP host
  port: 587,
  secure: false,
  auth: {
    user: 'vinsha@cybersquare.org', // your email
    pass: 'VinshaK7559',    // your password or app password
  },
});

async function sendLowStockAlert(product) {
  const mailOptions = {
    from: '"Inventory Alert" vinsha@cybersquare.org',
    to: 'anupamatm@cybersquare.org',  // Replace with your admin or product manager emails
    subject: `Low Stock Alert: ${product.name}`,
    html: `<p>The product "<strong>${product.name}</strong>" is low on stock.</p><p>Current stock: ${product.stock}</p>`,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendLowStockAlert };
