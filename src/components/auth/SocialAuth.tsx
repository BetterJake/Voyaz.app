"use client";

import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SocialAuthContent({ label }: { label: string }) {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const handleGoogleLogin = async () => {
    const callbackUrl = new URL(`${window.location.origin}/api/auth/callback`);
    if (next) {
      callbackUrl.searchParams.set("next", next);
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 py-3.5 transition-all hover:bg-gray-50 active:scale-[0.98]"
    >
      <FcGoogle size={24} />
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </button>
  );
}

export function SocialAuth({ label = "Continue with Google" }) {
  return (
    <div className="w-full">
      <Suspense
        fallback={
          <div className="h-12 w-full animate-pulse bg-gray-50 rounded-2xl border border-gray-200" />
        }
      >
        <SocialAuthContent label={label} />
      </Suspense>
    </div>
  );
}
