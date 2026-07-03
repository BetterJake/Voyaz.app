import React from "react";
import { Button } from "@/components/ui/Button";
import { SettingsFormData } from "../types";
interface NotificationsSectionProps {
  formData: SettingsFormData;
  isSaving: boolean;
  handleInputChange: (field: keyof SettingsFormData, value: any) => void;
  handleSave: (section: string) => void;
}
export function NotificationsSection({
  formData,
  isSaving,
  handleInputChange,
  handleSave,
}: NotificationsSectionProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Notifications</h2>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave("Notifications");
        }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">
                Receive trip updates, itineraries, and AI recommendations.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.email_notifications}
                onChange={(e) => handleInputChange("email_notifications", e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="w-full h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Promotional Emails</h3>
              <p className="text-sm text-gray-500">Receive special offers, tips, and news.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.promotional_emails}
                onChange={(e) => handleInputChange("promotional_emails", e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="w-full h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-500">Get instant alerts on your device.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.push_notifications}
                onChange={(e) => handleInputChange("push_notifications", e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="pt-4">
            <Button type="submit" isLoading={isSaving} className="w-full sm:w-auto px-8">
              Save Notifications
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
