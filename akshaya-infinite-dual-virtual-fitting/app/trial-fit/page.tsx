import Link from "next/link";
import TrialFitClient from "./trial-fit-client";

export const metadata = {
  title: "AI Trial Fit | Akshaya Infinite",
  description: "Explore your fit with Akshaya Infinite's guided measurement and virtual trial room."
};

export default function TrialFitPage() {
  return <main className="section trial-shell">
    <div className="eyebrow">AKSHAYA INFINITE · PERSONAL FIT STUDIO</div>
    <h1 className="trial-title">Your fit, <em>your way.</em></h1>
    <p className="trial-intro">Enter your measurements, explore owner-selected designs and preview the trial-fit experience.</p>
    <TrialFitClient />
    <p className="small"><Link href="/">← Back to Akshaya Infinite</Link></p>
  </main>;
}
