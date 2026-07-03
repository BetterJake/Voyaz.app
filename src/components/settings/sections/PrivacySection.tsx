import React from "react";
import { IoInformationCircleOutline, IoDownloadOutline } from "react-icons/io5";
import { Button } from "@/components/ui/Button";
import { SettingsFormData } from "../types";
import { createClient } from "@/utils/supabase/client";

interface PrivacySectionProps {
  userId: string;
  formData: SettingsFormData;
  handleInputChange: (field: keyof SettingsFormData, value: any) => void;
  handleExportData: () => void;
  setSaveSuccess: (msg: string | null) => void;
}

export function PrivacySection({
  userId,
  formData,
  handleInputChange,
  handleExportData,
  setSaveSuccess,
}: PrivacySectionProps) {
  const supabase = createClient();

  const toggleConsent = async (checked: boolean) => {
    handleInputChange("ai_training_consent", checked);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ai_training_consent: checked });
    if (!error) {
      setSaveSuccess("Privacy preferences updated.");
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  const togglePrivacy = async (field: "show_friends" | "show_followers", value: boolean) => {
    handleInputChange(field, value);
    const { error } = await supabase.from("profiles").upsert({ id: userId, [field]: value });
    if (!error) {
      setSaveSuccess("Social visibility updated.");
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Privacy & Data</h2>

      <div className="space-y-8">
        {/* Social Visibility */}
        <div className="border-t border-gray-100 pt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Social Visibility</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div className="pr-4">
                <h4 className="font-bold text-gray-900 mb-1">Show Friends List on Profile</h4>
                <p className="text-sm text-gray-500">
                  Allow others to see the people you are friends with.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.show_friends !== false}
                  onChange={(e) => togglePrivacy("show_friends", e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div className="pr-4">
                <h4 className="font-bold text-gray-900 mb-1">Show Followers List on Profile</h4>
                <p className="text-sm text-gray-500">
                  Allow others to see the people who follow you.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.show_followers !== false}
                  onChange={(e) => togglePrivacy("show_followers", e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Export Data */}
        <div className="border-t border-gray-100 pt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Export Your Data</h3>
          <p className="text-sm text-gray-500 mb-4">
            Download a copy of all your profile settings, preferences, and stored voyages in JSON
            format.
          </p>
          <Button
            onClick={handleExportData}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 hover:bg-gray-800"
          >
            <IoDownloadOutline className="text-lg" />
            Request Data Export
          </Button>
        </div>
      </div>
    </div>
  );
}
