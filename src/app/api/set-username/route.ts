import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/src/lib/dbConnect';
import UserModel from '@/src/model/User.model';
import { usernameValidation } from '@/src/schema/SignUp.schema';
import { z } from 'zod';

const usernameSchema = z.object({
  username: usernameValidation,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  await dbConnect();

  try {
    const body = await request.json();
    const result = usernameSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message: errors.length ? errors.join(', ') : 'Invalid username',
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    // Check if username is already taken
    const existingUser = await UserModel.findOne({
      username: username.toLowerCase(),
    });

    if (existingUser) {
      return Response.json(
        { success: false, message: 'Username is already taken' },
        { status: 400 }
      );
    }

    // Find the current user and update their username
    const userId = session.user._id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.username) {
      return Response.json(
        { success: false, message: 'Username is already set' },
        { status: 400 }
      );
    }

    user.username = username.toLowerCase();
    await user.save();

    return Response.json(
      { success: true, message: 'Username set successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error setting username:', error);
    return Response.json(
      { success: false, message: 'Error setting username' },
      { status: 500 }
    );
  }
}
