"use client";

import React, { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Save,
  Loader2,
  Info,
  CloudRain,
  Zap,
  Percent,
  CheckCircle,
  AlertCircle,
  Ticket,
  Sliders,
  DollarSign,
  PackageCheck,
  Clock,
} from "lucide-react";

interface Slab {
  min: number;
  max: number;
  fee: number;
}

interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discount_type: "flat" | "percentage";
  discount_value: number;
  min_order_value: number;
  max_discount_cap: number | null;
  is_active: boolean;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
}

export default function PricingPage() {
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // New Coupon Modal State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    description: "",
    discount_type: "flat" as "flat" | "percentage",
    discount_value: "",
    min_order_value: "0",
    max_discount_cap: "",
    usage_limit: "",
    valid_until: "",
  });
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken") || "";
    }
    return "";
  };

  const showToast = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3500);
  };

  // ── Fetch Initial Data ───────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const token = getAdminToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [cfgRes, setRes, cpnRes] = await Promise.all([
        fetch(`${baseUrl}/pricing/config`, { headers }),
        fetch(`${baseUrl}/settings`),
        fetch(`${baseUrl}/pricing/coupons`, { headers }),
      ]);

      const [cfgData, setData, cpnData] = await Promise.all([
        cfgRes.json(),
        setRes.json(),
        cpnRes.json(),
      ]);

      if (cfgData.success) setPricingConfig(cfgData.data);
      if (setData.success) setAppSettings(setData.data);
      if (cpnData.success) setCoupons(cpnData.data);
    } catch (err) {
      console.error("Failed to load pricing config:", err);
      showToast("error", "Failed to load pricing configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Save Pricing Config Fields ───────────────────────────────────────────
  const savePricingFields = async (fields: object, sectionName: string) => {
    setSavingSection(sectionName);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const token = getAdminToken();
      const response = await fetch(`${baseUrl}/pricing/config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fields),
      });
      const data = await response.json();
      if (data.success) {
        setPricingConfig(data.data);
        showToast("success", `${sectionName} updated successfully!`);
      } else {
        showToast("error", data.error || `Failed to update ${sectionName}`);
      }
    } catch (err) {
      showToast("error", "Connection error. Failed to save.");
    } finally {
      setSavingSection(null);
    }
  };

  // ── Save App Settings (for rain surge) ──────────────────────────────────
  const saveAppSettings = async (fields: object, sectionName: string) => {
    setSavingSection(sectionName);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await response.json();
      if (data.success) {
        setAppSettings(data.data);
        showToast("success", `${sectionName} updated successfully!`);
      } else {
        showToast("error", data.error || `Failed to update ${sectionName}`);
      }
    } catch (err) {
      showToast("error", "Connection error. Failed to save.");
    } finally {
      setSavingSection(null);
    }
  };

  // ── Slab Handlers ────────────────────────────────────────────────────────
  const updateSlab = (
    key: "platform_fee_slabs" | "handling_fee_slabs",
    index: number,
    field: keyof Slab,
    value: number
  ) => {
    const current: Slab[] = [...(pricingConfig[key] || [])];
    current[index] = { ...current[index], [field]: value };
    setPricingConfig({ ...pricingConfig, [key]: current });
  };

  const addSlab = (key: "platform_fee_slabs" | "handling_fee_slabs") => {
    const current: Slab[] = [...(pricingConfig[key] || [])];
    const lastMax = current.length > 0 ? current[current.length - 1].max + 1 : 1;
    current.push({ min: lastMax, max: lastMax + 500, fee: 10 });
    setPricingConfig({ ...pricingConfig, [key]: current });
  };

  const deleteSlab = (
    key: "platform_fee_slabs" | "handling_fee_slabs",
    index: number
  ) => {
    const current: Slab[] = [...(pricingConfig[key] || [])];
    current.splice(index, 1);
    setPricingConfig({ ...pricingConfig, [key]: current });
  };

  // ── Coupon CRUD ──────────────────────────────────────────────────────────
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCoupon(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const token = getAdminToken();
      const payload = {
        code: couponForm.code.toUpperCase().trim(),
        description: couponForm.description || null,
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        min_order_value: parseFloat(couponForm.min_order_value || "0"),
        max_discount_cap: couponForm.max_discount_cap ? parseFloat(couponForm.max_discount_cap) : null,
        usage_limit: couponForm.usage_limit ? parseInt(couponForm.usage_limit) : null,
        valid_until: couponForm.valid_until ? new Date(couponForm.valid_until).toISOString() : null,
      };

      const res = await fetch(`${baseUrl}/pricing/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons([data.data, ...coupons]);
        setShowCouponModal(false);
        setCouponForm({
          code: "",
          description: "",
          discount_type: "flat",
          discount_value: "",
          min_order_value: "0",
          max_discount_cap: "",
          usage_limit: "",
          valid_until: "",
        });
        showToast("success", `Coupon "${data.data.code}" created!`);
      } else {
        showToast("error", data.error || "Failed to create coupon.");
      }
    } catch {
      showToast("error", "Error creating coupon.");
    } finally {
      setCreatingCoupon(false);
    }
  };

  const toggleCouponActive = async (coupon: Coupon) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const token = getAdminToken();
      const res = await fetch(`${baseUrl}/pricing/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(coupons.map((c) => (c.id === coupon.id ? data.data : c)));
      }
    } catch {
      showToast("error", "Could not toggle coupon status.");
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const token = getAdminToken();
      const res = await fetch(`${baseUrl}/pricing/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(coupons.filter((c) => c.id !== id));
        showToast("success", "Coupon deleted.");
      }
    } catch {
      showToast("error", "Error deleting coupon.");
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {message.text && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border font-semibold text-sm transition-all animate-bounce ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-mont flex items-center gap-3">
            <Tag className="h-8 w-8 text-primary" />
            Pricing & Charges Engine
          </h1>
          <p className="text-muted mt-1">
            Configure dynamic fee slabs, packaging charges, GST, surge rules, and coupons — 100% database driven.
          </p>
        </div>
      </div>

      {/* ── Grid Layout ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ── 1. Platform Fee (Per Product) ─────────────────────────────── */}
        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Platform Fee (Per Product)</h2>
                <p className="text-xs text-muted">Slabs by product selling price × quantity</p>
              </div>
            </div>
            {/* Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pricingConfig?.platform_fee_enabled ?? true}
                onChange={(e) =>
                  setPricingConfig({ ...pricingConfig, platform_fee_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Slabs Table */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted px-2">
              <span className="col-span-4">Min Price (₹)</span>
              <span className="col-span-4">Max Price (₹)</span>
              <span className="col-span-3">Fee (₹)</span>
              <span className="col-span-1"></span>
            </div>

            {(pricingConfig?.platform_fee_slabs || []).map((slab: Slab, idx: number) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="number"
                  value={slab.min}
                  onChange={(e) => updateSlab("platform_fee_slabs", idx, "min", Number(e.target.value))}
                  className="col-span-4 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="number"
                  value={slab.max}
                  onChange={(e) => updateSlab("platform_fee_slabs", idx, "max", Number(e.target.value))}
                  className="col-span-4 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="number"
                  value={slab.fee}
                  onChange={(e) => updateSlab("platform_fee_slabs", idx, "fee", Number(e.target.value))}
                  className="col-span-3 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-bold text-primary"
                />
                <button
                  type="button"
                  onClick={() => deleteSlab("platform_fee_slabs", idx)}
                  className="col-span-1 text-muted hover:text-rose-500 p-2 flex justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addSlab("platform_fee_slabs")}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-2"
            >
              <Plus className="h-3.5 w-3.5" /> Add Price Slab Row
            </button>
          </div>

          {/* Step extension config */}
          <div className="p-4 bg-background rounded-2xl border border-border space-y-3">
            <p className="text-xs font-semibold text-muted">Above last slab (extension rule):</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted">Add ₹</span>
              <input
                type="number"
                value={pricingConfig?.platform_fee_step_fee ?? 10}
                onChange={(e) => setPricingConfig({ ...pricingConfig, platform_fee_step_fee: Number(e.target.value) })}
                className="w-20 bg-surface border border-border rounded-xl px-3 py-1.5 text-center text-foreground font-bold"
              />
              <span className="text-muted">for every additional ₹</span>
              <input
                type="number"
                value={pricingConfig?.platform_fee_step_amount ?? 1000}
                onChange={(e) => setPricingConfig({ ...pricingConfig, platform_fee_step_amount: Number(e.target.value) })}
                className="w-24 bg-surface border border-border rounded-xl px-3 py-1.5 text-center text-foreground font-bold"
              />
            </div>
          </div>

          <button
            onClick={() =>
              savePricingFields(
                {
                  platform_fee_enabled: pricingConfig.platform_fee_enabled,
                  platform_fee_slabs: pricingConfig.platform_fee_slabs,
                  platform_fee_step_amount: pricingConfig.platform_fee_step_amount,
                  platform_fee_step_fee: pricingConfig.platform_fee_step_fee,
                },
                "Platform Fee"
              )
            }
            disabled={savingSection === "Platform Fee"}
            className="w-full bg-primary text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {savingSection === "Platform Fee" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Platform Fee
          </button>
        </div>

        {/* ── 2. Order Handling Fee ─────────────────────────────────────── */}
        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <Sliders className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Order Handling Fee</h2>
                <p className="text-xs text-muted">Slabs based on cart subtotal</p>
              </div>
            </div>
            {/* Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pricingConfig?.handling_fee_enabled ?? true}
                onChange={(e) =>
                  setPricingConfig({ ...pricingConfig, handling_fee_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {/* Slabs Table */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted px-2">
              <span className="col-span-4">Min Cart (₹)</span>
              <span className="col-span-4">Max Cart (₹)</span>
              <span className="col-span-3">Fee (₹)</span>
              <span className="col-span-1"></span>
            </div>

            {(pricingConfig?.handling_fee_slabs || []).map((slab: Slab, idx: number) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="number"
                  value={slab.min}
                  onChange={(e) => updateSlab("handling_fee_slabs", idx, "min", Number(e.target.value))}
                  className="col-span-4 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  value={slab.max}
                  onChange={(e) => updateSlab("handling_fee_slabs", idx, "max", Number(e.target.value))}
                  className="col-span-4 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  value={slab.fee}
                  onChange={(e) => updateSlab("handling_fee_slabs", idx, "fee", Number(e.target.value))}
                  className="col-span-3 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-blue-500 font-bold text-blue-500"
                />
                <button
                  type="button"
                  onClick={() => deleteSlab("handling_fee_slabs", idx)}
                  className="col-span-1 text-muted hover:text-rose-500 p-2 flex justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addSlab("handling_fee_slabs")}
              className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1 mt-2"
            >
              <Plus className="h-3.5 w-3.5" /> Add Cart Slab Row
            </button>
          </div>

          {/* Step extension config */}
          <div className="p-4 bg-background rounded-2xl border border-border space-y-3">
            <p className="text-xs font-semibold text-muted">Above last slab (extension rule):</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted">Add ₹</span>
              <input
                type="number"
                value={pricingConfig?.handling_fee_step_fee ?? 5}
                onChange={(e) => setPricingConfig({ ...pricingConfig, handling_fee_step_fee: Number(e.target.value) })}
                className="w-20 bg-surface border border-border rounded-xl px-3 py-1.5 text-center text-foreground font-bold"
              />
              <span className="text-muted">for every additional ₹</span>
              <input
                type="number"
                value={pricingConfig?.handling_fee_step_amount ?? 500}
                onChange={(e) => setPricingConfig({ ...pricingConfig, handling_fee_step_amount: Number(e.target.value) })}
                className="w-24 bg-surface border border-border rounded-xl px-3 py-1.5 text-center text-foreground font-bold"
              />
            </div>
          </div>

          <button
            onClick={() =>
              savePricingFields(
                {
                  handling_fee_enabled: pricingConfig.handling_fee_enabled,
                  handling_fee_slabs: pricingConfig.handling_fee_slabs,
                  handling_fee_step_amount: pricingConfig.handling_fee_step_amount,
                  handling_fee_step_fee: pricingConfig.handling_fee_step_fee,
                },
                "Order Handling Fee"
              )
            }
            disabled={savingSection === "Order Handling Fee"}
            className="w-full bg-blue-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {savingSection === "Order Handling Fee" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Handling Fee
          </button>
        </div>

        {/* ── 3. Packaging Fee & GST ───────────────────────────────────── */}
        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-2xl">
                <PackageCheck className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Packaging & GST</h2>
                <p className="text-xs text-muted">Store packaging charge + GST display mode</p>
              </div>
            </div>
          </div>

          {/* Packaging Section */}
          <div className="p-4 bg-background rounded-2xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground">Packaging Fee (Restaurant-wise)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pricingConfig?.packaging_fee_enabled ?? false}
                  onChange={(e) => setPricingConfig({ ...pricingConfig, packaging_fee_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>

            {pricingConfig?.packaging_fee_enabled && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Fee Type</label>
                  <select
                    value={pricingConfig?.packaging_fee_type || "fixed"}
                    onChange={(e) => setPricingConfig({ ...pricingConfig, packaging_fee_type: e.target.value })}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                  >
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Fee Value</label>
                  <input
                    type="number"
                    value={pricingConfig?.packaging_fee_value ?? 10}
                    onChange={(e) => setPricingConfig({ ...pricingConfig, packaging_fee_value: Number(e.target.value) })}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* GST Section */}
          <div className="p-4 bg-background rounded-2xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground">GST (Inclusive Display)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pricingConfig?.gst_enabled ?? false}
                  onChange={(e) => setPricingConfig({ ...pricingConfig, gst_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>

            {pricingConfig?.gst_enabled && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">GST Percentage (%)</label>
                    <input
                      type="number"
                      value={pricingConfig?.gst_percentage ?? 5}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, gst_percentage: Number(e.target.value) })}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Applies On</label>
                    <select
                      value={pricingConfig?.gst_applies_on || "product_only"}
                      onChange={(e) => setPricingConfig({ ...pricingConfig, gst_applies_on: e.target.value })}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                    >
                      <option value="product_only">Product Only</option>
                      <option value="product_and_fees">Product + Fees</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-purple-500/10 rounded-xl text-xs text-purple-400">
                  <Info className="h-4 w-4 shrink-0" />
                  GST is shown as inclusive ("incl.") in the bill summary and does NOT add on top of grand total.
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() =>
              savePricingFields(
                {
                  packaging_fee_enabled: pricingConfig.packaging_fee_enabled,
                  packaging_fee_type: pricingConfig.packaging_fee_type,
                  packaging_fee_value: pricingConfig.packaging_fee_value,
                  gst_enabled: pricingConfig.gst_enabled,
                  gst_percentage: pricingConfig.gst_percentage,
                  gst_applies_on: pricingConfig.gst_applies_on,
                },
                "Packaging & GST"
              )
            }
            disabled={savingSection === "Packaging & GST"}
            className="w-full bg-purple-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-600 transition-all disabled:opacity-50"
          >
            {savingSection === "Packaging & GST" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Packaging & GST
          </button>
        </div>

        {/* ── 4. Dynamic Surge Pricing ──────────────────────────────────── */}
        <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Surge Pricing</h2>
              <p className="text-xs text-muted">Rain surge + Peak hour time window surge</p>
            </div>
          </div>

          {/* Rain Surge */}
          <div className="p-4 bg-background rounded-2xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-sm text-foreground">Rain Surge</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appSettings?.is_rainy_condition ?? false}
                  onChange={(e) => setAppSettings({ ...appSettings, is_rainy_condition: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted">Rain Surge Amount: ₹</span>
              <input
                type="number"
                value={appSettings?.rainy_condition_fee ?? 20}
                onChange={(e) => setAppSettings({ ...appSettings, rainy_condition_fee: Number(e.target.value) })}
                className="w-24 bg-surface border border-border rounded-xl px-3 py-1.5 text-center text-foreground font-bold"
              />
            </div>
          </div>

          {/* Peak Hour Surge */}
          <div className="p-4 bg-background rounded-2xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="font-semibold text-sm text-foreground">Peak Hour Surge</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pricingConfig?.peak_surge_enabled ?? false}
                  onChange={(e) => setPricingConfig({ ...pricingConfig, peak_surge_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {pricingConfig?.peak_surge_enabled && (
              <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <label className="block text-muted mb-1">Surge Amount (₹)</label>
                  <input
                    type="number"
                    value={pricingConfig?.peak_surge_amount ?? 15}
                    onChange={(e) => setPricingConfig({ ...pricingConfig, peak_surge_amount: Number(e.target.value) })}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-foreground font-bold"
                  />
                </div>
                <div>
                  <label className="block text-muted mb-1">Start Time</label>
                  <input
                    type="time"
                    value={pricingConfig?.peak_surge_start || "12:00"}
                    onChange={(e) => setPricingConfig({ ...pricingConfig, peak_surge_start: e.target.value })}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted mb-1">End Time</label>
                  <input
                    type="time"
                    value={pricingConfig?.peak_surge_end || "14:00"}
                    onChange={(e) => setPricingConfig({ ...pricingConfig, peak_surge_end: e.target.value })}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={async () => {
              await saveAppSettings(
                {
                  is_rainy_condition: appSettings.is_rainy_condition,
                  rainy_condition_fee: appSettings.rainy_condition_fee,
                },
                "Rain Surge"
              );
              await savePricingFields(
                {
                  peak_surge_enabled: pricingConfig.peak_surge_enabled,
                  peak_surge_amount: pricingConfig.peak_surge_amount,
                  peak_surge_start: pricingConfig.peak_surge_start,
                  peak_surge_end: pricingConfig.peak_surge_end,
                },
                "Peak Surge"
              );
            }}
            disabled={savingSection === "Peak Surge"}
            className="w-full bg-amber-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-all disabled:opacity-50"
          >
            {savingSection === "Peak Surge" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Surge Settings
          </button>
        </div>
      </div>

      {/* ── 5. Coupons Management Table ─────────────────────────────────────── */}
      <div className="bg-surface rounded-3xl p-8 shadow-sm border border-border space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <Ticket className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Promo Coupons</h2>
              <p className="text-xs text-muted">Manage generic multi-use promo codes for marketing campaigns</p>
            </div>
          </div>

          <button
            onClick={() => setShowCouponModal(true)}
            className="bg-emerald-500 text-white px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
          >
            <Plus className="h-4 w-4" /> Create Coupon
          </button>
        </div>

        {/* Coupons Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-background text-xs font-semibold text-muted uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Code</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Min Order</th>
                <th className="p-3">Cap</th>
                <th className="p-3">Usage</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted">
                    No coupons created yet. Click "Create Coupon" to add your first promo code!
                  </td>
                </tr>
              ) : (
                coupons.map((cpn) => (
                  <tr key={cpn.id} className="hover:bg-background/50 transition-colors">
                    <td className="p-3 font-bold font-mono text-emerald-400 uppercase">{cpn.code}</td>
                    <td className="p-3 font-semibold">
                      {cpn.discount_type === "flat" ? `₹${cpn.discount_value} OFF` : `${cpn.discount_value}% OFF`}
                    </td>
                    <td className="p-3 text-muted">₹{cpn.min_order_value}</td>
                    <td className="p-3 text-muted">
                      {cpn.max_discount_cap ? `₹${cpn.max_discount_cap}` : "No cap"}
                    </td>
                    <td className="p-3 text-muted">
                      {cpn.used_count} {cpn.usage_limit ? `/ ${cpn.usage_limit}` : "(unlimited)"}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleCouponActive(cpn)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          cpn.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-muted/10 text-muted border border-border"
                        }`}
                      >
                        {cpn.is_active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => deleteCoupon(cpn.id)}
                        className="text-muted hover:text-rose-500 p-2 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Coupon Modal ────────────────────────────────────────────── */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-mont">
              <Ticket className="h-5 w-5 text-emerald-500" /> Create New Coupon
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Coupon Code (Required)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FRESHSAVE50"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-foreground uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ₹50 off on launch order"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Discount Type</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, discount_type: e.target.value as "flat" | "percentage" })
                    }
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground"
                  >
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    placeholder={couponForm.discount_type === "flat" ? "50" : "20"}
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={couponForm.min_order_value}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order_value: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Max Cap (₹, optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={couponForm.max_discount_cap}
                    onChange={(e) => setCouponForm({ ...couponForm, max_discount_cap: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Total Usage Limit (optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 500 (leave blank for unlimited)"
                  value={couponForm.usage_limit}
                  onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 bg-background border border-border text-foreground py-3 rounded-2xl font-bold text-sm hover:bg-background/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCoupon}
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                  {creatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
