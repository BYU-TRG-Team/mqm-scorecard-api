import Mail from "nodemailer/lib/mailer";

class SMTPService {
  constructor(
    private readonly transporter: Mail
  ) {}

  sendEmail(mailOptions: Mail.Options) {
    return this.transporter.sendMail(mailOptions, () => {});
  } 
}

export default SMTPService
