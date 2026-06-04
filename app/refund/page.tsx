import React from "react";
import { RefreshCcw, XCircle, CreditCard, Clock } from "lucide-react";

export default function RefundPolicy() {
  const lastUpdated = "June 3, 2026";

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 text-red-500 mb-2">
          <RefreshCcw size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground font-mont">Refund & Cancellation</h1>
        <p className="text-muted text-sm font-medium">Last Updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
        
        {/* Cancellation Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
               <XCircle size={24} />
             </div>
             <h2 className="text-2xl font-bold m-0 italic font-mont uppercase">Cancellation Policy</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
              <h3 className="text-lg font-bold mb-3 text-red-500">Customer Cancellation</h3>
              <ul className="space-y-3 text-sm text-muted-foreground list-none p-0">
                <li className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span>Orders can be cancelled before the store accepts the order.</span>
                </li>
                <li className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span>Once the store starts preparing the order, cancellation may not be possible.</span>
                </li>
                <li className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span>Cancellation fees may apply if cancelled after acceptance.</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
              <h3 className="text-lg font-bold mb-3 text-primary">Platform Cancellation</h3>
              <ul className="space-y-3 text-sm text-muted-foreground list-none p-0">
                <li className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Vendor is unable to fulfill the order (out of stock).</span>
                </li>
                <li className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Unavailability of delivery partners in your area.</span>
                </li>
                <li className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Technical errors or incorrect pricing on the platform.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Refund Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10 text-primary">
               <CreditCard size={24} />
             </div>
             <h2 className="text-2xl font-bold m-0 italic font-mont uppercase">Refund Policy</h2>
          </div>
          
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
             <div className="p-6 border-b border-border bg-background/50">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Refunds are processed when an order is cancelled by the platform or if there's a valid issue with the delivered products (missing items, wrong items, or quality issues).
                </p>
             </div>
             <div className="p-6 space-y-6">
                <div className="flex gap-6 items-start">
                   <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Clock size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-foreground">Refund Timeline</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Once approved, the refund amount will be credited back to your original payment source (Bank Account, UPI, or Wallet) within **5-7 business days**.
                      </p>
                   </div>
                </div>
                <div className="flex gap-6 items-start">
                   <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                      <RefreshCcw size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-foreground">Dispute Resolution</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        If you receive a damaged or incorrect product, please raise a complaint within **30 minutes** of delivery via the "Help" section in the app with photos of the issue.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        <section className="p-8 rounded-3xl bg-surface border border-dashed border-border text-center">
           <h3 className="text-xl font-bold font-mont mb-2">Need help with a refund?</h3>
           <p className="text-sm text-muted-foreground mb-6">Contact our support team with your Order ID for quick assistance.</p>
           <div className="flex justify-center gap-4">
              <a href="mailto:support@freshrun.com" className="px-6 py-2 bg-primary text-white font-bold rounded-xl text-sm">Email Support</a>
              <button className="px-6 py-2 bg-background border border-border text-foreground font-bold rounded-xl text-sm">Call Us</button>
           </div>
        </section>

      </div>
    </div>
  );
}
