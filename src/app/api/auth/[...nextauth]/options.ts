import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { uploadImageFromUrl } from "@/lib/cloudinary";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user?.email) return false;
      
      await connectToDatabase();
      
      const googleId = account?.providerAccountId || (profile as { sub?: string })?.sub;
      let existing = await User.findOne({ email: user.email });
      
      if (!existing) {
        let profilePicUrl: string | undefined = user.image || undefined;
        let profilePicPublicId: string | undefined = undefined;
        
        try {
          if (user.image) {
            const uploaded = await uploadImageFromUrl(user.image);
            profilePicUrl = uploaded.secureUrl;
            profilePicPublicId = uploaded.publicId;
          }
        } catch (error) {
          console.error("Failed to upload profile image:", error);
        }
        
        existing = await User.create({
          name: user.name ?? "",
          email: user.email,
          googleId: googleId ?? "",
          profilePicUrl,
          profilePicPublicId,
          role: "user",
        });
      } else if (!existing.googleId && googleId) {
        existing.googleId = googleId;
        await existing.save();
      }
      
      return true;
    },
    async session({ session, token }) {
      if (!session.user) return session;
      
      session.user.id = token.sub!;
      session.user.role = token.role || "user";
      
      return session;
    },
    async jwt({ token }) {
      // attach role from DB to JWT so middleware can check it
      if (!token.email) return token;
      
      await connectToDatabase();
      const dbUser = await User.findOne({ email: token.email }).lean();
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
      const email = token.email.toLowerCase();
      const dbRole = dbUser?.role || "user";
      
      token.role = adminEmail && email === adminEmail ? "admin" : dbRole;
      
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
};