import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/src/lib/dbConnect';
import UserModel from '@/src/model/User.model';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
            email: { label: 'Email or Username', type: 'text' },
            password: { label: 'Password', type: 'password' },
            },
        async authorize(credentials: any): Promise<any> {
            if (!credentials?.identifier || !credentials?.password) {
              throw new Error('Missing credentials');
            }
            await dbConnect();
            try {
                const user = await UserModel.findOne({
                $or: [
                    { email: credentials.identifier },
                    { username: credentials.identifier },
                ],
            }).select('+password')
            if (!user) {
                throw new Error('Invalid Credentials');
            }
            const isPasswordCorrect = await bcrypt.compare(
                credentials.password,
                user.password
            );
            if (!isPasswordCorrect) {
              throw new Error('Invalid Credentials');
            }
            if (!user.isVerified) {
                throw new Error('Please verify your account before logging in');
            }
            return {
              _id:user._id.toString(),
              email:user.email,
              username:user.username,
              isVerified:user.isVerified,
              isAccepting:user.isAccepting
            };
            } 
            catch (err: any) {
                throw new Error(err.message || "Authentication Failed");
            }
        },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};