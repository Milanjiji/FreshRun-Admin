import React from "react";
import { Scale, ShieldAlert, FileText, CheckCircle } from "lucide-react";

export default function TermsAndConditions() {
  const lastUpdated = "June 3, 2026";

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-secondary/10 text-secondary mb-2">
          <Scale size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground font-mont">Terms & Conditions</h1>
        <p className="text-muted text-sm font-medium">Last Updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <p className="text-lg leading-relaxed text-muted-foreground italic border-l-4 border-primary pl-4 bg-primary/5 py-4 rounded-r-xl">
          Welcome to FreshRun. By using our application or website, you agree to comply with and be bound by the following terms and conditions of use.
        </p>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-white text-sm font-bold">1</span>
            Acceptance of Terms
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using the FreshRun platform (Customer App, Delivery App, or Admin Dashboard), you signify that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-white text-sm font-bold">2</span>
            User Accounts
          </h2>
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm space-y-3">
            <p className="text-sm font-semibold">To use certain features of the app, you must register for an account. You agree to:</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>Provide accurate, current, and complete information.</li>
              <li>Maintain the security of your account by not sharing your OTP or credentials.</li>
              <li>Promptly update any changes to your information.</li>
              <li>Take responsibility for all activities that occur under your account.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-white text-sm font-bold">3</span>
            Ordering and Delivery
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Orders are subject to availability of products at the partner stores. We strive to provide accurate delivery times, but these are estimates and may be affected by traffic, weather, or vendor delays.
          </p>
          <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex gap-4 items-start">
             <ShieldAlert size={24} className="text-amber-500 shrink-0" />
             <p className="text-xs text-amber-700 font-medium">
               Note: FreshRun is a marketplace. We are not responsible for the quality of food or products prepared by third-party restaurants or vendors, though we assist in dispute resolution.
             </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-white text-sm font-bold">4</span>
            Pricing and Payments
          </h2>
          <p className="text-muted-foreground">
            All prices are set by the respective vendors. FreshRun may charge a delivery fee and a small handling fee per order. Payments can be made via integrated secure payment gateways or cash on delivery where available.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-white text-sm font-bold">5</span>
            Intellectual Property
          </h2>
          <p className="text-muted-foreground">
            All content on the FreshRun platform, including logos, graphics, and software, is the property of FreshRun and protected by copyright laws.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-white text-sm font-bold">6</span>
            Limitation of Liability
          </h2>
          <p className="text-muted-foreground">
            FreshRun shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.
          </p>
        </section>

        <section className="mt-12 p-8 rounded-3xl bg-secondary text-white text-center">
          <h2 className="text-2xl font-bold m-0 mb-4 text-white font-mont italic">Legal Compliance</h2>
          <p className="opacity-90 mb-6 text-sm">
            These terms are governed by and construed in accordance with the laws of India.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 rounded-full border border-white/20">
             <CheckCircle size={16} />
             <span className="text-xs font-bold uppercase tracking-widest">Version 1.2.0</span>
          </div>
        </section>
      </div>
    </div>
  );
}
