import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateOrderStatus } from "./actions";

const statuses = ["new_enquiry","quote_sent","awaiting_payment","confirmed","cutting_stitching","quality_check","ready_for_delivery","completed","cancelled"];
const labels: Record<string,string> = {new_enquiry:"New enquiry",quote_sent:"Quote sent",awaiting_payment:"Awaiting payment",confirmed:"Confirmed",cutting_stitching:"Cutting & stitching",quality_check:"Quality check",ready_for_delivery:"Ready for delivery",completed:"Completed",cancelled:"Cancelled"};

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "owner" && profile?.role !== "staff") redirect("/?error=not-authorised");

  const { data: orders, error } = await supabase.from("orders").select("id,order_code,created_at,customer_name,phone,category,garment,status,quoted_total,payment_status,customisation_details").order("created_at",{ascending:false}).limit(100);
  return <main className="section"><div className="eyebrow">PRIVATE WORKSPACE</div><h2>Owner <em>dashboard.</em></h2><p>Signed in as {user.email}. <a href="/auth/signout">Sign out</a></p>
    {error && <div className="notice">Unable to load orders. Check database migration and access policies.</div>}
    <div className="notice">Privacy reminder: body measurements and photos are sensitive. Collect only what you need, restrict access and delete data when no longer required.</div>
    {!orders?.length ? <p>No orders yet.</p> : <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:850}}><thead><tr>{["Order","Customer","Garment","Status","Quote (₹)","Payment","Update"].map(x=><th key={x} style={{textAlign:"left",padding:10,borderBottom:"1px solid var(--line)"}}>{x}</th>)}</tr></thead><tbody>{orders.map(order=><tr key={order.id}>
      <td style={{padding:10,borderBottom:"1px solid var(--line)"}}><b>{order.order_code}</b><div className="small">{new Date(order.created_at).toLocaleDateString("en-IN")}</div></td>
      <td style={{padding:10,borderBottom:"1px solid var(--line)"}}>{order.customer_name}<div className="small">{order.phone}</div></td>
      <td style={{padding:10,borderBottom:"1px solid var(--line)"}}>{order.category} · {order.garment}<div className="small">{order.customisation_details}</div></td>
      <td style={{padding:10,borderBottom:"1px solid var(--line)"}}>{labels[order.status] || order.status}</td>
      <td style={{padding:10,borderBottom:"1px solid var(--line)"}}>{order.quoted_total == null ? "—" : Number(order.quoted_total).toLocaleString("en-IN")}</td>
      <td style={{padding:10,borderBottom:"1px solid var(--line)"}}>{order.payment_status}</td>
      <td style={{padding:10,borderBottom:"1px solid var(--line)"}}><form action={updateOrderStatus}><input type="hidden" name="orderId" value={order.id}/><select name="status" defaultValue={order.status}>{statuses.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select><button className="button" style={{marginTop:6,padding:8}}>Save</button></form></td>
    </tr>)}</tbody></table></div>}
    <p><a href="/">← View website</a></p>
  </main>;
}