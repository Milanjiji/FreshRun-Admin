import React from "react";
import { Info, Target, Users, Award, ShieldCheck } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
          <Info size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground font-mont">About FreshRun</h1>
        <p className="text-muted text-lg font-medium">Your Daily Essentials, Delivered with Speed & Trust.</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
        <section className="space-y-6 text-center max-w-2xl mx-auto">
          <p className="text-lg leading-relaxed text-muted-foreground">
            FreshRun is a hyper-local delivery platform dedicated to bringing you the freshest groceries, restaurant food, and daily essentials from your favorite local shops directly to your doorstep.
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
              To empower local businesses by connecting them with customers through a seamless, technology-driven delivery network, ensuring speed, quality, and reliability.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold">Our Vision</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To become the most trusted hyper-local ecosystem where every household can access their daily needs within minutes, while helping local vendors thrive in the digital age.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-center">Why Choose FreshRun?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="mx-auto h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                <Award size={28} />
              </div>
              <h4 className="font-bold">Quality Guaranteed</h4>
              <p className="text-xs text-muted-foreground">We partner only with verified local vendors to ensure the highest standards.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                <Users size={28} />
              </div>
              <h4 className="font-bold">Community First</h4>
              <p className="text-xs text-muted-foreground">We support local economies by giving neighborhood shops a digital platform.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                <ShieldCheck size={28} />
              </div>
              <h4 className="font-bold">Safe & Secure</h4>
              <p className="text-xs text-muted-foreground">From verified riders to secure payments, your safety is our top priority.</p>
            </div>
          </div>
        </section>

        <section className="p-10 rounded-3xl bg-primary text-white text-center space-y-6">
          <h2 className="text-3xl font-bold m-0 text-white">Join the FreshRun Family</h2>
          <p className="opacity-90 max-w-xl mx-auto">
            Whether you're a customer looking for convenience or a store owner wanting to grow, FreshRun is here for you.
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
