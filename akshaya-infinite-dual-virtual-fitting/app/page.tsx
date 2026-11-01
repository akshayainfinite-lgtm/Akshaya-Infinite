import Link from "next/link";

export default function Home() {
  return <>
    <div className="top">BESPOKE CLOTHING · MADE WITH CARE · MADE FOR YOU</div>
    <header className="nav">
      <Link href="/" className="brand">Akshaya Infinite<small>YOUR STYLE. YOUR FIT.</small></Link>
      <nav className="navlinks"><a href="#collections">Collections</a><Link href="/trial-fit">AI Trial Fit</Link><a href="#order">Request a quote</a><Link href="/track">Track order</Link></nav>
    </header>
    <main>
      <section className="hero">
        <div><div className="eyebrow">THOUGHTFULLY TAILORED</div><h1>Clothing that feels<br/><em>uniquely you.</em></h1><p>Custom-made fashion for ladies, boys and girls — designed around your style, occasion and fit.</p><p><Link className="button" href="#order">Request a custom quote ↗</Link></p><p className="small">Personalised designs · Tailor-reviewed measurements · Transparent quotations</p></div>
        <div className="hero-art" aria-label="Abstract tailored dress illustration"><div className="dress"/></div>
      </section>
      <section className="section" id="collections"><div className="eyebrow">THE COLLECTIONS</div><h2>Made for every <em>you.</em></h2><div className="cards">
        <article className="card"><b>Ladies</b><p>Blouses, kurtis, suits, gowns, lehengas and occasion wear.</p><a href="#order">Design your outfit →</a></article>
        <article className="card"><b>Boys</b><p>Kurtas, shirts, trousers, waistcoats and festive wear.</p><a href="#order">Design your outfit →</a></article>
        <article className="card"><b>Girls</b><p>Frocks, gowns, lehengas, party dresses and festive wear.</p><a href="#order">Design your outfit →</a></article>
      </div></section>
      <section className="section" id="fit" style={{background:"var(--cream)"}}><div className="eyebrow">AI FIT & STYLE ASSISTANT</div><h2>A more personal <em>fit.</em></h2><p>Explore the customer Trial Fit studio: enter measurements manually, choose a garment published by the owner and prepare a private virtual fitting. Camera measurement and AI garment rendering activate after approved providers are integrated and validated.</p><p><Link className="button gold" href="/trial-fit">Open AI Trial Fit ↗</Link></p><div className="notice"><b>Privacy by design:</b> Ask for explicit consent before processing body images, restrict staff access, minimise retention and provide deletion options. For children, require parent/guardian involvement. Always offer manual measurement.</div></section>
      <section className="section" id="order"><div className="eyebrow">LET'S MAKE SOMETHING SPECIAL</div><h2>Request a custom <em>quotation.</em></h2><p>Share your requirements. Your request is stored securely and your WhatsApp enquiry can be prepared after submission.</p><OrderForm/></section>
      <section className="section" style={{background:"var(--cream)"}}><div className="eyebrow">OWNER TOOLS</div><h2>Tailoring, organised.</h2><p>Admin access is restricted to authenticated users. Manage enquiries, quotations, payment confirmation and tailoring progress from the owner dashboard.</p><Link className="button gold" href="/admin">Open owner dashboard</Link> <Link className="button" href="/admin/trial-fit">Manage Trial Fit designs</Link><p className="small">You must sign in with an authorised Supabase account. Never share admin credentials.</p></section>
    </main>
    <footer className="footer"><b className="brand">Akshaya Infinite</b><span>Thoughtfully tailored for every occasion.</span><span>© {new Date().getFullYear()} Akshaya Infinite</span></footer>
  </>;
}

function OrderForm() {
  return <form className="form" action="/api/orders" method="post">
    <div className="grid">
      <label className="field">Customer name *<input name="customerName" required minLength={2} maxLength={100}/></label>
      <label className="field">Phone number *<input name="phone" required minLength={7} maxLength={25} placeholder="+91…"/></label>
      <label className="field">Collection *<select name="category" required><option value="">Choose</option><option>Ladies</option><option>Boys</option><option>Girls</option></select></label>
      <label className="field">Garment *<input name="garment" required placeholder="Blouse, kurta, frock…"/></label>
      <label className="field">Occasion<input name="occasion" maxLength={100}/></label>
      <label className="field">Timeline<input name="timeline" maxLength={100}/></label>
      <label className="field full">Fabric / material<input name="fabric" maxLength={500}/></label>
      <label className="field full">Customisation details *<textarea name="customisation" required minLength={3} maxLength={3000} rows={3}/></label>
      <label className="field full">Measurement / fitting notes (optional)<textarea name="measurements" maxLength={2000} rows={2}/></label>
      <label className="field full" style={{fontWeight:400,display:"block"}}><input type="checkbox" name="consent" value="yes" required style={{width:"auto",marginRight:8}}/>I consent to using these details to respond to my tailoring enquiry.</label>
    </div>
    <p><button className="button" type="submit">Submit enquiry</button></p>
    <p className="small">No payment is collected on this website. Final pricing is confirmed by the owner.</p>
  </form>;
}