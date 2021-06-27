const Mailgen = require("mailgen");
require("dotenv").config();

class EmailService {
  constructor(env, sender) {
    this.sender = sender;
    switch (env) {
      case "development":
        this.link = "https://20ed3f7bf0d4.ngrok.io";
        break;
      case "production":
        this.link = "link fro production";
        break;
      default:
        this.link = "https://20ed3f7bf0d4.ngrok.io";
        break;
    }
  }
  #createTemplateVerificationEmail(verifyToken, name) {
    const mailGenerator = new Mailgen({
      theme: "cerberus",
      product: {
        name: "Lookout84 System",
        link: this.link,
      },
    });
    const email = {
      body: {
        name,
        intro:
          "Welcome to Lookout84 System! We're very excited to have you on board.",
        action: {
          instructions:
            "To get started with Lookout84 System, please click here:",
          button: {
            color: "#22BC66", // Optional action button color
            text: "Confirm your account",
            link: `${this.link}/api/users/verify/${verifyToken}`,
          },
        },
      },
    };
    return mailGenerator.generate(email);
  }
  async sendVerifyEmail(verifyToken, email, name) {
    const emailHtml = this.#createTemplateVerificationEmail(verifyToken, name);
    const msg = {
      to: email,
      subject: "Verify your account",
      html: emailHtml,
    };
    console.log("Presend");
    const result = await this.sender.send(msg);
    console.log(result);
  }
}

module.exports = EmailService;
