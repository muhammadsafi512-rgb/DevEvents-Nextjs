import nodemailer from "nodemailer";
import { site } from "@/lib/site";

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendPasswordResetEmail(to: string, name: string, link: string) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });

    await transporter.sendMail({
        from: `"${site.name}" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Reset your ${site.name} password`,
        text: `Hi ${name}, \n\nUse this link to set a new password. It expires in 1 hour:\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
        html: `<p>Hi ${escapeHtml(name)},</p>
<p>Use the button below to set a new password.The link expires in 1 hour.</p>
<p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#12a594;color:#000;border-radius:6px;text-decoration:none;font-weight:600">Reset Password</a></p>
<p>Or paste this link into your browser:<br>${link}</p>
<p>If you didn't ask for this, you can ignore this email.</p>`,
    });
}