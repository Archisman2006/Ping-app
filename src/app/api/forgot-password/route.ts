import dbConnect from '@/src/lib/dbConnect';
import UserModel from '@/src/model/User.model';
import { forgotPasswordSchema } from '@/src/schema/ForgotPassword.schema';
import { sendResetPasswordEmail } from '@/src/helpers/sendResetPasswordEmail';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const parseResult = forgotPasswordSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        {
          success: false,
          message: parseResult.error.format().email?._errors[0] || 'Invalid email address',
        },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;

    const user = await UserModel.findOne({
      email,
      isVerified: true,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'No verified account found with this email address.',
        },
        { status: 404 }
      );
    }

    // Generate random 32-byte hex token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash token using SHA-256 for secure DB storage
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Token expires in 15 minutes
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = tokenExpiry;
    await user.save();

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    const emailResponse = await sendResetPasswordEmail(
      user.email,
      user.username,
      resetUrl
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message || 'Failed to send password reset email.',
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Password reset link sent to your email.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in forgot-password route:', error);
    return Response.json(
      {
        success: false,
        message: 'An unexpected error occurred while processing your request.',
      },
      { status: 500 }
    );
  }
}
