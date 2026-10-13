import nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from '../types/ApiResponse';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const emailHtml = await render(VerificationEmail({ username, otp: verifyCode }));

    await transporter.sendMail({
      from: `"Ping" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Ping Verification Code',
      html: emailHtml,
    });

    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError: any) {
    console.error('Error sending verification email via Nodemailer:', emailError);
    return { success: false, message: emailError?.message || 'Failed to send verification email.' };
  }
}