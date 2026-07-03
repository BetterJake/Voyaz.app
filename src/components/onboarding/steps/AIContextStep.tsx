"use client";
import React from "react";
import { Input } from "@/components/ui/Input";
import { SettingsFormData } from "../../settings/types";

interface AIContextStepProps {
  formData: SettingsFormData;
  onChange: (field: keyof SettingsFormData, value: any) => void;
}

export function AIContextStep({ formData, onChange }: AIContextStepProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Dietary Restrictions"
        placeholder="e.g. Vegan, Vegetarian, Gluten-free"
        value={formData.dietary_restrictions}
        onChange={(e) => onChange("dietary_restrictions", e.target.value)}
        maxLength={200}
      />
    </div>
  );
}
