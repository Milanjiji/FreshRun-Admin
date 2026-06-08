"use client";

import React, { useEffect, useState } from "react";
import { Truck, Moon, Clock, IndianRupee, Save, Loader2, Info, MapPin, CloudRain, Navigation } from "lucide-react";

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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-mont">Delivery Settings</h1>
          <p className="text-muted mt-1">Configure delivery radius, per-km charges, and surge pricing</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* 1. Radius & Service Limits */}
        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <Navigation className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Radius & Limits</h2>
              <p className="text-sm text-muted">Serviceable area controls</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Max Delivery Radius (km)</label>
              <div className="relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60" />
                <input 
                  type="number"
                  step="0.1"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                  value={settings?.global_max_delivery_radius || 10}
                  onChange={(e) => setSettings({ ...settings, global_max_delivery_radius: parseFloat(e.target.value) })}
                />
              </div>
              <p className="text-[10px] text-muted mt-2 px-1">Orders beyond this distance will be blocked.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Base Distance Radius (km)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60" />
                <input 
                  type="number"
                  step="0.1"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                  value={settings?.base_delivery_radius || 5}
                  onChange={(e) => setSettings({ ...settings, base_delivery_radius: parseFloat(e.target.value) })}
                />
              </div>
              <p className="text-[10px] text-muted mt-2 px-1">Extra per-km charges apply after this distance.</p>
            </div>
          </div>
        </div>

        {/* 2. Standard Pricing */}
        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Standard Fees</h2>
              <p className="text-sm text-muted">Base charges and km pricing</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Base Delivery Fee (Min Charge)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60">₹</div>
                <input 
                  type="number"
                  className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                  value={settings?.min_delivery_fee || 30}
                  onChange={(e) => setSettings({ ...settings, min_delivery_fee: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Extra Charge (₹/km)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60">₹</div>
                <input 
                  type="number"
                  className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                  value={settings?.per_km_extra_charge || 10}
                  onChange={(e) => setSettings({ ...settings, per_km_extra_charge: parseFloat(e.target.value) })}
                />
              </div>
              <p className="text-[10px] text-muted mt-2 px-1">Applied for each km beyond the base distance.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Free Delivery Threshold (₹)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60">₹</div>
                <input 
                  type="number"
                  className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                  value={settings?.free_delivery_threshold || 500}
                  onChange={(e) => setSettings({ ...settings, free_delivery_threshold: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Platform Commission (%)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60">%</div>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                  value={settings?.platform_commission ?? 10}
                  onChange={(e) => setSettings({ ...settings, platform_commission: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Surge & Late Night */}
        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <CloudRain className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Surge Controls</h2>
              <p className="text-sm text-muted">Rainy days and late night fees</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Rainy Toggle */}
            <div className="flex items-center justify-between p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
              <div className="flex items-center gap-3">
                 <CloudRain className={settings?.is_rainy_condition ? "text-indigo-500" : "text-muted/40"} size={20} />
                 <div>
                    <p className="text-sm font-bold">Rainy Condition</p>
                    <p className="text-[10px] text-muted">Enable surge fee</p>
                 </div>
              </div>
              <button 
                onClick={() => setSettings({ ...settings, is_rainy_condition: !settings?.is_rainy_condition })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings?.is_rainy_condition ? 'bg-primary' : 'bg-muted/30'}`}
              >
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.is_rainy_condition ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Rainy Day Fee (₹)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60">₹</div>
                  <input 
                    type="number"
                    className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                    value={settings?.rainy_condition_fee || 20}
                    onChange={(e) => setSettings({ ...settings, rainy_condition_fee: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="h-px bg-border" />

              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Late Night Fee (₹)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60">₹</div>
                  <input 
                    type="number"
                    className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                    value={settings?.late_night_fee || 10}
                    onChange={(e) => setSettings({ ...settings, late_night_fee: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {message.text && (
        <div className={`mt-8 p-4 rounded-2xl text-center font-bold animate-in fade-in slide-in-from-bottom-2 duration-300 ${
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
