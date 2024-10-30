import NextAuth, { NextAuthOptions, CallbacksOptions, Account, Profile } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/AdminModel';
import bcrypt from 'bcryptjs';
import { User as NextAuthUser } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { NextApiRequest, NextApiResponse } from 'next';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

interface CustomUser extends NextAuthUser {
  role: string[];
  username: string;
  manage: string[];
}

declare module 'next-auth' {
  interface Session {
    user?: CustomUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: string[];
    name: string;
    manage: string[];
  }
}

function isCustomUser(user: NextAuthUser | CustomUser | AdapterUser): user is CustomUser {
  return (user as CustomUser).role !== undefined;
}

const callbacks: CallbacksOptions<Profile, Account> = {
  async jwt({ token, user }) {
    // console.log('JWT Callback - Trigger:', trigger);
    // console.log('JWT Callback - Incoming User:', user);
    // console.log('JWT Callback - Current Token:', token);
    if (user && isCustomUser(user)) {
      token.id = user.id;
      token.role = user.role ?? [];
      token.name = user.name ?? '';
      token.username = user.username ?? '';
      token.manage = Array.isArray(user.manage) ? user.manage : [];
      // console.log('JWT Callback - Updated Token:', token);
    }
    return token;
  },

  async signIn({  }) {
    return true;
  },
  
  async session({ session, token }) {
    // console.log('Session Callback - Trigger:', trigger);
    // console.log('Session Callback - Token:', token);
    if (token) {
      session.user = {
        id: token.id,
        username: token.username,
        role: Array.isArray(token.role) ? token.role : [],
        name: token.name,
        manage: token.manage,
      };
      // console.log('Session callback - session data:', session);
    }
    return session;
  },
  
  async redirect({ url, baseUrl }) {
    if (url.startsWith(baseUrl)) return url;
    return baseUrl;
  },
};

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // console.log('Authorize called with credentials:', credentials);
        
        if (!credentials?.identifier || !credentials?.password) {
          console.error('Missing credentials');
          throw new Error('Missing credentials');
        }
        
        try {
          await dbConnect();
          
          const query = { 
            $or: [
              { email: credentials.identifier }, 
              { username: credentials.identifier }
            ] 
          };
          
          const user = await Admin.findOne(query);
          // console.log('DB User found:', user);
          
          if (!user || !user._id) {
            console.error('User not found');
            throw new Error('User not found');
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) {
            console.error('Invalid password');
            throw new Error('Invalid password');
          }

          const customUser: CustomUser = {
            id: user._id.toString(),
            username: user.username,
            role: Array.isArray(user.role) ? user.role : [],
            name: user.name,
            manage: user.manage || [],
          };

          // console.log('Authorize returning user:', customUser);
          return customUser;
          
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      }
    }),
  ],
  debug: true,
  session: {
    strategy: 'jwt' as const,
  },
  jwt: {
    secret: jwtSecret,
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  callbacks,
};

const authHandler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, options);
export default authHandler;