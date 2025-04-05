import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import { Session } from "next-auth";
import { AdapterUser } from "@auth/core/adapters";

interface ExtendedUser {
  id: string;
  role?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface ExtendedSession extends Session {
  user: ExtendedUser;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({
      session,
      user,
    }: {
      session: Session;
      user: AdapterUser;
    }): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: (user as ExtendedUser).role || "user",
        },
      };
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
