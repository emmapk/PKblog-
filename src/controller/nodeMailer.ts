import 'dotenv/config';
import nodemailer from 'nodemailer';

export const sendEmail = async (email:string, subject:string,  text:string) => {
    console.log(`Email sent to ${email} with subject: ${subject} and text: ${text}`);
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: "emmanuelmichaelpk3@gmail.com",
                pass:"ugtjkbfbcafivlmk",
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: text,
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.log("Email not sent");
        console.error(error);
    }
};



export default sendEmail;
