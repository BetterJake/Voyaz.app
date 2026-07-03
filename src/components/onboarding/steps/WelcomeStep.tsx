import React from "react";
import { Input } from "@/components/ui/Input";
import { SettingsFormData } from "../../settings/types";
interface WelcomeStepProps {
  formData: SettingsFormData;
  onChange: (field: keyof SettingsFormData, value: any) => void;
}
export function WelcomeStep({ formData, onChange }: WelcomeStepProps) {
  return (
    <div className="space-y-4">
      <Input
        label="First Name"
        placeholder="Emily"
        value={formData.first_name}
        onChange={(e) => onChange("first_name", e.target.value)}
        maxLength={50}
      />
      <Input
        label="Last Name"
        placeholder="Carter"
        value={formData.last_name}
        onChange={(e) => onChange("last_name", e.target.value)}
        maxLength={50}
      />
    </div>
  );
}
