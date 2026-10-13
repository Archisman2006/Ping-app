import {z} from 'zod'
export const usernameValidation= z
.string()
.min(3,"username should be atleast 3 characters")
.max(20,"username should be at max 20 characters")

export const signUpSchema = z.object({
  username: usernameValidation,

  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});