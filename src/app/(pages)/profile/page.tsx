import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ProfileClient } from "@/components/profile/ProfileClient";
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile?.onboarding_done || !profile?.username) {
    return redirect("/onboarding");
  }
  const userData = {
    id: user.id,
    email: user.email || "",
    username: profile.username || "Traveler",
    first_name: profile.first_name,
    last_name: profile.last_name,
    avatarUrl: profile.avatar_url,
    bannerUrl: profile.banner_url,
    bio: profile.bio,
  };
  return (
    <ProfileClient
      user={userData}
      isPublic={false}
      targetUserId={user.id}
      currentUserId={user.id}
    />
  );
}
