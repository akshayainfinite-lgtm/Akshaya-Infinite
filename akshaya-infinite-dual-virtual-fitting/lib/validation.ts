import { z } from "zod";

export const orderRequestSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(25),
  category: z.enum(["Ladies", "Boys", "Girls"]),
  garment: z.string().trim().min(2).max(120),
  occasion: z.string().trim().max(100).optional().default(""),
  timeline: z.string().trim().max(100).optional().default(""),
  fabric: z.string().trim().max(500).optional().default(""),
  customisation: z.string().trim().min(3).max(3000),
  measurements: z.string().trim().max(2000).optional().default(""),
  consent: z.literal(true)
});

export const quoteSchema = z.object({
  baseStitching: z.number().min(0).max(100000),
  fabricCost: z.number().min(0).max(1000000).default(0),
  extraMaterial: z.number().min(0).max(100000).default(0),
  labourHours: z.number().min(0).max(1000).default(0),
  labourRate: z.number().min(0).max(100000).default(0),
  customWork: z.number().min(0).max(1000000).default(0),
  workloadSurcharge: z.number().min(0).max(100000).default(0),
  expressSurcharge: z.number().min(0).max(100000).default(0),
  delivery: z.number().min(0).max(100000).default(0)
}).strict();

export type QuoteInput = z.infer<typeof quoteSchema>;
export function calculateQuote(input: QuoteInput) {
  const labour = input.labourHours * input.labourRate;
  const total = input.baseStitching + input.fabricCost + input.extraMaterial + labour +
    input.customWork + input.workloadSurcharge + input.expressSurcharge + input.delivery;
  return { labour, total: Math.round(total * 100) / 100, currency: "INR" as const };
}