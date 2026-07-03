import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SettingsClientProps, SettingsFormData } from "../types";
import { useAuth } from "@/context/AuthContext";

export function useSettingsForm({
  userId,
  initialFirstName,
  initialLastName,
  profile,
  email,
  isGoogleOAuth,
}: SettingsClientProps) {
  const supabase = createClient();
  const { refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState(email);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">(
    "idle"
  );
  const [initialUsername, setInitialUsername] = useState(profile?.username || "");
  const [formData, setFormData] = useState<SettingsFormData>({
    username: profile?.username || "",
    first_name: initialFirstName || "",
    last_name: initialLastName || "",
    avatar_url: profile?.avatar_url || "",
    banner_url: profile?.banner_url || "",
    bio: profile?.bio || "",
    language: profile?.language || "English (US)",
    timezone: profile?.timezone || "UTC-08:00 (Pacific Time)",
    theme: profile?.theme || "System",
    distance_unit: profile?.distance_unit || "Kilometers (km)",
    temperature_unit: profile?.temperature_unit || "Celsius (°C)",
    travel_style: profile?.travel_style || "Budget Backpacker",
    pace_of_travel: profile?.pace_of_travel || "Moderate (3-4 activities/day)",
    preferred_currency: profile?.preferred_currency || "USD ($)",
    travel_companions: profile?.travel_companions || "Solo",
    dietary_restrictions: profile?.dietary_restrictions || "",
    accommodation_preference: profile?.accommodation_preference || "Hotels",
    accessibility_needs: profile?.accessibility_needs || "",
    email_notifications: profile?.email_notifications !== false,
    promotional_emails: profile?.promotional_emails || false,
    push_notifications: profile?.push_notifications || false,
    ai_training_consent: profile?.ai_training_consent !== false,
  });

  useEffect(() => {
    let active = true;
    const trimmedUsername = formData.username?.trim();

    if (!trimmedUsername || trimmedUsername === initialUsername || trimmedUsername.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    const checkUsername = async () => {
      if (!active) return;
      setUsernameStatus("checking");

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", trimmedUsername)
          .neq("id", userId) // Important: don't count ourselves
          .maybeSingle();

        if (!active) return;

        if (error) {
          setUsernameStatus("idle");
          return;
        }

        setUsernameStatus(data ? "taken" : "available");
      } catch (err) {
        if (active) setUsernameStatus("idle");
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [formData.username, initialUsername, userId]);

  const handleInputChange = (field: keyof SettingsFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(null);
    setSaveError(null);
  };

  const handleSave = async (sectionName: string) => {
    if (sectionName === "Profile") {
      const trimmedUsername = formData.username?.trim();
      const trimmedFirst = formData.first_name?.trim();
      const trimmedLast = formData.last_name?.trim();
      if (!trimmedUsername || !trimmedFirst || !trimmedLast) {
        setSaveError("First Name, Last Name and Username are required.");
        return;
      }
      if (usernameStatus === "taken") {
        setSaveError("Username is already taken.");
        return;
      }
      if (usernameStatus === "checking") {
        return;
      }
    }
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      let emailUpdated = false;
      if (sectionName === "Profile" && !isGoogleOAuth && newEmail !== email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: newEmail,
        });
        if (emailError) throw emailError;
        emailUpdated = true;
      }
      const payload = {
        id: userId,
        ...formData,
        username: formData.username?.trim() === "" ? null : formData.username?.trim(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw error;

      // Refresh the profile in AuthContext to update global state
      await refreshProfile();

      if (sectionName === "Profile") {
        setInitialUsername(formData.username?.trim() || "");
        setUsernameStatus("idle");
      }
      setSaveSuccess(
        emailUpdated
          ? "Profile updated! Please check your new email to confirm the change."
          : `${sectionName} updated successfully!`
      );
      setTimeout(() => setSaveSuccess(null), emailUpdated ? 6000 : 3000);
    } catch (error: any) {
      setSaveError(error.message || "Failed to save settings.");
      setTimeout(() => setSaveError(null), 6000);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    isSaving,
    saveSuccess,
    setSaveSuccess,
    saveError,
    setSaveError,
    newEmail,
    setNewEmail,
    usernameStatus,
    handleInputChange,
    handleSave,
  };
}
