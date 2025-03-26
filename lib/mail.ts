import { createTransport } from "nodemailer"

export const transporter = createTransport({
    // @ts-ignore
    host: process.env.NODEMAILER_HOST ?? "smtp.ethereal.email",
    port: process.env.NODEMAILER_PORT ?? 587,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
    },
})