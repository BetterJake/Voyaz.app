import React from "react";
import { motion } from "framer-motion";
import {
  IoPersonOutline,
  IoCameraOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoLogoGoogle,
  IoLockClosedOutline,
} from "react-icons/io5";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { SettingsFormData } from "../types";
interface ProfileSectionProps {
  formData: SettingsFormData;
  isSaving: boolean;
  usernameStatus: "idle" | "checking" | "available" | "taken";
  isGoogleOAuth: boolean;
  email: string;
  newEmail: string;
  setNewEmail: (email: string) => void;
  localAvatarUrl?: string;
  isUploadingAvatar: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localBannerUrl?: string;
  isUploadingBanner: boolean;
  bannerInputRef: React.RefObject<HTMLInputElement | null>;
  handleBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputChange: (field: keyof SettingsFormData, value: any) => void;
  handleSave: (section: string) => void;
}
export function ProfileSection({
  formData,
  isSaving,
  usernameStatus,
  isGoogleOAuth,
  email,
  newEmail,
  setNewEmail,
  localAvatarUrl,
  isUploadingAvatar,
  fileInputRef,
  handleAvatarUpload,
  localBannerUrl,
  isUploadingBanner,
  bannerInputRef,
  handleBannerUpload,
  handleInputChange,
  handleSave,
}: ProfileSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">
            Profile Appearance
          </h2>
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-3 ml-1">
              Profile Banner
            </label>
            <div
              className="relative h-32 md:h-44 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer group"
              onClick={() => !isUploadingBanner && bannerInputRef.current?.click()}
            >
              {isUploadingBanner && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {localBannerUrl ? (
                <img
                  src={localBannerUrl}
                  alt="Banner"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                  <IoCameraOutline className="text-3xl" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Click to upload banner
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                Change Banner
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={bannerInputRef}
                onChange={handleBannerUpload}
                disabled={isUploadingBanner}
              />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 ml-1">
              Recommend 1500x500px. JPG, PNG up to 10MB.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 text-center sm:text-left">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex shrink-0 items-center justify-center cursor-pointer group"
              onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
            >
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {localAvatarUrl ? (
                <img src={localAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${email}&background=random`}
                  alt="Avatar Placeholder"
                  className="w-full h-full object-cover opacity-80"
                />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <IoCameraOutline className="text-white text-2xl" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Profile Picture</h3>
              <p className="text-sm text-gray-500 mb-3">PNG, JPG or GIF up to 5MB.</p>
              <input
                type="file"
                accept="image/*. "
                className="hidden"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto px-6 py-2 text-sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploadingAvatar}
              >
                Upload New
              </Button>
            </div>
          </div>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave("Profile");
            }}
          >
            <div>
              <div className="relative">
                <Input
                  label="Username (Nickname)"
                  placeholder="e.g. travel_guru"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange(
                      "username",
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                    )
                  }
                  maxLength={30}
                  error={!formData.username?.trim() ? "Username is required" : undefined}
                />
                <div className="absolute right-3 top-[38px] flex items-center">
                  {usernameStatus === "checking" && (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {formData.username?.trim() && usernameStatus === "available" && (
                    <IoCheckmarkCircleOutline className="text-xl text-green-500" />
                  )}
                  {formData.username?.trim() && usernameStatus === "taken" && (
                    <IoCloseCircleOutline className="text-xl text-red-500" />
                  )}
                </div>
              </div>
              {formData.username?.trim() && usernameStatus === "taken" && (
                <p className="text-[11px] font-bold text-red-500 mt-1.5 ml-1">Already taken.</p>
              )}
              {formData.username?.trim() && usernameStatus === "available" && (
                <p className="text-[11px] font-bold text-green-500 mt-1.5 ml-1">Available!</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                maxLength={50}
                error={!formData.first_name?.trim() ? "Required" : undefined}
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                maxLength={50}
                error={!formData.last_name?.trim() ? "Required" : undefined}
              />
            </div>
            <TextArea
              label="Bio"
              placeholder="Tell us about your travel philosophy..."
              value={formData.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              maxLength={160}
            />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right mt-1">
              {formData.bio?.length || 0}/160
            </p>
            <div>
              <Input
                label="Email Address"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={isGoogleOAuth}
                icon={isGoogleOAuth ? <IoLockClosedOutline /> : undefined}
                maxLength={255}
              />
              {isGoogleOAuth && (
                <p className="text-[11px] font-bold text-gray-400 mt-2 ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                  <IoLogoGoogle className="text-xs" /> Account connected to Google
                </p>
              )}
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isSaving}
                className="w-full sm:w-auto px-8"
                disabled={
                  !formData.username?.trim() ||
                  !formData.first_name?.trim() ||
                  !formData.last_name?.trim() ||
                  usernameStatus === "taken" ||
                  usernameStatus === "checking"
                }
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
