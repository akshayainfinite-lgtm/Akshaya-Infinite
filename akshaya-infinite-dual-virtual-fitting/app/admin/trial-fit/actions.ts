"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function addTrialFitGarment(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/trial-fit");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "owner") redirect("/?error=not-authorised");

  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "");
  const modelGender = String(formData.get("model_gender") || "");
  const fitType = String(formData.get("fit_type") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const file = formData.get("image");
  if (title.length < 2 || title.length > 100 || !["Ladies","Boys","Girls"].includes(category) || !["Female","Male","Unisex"].includes(modelGender) || !(file instanceof File) || !["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 8*1024*1024) redirect("/admin/trial-fit?error=invalid");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const objectPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("trial-fit-catalog").upload(objectPath, file, { contentType:file.type, upsert:false });
  if (uploadError) redirect("/admin/trial-fit?error=upload");
  const { data: urlData } = supabase.storage.from("trial-fit-catalog").getPublicUrl(objectPath);
  const { error: insertError } = await supabase.from("trial_fit_garments").insert({
    title, category, model_gender:modelGender, fit_type:fitType || null, description:description || null,
    image_url:urlData.publicUrl, storage_path:objectPath, created_by:user.id, is_published:true
  });
  if (insertError) {
    await supabase.storage.from("trial-fit-catalog").remove([objectPath]);
    redirect("/admin/trial-fit?error=save");
  }
  revalidatePath("/admin/trial-fit");
  revalidatePath("/trial-fit");
  redirect("/admin/trial-fit?added=1");
}
