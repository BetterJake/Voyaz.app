"use client";
import React from "react";
import { Select } from "@/components/ui/Select";
import { SettingsFormData } from "../../settings/types";
import { TRAVEL_STYLES } from "../constants";

interface TravelStyleStepProps {
  formData: SettingsFormData;
  onChange: (field: keyof SettingsFormData, value: any) => void;
}

export function TravelStyleStep({ formData, onChange }: TravelStyleStepProps) {
  return (
    <div className="space-y-4">
      <Select
        label="Travel Style"
        value={formData.travel_style || ""}
        options={TRAVEL_STYLES}
        onChange={(val) => onChange("travel_style", val)}
      />
    </div>
  );
}
