import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("trial_fit_garments")
      .select("id,title,category,fit_type,image_url,model_gender,description")
      .eq("is_published", true).order("created_at", { ascending: false }).limit(60);
    if (error) return NextResponse.json({ garments: [], message: "Catalogue is not configured yet." });
    return NextResponse.json({ garments: data || [] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ garments: [], message: "Supabase is not configured." }, { status: 200 });
  }
}
