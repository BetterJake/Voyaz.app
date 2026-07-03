import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SettingsClient } from "../../../components/settings/SettingsClient";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Settings - voyaz.app",
};
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }
  const isGoogleOAuth = user.app_metadata?.providers?.includes("google") || false;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const metadata = user.user_metadata || {};
  let firstName = profile?.first_name || metadata.first_name || metadata.given_name || "";
  let lastName = profile?.last_name || metadata.last_name || metadata.family_name || "";
  const avatarUrl = profile?.avatar_url || metadata.avatar_url || metadata.picture || "";
  if (!firstName && !lastName && metadata.full_name) {
    const parts = metadata.full_name.split(" ");
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }
  const profileData = profile || {};
  return (
    <SettingsClient
      userId={user.id}
      email={user.email || ""}
      isGoogleOAuth={isGoogleOAuth}
      initialFirstName={firstName}
      initialLastName={lastName}
      avatarUrl={avatarUrl}
      profile={profileData}
    />
  );
}
