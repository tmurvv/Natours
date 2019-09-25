const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const nodemailerSendgrid = require('nodemailer-sendgrid');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Natours <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            /****************
             * was not able to get sendgrid working, might use different solution, so don't want to waste more time
             * **************/
            // //Sendgrid
            // return nodemailer.createTransport({
            //     service: 'SendGrid',
            //     auth: {
            //         user: process.env.SENDGRID_USERNAME,
            //         pass: process.env.SENDGRID_PASSWORD
            //     }
            // });
            // console.log('imin prod createtransport');
            // return nodemailer.createTransport(
            //     nodemailerSendgrid({
            //         apiKey: process.env.SENDGRID_PASSWORD
            //     })
            // );
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        console.log('imin');
        //1) render HTML based on template
        const html = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject
            }
        );
        //2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };
        //3) send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours family!');
    }

    async sendPasswordReset() {
        console.log('imin passwordreset');
        await this.send(
            'passwordReset',
            'Your password reset, valid for 10 minutes'
        );
    }
};
