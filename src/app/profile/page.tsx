import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import ProfileClient from "@/components/ProfileClient";

export const metadata: Metadata = {
  title: "Your Profile",
  description: "View and update your profile on Perfect Ceiling.",
  openGraph: {
    title: "Your Profile | Perfect Ceiling",
    description: "View and update your profile on Perfect Ceiling.",
  },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  return <ProfileClient isAuthenticated={!!session} />;
}


