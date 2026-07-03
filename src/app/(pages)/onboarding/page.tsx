import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import OnboardingClient from "@/components/onboarding/OnboardingClient";
export const metadata = {
  title: "Welcome to voyaz - Onboarding",
};
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_done, username")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_done && profile?.username) {
    return redirect("/profile");
  }
  const metadata = user.user_metadata || {};
  let firstName = metadata.first_name || metadata.given_name || "";
  let lastName = metadata.last_name || metadata.family_name || "";
  const avatarUrl = metadata.avatar_url || metadata.picture || "";
  if (!firstName && !lastName && metadata.full_name) {
    const parts = metadata.full_name.split(" ");
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }
  return (
    <OnboardingClient
      userId={user.id}
      email={user.email || ""}
      initialFirstName={firstName}
      initialLastName={lastName}
      avatarUrl={avatarUrl}
    />
  );
}
