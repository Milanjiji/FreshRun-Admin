"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Settings,
  Upload,
  X
} from "lucide-react";
import { CldUploadWidget } from 'next-cloudinary';

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [actionType, setActionType] = useState("filter_price");
  const [payloadValue, setPayloadValue] = useState("");
  const [stores, setStores] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [filterAmount, setFilterAmount] = useState("");
  const [filterTitle, setFilterTitle] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const isCloudinaryConfigured = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // Dummy auth token if needed, usually passed via headers or stored in context.
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

  useEffect(() => {
    fetchBanners();
    fetchStores();
    fetchCategories();
  }, []);

  const fetchStores = async () => {
    setLoadingStores(true);
    try {
      const response = await fetch(`${baseUrl}/stores?include_inactive=true&include_pending=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStores(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load stores for banner redirects", err);
    } finally {
      setLoadingStores(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch(`${baseUrl}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load categories for banner redirects", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/banners/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBanners(data.data || []);
      } else {
        setError(data.error || "Failed to load banners.");
      }
    } catch (err) {
      setError("Connection error. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccess(msg);
      setError("");
      setTimeout(() => setSuccess(""), 4000);
    } else {
      setError(msg);
      setSuccess("");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      showNotification("Please upload a banner image.", false);
      return;
    }

    setSubmitting(true);
    let payloadStr = {};
    if (actionType === 'filter_price') {
      if (!filterAmount.trim()) {
        showNotification("Please enter filter amount.", false);
        setSubmitting(false);
        return;
      }
      payloadStr = { 
        max_price: parseInt(filterAmount),
        title: filterTitle.trim() || `Under ₹${filterAmount} Deals`
      };
    } else if (actionType === 'store_redirect') {
      if (!selectedStoreId) {
        showNotification("Please select a store.", false);
        setSubmitting(false);
        return;
      }
      payloadStr = { store_id: selectedStoreId };
    } else if (actionType === 'category_redirect') {
      if (!payloadValue.trim()) {
        showNotification("Please enter category slug.", false);
        setSubmitting(false);
        return;
      }
      payloadStr = { category_id: payloadValue };
    } else if (actionType === 'external_link') {
      if (!payloadValue.trim()) {
        showNotification("Please enter URL.", false);
        setSubmitting(false);
        return;
      }
      payloadStr = { url: payloadValue };
    }

    try {
      const response = await fetch(`${baseUrl}/banners`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          image_url: imageUrl,
          action_type: actionType,
          action_payload: payloadStr,
          is_active: true
        })
      });
      const data = await response.json();
      if (data.success) {
        showNotification("Banner created successfully!");
        setImageUrl("");
        setPayloadValue("");
        setFilterAmount("");
        setFilterTitle("");
        setSelectedStoreId("");
        fetchBanners();
      } else {
        showNotification(data.error || "Failed to create banner", false);
      }
    } catch (err) {
      showNotification("Network error. Failed to create banner.", false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this banner?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`${baseUrl}/banners/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        showNotification("Banner deleted successfully!");
        fetchBanners();
      } else {
        showNotification(data.error || "Failed to delete banner", false);
      }
    } catch (err) {
      showNotification("Network error. Failed to delete banner.", false);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) return;
    const urlToRemove = imageUrl;
    setImageUrl("");
    try {
      await fetch(`${baseUrl}/banners/delete-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: urlToRemove })
      });
    } catch (err) {
      console.error("Failed to delete image from Cloudinary:", err);
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-mont bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Banners Management
        </h1>
        <p className="text-sm text-muted mt-1">
          Upload and configure dynamic promotional banners for the Customer App home screen.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-500 border border-red-500/20 transition-all">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-green-500/10 p-4 text-green-600 border border-green-500/20 transition-all">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-surface p-6 border border-border shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center gap-2 text-primary">
              <ImageIcon size={20} />
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Create Banner</h3>
            </div>

            <form onSubmit={handleAddBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Banner Image</label>
                
                {imageUrl ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden bg-muted/10 border border-border group">
                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover object-top" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : isCloudinaryConfigured ? (
                  <CldUploadWidget 
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={(result: any) => {
                      if (result.info && typeof result.info !== 'string') {
                        setImageUrl(result.info.secure_url);
                      }
                      document.body.style.overflow = "auto";
                    }}
                    onClose={() => {
                      document.body.style.overflow = "auto";
                    }}
                  >
                    {({ open }) => {
                      return (
                        <button
                          type="button"
                          onClick={() => open()}
                          className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background h-32 hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                          <div className="rounded-full bg-muted/10 p-2 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <Upload size={20} className="text-muted/60 group-hover:text-primary" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">Click to upload banner</p>
                            <p className="text-xs text-muted mt-1">PNG, JPG or WEBP</p>
                          </div>
                        </button>
                      );
                    }}
                  </CldUploadWidget>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-background p-5 text-center">
                    <Upload size={24} className="mx-auto text-muted/60" />
                    <p className="mt-3 text-sm font-semibold text-foreground">Image upload is not configured</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Action Type</label>
                <select 
                  value={actionType}
                  onChange={(e) => {
                    setActionType(e.target.value);
                    setPayloadValue("");
                    setSelectedStoreId("");
                    setFilterAmount("");
                    setFilterTitle("");
                  }}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all appearance-none"
                >
                  <option value="filter_price">Filter by Price (e.g. 99 Store)</option>
                  <option value="store_redirect">Redirect to Store</option>
                  <option value="category_redirect">Redirect to Category</option>
                  <option value="external_link">Open External Link</option>
                </select>
              </div>

              {actionType === 'filter_price' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                      Max Price (₹)
                    </label>
                    <input 
                      type="number"
                      value={filterAmount}
                      onChange={(e) => setFilterAmount(e.target.value)}
                      placeholder="e.g. 99"
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                      Promotion Title (Optional)
                    </label>
                    <input 
                      type="text"
                      value={filterTitle}
                      onChange={(e) => setFilterTitle(e.target.value)}
                      placeholder="e.g. Pocket Friendly Deals"
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}

              {actionType === 'store_redirect' && (
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                    Select Store
                  </label>
                  {loadingStores ? (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Loader2 size={16} className="animate-spin text-primary" />
                      <span>Loading stores...</span>
                    </div>
                  ) : (
                    <select
                      value={selectedStoreId}
                      onChange={(e) => setSelectedStoreId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                      required
                    >
                      <option value="">-- Choose a Store --</option>
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.approval_status})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {actionType === 'category_redirect' && (
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  {loadingCategories ? (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Loader2 size={16} className="animate-spin text-primary" />
                      <span>Loading categories...</span>
                    </div>
                  ) : (
                    <select
                      value={payloadValue}
                      onChange={(e) => setPayloadValue(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                      required
                    >
                      <option value="">-- Choose a Category --</option>
                      {categories.map((c) => (
                        <option key={c.slug || c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {actionType === 'external_link' && (
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                    URL
                  </label>
                  <input 
                    type="url"
                    value={payloadValue}
                    onChange={(e) => setPayloadValue(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add Banner
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Settings size={20} />
            <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Active Banners</h3>
          </div>

          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center text-center bg-surface border border-border rounded-2xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            </div>
          ) : banners.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center bg-surface border border-border rounded-2xl p-6">
              <AlertCircle className="h-10 w-10 text-muted mb-3" />
              <h3 className="text-lg font-bold text-foreground">No Banners Found</h3>
              <p className="text-sm text-muted mt-1">Create one to display on the home screen.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div key={banner.id} className="flex gap-4 p-4 bg-surface border border-border rounded-2xl shadow-sm">
                  <div className="w-48 h-28 flex-shrink-0 bg-muted/20 rounded-xl overflow-hidden relative">
                     <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="flex-1 py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded mb-2">
                          {banner.action_type.replace('_', ' ')}
                        </span>
                        <div className="text-sm text-muted font-sans bg-background p-3 rounded-xl border border-border">
                          {banner.action_type === 'store_redirect' && banner.action_payload?.store_id ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground">
                                Store: {stores.find(s => s.id === banner.action_payload.store_id)?.name || "Loading store..."}
                              </span>
                              <span className="text-[10px] font-mono text-muted">ID: {banner.action_payload.store_id}</span>
                            </div>
                          ) : banner.action_type === 'filter_price' ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground">
                                Price Limit: ₹{banner.action_payload?.max_price}
                              </span>
                              {banner.action_payload?.title && (
                                <span className="text-xs text-muted">Title: "{banner.action_payload.title}"</span>
                              )}
                            </div>
                          ) : (
                            <span className="font-mono text-xs break-all">{JSON.stringify(banner.action_payload)}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        disabled={deletingId === banner.id}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        {deletingId === banner.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
