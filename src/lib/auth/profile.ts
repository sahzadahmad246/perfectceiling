import type { User } from "@supabase/supabase-js";

import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type MetadataValue = string | number | boolean | null | undefined;
type Metadata = Record<string, MetadataValue>;

export type AuthProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
};

type ProfileRow = {
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export function getProfileFromUser(user: User): AuthProfile {
  const metadata = user.user_metadata as Metadata;
  const identityData =
    (user.identities?.find((identity) => identity.provider === "google")
      ?.identity_data as Metadata | undefined) ?? {};
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : typeof identityData.full_name === "string"
          ? identityData.full_name
          : typeof identityData.name === "string"
            ? identityData.name
            : null;
  const avatarUrl =
    typeof metadata.avatar_url === "string"
      ? metadata.avatar_url
      : typeof metadata.picture === "string"
        ? metadata.picture
        : typeof identityData.avatar_url === "string"
          ? identityData.avatar_url
          : typeof identityData.picture === "string"
            ? identityData.picture
            : null;
  const email =
    user.email ??
    (typeof metadata.email === "string"
      ? metadata.email
      : typeof identityData.email === "string"
        ? identityData.email
        : null);

  return {
    id: user.id,
    email,
    fullName,
    avatarUrl,
  };
}

export async function getAuthProfile(
  supabase: SupabaseServerClient,
  user: User,
): Promise<AuthProfile> {
  const profile = getProfileFromUser(user);

  if (profile.avatarUrl) {
    return profile;
  }

  const { data: row } = await supabase
    .from("profiles")
    .select("email, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (!row) {
    return profile;
  }

  return {
    ...profile,
    email: profile.email ?? row.email,
    fullName: profile.fullName ?? row.full_name,
    avatarUrl: profile.avatarUrl ?? row.avatar_url,
  };
}

export async function upsertProfile(
  supabase: SupabaseServerClient,
  user: User,
) {
  const profile = getProfileFromUser(user);

  const { error } = await supabase.from("profiles").upsert({
    id: profile.id,
    email: profile.email,
    full_name: profile.fullName,
    avatar_url: profile.avatarUrl,
    provider: "google",
    updated_at: new Date().toISOString(),
  });

  return { error };
}
