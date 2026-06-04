"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Store, 
  Tag, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  X,
  IndianRupee,
  Box,
  Percent,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { CldUploadWidget } from 'next-cloudinary';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingStores, setFetchingStores] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [stores, setStores] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<string[]>([]);
  const [fetchingRecentProducts, setFetchingRecentProducts] = useState(false);
  const [selectedRecentProduct, setSelectedRecentProduct] = useState("custom");
  const isCloudinaryConfigured = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    discountPercent: "0",
    stockQuantity: "100",
    isStockOut: false,
    category: "restaurants",
    storeId: "",
    isVeg: true
  });

  const categories = [
    { id: "restaurants", name: "Restaurants", icon: "🍴" },
    { id: "street-food", name: "Street Food", icon: "🍱" },
    { id: "groceries", name: "Groceries", icon: "🛒" }
  ];

  // Fetch stores based on selected category
  useEffect(() => {
    const fetchStores = async () => {
      setFetchingStores(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/stores?category=${formData.category}&include_inactive=true&include_pending=true`);
        const data = await response.json();
        if (data.success) {
          setStores(data.data);
          // Auto-select first store if available
          if (data.data.length > 0) {
            setFormData(prev => ({ ...prev, storeId: data.data[0].id }));
          } else {
            setFormData(prev => ({ ...prev, storeId: "" }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch stores", err);
      } finally {
        setFetchingStores(false);
      }
    };

    fetchStores();
  }, [formData.category]);

  // Fetch unique product names for the selected category
  useEffect(() => {
    const fetchRecentProducts = async () => {
      setFetchingRecentProducts(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/products?category=${formData.category}`);
        const data = await response.json();
        if (data.success) {
          // Extract unique product names
          const names: string[] = data.data.map((p: any) => p.name);
          const uniqueNames = Array.from(new Set(names)).sort();
          setRecentProducts(uniqueNames);
        }
      } catch (err) {
        console.error("Failed to fetch recent products", err);
      } finally {
        setFetchingRecentProducts(false);
      }
    };

    fetchRecentProducts();
  }, [formData.category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.storeId) {
      setError("Please select a store for this product.");
      setLoading(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/products");
        }, 2000);
      } else {
        setError(data.error || "Failed to create product");
      }
    } catch (err) {
      setError("Connection error. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 rounded-full bg-primary/10 p-4 text-primary">
          <CheckCircle2 size={64} />
        </div>
        <h2 className="text-3xl font-bold text-foreground font-mont">Product Added!</h2>
        <p className="mt-2 text-muted text-lg">
          The product has been successfully added to the store catalog.
        </p>
        <p className="mt-4 text-sm text-muted">Redirecting you back to products list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products" className="rounded-xl border border-border p-2 text-muted hover:bg-background transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont">Add New Product</h1>
            <p className="text-sm text-muted">Create a new item and link it to a specific store.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-xl shadow-primary/40 hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Product
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-500 border border-red-500/20">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Product Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Basic Info */}
          <div className="rounded-2xl bg-surface p-6 border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <Package size={20} />
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Product Details</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5 flex items-center justify-between">
                    Select Recent Product
                    {fetchingRecentProducts && <Loader2 size={12} className="animate-spin text-primary" />}
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedRecentProduct}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedRecentProduct(val);
                        if (val !== "custom") {
                          setFormData(prev => ({ ...prev, name: val }));
                        } else {
                          setFormData(prev => ({ ...prev, name: "" }));
                        }
                      }}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all appearance-none pr-10"
                    >
                      <option value="custom">✨ Custom Input (New Product)</option>
                      {recentProducts.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/50 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Product Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={selectedRecentProduct !== "custom"}
                    placeholder="e.g. Chicken Biryani / Organic Milk"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all disabled:bg-muted/10 disabled:text-muted disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the product ingredients, weight, or size..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Category (Type)</label>
                  <div className="relative">
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all appearance-none pr-10"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/50 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5 flex items-center justify-between">
                    Link to Store
                    {fetchingStores && <Loader2 size={12} className="animate-spin text-primary" />}
                  </label>
                  <div className="relative">
                    <select 
                      name="storeId"
                      value={formData.storeId}
                      onChange={handleChange}
                      disabled={stores.length === 0}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all appearance-none disabled:opacity-50 pr-10"
                      required
                    >
                      {stores.length === 0 ? (
                        <option value="">No stores found for this category</option>
                      ) : (
                        stores.map(store => (
                          <option key={store.id} value={store.id}>{store.name}</option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/50 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="rounded-2xl bg-surface p-6 border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <IndianRupee size={20} />
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Pricing & Inventory</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Base Price (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted/50" />
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="250"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Discount (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-3 h-4 w-4 text-muted/50" />
                  <input 
                    type="number" 
                    name="discountPercent"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    placeholder="10"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Initial Stock</label>
                <div className="relative">
                  <Box className="absolute left-3 top-3 h-4 w-4 text-muted/50" />
                  <input 
                    type="number" 
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    placeholder="100"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isVeg"
                  name="isVeg"
                  checked={formData.isVeg}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="isVeg" className="text-sm font-medium text-foreground">
                  Vegetarian Product (Veg)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isStockOut"
                  name="isStockOut"
                  checked={formData.isStockOut}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="isStockOut" className="text-sm font-medium text-foreground">
                  Mark as "Out of Stock"
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Image Upload */}
        <div className="space-y-8">
          <div className="rounded-2xl bg-surface p-6 border border-border shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center gap-2 text-primary">
              <ImageIcon size={20} />
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Product Image</h3>
            </div>

            <div className="space-y-4">
              {formData.imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden border border-border bg-background aspect-square">
                  <img 
                    src={formData.imageUrl} 
                    alt="Product Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
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
                      setFormData(prev => ({ ...prev, imageUrl: result.info.secure_url }));
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
                        className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background py-12 hover:border-primary hover:bg-primary/5 transition-all group"
                      >
                        <div className="rounded-full bg-muted/10 p-3 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          <Upload size={24} className="text-muted/60 group-hover:text-primary" />
                        </div>
                        <div className="text-center px-4">
                          <p className="text-sm font-semibold text-foreground">Upload product photo</p>
                          <p className="text-[10px] text-muted mt-1 leading-tight">High quality photos increase sales by 40%</p>
                        </div>
                      </button>
                    );
                    }}
                  </CldUploadWidget>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background p-5 text-center">
                  <Upload size={24} className="mx-auto text-muted/60" />
                  <p className="mt-3 text-sm font-semibold text-foreground">Image upload is not configured</p>
                  <p className="mt-1 text-xs text-muted">
                    Set <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> to enable uploads.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                <p className="text-xs text-primary font-medium leading-relaxed">
                  Tip: Use a clear photo with a neutral background for professional menu listings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
