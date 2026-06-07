"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  X,
  Crosshair
} from "lucide-react";
import Link from "next/link";
import { CldUploadWidget } from 'next-cloudinary';
import LocationPickerModal from "@/components/LocationPickerModal";

export default function EditStorePage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingStore, setFetchingStore] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const isCloudinaryConfigured = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    category: "restaurants",
    imageUrl: "",
    storePhone1: "",
    storePhone2: "",
    storeHouseNumber: "",
    storeAddressLine: "",
    storeLandmark: "",
    storePincode: "",
    storeCity: "Calicut",
    latitude: "",
    longitude: "",
    mapsLink: "",
    ownerFullName: "",
    ownerEmail: "",
    ownerPhone1: "",
    ownerPhone2: "",
    vegType: "both",
    handlingFee: "5.90",
    maxDeliveryDistance: "5.0"
  });

  const [isMapOpen, setIsMapOpen] = useState(false);

  const categories = [
    { id: "restaurants", name: "Restaurants", icon: "🍴" },
    { id: "street-food", name: "Street Food", icon: "🍱" },
    { id: "groceries", name: "Groceries", icon: "🛒" }
  ];

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/stores/${storeId}`);
        const data = await response.json();
        
        if (data.success) {
          const s = data.data;
          // We need to fetch owner details separately or assume they are included?
          // Looking at storeModel.getStoreById, it doesn't seem to join users.
          // But for now, let's fill what we have.
          setFormData({
            storeName: s.name,
            description: s.description || "",
            category: s.category,
            imageUrl: s.image_url || "",
            storePhone1: s.phone_1,
            storePhone2: s.phone_2 || "",
            storeHouseNumber: s.house_number || "",
            storeAddressLine: s.address_line || "",
            storeLandmark: s.landmark || "",
            storePincode: s.pincode || "",
            storeCity: s.city || "Calicut",
            latitude: s.latitude ? s.latitude.toString() : "",
            longitude: s.longitude ? s.longitude.toString() : "",
            mapsLink: s.maps_link || "",
            ownerFullName: "", // Will be empty unless we fetch user
            ownerEmail: "",
            ownerPhone1: "",
            ownerPhone2: "",
            vegType: s.veg_type || "both",
            handlingFee: s.handling_fee ? s.handling_fee.toString() : "5.90",
            maxDeliveryDistance: s.max_delivery_distance ? s.max_delivery_distance.toString() : "5.0"
          });

          // Fetch owner details
          if (s.owner_id) {
            const userResponse = await fetch(`${baseUrl}/user/${s.owner_id}`);
            const userData = await userResponse.json();
            if (userData.success) {
              const u = userData.data;
              setFormData(prev => ({
                ...prev,
                ownerFullName: u.full_name || "",
                ownerEmail: u.email || "",
                ownerPhone1: u.phone_number || "",
                ownerPhone2: "" // Not typically in user model
              }));
            }
          }
        } else {
          setError(data.error || "Failed to fetch store details");
        }
      } catch (err) {
        setError("Connection error. Could not reach backend.");
      } finally {
        setFetchingStore(false);
      }
    };

    if (storeId) fetchStore();
  }, [storeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOnboardRazorpay = async () => {
    if (!formData.bankAccountNumber || !formData.ifscCode || !formData.panNumber) {
      alert("Please fill in Bank Account, IFSC, and PAN details.");
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/payments/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "owner",
          storeId: storeId,
          bankDetails: {
            accountNumber: formData.bankAccountNumber,
            ifscCode: formData.ifscCode,
          },
          pan: formData.panNumber,
          name: formData.ownerFullName,
          email: formData.ownerEmail,
          phone: formData.ownerPhone1,
          businessName: formData.storeName
        })
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ 
          ...prev, 
          razorpayAccountId: data.account_id,
          razorpayKycStatus: 'created'
        }));
        alert("Razorpay onboarding initiated successfully!");
      } else {
        alert(data.error || "Failed to onboard store");
      }
    } catch (err) {
      alert("Connection error. Could not reach backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      // Update Store
      const response = await fetch(`${baseUrl}/stores/${storeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.storeName,
          description: formData.description,
          category: formData.category,
          image_url: formData.imageUrl,
          phone_1: formData.storePhone1,
          phone_2: formData.storePhone2,
          house_number: formData.storeHouseNumber,
          address_line: formData.storeAddressLine,
          landmark: formData.storeLandmark,
          pincode: formData.storePincode,
          city: formData.storeCity,
          latitude: formData.latitude,
          longitude: formData.longitude,
          maps_link: formData.mapsLink,
          veg_type: formData.vegType,
          handling_fee: parseFloat(formData.handlingFee),
          max_delivery_distance: parseFloat(formData.maxDeliveryDistance)
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/stores");
        }, 2000);
      } else {
        setError(data.error || "Failed to update store");
      }
    } catch (err) {
      setError("Connection error. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingStore) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 rounded-full bg-primary/10 p-4 text-primary">
          <CheckCircle2 size={64} />
        </div>
        <h2 className="text-3xl font-bold text-foreground font-mont">Store Updated!</h2>
        <p className="mt-2 text-muted text-lg">
          The store details have been successfully updated.
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont">Edit Store</h1>
            <p className="text-sm text-muted">Update store partner and owner information.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-xl shadow-primary/40 hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Update Store
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
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setIsMapOpen(true)}
                  className="flex-1 flex items-center justify-center gap-3 rounded-xl border-2 border-primary bg-primary/5 py-4 text-primary font-bold hover:bg-primary/10 transition-all group"
                >
                  <Crosshair size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                  Update Store Location
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
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Razorpay Onboarding Section */}
          <div className="rounded-2xl bg-surface p-6 border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 size={20} />
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Razorpay Onboarding</h3>
            </div>

            {formData.razorpayKycStatus === 'activated' ? (
              <div className="rounded-xl bg-green-500/10 p-4 border border-green-500/20 text-center">
                <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
                <p className="text-sm font-bold text-green-600">Account Activated</p>
                <p className="text-[10px] text-green-500 mt-1">ID: {formData.razorpayAccountId}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`rounded-xl p-4 border text-center ${
                  formData.razorpayKycStatus === 'needs_clarification' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 'bg-muted/10 border-border text-muted'
                }`}>
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Status: {formData.razorpayKycStatus.replace('_', ' ')}
                  </p>
                  {formData.razorpayKycStatus === 'needs_clarification' && (
                    <p className="text-[10px] mt-1 italic">Action required from owner</p>
                  )}
                </div>

                {!formData.razorpayAccountId ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-muted">Enter store bank details to link with Razorpay Route.</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase mb-1">Account Number</label>
                        <input 
                          type="text" 
                          name="bankAccountNumber"
                          value={formData.bankAccountNumber}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase mb-1">IFSC Code</label>
                        <input 
                          type="text" 
                          name="ifscCode"
                          value={formData.ifscCode}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase mb-1">PAN Number</label>
                        <input 
                          type="text" 
                          name="panNumber"
                          value={formData.panNumber}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={handleOnboardRazorpay}
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all mt-4"
                    >
                      {loading ? "Processing..." : "Link Razorpay Account"}
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-2">
                    <p className="text-[10px] text-muted">Linked Account ID: {formData.razorpayAccountId}</p>
                    <button 
                       type="button"
                       className="mt-4 w-full py-2 rounded-lg border border-border text-[10px] font-bold text-muted hover:bg-background transition-all"
                       onClick={() => alert("KYC status will be updated automatically via webhooks.")}
                    >
                      Refresh KYC Status
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

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
                  value={formData.ownerFullName}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none text-muted transition-all bg-muted/10 cursor-not-allowed"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={formData.ownerEmail}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none text-muted transition-all bg-muted/10 cursor-not-allowed"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Primary Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted/50" />
                  <input 
                    type="tel" 
                    value={formData.ownerPhone1}
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none text-muted transition-all bg-muted/10 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted italic">Owner details are managed via the Users section.</p>
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
