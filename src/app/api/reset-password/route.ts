import dbConnect from '@/src/lib/dbConnect';
import UserModel from '@/src/model/User.model';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { token, password } = await request.json();

    if (!token) {
      return Response.json(
        {
          success: false,
          message: 'Reset token is required.',
        },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return Response.json(
        {
          success: false,
          message: 'Password must be at least 6 characters long.',
        },
        { status: 400 }
      );
    }

    // Hash the token received from the user to match the one stored in MongoDB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user with matching token and ensure it has not expired
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'Invalid or expired password reset link. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return Response.json(
      {
        success: true,
        message: 'Your password has been reset successfully. You can now sign in.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in reset-password route:', error);
    return Response.json(
      {
        success: false,
        message: 'An unexpected error occurred while resetting your password.',
      },
      { status: 500 }
    );
  }
}
