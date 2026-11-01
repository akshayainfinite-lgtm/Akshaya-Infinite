 "use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["new_enquiry","quote_sent","awaiting_payment","confirmed","cutting_stitching","quality_check","ready_for_delivery","completed","cancelled"])
});
export async function updateOrderStatus(formData: FormData) {
  const parsed = schema.safeParse({ orderId: formData.get("orderId"), status: formData.get("status") });
  if (!parsed.success) redirect("/admin?error=invalid");
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "owner" && profile?.role !== "staff") redirect("/");
  const { error } = await supabase.from("orders").update({ status: parsed.data.status, updated_at: new Date().toISOString() }).eq("id", parsed.data.orderId);
  if (error) redirect("/admin?error=update-failed");
  revalidatePath("/admin"); redirect("/admin?updated=1");
}