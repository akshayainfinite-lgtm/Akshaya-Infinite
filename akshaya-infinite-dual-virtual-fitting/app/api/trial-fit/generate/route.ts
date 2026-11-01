import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  garmentId: z.string().uuid(),
  consent: z.literal(true),
  photoName: z.string().min(1).max(180),
  photoType: z.enum(["image/jpeg","image/png","image/webp"]),
  photoSize: z.number().int().positive().max(8 * 1024 * 1024),
  category: z.enum(["Ladies","Boys","Girls"]),
  unit: z.enum(["cm","in"]),
  measurements: z.record(z.string(), z.string().max(12)).optional()
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return NextResponse.json({ message: "Please check the photo, selected design and consent." }, { status: 400 });

  // The UI intentionally sends metadata only. A real provider adapter must be selected,
  // privacy-reviewed and connected before any customer photo bytes are transmitted.
  if (!process.env.VIRTUAL_TRYON_PROVIDER || !process.env.VIRTUAL_TRYON_API_KEY) {
    return NextResponse.json({
      configured: false,
      message: "AI virtual fitting is not connected yet. Your photo has not been uploaded or stored. The owner must connect and test an approved virtual try-on provider before live previews can be generated."
    }, { status: 503 });
  }
  return NextResponse.json({ configured: false, message: "The provider adapter is not implemented yet. No photo was transmitted." }, { status: 503 });
}
