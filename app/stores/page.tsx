"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Store, Search, Filter, Loader2, ExternalLink, MapPin, Phone, Check, X, Trash2 } from "lucide-react";


export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [handlingFeeInput, setHandlingFeeInput] = useState<number>(0);


  const fetchStores = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/stores?include_inactive=true&include_pending=true`);
      const data = await response.json();
      if (data.success) {
        setStores(data.data);
      } else {
        setError(data.error || "Failed to load stores");
      }
    } catch (err) {
      setError("Connection error. Could not reach backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    setApprovingId(id);
    setIsProcessing(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/stores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: status })
      });
      const data = await response.json();
      if (data.success) {
        setStores(prev => prev.map(s => s.id === id ? { ...s, approval_status: status } : s));
        if (selectedStore?.id === id) {
          setSelectedStore({ ...selectedStore, approval_status: status });
        }
      }
    } catch (err) {
      console.error("Failed to update approval status", err);
    } finally {
      setApprovingId(null);
      setIsProcessing(false);
    }
  };

  const handleDeleteStore = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone and will fail if the store has products.`)) return;

    setDeletingId(id);
    setIsProcessing(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/stores/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setStores(prev => prev.filter(s => s.id !== id));
        if (selectedStore?.id === id) setSelectedStore(null);
      } else {
        alert(data.error || "Failed to delete store");
      }
    } catch (err) {
      alert("Connection error. Could not delete store.");
    } finally {
      setDeletingId(null);
      setIsProcessing(false);
    }
  };

  const fetchProducts = async (storeId: string) => {
    setLoadingProducts(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/products?store_id=${storeId}&include_inactive=true`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchProducts(selectedStore.id);
      setHandlingFeeInput(selectedStore.handling_fee || 0);
    } else {
      setProducts([]);
    }
  }, [selectedStore?.id]);


  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    setIsProcessing(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/stores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      const data = await response.json();
      if (data.success) {
        setStores(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
        if (selectedStore?.id === id) {
          setSelectedStore({ ...selectedStore, is_active: !currentStatus });
        }
      }
    } catch (err) {
      console.error("Failed to toggle availability", err);
    } finally {
      setIsProcessing(false);
    }
  };


  const updateProductStock = async (productId: string, stock: number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: stock, isStockOut: stock <= 0 })
      });
      const data = await response.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_quantity: stock, is_stock_out: stock <= 0 } : p));
      }
    } catch (err) {
      console.error("Failed to update stock", err);
    }
  };

  const toggleProductAvailability = async (productId: string, currentStatus: boolean) => {
    setIsProcessing(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await response.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_active: !currentStatus } : p));
      }
    } catch (err) {
      console.error("Failed to toggle product availability", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateHandlingFee = async () => {
    if (!selectedStore) return;
    setIsProcessing(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/stores/${selectedStore.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handling_fee: handlingFeeInput })
      });
      const data = await response.json();
      if (data.success) {
        setStores(prev => prev.map(s => s.id === selectedStore.id ? { ...s, handling_fee: handlingFeeInput } : s));
        setSelectedStore({ ...selectedStore, handling_fee: handlingFeeInput });
      }
    } catch (err) {
      console.error("Failed to update handling fee", err);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="relative min-h-screen">
      {/* Global Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/60 backdrop-blur-[2px] transition-all">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-surface p-8 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            </div>
            <p className="text-sm font-bold text-foreground font-mont uppercase tracking-widest animate-pulse">Processing...</p>
          </div>
        </div>
      )}

      <div className="flex gap-8">

      <div className={`flex-1 space-y-8 transition-all ${selectedStore ? 'max-w-[65%]' : 'w-full'}`}>
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont">Stores</h1>
            <p className="text-sm text-muted">Manage your restaurant partners and grocery stores.</p>
          </div>
          <Link href="/stores/new">
            <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-primary/40 hover:bg-primary-dark transition-all">
              <Plus className="h-4 w-4" />
              Create New Store
            </button>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-4 rounded-2xl bg-surface p-4 border border-border shadow-sm">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-4 py-2 border border-border focus-within:border-primary transition-all">
            <Search className="h-4 w-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search by store name, ID or location..." 
              className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted/50"
            />
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-background transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Stores Content Area */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-border bg-surface/50">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted font-medium">Loading your stores...</p>
            </div>
          </div>
        ) : stores.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Store Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Approval</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {stores.map((store) => (
                  <tr 
                    key={store.id} 
                    className={`hover:bg-background/50 transition-colors group cursor-pointer ${selectedStore?.id === store.id ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedStore(store)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
                          {store.image_url ? (
                            <img src={store.image_url} alt={store.name} className="h-full w-full object-cover" />
                          ) : (
                            <Store size={20} className="text-muted/50" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground font-mont">{store.name}</p>
                          <p className="text-[10px] text-muted font-mono uppercase truncate w-32">{store.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => toggleAvailability(store.id, store.is_active)}
                          disabled={updatingId === store.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${store.is_active ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${store.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className={`text-xs font-bold ${store.is_active ? 'text-primary' : 'text-muted'}`}>
                          {store.is_active ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        store.approval_status === 'approved' ? 'bg-green-500/10 text-green-600' :
                        store.approval_status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {store.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                        {store.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/stores/${store.id}`}>
                          <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-muted hover:bg-background transition-all">
                            Edit
                          </button>
                        </Link>
                        <button 
                          onClick={(e) => handleDeleteStore(e, store.id, store.name)}
                          disabled={deletingId === store.id}
                          className="px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {deletingId === store.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface/50 p-12 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Store size={40} />
            </div>
            <h3 className="text-xl font-bold text-foreground font-mont">No Stores Found</h3>
            <p className="mt-2 max-w-xs text-sm text-muted">
              {error || "You haven't added any stores yet. Click the button above to list your first store partner."}
            </p>
          </div>
        )}
      </div>

      {/* Details Sidebar */}
      {selectedStore && (
        <div className="w-[35%] bg-surface rounded-3xl border border-border shadow-xl p-6 h-fit sticky top-8 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-mont">Store Details</h2>
            <button onClick={() => setSelectedStore(null)} className="p-2 hover:bg-background rounded-full transition-colors">
              <Plus className="h-5 w-5 rotate-45 text-muted" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-muted">
              {selectedStore.image_url ? (
                <img src={selectedStore.image_url} alt={selectedStore.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-muted/30">
                  <Store size={48} />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold font-mont">{selectedStore.name}</h3>
              <p className="text-sm text-muted mt-1">{selectedStore.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-2xl bg-background border border-border">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Contact</p>
                <p className="text-sm font-medium mt-1">{selectedStore.phone_1}</p>
              </div>
              <div className="p-3 rounded-2xl bg-background border border-border">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Location</p>
                <p className="text-sm font-medium mt-1">{selectedStore.city}</p>
              </div>
              <div className="p-3 rounded-2xl bg-background border border-border relative flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Handling Fee</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted">₹</span>
                    <input 
                      type="number" 
                      value={isNaN(handlingFeeInput) ? "" : handlingFeeInput}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setHandlingFeeInput(isNaN(val) ? 0 : val);
                      }}
                      className="w-full bg-transparent text-sm font-bold outline-none focus:text-primary transition-colors"
                    />
                  </div>
                </div>
                {handlingFeeInput !== selectedStore.handling_fee && (
                   <button 
                     onClick={updateHandlingFee}
                     className="mt-2 w-full py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-primary-dark transition-all flex items-center justify-center gap-1"
                   >
                     <Check size={10} /> Save
                   </button>
                )}
              </div>

            </div>


            <div className="pt-4 border-t border-border">
               <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted">Approval Status</h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    selectedStore.approval_status === 'approved' ? 'bg-green-500/10 text-green-600' :
                    selectedStore.approval_status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {selectedStore.approval_status}
                  </span>
               </div>
               
               {selectedStore.approval_status === 'pending' && (
                 <div className="flex gap-2 mb-4">
                   <button 
                     onClick={() => handleApproval(selectedStore.id, 'approved')}
                     className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
                   >
                     Approve Store
                   </button>
                   <button 
                     onClick={() => handleApproval(selectedStore.id, 'rejected')}
                     className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all"
                   >
                     Reject
                   </button>
                 </div>
               )}

               <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted">Store Availability</h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${selectedStore.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted'}`}>
                    {selectedStore.is_active ? 'Online' : 'Offline'}
                  </span>
               </div>
               <button 
                  onClick={() => toggleAvailability(selectedStore.id, selectedStore.is_active)}
                  disabled={updatingId === selectedStore.id}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${selectedStore.is_active ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark'}`}
               >
                  {updatingId === selectedStore.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : selectedStore.is_active ? 'Take Store Offline' : 'Set Store Online'}
               </button>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted">Products ({products.length})</h4>
              </div>

              {loadingProducts ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {products.map((product) => (
                    <div key={product.id} className="p-3 rounded-2xl border border-border bg-background/50 hover:bg-background transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-border bg-surface">
                           {product.image_url ? (
                             <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                           ) : (
                             <div className="flex items-center justify-center h-full text-muted/20">
                               <Plus size={16} />
                             </div>
                           )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground truncate">{product.name}</p>
                          <p className="text-[10px] text-muted">₹{product.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProductAvailability(product.id, product.is_active);
                            }}
                            className={`h-5 w-8 rounded-full transition-colors relative flex items-center ${product.is_active ? 'bg-primary' : 'bg-muted'}`}
                          >
                            <span className={`h-3 w-3 bg-white rounded-full transition-transform ${product.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2">
                           <p className="text-[10px] font-bold text-muted uppercase">Stock</p>
                           <input 
                              type="number" 
                              value={product.stock_quantity}
                              onChange={(e) => updateProductStock(product.id, parseInt(e.target.value))}
                              className="w-14 bg-surface border border-border rounded-md px-1.5 py-0.5 text-xs font-bold outline-none focus:border-primary"
                           />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                           {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted text-center py-4 bg-background rounded-2xl border border-dashed border-border">
                  No products found for this store.
                </p>
              )}
            </div>

          </div>
        </div>
      )}
      </div>
    </div>
  );

}

