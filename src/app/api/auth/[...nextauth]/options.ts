import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs';
import dbConnect from '@/src/lib/dbConnect';
import UserModel from '@/src/model/User.model';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
          clientId: process.env.GOOGLE_ID ?? '',
          clientSecret: process.env.GOOGLE_SECRET ?? '',
        }),
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
            if (!user.password) {
              throw new Error('This account was registered using Google. Please sign in with Google.');
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
              isAccepting:user.isAccepting,
            };
            } 
            catch (err: any) {
                throw new Error(err.message || "Authentication Failed");
            }
        },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await dbConnect();
        try {
          const googleId = profile?.sub || account.providerAccountId;
          const email = user.email;

          if (!email) {
            return false;
          }

          const existingUser = await UserModel.findOne({
            $or: [{ googleId }, { email }],
          });

          if (!existingUser) {
            // New Google user: create account without username (to be selected on username setup page)
            await UserModel.create({
              email,
              googleId,
              isVerified: true,
              isAccepting: true,
              messages: [],
            });
          } else {
            // Existing user: link googleId and mark email as verified if needed
            let isModified = false;
            if (!existingUser.googleId) {
              existingUser.googleId = googleId;
              isModified = true;
            }
            if (!existingUser.isVerified) {
              existingUser.isVerified = true;
              isModified = true;
            }
            if (isModified) {
              await existingUser.save();
            }
          }
          return true;
        } catch (error) {
          console.error('Error during Google signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (account?.provider === 'google') {
        await dbConnect();
        const dbUser = await UserModel.findOne({
          $or: [
            { googleId: account.providerAccountId },
            { email: user?.email || token.email },
          ],
        });
        if (dbUser) {
          token._id = dbUser._id.toString();
          token.isVerified = dbUser.isVerified;
          token.isAcceptingMessages = dbUser.isAccepting;
          token.username = dbUser.username;
        }
      } else if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAccepting;
        token.username = user.username;
      }

      // Handle session updates (e.g. after user submits their chosen unique username)
      if (trigger === 'update' && session) {
        if (session.username !== undefined) token.username = session.username;
        if (session.isAcceptingMessages !== undefined) {
          token.isAcceptingMessages = session.isAcceptingMessages;
        }
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