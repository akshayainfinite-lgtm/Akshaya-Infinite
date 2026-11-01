"use client";

import { useEffect, useMemo, useState } from "react";

type Garment = { id: string; title: string; category: string; fit_type: string | null; image_url: string; model_gender: string; description: string | null };
const fields = [["height","Height"],["chest","Chest / bust"],["waist","Waist"],["hip","Hip"],["shoulder","Shoulder width"],["sleeve","Sleeve length"],["inseam","Inside leg"]] as const;
type Mode = "photo" | "avatar";

function AvatarPreview({ gender, chest, waist, hip, height, garment }: { gender:string; chest:number; waist:number; hip:number; height:number; garment:Garment|null }) {
  const torso = Math.max(54, Math.min(91, 69 + (chest-90)*0.48));
  const waistWidth = Math.max(43, Math.min(78, 57 + (waist-75)*0.48));
  const hipWidth = Math.max(52, Math.min(91, 68 + (hip-94)*0.43));
  const scaleY = Math.max(.88, Math.min(1.12, height/170));
  const isMale = gender === "Male";
  return <div className="avatar-stage">
    <div className="avatar-caption">3D FIT PREVIEW · ADJUSTABLE BODY MODEL</div>
    <svg className="avatar-svg" viewBox="0 0 300 440" role="img" aria-label="Adjustable illustrative 3D body avatar wearing a sample garment">
      <defs><linearGradient id="skin" x1="0" x2="1"><stop stopColor="#9a6549"/><stop offset=".48" stopColor="#d6a17e"/><stop offset="1" stopColor="#87553f"/></linearGradient><linearGradient id="cloth" x1="0" x2="1"><stop stopColor="#766044"/><stop offset=".5" stopColor="#c4a779"/><stop offset="1" stopColor="#6b553b"/></linearGradient><linearGradient id="shade" x1="0" x2="1"><stop stopColor="#000" stopOpacity=".2"/><stop offset=".5" stopColor="#fff" stopOpacity=".12"/><stop offset="1" stopColor="#000" stopOpacity=".25"/></linearGradient></defs>
      <ellipse cx="150" cy="416" rx="75" ry="10" fill="#5c4a35" opacity=".15"/>
      <g transform={`translate(0 ${220*(1-scaleY)}) scale(1 ${scaleY})`}>
        <path d="M130 67 Q150 55 170 67 L174 103 Q150 117 126 103Z" fill="url(#skin)"/>
        <ellipse cx="150" cy="43" rx="29" ry="35" fill="url(#skin)"/>
        <path d="M121 38 Q120 5 151 6 Q181 7 180 42 Q168 21 149 24 Q135 24 121 38" fill="#30251f"/>
        <path d={`M${150-torso/2} 105 Q150 91 ${150+torso/2} 105 L${150+torso/2+14} 196 Q150 214 ${150-waistWidth/2} 214 L${150-waistWidth/2-8} 158Z`} fill="url(#skin)"/>
        <path d={`M${150-torso/2-3} 108 Q150 91 ${150+torso/2+3} 108 L${150+waistWidth/2+4} 205 Q150 223 ${150-waistWidth/2-4} 205Z`} fill="url(#cloth)" stroke="#665039" strokeWidth="1.5"/>
        <path d={`M${150-waistWidth/2-4} 202 Q150 216 ${150+waistWidth/2+4} 202 L${150+hipWidth/2} 295 L${150-hipWidth/2} 295Z`} fill="url(#cloth)" stroke="#665039" strokeWidth="1.5"/>
        <path d={`M${150-torso/2} 110 Q${150-torso/2-22} 108 112 130 L91 218 Q90 232 102 235 Q114 237 119 221 L${150-torso/2+12} 150Z`} fill="url(#skin)"/>
        <path d={`M${150+torso/2} 110 Q${150+torso/2+22} 108 188 130 L209 218 Q210 232 198 235 Q186 237 181 221 L${150+torso/2-12} 150Z`} fill="url(#skin)"/>
        <path d={`M${150-hipWidth/2+8} 290 L${150-hipWidth/2+hipWidth*.42} 290 L145 390 Q142 402 128 400 Q117 397 121 383Z`} fill="url(#skin)"/>
        <path d={`M${150+hipWidth/2-8} 290 L${150+hipWidth/2-hipWidth*.42} 290 L179 383 Q183 397 172 400 Q158 402 155 390Z`} fill="url(#skin)"/>
        <path d="M119 390 Q132 394 145 389 L146 405 Q130 412 111 407Z M155 389 Q168 394 181 390 L189 407 Q170 412 154 405Z" fill="#4b3b30"/>
        <path d="M150 104 L150 294" stroke="#f4dfc2" strokeOpacity=".38" strokeWidth="1"/>
        <path d="M110 235 Q150 244 190 235" stroke="url(#shade)" strokeWidth="5" fill="none"/>
      </g>
    </svg>
    <div className="avatar-garment-label">{garment ? garment.title : "Akshaya Infinite sample fit"}</div>
    <p className="small">Illustrative adjustable avatar. It is not a photorealistic cloth simulation or a verified size recommendation.</p>
  </div>;
}

export default function TrialFitClient() {
  const [unit,setUnit] = useState("cm");
  const [category,setCategory] = useState("Ladies");
  const [measurements,setMeasurements] = useState<Record<string,string>>({});
  const [garments,setGarments] = useState<Garment[]>([]);
  const [garmentId,setGarmentId] = useState("");
  const [photo,setPhoto] = useState<File|null>(null);
  const [consent,setConsent] = useState(false);
  const [status,setStatus] = useState("");
  const [loading,setLoading] = useState(false);
  const [photoUrl,setPhotoUrl] = useState("");
  const [mode,setMode] = useState<Mode>("photo");
  const [avatarGender,setAvatarGender] = useState("Female");
  const [avatar,setAvatar] = useState({chest:90,waist:75,hip:96,height:165});

  useEffect(() => { fetch("/api/trial-fit/catalog").then(r=>r.json()).then(d=>setGarments(d.garments||[])).catch(()=>setGarments([])); },[]);
  useEffect(() => { if (!photo) { setPhotoUrl(""); return; } const url=URL.createObjectURL(photo); setPhotoUrl(url); return ()=>URL.revokeObjectURL(url); },[photo]);
  const selected = useMemo(()=>garments.find(g=>g.id===garmentId)||null,[garments,garmentId]);

  async function requestTrial() {
    if (!selected || !consent) { setStatus("Choose an owner design and accept the temporary-processing consent."); return; }
    if (mode === "photo" && !photo) { setStatus("Choose a full-length photo before continuing."); return; }
    if (mode === "photo" && photo && (!['image/jpeg','image/png','image/webp'].includes(photo.type) || photo.size > 8*1024*1024)) { setStatus("Please choose a JPG, PNG or WebP image under 8 MB."); return; }
    setLoading(true);
    try {
      const response=await fetch("/api/trial-fit/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({garmentId,consent:true,mode,photoName:photo?.name||"avatar-session",photoType:photo?.type||"image/jpeg",photoSize:photo?.size||1,category,unit,measurements,avatar})});
      const data=await response.json(); setStatus(data.message||"The AI provider is not connected yet. No customer photo was transmitted.");
    } catch { setStatus("Could not contact the trial-fit service. Your photo remains on this device."); }
    finally { setLoading(false); }
  }

  return <div className="trial-workspace">
    <div className="trial-modebar" role="tablist" aria-label="Virtual fitting mode">
      <button type="button" role="tab" aria-selected={mode==="photo"} className={mode==="photo"?"active":""} onClick={()=>{setMode("photo");setStatus("")}}> <span>01</span> Photo AI Try-On</button>
      <button type="button" role="tab" aria-selected={mode==="avatar"} className={mode==="avatar"?"active":""} onClick={()=>{setMode("avatar");setStatus("")}}> <span>02</span> 3D Fit Studio</button>
    </div>
    <div className="trial-grid">
      <section className="trial-panel">
        <div className="step-label">01 · YOUR FIT PROFILE</div><h2>Build your fit profile</h2>
        <p className="muted">Enter measurements manually or use the camera measurement workflow when a validated provider is connected. Estimates must be checked before tailoring.</p>
        <div className="inline-fields">
          <label className="field">Collection<select value={category} onChange={e=>setCategory(e.target.value)}><option>Ladies</option><option>Boys</option><option>Girls</option></select></label>
          <label className="field">Unit<select value={unit} onChange={e=>setUnit(e.target.value)}><option value="cm">Centimetres (cm)</option><option value="in">Inches (in)</option></select></label>
        </div>
        <div className="measure-grid">{fields.map(([key,label])=><label className="field" key={key}>{label} ({unit})<input type="number" min="0" max="300" step="0.1" inputMode="decimal" placeholder="Enter value" value={measurements[key]||""} onChange={e=>setMeasurements(v=>({...v,[key]:e.target.value}))}/></label>)}</div>
        <div className="notice trial-notice"><b>Camera measurement status:</b> Guided camera scanning is planned but not active until a measurement provider is selected, integrated and accuracy-tested. Manual measurements work now.</div>
      </section>
      <section className="trial-panel">
        <div className="step-label">02 · OWNER'S COLLECTION</div><h2>Choose your design</h2><p className="muted">Only garments published by Akshaya Infinite appear here. Select the exact design you want to preview.</p>
        {garments.length ? <div className="garment-grid">{garments.map(g=><button type="button" key={g.id} className={"garment-choice "+(garmentId===g.id?"chosen":"")} onClick={()=>setGarmentId(g.id)}><img src={g.image_url} alt={g.title}/><span><b>{g.title}</b><small>{g.category} · {g.model_gender} reference</small></span></button>)}</div> : <div className="empty-catalog">No owner designs are published yet. The owner can add garments from the admin workspace.</div>}
        {mode==="photo" ? <><div className="step-label step-gap">03 · PHOTO-BASED AI TRY-ON</div><h2>See the outfit on you</h2><p className="muted">Choose a clear, full-length photo in fitted clothing, facing the camera with arms slightly away from your body.</p><label className="upload-box"><input type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={e=>setPhoto(e.target.files?.[0]||null)}/><span>＋ Choose or take your photo</span><small>JPG, PNG or WebP · max 8 MB</small></label>{photoUrl&&<div className="photo-preview"><img src={photoUrl} alt="Your selected photo preview"/><button type="button" className="text-button" onClick={()=>setPhoto(null)}>Remove photo</button></div>}</> : <><div className="step-label step-gap">03 · INTERACTIVE 3D FIT STUDIO</div><h2>Adjust your avatar</h2><p className="muted">Create a basic body-shape preview using your measurements. This is an illustrative avatar, not a true 3D cloth simulation.</p><div className="avatar-controls"><label className="field">Avatar model<select value={avatarGender} onChange={e=>setAvatarGender(e.target.value)}><option value="Female">Female</option><option value="Male">Male</option></select></label>{([['height','Height',130,210],['chest','Chest / bust',55,150],['waist','Waist',45,140],['hip','Hip',55,160]] as const).map(([key,label,min,max])=><label className="slider-field" key={key}><span>{label}<b>{avatar[key]} cm</b></span><input type="range" min={min} max={max} value={avatar[key]} onChange={e=>setAvatar(v=>({...v,[key]:Number(e.target.value)}))}/></label>)}</div><AvatarPreview gender={avatarGender} chest={avatar.chest} waist={avatar.waist} hip={avatar.hip} height={avatar.height} garment={selected}/></>}
        <label className="consent-row"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>I consent to temporary processing solely for this fitting session. I understand this starter does not currently send my photo to an AI provider or retain it.</label>
        <button className="button gold trial-submit" disabled={loading} onClick={requestTrial}>{loading?"Checking…":mode==="photo"?"Generate Photo Try-On →":"Continue with 3D Fit →"}</button>
        {status&&<div className="status" role="status">{status}</div>}
        <div className="privacy-note"><b>Temporary photo privacy</b><br/>Photo previews remain in this browser session only. No customer photo is uploaded to Supabase or sent to an AI provider in this starter. When a vetted provider is connected, server-side processing must use short-lived storage and verified deletion.</div>
      </section>
    </div>
  </div>;
}
