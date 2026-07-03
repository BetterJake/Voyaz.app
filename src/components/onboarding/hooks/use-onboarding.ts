import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SettingsFormData } from "../../settings/types";
import { STEPS } from "../constants";
interface UseOnboardingProps {
  userId: string;
  initialFirstName: string;
  initialLastName: string;
  avatarUrl: string;
}
export function useOnboarding({
  userId,
  initialFirstName,
  initialLastName,
  avatarUrl,
}: UseOnboardingProps) {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">(
    "idle"
  );
  const [localAvatarUrl, setLocalAvatarUrl] = useState(avatarUrl);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState<SettingsFormData>({
    first_name: initialFirstName,
    last_name: initialLastName,
    username: "",
    avatar_url: avatarUrl,
    language: "English (US)",
    timezone: "UTC+01:00 (Central European Time)",
    theme: "Light",
    distance_unit: "Kilometers (km)",
    temperature_unit: "Celsius (°C)",
    travel_style: "Comfort & Culture",
    pace_of_travel: "Moderate (3-4 activities/day)",
    preferred_currency: "EUR (€)",
    travel_companions: "Solo",
    dietary_restrictions: "",
    accommodation_preference: "Hotels",
    accessibility_needs: "",
  });
  useEffect(() => {
    let active = true;
    const trimmedUsername = formData.username?.trim();

    if (!trimmedUsername || trimmedUsername.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    const checkUsername = async () => {
      if (!active) return;
      setUsernameStatus("checking");

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", trimmedUsername)
          .neq("id", userId)
          .maybeSingle();

        if (!active) return;

        if (error) {
          console.error("Username check error:", error);
          setUsernameStatus("idle");
          return;
        }

        setUsernameStatus(data ? "taken" : "available");
      } catch (err) {
        if (active) setUsernameStatus("idle");
      }
    };

    const timer = setTimeout(checkUsername, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [formData.username, userId]);
  const handleInputChange = (field: keyof SettingsFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleAvatarUpload = async (file: File) => {
    if (!navigator.onLine) {
      alert("You must be online to upload an avatar.");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setLocalAvatarUrl(publicUrl);
      handleInputChange("avatar_url", publicUrl);
    } catch (error) {
      console.error("Avatar upload failed:", error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await handleComplete(false);
    }
  };
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  const handleSkip = async () => {
    await handleComplete(true);
  };
  const handleComplete = async (isSkipping: boolean) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const finalUsername =
        isSkipping && !formData.username ? `user_${userId.slice(0, 8)}` : formData.username;
      const payload = {
        id: userId,
        ...formData,
        first_name: formData.first_name || initialFirstName,
        last_name: formData.last_name || initialLastName,
        avatar_url: formData.avatar_url || avatarUrl,
        username: finalUsername || null,
        onboarding_done: true,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw error;
      router.push("/profile");
      router.refresh();
    } catch (error) {
      console.error("Onboarding completion failed:", error);
      const message =
        error instanceof Error ? error.message : "Something went wrong while saving your profile.";
      // Surface the real cause instead of silently swallowing it, so a misconfigured
      // profiles table / RLS policy is visible instead of an infinite onboarding loop.
      setSaveError(message);
      setIsSaving(false);
    }
  };
  return {
    currentStep,
    formData,
    isSaving,
    saveError,
    usernameStatus,
    localAvatarUrl,
    isUploadingAvatar,
    handleInputChange,
    handleAvatarUpload,
    handleNext,
    handleBack,
    handleSkip,
  };
}
