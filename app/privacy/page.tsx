import React from "react";
import { Shield, Lock, Eye, FileText, Trash2, Globe } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "May 26, 2026";

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
          <Shield size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground font-mont">Privacy Policy</h1>
        <p className="text-muted text-sm font-medium">Last Updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-lg leading-relaxed text-muted-foreground">
          At FreshRun, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Customer and Delivery Partner applications.
        </p>

        {/* Section 1: Information We Collect */}
        <section className="mt-12 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <Eye size={24} />
            </div>
            <h2 className="text-2xl font-bold m-0">Information We Collect</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
              <h3 className="text-lg font-bold mb-3 text-primary">Customer Data</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Personal identifiers (Name, Email, Phone Number)</li>
                <li>Delivery addresses and location data</li>
                <li>Order history and transaction details</li>
                <li>Device information and app usage statistics</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
              <h3 className="text-lg font-bold mb-3 text-secondary">Delivery Partner Data</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Everything collected from customers</li>
                <li>Government IDs (Aadhar Number & Image) for verification</li>
                <li>Real-time GPS location tracking for order fulfillment</li>
                <li>Earnings and payout information</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: How We Use Your Data */}
        <section className="mt-12 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Lock size={24} />
            </div>
            <h2 className="text-2xl font-bold m-0">How We Use Your Data</h2>
          </div>
          <p className="text-muted-foreground">
            We use the collected information for various purposes to provide and improve our service:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
            {[
              "To process and deliver your orders efficiently",
              "To verify the identity of our delivery partners",
              "To track deliveries in real-time for customer transparency",
              "To provide customer support and resolve disputes",
              "To send important notifications regarding your account",
              "To improve our app performance and user experience"
            ].map((item, i) => (
              <li key={i} className="flex gap-3 items-start p-3 bg-background rounded-xl border border-border/50">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 3: Third-Party Services */}
        <section className="mt-12 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <Globe size={24} />
            </div>
            <h2 className="text-2xl font-bold m-0">Third-Party Services</h2>
          </div>
          <p className="text-muted-foreground">
            We utilize trusted third-party services to power certain features of our platform. These providers have their own privacy policies:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ServiceCard name="Firebase" use="Authentication & Notifications" />
            <ServiceCard name="Google Maps" use="Geocoding & Navigation" />
            <ServiceCard name="Cloudinary" use="Secure Image Hosting" />
          </div>
        </section>

        {/* Section 4: Data Retention & Deletion */}
        <section className="mt-12 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <Trash2 size={24} />
            </div>
            <h2 className="text-2xl font-bold m-0">Data Retention & Deletion</h2>
          </div>
          <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl">
            <p className="text-muted-foreground mb-4">
              We retain your data as long as your account is active. You have the right to request the deletion of your account and all associated personal data at any time.
            </p>
            <p className="text-sm font-bold text-foreground">
              To delete your account: Navigate to Settings within the app and select "Delete Account" or contact us at support@freshrun.com.
            </p>
          </div>
        </section>

        {/* Section 5: Contact Us */}
        <section className="mt-12 p-8 rounded-2xl bg-primary text-white text-center">
          <h2 className="text-2xl font-bold m-0 mb-4 text-white">Questions or Concerns?</h2>
          <p className="opacity-90 mb-6">
            If you have any questions about this Privacy Policy, please contact our data protection team.
          </p>
          <a 
            href="mailto:privacy@freshrun.com" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-opacity-90 transition-all"
          >
            <FileText size={18} />
            Contact Privacy Team
          </a>
        </section>
      </div>
    </div>
  );
}

function ServiceCard({ name, use }: { name: string; use: string }) {
  return (
    <div className="p-4 rounded-xl bg-surface border border-border text-center">
      <h4 className="font-bold text-foreground">{name}</h4>
      <p className="text-xs text-muted mt-1">{use}</p>
    </div>
  );
}
