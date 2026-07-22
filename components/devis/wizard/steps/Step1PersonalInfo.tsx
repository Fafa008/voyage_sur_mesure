"use client";

import { PersonalInfoSection } from "@/components/devis/sections/PersonalInfoSection";

interface Step1Props {
  data: any;
  updateData: (data: any) => void;
}

export function Step1PersonalInfo({ data, updateData }: Step1Props) {
  const handleChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  return <PersonalInfoSection data={data} onChange={handleChange} />;
}
