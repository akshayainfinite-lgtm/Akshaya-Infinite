/**
 * AI measurement integration boundary — no provider is configured yet.
 *
 * Production integration requirements:
 * 1. Choose a provider that supports the intended garments and required camera views.
 * 2. Confirm API terms, image retention/deletion, data location, child-data safeguards,
 *    security certifications, accuracy claims, pricing, and commercial usage rights.
 * 3. Send images only from a server route after explicit consent.
 * 4. Do not log image bytes, API keys, or sensitive measurements.
 * 5. Store estimated measurements as source="ai_estimate"; require human verification.
 * 6. Delete raw captures as soon as processing is complete unless retention is necessary
 *    and the customer has explicitly agreed.
 */

export type MeasurementRequest = {
  consent: true;
  category: "Ladies" | "Boys" | "Girls";
  garment: string;
  unit: "cm" | "in";
  // Use short-lived signed upload URLs in a production implementation.
  imageObjectKeys: string[];
};

export type MeasurementEstimate = {
  measurements: Record<string, number>;
  confidence?: Record<string, number>;
  provider: string;
  requiresTailorVerification: true;
};

export async function estimateMeasurements(_input: MeasurementRequest): Promise<MeasurementEstimate> {
  throw new Error("No AI measurement provider is configured. Use manual measurements until a provider is selected and validated.");
}