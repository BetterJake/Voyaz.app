"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "./hooks/use-onboarding";
import { STEPS, STEP_CONTENT_VARIANTS } from "./constants";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ProfileStep } from "./steps/ProfileStep";
import { TravelStyleStep } from "./steps/TravelStyleStep";
import { AIContextStep } from "./steps/AIContextStep";
import { PreferencesStep } from "./steps/PreferencesStep";
import AuthLayout from "@/components/auth/AuthLayout";
interface OnboardingClientProps {
  userId: string;
  email: string;
  initialFirstName?: string;
  initialLastName?: string;
  avatarUrl?: string;
}
export default function OnboardingClient({
  userId,
  initialFirstName = "",
  initialLastName = "",
  avatarUrl = "",
}: OnboardingClientProps) {
  const {
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
  } = useOnboarding({ userId, initialFirstName, initialLastName, avatarUrl });
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep formData={formData} onChange={handleInputChange} />;
      case 1:
        return (
          <ProfileStep
            formData={formData}
            onChange={handleInputChange}
            localAvatarUrl={localAvatarUrl}
            isUploadingAvatar={isUploadingAvatar}
            onAvatarUpload={handleAvatarUpload}
            usernameStatus={usernameStatus}
          />
        );
      case 2:
        return <TravelStyleStep formData={formData} onChange={handleInputChange} />;
      case 3:
        return <AIContextStep formData={formData} onChange={handleInputChange} />;
      case 4:
        return <PreferencesStep formData={formData} onChange={handleInputChange} />;
      default:
        return null;
    }
  };
  const stepDescriptions = [
    "Let's start with your basic identity.",
    "Personalize how others see you.",
    "Tell us about your travel habits.",
    "Help our AI plan the perfect trip.",
    "Configure your local environment.",
  ];
  const isNextDisabled =
    (currentStep === 1 && (usernameStatus === "taken" || !formData.username)) || isSaving;
  return (
    <AuthLayout>
      <div className="relative">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-500 ${index <= currentStep ? "w-6 bg-primary" : "w-2 bg-slate-100"}`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors focus:outline-none"
          >
            Skip for now
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={STEP_CONTENT_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-8"
          >
            <header className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Step 0{currentStep + 1}
              </span>
              <h2 className="text-4xl font-black tracking-tight text-gray-900 uppercase">
                {STEPS[currentStep].title}
              </h2>
              <p className="text-sm font-medium text-gray-500">{stepDescriptions[currentStep]}</p>
            </header>
            <div className="space-y-5">{renderStep()}</div>
            {saveError && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                Could not save your profile: {saveError}
              </div>
            )}
            <div className="pt-4 flex flex-col gap-3">
              <Button onClick={handleNext} isLoading={isSaving} disabled={isNextDisabled}>
                {currentStep === STEPS.length - 1 ? "Start Your Journey" : "Continue"}
              </Button>
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  disabled={isSaving}
                  className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors py-2 focus:outline-none"
                >
                  Go Back
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
}
