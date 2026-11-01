import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({ orderCode: z.string().trim().min(3).max(40), phone: z.string().trim().min(7).max(25) });

const statusLabels: Record<string, string> = {
  new_enquiry: "Enquiry received — the team will review your requirements.",
  quote_sent: "Quotation prepared — please check your WhatsApp for the quote.",
  awaiting_payment: "Awaiting payment confirmation.",
  confirmed: "Order confirmed.",
  cutting_stitching: "Cutting and stitching in progress.",
  quality_check: "Finishing and quality check in progress.",
  ready_for_delivery: "Your outfit is ready for delivery or collection.",
  completed: "Order completed."
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid order code and phone number." }, { status: 400 });
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("orders")
      .select("status, phone, order_code")
      .eq("order_code", parsed.data.orderCode.toUpperCase())
      .maybeSingle();
    // Keep unknown code and phone mismatch responses indistinguishable to reduce order-code probing.
    if (error || !data || normalisePhone(data.phone) !== normalisePhone(parsed.data.phone)) {
      return NextResponse.json({ message: "We couldn't match those details. Check your order code and phone number, or contact us on WhatsApp." });
    }
    return NextResponse.json({ message: statusLabels[data.status] || "Your order status is being updated." });
  } catch {
    return NextResponse.json({ error: "Order tracking is not configured yet." }, { status: 503 });
  }
}
function normalisePhone(value: string) { return value.replace(/\D/g, "").replace(/^0+/, ""); }