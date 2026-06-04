import React from "react";
import { Truck, MapPin, Navigation, Clock, ShieldCheck } from "lucide-react";

export default function ShippingAndDelivery() {
  const lastUpdated = "June 3, 2026";

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-orange-500/10 text-orange-600 mb-2">
          <Truck size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground font-mont">Shipping & Delivery</h1>
        <p className="text-muted text-sm font-medium">Last Updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
        
        {/* Delivery Area Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10 text-primary">
               <MapPin size={24} />
             </div>
             <h2 className="text-2xl font-bold m-0 font-mont uppercase">Service Area</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            FreshRun currently operates as a hyper-local delivery service in **Calicut and Alappuzha (Punnapra area)**. We deliver within a **5-7 km radius** of our partner stores to ensure that your orders arrive fresh and on time.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
             <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-4 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                   <Navigation size={20} />
                </div>
                <div>
                   <p className="text-xs font-bold text-muted uppercase">Radius</p>
                   <p className="text-sm font-bold">5.0 - 7.0 KM</p>
                </div>
             </div>
             <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-4 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                   <Clock size={20} />
                </div>
                <div>
                   <p className="text-xs font-bold text-muted uppercase">Avg. Time</p>
                   <p className="text-sm font-bold">30 - 45 Minutes</p>
                </div>
             </div>
          </div>
        </section>

        {/* Delivery Process Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
               <Truck size={24} />
             </div>
             <h2 className="text-2xl font-bold m-0 font-mont uppercase">How it works</h2>
          </div>
          
          <div className="space-y-4">
             {[
               { title: "Order Placement", desc: "Customer places an order from a nearby store." },
               { title: "Store Preparation", desc: "The store accepts and prepares the items (Freshness Check)." },
               { title: "Partner Assignment", desc: "A nearby delivery partner is assigned to pick up the order." },
               { title: "Live Tracking", desc: "Customer can track the rider in real-time on the map." },
               { title: "Safe Handoff", desc: "The rider delivers the order to your exact location." }
             ].map((step, i) => (
               <div key={i} className="flex gap-4 items-start p-4 rounded-xl hover:bg-background transition-colors group">
                  <span className="text-2xl font-black text-border group-hover:text-primary transition-colors">0{i+1}</span>
                  <div>
                     <h4 className="font-bold text-foreground">{step.title}</h4>
                     <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* Shipping Charges */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
               <ShieldCheck size={24} />
             </div>
             <h2 className="text-2xl font-bold m-0 font-mont uppercase">Delivery Fees</h2>
          </div>
          <p className="text-muted-foreground">
            Delivery fees are calculated based on the distance between the store and your location. A small handling fee (approx. ₹5.90) is applied to maintain the platform and ensure safe delivery.
          </p>
        </section>

        <section className="p-8 rounded-3xl bg-orange-600 text-white text-center">
           <h2 className="text-2xl font-bold m-0 mb-4 text-white">Questions about your delivery?</h2>
           <p className="opacity-90 mb-6 text-sm">
             Our support team is available 9 AM to 10 PM daily to assist with tracking or delivery issues.
           </p>
           <div className="flex justify-center gap-4">
              <a href="tel:+919876543210" className="px-6 py-2 bg-white text-orange-600 font-bold rounded-xl text-sm">Call Dispatch</a>
           </div>
        </section>

      </div>
    </div>
  );
}
