import nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import ResetPasswordEmail from '../../emails/resetPasswordEmail';
import { ApiResponse } from '../types/ApiResponse';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetPasswordEmail(
  email: string,
  username: string,
  resetUrl: string
): Promise<ApiResponse> {
  try {
    const emailHtml = await render(
      ResetPasswordEmail({ username, resetUrl })
    );

    await transporter.sendMail({
      from: `"Ping" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Ping | Password Reset Request',
      html: emailHtml,
    });

    return {
      success: true,
      message: 'Password reset email sent successfully.',
    };
  } catch (emailError: any) {
    console.error('Error sending reset password email via Nodemailer:', emailError);
    return {
      success: false,
      message: emailError?.message || 'Failed to send password reset email.',
    };
  }
}
