require('dotenv').config();
const Brevo = require('@getbrevo/brevo');

const sendEmail = async (metaParams) => {
   try {
     // Instantiate the API client with your API key
     const transactionalEmailsApi = new Brevo.TransactionalEmailsApi();
     transactionalEmailsApi.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
     const {subject, html, text, fromEmail, toEmail, fromName, toName } = metaParams
     // Create the email message object
     const sendSmtpEmail = new Brevo.SendSmtpEmail();
     sendSmtpEmail.params = {
           "text": text
     }
     // Set email parameters
     sendSmtpEmail.subject = subject
     sendSmtpEmail.htmlContent = html;
     sendSmtpEmail.sender = { "name": metaParams?.fromName? fromName:"Default", "email": fromEmail }; // Must be a verified sender
     sendSmtpEmail.to = [{ "email": toEmail, "name": metaParams?.toName ? toName: "DefaultTo" }];
      
     // Send the email
    await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
   } catch (error) {
     console.error('Error sending email:', error.body || error);
   }
 }

 module.exports = sendEmail;