import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { uploadImageFromUrl } from "@/lib/cloudinary";

export const authOptions: NextAuthOptions = {
  trustHost: true,
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

      const googleId = account?.providerAccountId || (profile as any)?.sub;
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
        } catch {}

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
      (session as any).user.id = token.sub;
      (session as any).user.role = (token as any).role;
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
      (token as any).role = adminEmail && email === adminEmail ? "admin" : dbRole;
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
};


