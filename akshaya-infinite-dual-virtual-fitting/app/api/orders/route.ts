import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { orderRequestSchema } from "@/lib/validation";

function formToObject(formData: FormData) {
  return {
    customerName: String(formData.get("customerName") || ""),
    phone: String(formData.get("phone") || ""),
    category: String(formData.get("category") || ""),
    garment: String(formData.get("garment") || ""),
    occasion: String(formData.get("occasion") || ""),
    timeline: String(formData.get("timeline") || ""),
    fabric: String(formData.get("fabric") || ""),
    customisation: String(formData.get("customisation") || ""),
    measurements: String(formData.get("measurements") || ""),
    consent: formData.get("consent") === "yes"
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = orderRequestSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the required fields and try again." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    // Elevated access stays on the server only. Validate every field before this call.
    // Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
    const payload = parsed.data;
    const { data, error } = await supabase.from("orders").insert({
      customer_name: payload.customerName,
      phone: payload.phone,
      category: payload.category,
      garment: payload.garment,
      occasion: payload.occasion,
      timeline: payload.timeline,
      fabric_details: payload.fabric,
      customisation_details: payload.customisation,
      measurement_notes: payload.measurements,
      consent_to_contact: true,
      status: "new_enquiry"
    }).select("order_code").single();

    if (error) {
      console.error("Order insert failed:", error.message);
      return NextResponse.json({ error: "We couldn't save your request. Please try again or contact us on WhatsApp." }, { status: 500 });
    }
    const whatsapp = process.env.AKSHAYA_WHATSAPP_NUMBER || "919391411796";
    const msg = `Hello Akshaya Infinite! I submitted tailoring enquiry ${data.order_code}. Please review it and share a quotation.`;
    const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
    return NextResponse.redirect(whatsappUrl, { status: 303 });
  } catch {
    return NextResponse.json({ error: "Website setup is incomplete. Please configure Supabase, then try again." }, { status: 503 });
  }
}