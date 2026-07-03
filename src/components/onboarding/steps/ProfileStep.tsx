import React, { useRef } from "react";
import { IoCameraOutline, IoCheckmarkCircle } from "react-icons/io5";
import { Input } from "@/components/ui/Input";
import { SettingsFormData } from "../../settings/types";
interface ProfileStepProps {
  formData: SettingsFormData;
  onChange: (field: keyof SettingsFormData, value: any) => void;
  localAvatarUrl: string;
  isUploadingAvatar: boolean;
  onAvatarUpload: (file: File) => void;
  usernameStatus: "idle" | "checking" | "available" | "taken";
}
export function ProfileStep({
  formData,
  onChange,
  localAvatarUrl,
  isUploadingAvatar,
  onAvatarUpload,
  usernameStatus,
}: ProfileStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarUpload(file);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
        <div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer group"
          onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
        >
          {isUploadingAvatar ? (
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : localAvatarUrl ? (
            <img src={localAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <IoCameraOutline className="text-2xl text-gray-300 group-hover:text-primary transition-colors" />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-gray-900">Profile Photo</p>
          <p className="text-[10px] text-gray-400">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>
      <div className="relative">
        <Input
          label="Username"
          placeholder="traveler_emily"
          value={formData.username}
          onChange={(e) =>
            onChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
          }
          maxLength={30}
        />
        <div className="absolute right-4 top-[38px]">
          {usernameStatus === "checking" && (
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          {usernameStatus === "available" && (
            <IoCheckmarkCircle className="text-green-500 text-lg" />
          )}
        </div>
        {usernameStatus === "taken" && (
          <p className="mt-1 text-[10px] font-bold text-red-500 uppercase">
            Username already taken
          </p>
        )}
      </div>
    </div>
  );
}
