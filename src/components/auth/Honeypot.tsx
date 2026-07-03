"use client";
import React from "react";

interface HoneypotProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * A hidden field to catch bots.
 * If a bot fills this field, we know it's not a human.
 */
export function Honeypot({ value, onChange }: HoneypotProps) {
  return (
    <div style={{ display: "none" }} aria-hidden="true">
      <label htmlFor="website_url">Website URL</label>
      <input
        id="website_url"
        name="website_url"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={50}
      />
    </div>
  );
}
