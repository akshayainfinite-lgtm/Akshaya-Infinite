 "use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const [email,setEmail] = useState(""); const [password,setPassword] = useState(""); const [message,setMessage] = useState("");
  async function login(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) { setMessage("Supabase configuration is missing. Follow README setup instructions."); return; }
    const supabase = createBrowserClient(url,key);
    const {error} = await supabase.auth.signInWithPassword({email,password});
    if (error) setMessage("Sign-in failed. Check your credentials or ask the owner to provision your account.");
    else window.location.href = "/admin";
  }
  return <main className="section"><div className="eyebrow">AUTHORised ACCESS</div><h2>Owner <em>sign in.</em></h2><form className="form" onSubmit={login}><div className="grid">
    <label className="field">Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <label className="field">Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
  </div><p><button className="button">Sign in</button></p>{message && <div className="status">{message}</div>}<p className="small">Create owner users in Supabase Auth, then assign the owner role in the profiles table using the SQL setup guide.</p></form></main>;
}