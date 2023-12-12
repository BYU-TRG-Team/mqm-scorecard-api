declare module "nodemailer-sendgrid-transport" {
  import SMTPTransport from "nodemailer/lib/smtp-transport";

  function transporter(
    options: {
      auth: {
        api_key: string
      }
    }
  ): SMTPTransport 

  export default transporter;
}