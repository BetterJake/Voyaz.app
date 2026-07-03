import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SettingsFormData } from "../types";
interface TravelSectionProps {
  formData: SettingsFormData;
  isSaving: boolean;
  handleInputChange: (field: keyof SettingsFormData, value: any) => void;
  handleSave: (section: string) => void;
}
export function TravelSection({
  formData,
  isSaving,
  handleInputChange,
  handleSave,
}: TravelSectionProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 tracking-tight">
          AI Trip Planner Context
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          These settings help our AI generate the perfect, personalized itineraries just for you.
        </p>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave("Travel Preferences");
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-primary">
                Travel Style
              </label>
              <select
                value={formData.travel_style}
                onChange={(e) => handleInputChange("travel_style", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary bg-white"
              >
                <option>Budget Backpacker</option>
                <option>Comfort & Culture</option>
                <option>Luxury Resort</option>
                <option>Adventure & Nature</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-primary">
                Preferred Currency
              </label>
              <select
                value={formData.preferred_currency}
                onChange={(e) => handleInputChange("preferred_currency", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary bg-white"
              >
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>PLN (zł)</option>
                <option>JPY (¥)</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary">
              Dietary Restrictions
            </label>
            <Input
              placeholder="e.g. Vegetarian, Gluten-free, Vegan"
              value={formData.dietary_restrictions}
              onChange={(e) => handleInputChange("dietary_restrictions", e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="pt-4">
            <Button type="submit" isLoading={isSaving} className="w-full sm:w-auto px-8">
              Update AI Preferences
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
