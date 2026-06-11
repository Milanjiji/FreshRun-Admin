"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Package, Search, Filter, Loader2, Tag, Box, AlertCircle, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/products?include_inactive=true`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.error || "Failed to load products");
      }
    } catch (err) {
      setError("Connection error. Could not reach backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    setDeletingId(id);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/products/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (err) {
      alert("Connection error. Could not delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont">Products</h1>
          <p className="text-sm text-muted">Manage your menu items, groceries and food catalog.</p>
        </div>
        <Link href="/products/new">
          <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-primary/40 hover:bg-primary-dark transition-all">
            <Plus className="h-4 w-4" />
            Add New Product
          </button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-4 rounded-2xl bg-surface p-4 border border-border shadow-sm">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-4 py-2 border border-border focus-within:border-primary transition-all">
          <Search className="h-4 w-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search products by name, store or category..." 
            className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted/50"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-background transition-colors">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Products Content Area */}
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-border bg-surface/50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted font-medium">Loading products...</p>
          </div>
        </div>
      ) : products.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Product Info</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Store</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Price & Stock</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-background/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package size={20} className="text-muted/50" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground font-mont">{product.name}</p>
                        {Array.isArray(product.variants) && product.variants.length > 0 ? (
                          <p className="text-xs font-bold text-primary mb-1">{product.variants.length} Variants</p>
                        ) : product.unit ? (
                          <p className="text-xs text-muted font-medium mb-1">{product.unit}</p>
                        ) : null}
                        <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Store size={14} className="text-muted" />
                      <span className="font-medium text-muted">{product.store_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">₹{product.price}</p>
                        {product.discount_percent > 0 && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 rounded">
                            -{product.discount_percent}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted text-[10px]">
                        <Box size={10} />
                        <span>Qty: {product.stock_quantity}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.is_stock_out ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                        <AlertCircle size={10} />
                        STOCK OUT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-500">
                        IN STOCK
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/products/${product.id}`}>
                        <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-muted hover:bg-background transition-all">
                          Edit
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {deletingId === product.id ? (
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
            <Package size={40} />
          </div>
          <h3 className="text-xl font-bold text-foreground font-mont">No Products Found</h3>
          <p className="mt-2 max-w-xs text-sm text-muted">
            {error || "You haven't added any products yet. Click the button above to add your first item."}
          </p>
          <Link href="/products/new">
            <button className="mt-8 rounded-xl border border-primary text-primary px-6 py-2.5 text-sm font-semibold hover:bg-primary/5 transition-all">
              Get Started
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

// Internal icon component for the table
function Store({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
      <path d="M2 7h20"/>
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
    </svg>
  );
}
