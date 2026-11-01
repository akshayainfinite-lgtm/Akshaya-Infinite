import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addTrialFitGarment } from "./actions";

export const dynamic = "force-dynamic";

export default async function TrialFitAdminPage({ searchParams }: { searchParams: { error?: string; added?: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/trial-fit");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "owner") redirect("/?error=not-authorised");
  const { data: garments } = await supabase.from("trial_fit_garments").select("id,title,category,model_gender,is_published,created_at").order("created_at",{ascending:false});
  return <main className="section admin-fit">
    <div className="eyebrow">OWNER WORKSPACE</div><h1>AI Trial Fit <em>catalogue.</em></h1>
    <p>Upload the actual garment photograph that customers should use for virtual fitting. Use images you own or have permission to use.</p>
    {searchParams.added && <div className="status">Garment added to the customer catalogue.</div>}
    {searchParams.error && <div className="status">Could not save this garment. Check the image type, size, storage bucket and database migration.</div>}
    <form action={addTrialFitGarment} className="form" encType="multipart/form-data">
      <div className="grid">
        <label className="field">Design name *<input name="title" required minLength={2} maxLength={100}/></label>
        <label className="field">Collection *<select name="category" required><option>Ladies</option><option>Boys</option><option>Girls</option></select></label>
        <label className="field">Reference model *<select name="model_gender" required><option value="Female">Female</option><option value="Male">Male</option><option value="Unisex">Unisex</option></select></label>
        <label className="field">Fit type<input name="fit_type" maxLength={80} placeholder="Regular, slim, relaxed…"/></label>
        <label className="field full">Description<textarea name="description" rows={3} maxLength={1000}/></label>
        <label className="field full">Garment photograph *<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required/><small className="small">JPG, PNG or WebP · maximum 8 MB</small></label>
      </div>
      <p><button className="button gold" type="submit">Publish garment design</button></p>
    </form>
    <h2>Published designs</h2>
    {!garments?.length ? <p>No designs uploaded yet.</p> : <div className="owner-garment-list">{garments.map(g=><div key={g.id} className="owner-garment"><b>{g.title}</b><span>{g.category} · {g.model_gender} · {g.is_published?"Published":"Hidden"}</span></div>)}</div>}
    <p><Link href="/admin">← Owner dashboard</Link> · <Link href="/trial-fit">Open customer Trial Fit</Link></p>
  </main>;
}
