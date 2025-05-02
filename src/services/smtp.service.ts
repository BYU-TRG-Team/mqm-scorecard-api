import Mail from "nodemailer/lib/mailer";

class SMTPService {
  constructor(
    private readonly transporter: Mail
  ) {}

  sendEmail(mailOptions: Mail.Options) {
    console.log("sendEmail initiated");
    return this.transporter.sendMail(mailOptions, (err) => {
      console.error(err);
    });
  } 
}

export default SMTPService;
