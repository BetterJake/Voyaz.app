"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCloudUploadOutline,
  IoCopyOutline,
  IoCloseOutline,
  IoMailOutline,
  IoHelpCircleOutline,
} from "react-icons/io5";
import Link from "next/link";
import { SettingsNavigation } from "./ui/SettingsNavigation";
import { ProfileSection } from "./sections/ProfileSection";
import { TravelSection } from "./sections/TravelSection";

import { PrivacySection } from "./sections/PrivacySection";
import { SecuritySection } from "./sections/SecuritySection";
import { BlockedSection } from "./sections/BlockedSection";
import { useAuth } from "@/context/AuthContext";
import { useSettingsForm } from "./hooks/use-settings-form";
import { useSessions } from "./hooks/use-sessions";
import { SettingsClientProps, TabType } from "./types";
import { createClient } from "@/utils/supabase/client";
import { useScrollLock } from "@/hooks/useScrollLock";
import { signOutAction, deleteAccountAction } from "@/app/actions/auth";

export function SettingsClient(props: SettingsClientProps) {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  useScrollLock(showSupportModal);

  const [copied, setCopied] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState(props.avatarUrl);
  const [localBannerUrl, setLocalBannerUrl] = useState(props.profile?.banner_url);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const form = useSettingsForm(props);
  const sessions = useSessions(activeTab);

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmValue !== "DELETE") return;
    setIsDeleting(true);
    try {
      await signOut();
      await deleteAccountAction();
    } catch (error: any) {
      form.setSaveError(error.message || "Failed to delete account.");
      setIsDeleting(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const fileName = `${props.userId}-avatar-${Math.random()}.${file.name.split(".").pop()}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: props.userId,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      });
      if (profileError) throw profileError;
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (authError) throw authError;
      form.handleInputChange("avatar_url", publicUrl);
      setLocalAvatarUrl(urlWithCacheBuster);
      router.refresh();
      form.setSaveSuccess("Profile picture updated!");
    } catch (error: any) {
      form.setSaveError(error.message || "Error uploading avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    try {
      const fileName = `${props.userId}-banner-${Math.random()}.${file.name.split(".").pop()}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: props.userId,
        banner_url: publicUrl,
        updated_at: new Date().toISOString(),
      });
      if (profileError) throw profileError;
      form.handleInputChange("banner_url", publicUrl);
      setLocalBannerUrl(urlWithCacheBuster);
      router.refresh();
      form.setSaveSuccess("Profile banner updated!");
    } catch (error: any) {
      form.setSaveError(error.message || "Error uploading banner.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleExportData = () => {
    const data = {
      user: { id: props.userId, email: props.email, ...form.formData },
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voyaz_data_export.json`;
    a.click();
    form.setSaveSuccess("Data exported successfully.");
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("hello@voyaz.app");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-36 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      <AnimatePresence>
        {form.saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-8 left-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm"
          >
            <IoCheckmarkCircleOutline className="text-xl text-green-400" />
            {form.saveSuccess}
          </motion.div>
        )}
        {form.saveError && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-8 left-1/2 z-50 flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm"
          >
            <IoCloseCircleOutline className="text-xl" />
            {form.saveError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-200/60 pb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link
                href="/profile"
                className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 group"
                title="Back to Profile"
              >
                <IoArrowBackOutline className="text-xl text-gray-400 group-hover:text-primary transition-colors" />
              </Link>
              <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block" />
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 leading-none">
                Settings
              </h1>
            </div>
            <p className="text-gray-400 font-bold text-sm md:text-base uppercase tracking-widest ml-1">
              Personalize your voyage experience
            </p>
          </div>
          <button
            onClick={() => setShowSupportModal(true)}
            className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <IoHelpCircleOutline size={18} />
            Need Help?
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <SettingsNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleLogout={handleLogout}
            onSupportClick={() => setShowSupportModal(true)}
          />

          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeTab === "profile" && (
                  <ProfileSection
                    {...form}
                    isGoogleOAuth={props.isGoogleOAuth}
                    email={props.email}
                    localAvatarUrl={localAvatarUrl}
                    isUploadingAvatar={isUploadingAvatar}
                    fileInputRef={fileInputRef}
                    handleAvatarUpload={handleAvatarUpload}
                    localBannerUrl={localBannerUrl}
                    isUploadingBanner={isUploadingBanner}
                    bannerInputRef={bannerInputRef}
                    handleBannerUpload={handleBannerUpload}
                  />
                )}
                {activeTab === "travel" && (
                  <TravelSection
                    formData={form.formData}
                    isSaving={form.isSaving}
                    handleInputChange={form.handleInputChange}
                    handleSave={form.handleSave}
                  />
                )}

                {activeTab === "privacy" && (
                  <PrivacySection
                    userId={props.userId}
                    formData={form.formData}
                    handleInputChange={form.handleInputChange}
                    handleExportData={handleExportData}
                    setSaveSuccess={form.setSaveSuccess}
                  />
                )}
                {activeTab === "security" && (
                  <SecuritySection
                    email={props.email}
                    isGoogleOAuth={props.isGoogleOAuth}
                    {...sessions}
                    showDeleteConfirm={showDeleteConfirm}
                    setShowDeleteConfirm={setShowDeleteConfirm}
                    deleteConfirmValue={deleteConfirmValue}
                    setDeleteConfirmValue={setDeleteConfirmValue}
                    isDeleting={isDeleting}
                    handleDeleteAccount={handleDeleteAccount}
                  />
                )}
                {activeTab === "blocked" && <BlockedSection userId={props.userId} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSupportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-2xl"
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setShowSupportModal(false)}
              className="absolute top-12 right-12 w-16 h-16 rounded-3xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-900 transition-all hover:rotate-90 active:scale-90 shadow-xl shadow-gray-200/50 outline-none"
            >
              <IoCloseOutline size={32} />
            </motion.button>
            <div className="max-w-2xl w-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto mb-12 shadow-inner shadow-primary/20 animate-pulse">
                  <IoMailOutline size={48} />
                </div>
                <h2 className="text-6xl md:text-8xl font-[1000] uppercase tracking-tighter text-gray-900 mb-6 leading-[0.9]">
                  Need some
                  <br />
                  <span className="text-primary italic">assistance?</span>
                </h2>
                <p className="text-gray-400 font-bold text-lg md:text-xl uppercase tracking-widest mb-16 max-w-lg mx-auto leading-relaxed">
                  Our team is ready to help you navigate your next discovery. Reach out anytime.
                </p>
                <div className="relative group inline-block">
                  <button
                    onClick={handleCopyEmail}
                    className="group relative bg-white border-2 border-gray-100 px-10 py-8 rounded-[2rem] flex items-center gap-6 hover:border-primary transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-gray-200/50 outline-none"
                  >
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">
                        Direct Support Email
                      </p>
                      <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                        hello@voyaz.app
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {copied ? (
                        <IoCheckmarkCircleOutline size={24} className="text-green-500" />
                      ) : (
                        <IoCopyOutline size={24} />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {copied && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl"
                      >
                        Email Copied!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
