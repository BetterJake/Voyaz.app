"use client";
import React from "react";
import { Select } from "@/components/ui/Select";
import { SettingsFormData } from "../../settings/types";
import { CURRENCIES } from "../constants";

interface PreferencesStepProps {
  formData: SettingsFormData;
  onChange: (field: keyof SettingsFormData, value: any) => void;
}

export function PreferencesStep({ formData, onChange }: PreferencesStepProps) {
  return (
    <div className="space-y-4">
      <Select
        label="Currency"
        value={formData.preferred_currency || ""}
        options={CURRENCIES}
        onChange={(val) => onChange("preferred_currency", val)}
      />
    </div>
  );
}
