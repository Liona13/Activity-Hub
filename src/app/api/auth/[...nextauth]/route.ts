import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { Adapter } from "next-auth/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isNewUser?: boolean;
    } & DefaultSession["user"]
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide process.env.NEXTAUTH_SECRET');
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return '/auth/error?error=NoEmail';
      }

      try {
        // Check if user exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true }
        });

        // If this is a new registration attempt
        if (!existingUser && account) {
          // Check if this is a new OAuth sign up
          const isNewOAuthSignUp = account.type === 'oauth';
          
          if (isNewOAuthSignUp) {
            // Allow first-time registration
            return true;
          }
        }

        // If user exists, only allow login with the same provider
        if (existingUser) {
          const existingProvider = existingUser.accounts.find(
            acc => acc.provider === account?.provider
          );

          if (existingProvider) {
            // Allow login with same provider
            return true;
          }

          // Prevent login with different provider
          const primaryProvider = existingUser.accounts[0]?.provider;
          return `/auth/error?error=OAuthAccountNotLinked&provider=${primaryProvider}`;
        }

        // Prevent any other registration attempts
        return '/auth/error?error=EmailExists';
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return '/auth/error?error=default';
      }
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email;
        
        // Check if user has completed their profile
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { bio: true, location: true, interests: true },
        });
        
        session.user.isNewUser = !dbUser?.bio && !dbUser?.location && (!dbUser?.interests || dbUser.interests.length === 0);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    newUser: '/auth/new-user',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 