"use client";

import React, { useEffect, useState } from "react";
import { Truck, Moon, Clock, IndianRupee, Save, Loader2, Info } from "lucide-react";

export default function DeliverySettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchSettings = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/settings`);
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: "success", text: "Delivery settings updated successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update settings" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection error. Could not save settings." });
    } finally {
      setSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-mont">Delivery Settings</h1>
        <p className="text-muted mt-1">Manage late night fees and standard delivery charges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Late Night Settings */}
        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <Moon className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Late Night Fees</h2>
              <p className="text-sm text-muted">Apply extra charges during late hours</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Extra Fee (₹)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60">₹</div>
                <input 
                  type="number"
                  className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                  value={settings?.late_night_fee || 0}
                  onChange={(e) => setSettings({ ...settings, late_night_fee: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60" />
                  <input 
                    type="time"
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                    value={settings?.late_night_start || "23:00"}
                    onChange={(e) => setSettings({ ...settings, late_night_start: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60" />
                  <input 
                    type="time"
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                    value={settings?.late_night_end || "05:00"}
                    onChange={(e) => setSettings({ ...settings, late_night_end: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex gap-3">
              <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
                Fees will be automatically applied to the user's cart if the order is placed between these hours.
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Fee Settings */}
        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Standard Fees</h2>
              <p className="text-sm text-muted">Minimum delivery charges and thresholds</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Min Delivery Fee (₹)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60">₹</div>
                <input 
                  type="number"
                  className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                  value={settings?.min_delivery_fee || 0}
                  onChange={(e) => setSettings({ ...settings, min_delivery_fee: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Free Delivery Threshold (₹)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60">₹</div>
                <input 
                  type="number"
                  className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                  value={settings?.free_delivery_threshold || 0}
                  onChange={(e) => setSettings({ ...settings, free_delivery_threshold: parseFloat(e.target.value) })}
                />
              </div>
              <p className="text-[10px] text-muted mt-2 px-1">Orders above this amount will have zero delivery fee.</p>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
               <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`mt-6 p-4 rounded-2xl text-center font-semibold transition-all ${
          message.type === "success" 
            ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" 
            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
