import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ProfileClient } from "@/components/profile/ProfileClient";
interface PublicProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}
export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const isOwner = currentUser?.id === id;
  if (error || !profile) {
    return notFound();
  }
  const userData = {
    id: profile.id,
    email: isOwner ? currentUser?.email || "" : "",
    username: profile.username || "Traveler",
    first_name: profile.first_name,
    last_name: profile.last_name,
    avatarUrl: profile.avatar_url,
    bannerUrl: profile.banner_url,
    bio: profile.bio,
  };
  return (
    <div className="bg-gray-50 min-h-screen">
      <ProfileClient
        user={userData}
        isPublic={!isOwner}
        targetUserId={id}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}
