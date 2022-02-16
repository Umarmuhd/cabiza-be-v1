const fs = require("fs");
const path = require("path");
import config from "config";
const mustache = require("mustache");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");

class Mailer {
  transport = nodemailer.createTransport(
    mg({
      auth: {
        domain: config.get("mail.domain"),
        api_key: config.get("mail.api_key"),
      },
    })
  );

  async send(name: string, user: any, data: any) {
    const content = mustache.render(this.getMailContent(name), {
      user,
      ...data,
    });

    this.transport.sendMail({
      to: user.email,
      from: "Cabiza no-reply@cabiza.com",
      subject: data?.subject as string,
      html: content,
    });
  }

  getMailContent = (name: string) => {
    const content = fs
      .readFileSync(path.resolve(__dirname, "..", "mails", `${name}.mustache`))
      .toString();

    return content;
  };
}

module.exports = new Mailer();
