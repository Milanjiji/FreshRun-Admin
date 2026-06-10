import React from "react";
import { Info, Target, Users, Award, ShieldCheck, Mail } from "lucide-react";
import Image from "next/image";

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
          <Info size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground font-mont">About FreshRush</h1>
        <p className="text-muted text-lg font-medium">Empowering Local Shops Through Digital Commerce.</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
        <section className="space-y-6 text-center max-w-2xl mx-auto">
          <p className="text-lg leading-relaxed text-muted-foreground">
            FreshRush was created with a simple mission — to help local businesses grow digitally while making shopping easier, faster, and more convenient for everyone.
          </p>
        </section>

        {/* Origin / Location Story */}
        <section className="p-8 rounded-3xl bg-surface border border-border shadow-sm space-y-4 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold font-mont">Why We Started FreshRush</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            FreshRush was launched in <strong>Bauria, Howrah, West Bengal, India</strong> with a vision to connect local shops and local customers through technology. We noticed that many excellent local businesses had loyal customers but lacked a digital presence. At the same time, customers wanted a faster and more convenient way to order from the stores they already trust. FreshRush bridges that gap.
          </p>
        </section>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold">Our Mission</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To make every local shop digitally accessible and every customer's daily shopping experience faster, easier, and more convenient.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold">Our Vision</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To become the most trusted local commerce platform where customers, stores, and delivery partners grow together.
            </p>
          </div>
        </div>

        {/* Meet the Team */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-center">Meet The Team Behind FreshRush</h2>
          <p className="text-center text-sm text-muted-foreground -mt-6">Driven by passion to transform local commerce.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ashish Mishra Card */}
            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 relative">
                {/* Fallback initials if image path changes */}
                <div className="h-full w-full bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary">
                  AM
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold">Ashish Mishra</h4>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Founder & CEO</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ashish Mishra founded FreshRush with the vision of helping local businesses embrace digital technology and reach more customers in their communities.
              </p>
            </div>

            {/* Milan J Card */}
            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 relative">
                <div className="h-full w-full bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary">
                  MJ
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold">Milan J</h4>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Lead Developer</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Milan J is a Kerala-based developer responsible for the platform's technical implementation, mobile apps, and software engineering.
              </p>
              <a href="mailto:milanjiji7172@gmail.com" className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                <Mail size={14} />
                milanjiji7172@gmail.com
              </a>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-center">Why FreshRush Matters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="mx-auto h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                <Award size={28} />
              </div>
              <h4 className="font-bold">Support Local Shops</h4>
              <p className="text-xs text-muted-foreground">Helping neighborhood businesses become digitally accessible.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                <Users size={28} />
              </div>
              <h4 className="font-bold">Easy Ordering</h4>
              <p className="text-xs text-muted-foreground">Order from your favorite local stores in just a few clicks.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                <ShieldCheck size={28} />
              </div>
              <h4 className="font-bold">Fast Delivery</h4>
              <p className="text-xs text-muted-foreground">Quick delivery of food, groceries, medicines, vegetables, and essentials.</p>
            </div>
          </div>
        </section>

        <section className="p-10 rounded-3xl bg-primary text-white text-center space-y-6">
          <h2 className="text-3xl font-bold m-0 text-white">Join the FreshRush Family</h2>
          <p className="opacity-90 max-w-xl mx-auto">
            Whether you're a customer looking for convenience or a store owner wanting to grow, FreshRush is here for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-white text-primary font-bold rounded-xl shadow-lg hover:scale-105 transition-all">Download App</button>
            <button className="px-8 py-3 bg-black/20 text-white border border-white/30 font-bold rounded-xl hover:bg-black/30 transition-all">Partner with Us</button>
          </div>
        </section>
      </div>
    </div>
  );
}
