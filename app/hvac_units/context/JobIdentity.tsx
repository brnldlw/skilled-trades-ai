"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Observation } from "../../lib/unit-store";

export type JobIdentity = {
  manufacturer: string;
  model: string;
  symptom: string;
  observations: Observation[];
};

const JobIdentityContext = createContext<JobIdentity | null>(null);

export function JobIdentityProvider({
  value,
  children,
}: {
  value: JobIdentity;
  children: ReactNode;
}) {
  return (
    <JobIdentityContext.Provider value={value}>
      {children}
    </JobIdentityContext.Provider>
  );
}

export function useJobIdentity(): JobIdentity {
  const ctx = useContext(JobIdentityContext);
  if (!ctx) {
    throw new Error("useJobIdentity must be used within a JobIdentityProvider");
  }
  return ctx;
}
