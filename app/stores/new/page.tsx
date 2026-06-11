"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Store, 
  User, 
  Phone, 
  MapPin, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  X
} from "lucide-react";
import Link from "next/link";
import { CldUploadWidget } from 'next-cloudinary';
import LocationPickerModal from "@/components/LocationPickerModal";
import { Crosshair } from "lucide-react";

export default function NewStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const isCloudinaryConfigured = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

  // Fail-safe to ensure scroll is restored if Cloudinary widget leaves it stuck
  useEffect(() => {
    // Request location on load to pre-fill coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: pos.coords.latitude.toString(),
            longitude: pos.coords.longitude.toString()
          }));
        },
        (err) => console.warn("Initial location request denied or failed", err)
      );
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const [formData, setFormData] = useState({
    storeName: "The Grand Kitchen",
    description: "Delicious traditional and modern cuisine served fresh daily.",
    category: "restaurants",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000",
    storePhone1: "9876543210",
    storePhone2: "9876543211",
    storeHouseNumber: "45/A",
    storeAddressLine: "Beach Road, North Calicut",
    storeLandmark: "Opposite Beach Park",
    storePincode: "673001",
    storeCity: "Calicut",
    latitude: "11.2588",
    longitude: "75.7804",
    mapsLink: "https://maps.google.com/?q=11.2588,75.7804",
    ownerFullName: "Milan Sebastian",
    ownerEmail: "milan@example.com",
    ownerPhone1: "9988776655",
    ownerPhone2: "9988776644",
    vegType: "both",
    handlingFee: "5.90",
    maxDeliveryDistance: "10.0"
  });

  const [isMapOpen, setIsMapOpen] = useState(false);


  const [categories, setCategories] = useState<any[]>([
    { id: "restaurants", name: "Restaurants", icon: "🍴" },
    { id: "street-food", name: "Street Food", icon: "🍱" },
    { id: "groceries", name: "Groceries", icon: "🛒" },
    { id: "chicken", name: "Chicken", icon: "🍗" },
    { id: "fish", name: "Fish", icon: "🐟" },
    { id: "medicine", name: "Medicine", icon: "💊" }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/categories`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const iconMap: Record<string, string> = {
            "restaurants": "🍴",
            "street-food": "🍱",
            "groceries": "🛒",
            "chicken": "🍗",
            "fish": "🐟",
            "medicine": "💊"
          };
          const formatted = data.data.map((cat: any) => ({
            id: cat.slug,
            name: cat.name,
            icon: iconMap[cat.slug] || "📁"
          }));
          setCategories(formatted);
          if (formatted.length > 0) {
            setFormData(prev => ({ ...prev, category: formatted[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch store categories", err);
      }
    };
    fetchCategories();
  }, []);

  const extractCoords = (url: string) => {
    // Regex to match coordinates in Google Maps URLs
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) {
      return { lat: match[1], lng: match[2] };
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "mapsLink") {
      const coords = extractCoords(value);
      if (coords) {
        setFormData(prev => ({ 
          ...prev, 
          mapsLink: value, 
          latitude: coords.lat, 
          longitude: coords.lng 
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/stores`, {
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
          router.push("/stores");
        }, 2000);
      } else {
        setError(data.error || "Failed to create store");
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
        <h2 className="text-3xl font-bold text-foreground font-mont">Store Created!</h2>
        <p className="mt-2 text-muted text-lg">
          The store has been successfully listed and is now visible in the FreshRush app.
        </p>
        <p className="mt-4 text-sm text-muted">Redirecting you back to stores list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/stores" className="rounded-xl border border-border p-2 text-muted hover:bg-background transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont">List New Store</h1>
            <p className="text-sm text-muted">Register a new store partner and their owner details.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-xl shadow-primary/40 hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Store
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-500 border border-red-500/20">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Store Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Basic Info */}
          <div className="rounded-2xl bg-surface p-6 border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <Store size={20} />
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Store Basic Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Store Name</label>
                <input 
                  type="text" 
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="e.g. Fresh Bites Restaurant"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Vegetarian Type</label>

                  <select 
                    name="vegType"
                    value={formData.vegType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="both">🥗 Veg & Non-Veg (Mixed)</option>
                    <option value="veg">🥦 Pure Veg Only</option>
                    <option value="non-veg">🍗 Non-Veg Only</option>
                  </select>
                </div>


                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted mb-1.5">Main Store Image</label>
                  {formData.imageUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-border bg-background aspect-video">
                      <img 
                        src={formData.imageUrl} 
                        alt="Store Preview" 
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
                        // Force clean up overflow hidden in case widget leaves it
                        document.body.style.overflow = "auto";
                      }}
                      onClose={() => {
                        // Ensure scrolling is restored when widget closes
                        document.body.style.overflow = "auto";
                      }}
                    >
                      {({ open }) => {
                        return (
                          <button
                            type="button"
                            onClick={() => open()}
                            className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background py-8 hover:border-primary hover:bg-primary/5 transition-all group"
                          >
                            <div className="rounded-full bg-muted/10 p-3 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                              <Upload size={24} className="text-muted/60 group-hover:text-primary" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-foreground">Click to upload store image</p>
                              <p className="text-xs text-muted mt-1">PNG, JPG or WEBP (max. 5MB)</p>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us something about this store..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Store Contact & Location */}
          <div className="rounded-2xl bg-surface p-6 border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <MapPin size={20} />
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Store Location & Contact</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Store Primary Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted/50" />
                  <input 
                    type="tel" 
                    name="storePhone1"
                    value={formData.storePhone1}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Store Secondary Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted/50" />
                  <input 
                    type="tel" 
                    name="storePhone2"
                    value={formData.storePhone2}
                    onChange={handleChange}
                    placeholder="+91 98765 43211"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">House/Building No.</label>
                <input 
                  type="text" 
                  name="storeHouseNumber"
                  value={formData.storeHouseNumber}
                  onChange={handleChange}
                  placeholder="e.g. 12/45-A"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Area / Street</label>
                <input 
                  type="text" 
                  name="storeAddressLine"
                  value={formData.storeAddressLine}
                  onChange={handleChange}
                  placeholder="e.g. Beach Road"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-muted mb-1.5">Pincode</label>
                <input 
                  type="text" 
                  name="storePincode"
                  value={formData.storePincode}
                  onChange={handleChange}
                  placeholder="673001"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-muted mb-1.5">City</label>
                <input 
                  type="text" 
                  name="storeCity"
                  value={formData.storeCity}
                  onChange={handleChange}
                  placeholder="Calicut"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Handling Fee (₹)</label>
                <input 
                  type="number" 
                  name="handlingFee"
                  value={formData.handlingFee}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="5.90"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Max Delivery Distance (km)</label>
                <input 
                  type="number" 
                  name="maxDeliveryDistance"
                  value={formData.maxDeliveryDistance}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="5.0"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin size={16} />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Exact Geolocation</h4>
                </div>
                
                {(formData.latitude && formData.longitude) && (
                   <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                     LOCATION SET
                   </span>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setIsMapOpen(true)}
                  className="flex-1 flex items-center justify-center gap-3 rounded-xl border-2 border-primary bg-primary/5 py-4 text-primary font-bold hover:bg-primary/10 transition-all group"
                >
                  <Crosshair size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                  {formData.latitude ? "Update Store Location" : "Setup Store Location on Map"}
                </button>

                <div className="flex gap-2 flex-1">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="Latitude"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs outline-none focus:border-primary text-foreground transition-all text-center"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="Longitude"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs outline-none focus:border-primary text-foreground transition-all text-center"
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted italic">Click the button above to point your store's exact location on a map, or type the coordinates directly.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Owner Details */}
        <div className="space-y-8">
          <div className="rounded-2xl bg-surface p-6 border border-border shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center gap-2 text-primary">
              <User size={20} />
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Owner Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  name="ownerFullName"
                  value={formData.ownerFullName}
                  onChange={handleChange}
                  placeholder="e.g. Milan Sebastian"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  placeholder="owner@freshrush.com"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Primary Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted/50" />
                  <input 
                    type="tel" 
                    name="ownerPhone1"
                    value={formData.ownerPhone1}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted italic">Used to generate unique Store & Owner IDs</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Secondary Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted/50" />
                  <input 
                    type="tel" 
                    name="ownerPhone2"
                    value={formData.ownerPhone2}
                    onChange={handleChange}
                    placeholder="+91 98765 43211"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                <p className="text-xs text-primary font-medium leading-relaxed">
                  Listing a store will automatically create an owner profile. The owner can use their primary phone to log in to the FreshRush platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <LocationPickerModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        initialLat={formData.latitude}
        initialLng={formData.longitude}
        onConfirm={(lat, lng) => {
          setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
          setIsMapOpen(false);
        }}
      />
    </div>
  );
}
