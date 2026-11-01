 "use client";
import { useState } from "react";
export function TrackForm() {
  const [code, setCode] = useState(""); const [phone, setPhone] = useState(""); const [result, setResult] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setResult("");
    try {
      const response = await fetch("/api/track", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ orderCode: code, phone }) });
      const data = await response.json(); setResult(data.message || data.error || "No update available.");
    } catch { setResult("Could not check the order right now. Please try again later."); }
    finally { setLoading(false); }
  }
  return <form className="form" onSubmit={submit}><div className="grid">
    <label className="field">Order code<input value={code} onChange={e=>setCode(e.target.value)} required maxLength={40} placeholder="AI-…"/></label>
    <label className="field">Phone number used for the order<input value={phone} onChange={e=>setPhone(e.target.value)} required maxLength={25} /></label>
  </div><p><button className="button" disabled={loading}>{loading ? "Checking…" : "Check order status"}</button></p>{result && <div className="status" role="status">{result}</div>}</form>;
}