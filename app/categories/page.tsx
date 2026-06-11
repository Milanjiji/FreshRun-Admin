"use client";

import React, { useState, useEffect } from "react";
import { 
  FolderPlus, 
  Plus, 
  Trash2, 
  Folder, 
  Layers, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ListPlus,
  HelpCircle
} from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [submittingSubcatId, setSubmittingSubcatId] = useState<number | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<number | null>(null);
  const [deletingSubcatId, setDeletingSubcatId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add Category form state
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("cart-outline");

  // Add Subcategory inline inputs (categoryId -> text)
  const [newSubcatNames, setNewSubcatNames] = useState<Record<number, string>>({});

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/categories/admin`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      } else {
        setError(data.error || "Failed to load categories.");
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) {
      showNotification("Please fill in category name and slug", false);
      return;
    }

    setSubmittingCategory(true);
    try {
      const response = await fetch(`${baseUrl}/categories/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          slug: newCatSlug.trim().toLowerCase().replace(/\s+/g, "-"),
          icon: newCatIcon.trim()
        })
      });
      const data = await response.json();
      if (data.success) {
        showNotification("Category created successfully!");
        setNewCatName("");
        setNewCatSlug("");
        setNewCatIcon("cart-outline");
        fetchCategories();
      } else {
        showNotification(data.error || "Failed to create category", false);
      }
    } catch (err) {
      showNotification("Network error. Failed to create category.", false);
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? All nested subcategories will be permanently deleted.`)) {
      return;
    }

    setDeletingCatId(id);
    try {
      const response = await fetch(`${baseUrl}/categories/admin/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        showNotification("Category deleted successfully!");
        fetchCategories();
      } else {
        showNotification(data.error || "Failed to delete category", false);
      }
    } catch (err) {
      showNotification("Network error. Failed to delete category.", false);
    } finally {
      setDeletingCatId(null);
    }
  };

  const handleAddSubcategory = async (categoryId: number) => {
    const name = newSubcatNames[categoryId]?.trim();
    if (!name) {
      showNotification("Please enter a subcategory name", false);
      return;
    }

    setSubmittingSubcatId(categoryId);
    try {
      const response = await fetch(`${baseUrl}/categories/admin/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: categoryId,
          name: name
        })
      });
      const data = await response.json();
      if (data.success) {
        showNotification("Subcategory added successfully!");
        setNewSubcatNames(prev => ({ ...prev, [categoryId]: "" }));
        fetchCategories();
      } else {
        showNotification(data.error || "Failed to add subcategory", false);
      }
    } catch (err) {
      showNotification("Network error. Failed to add subcategory.", false);
    } finally {
      setSubmittingSubcatId(null);
    }
  };

  const handleDeleteSubcategory = async (id: number, name: string) => {
    if (!window.confirm(`Delete subcategory "${name}"?`)) {
      return;
    }

    setDeletingSubcatId(id);
    try {
      const response = await fetch(`${baseUrl}/categories/admin/subcategories/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        showNotification("Subcategory removed!");
        fetchCategories();
      } else {
        showNotification(data.error || "Failed to delete subcategory", false);
      }
    } catch (err) {
      showNotification("Network error. Failed to delete subcategory.", false);
    } finally {
      setDeletingSubcatId(null);
    }
  };

  const presetIcons = [
    { name: "restaurant-outline", label: "🍴 Fork & Knife" },
    { name: "pizza-outline", label: "🍱 Pizza / Street Food" },
    { name: "cart-outline", label: "🛒 Shopping Cart" },
    { name: "egg-outline", label: "🍗 Egg / Chicken" },
    { name: "fish-outline", label: "🐟 Fish / Seafood" },
    { name: "medkit-outline", label: "💊 First Aid / Medicine" },
    { name: "beer-outline", label: "🍺 Beverage / Alcohol" },
    { name: "ice-cream-outline", label: "🍨 Dessert / Ice Cream" },
  ];

  // Calculate totals
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-mont bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Product Categories Management
        </h1>
        <p className="text-sm text-muted mt-1">
          Create, edit, and remove dynamic categories and subcategories which display on the customer home screen and products catalog.
        </p>
      </div>

      {/* Notifications */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-surface p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Total Categories</p>
            <h3 className="text-2xl font-black text-foreground mt-1 font-mont">{totalCategories}</h3>
          </div>
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Folder size={24} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Total Subcategories</p>
            <h3 className="text-2xl font-black text-foreground mt-1 font-mont">{totalSubcategories}</h3>
          </div>
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Layers size={24} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider">System State</p>
            <h3 className="text-sm font-bold text-green-500 mt-2 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-ping inline-block" />
              Dynamic Sync Active
            </h3>
          </div>
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Tag size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Add Category */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-surface p-6 border border-border shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center gap-2 text-primary">
              <FolderPlus size={20} />
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Create Category</h3>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Category Name</label>
                <input 
                  type="text"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    // Generate slug automatically
                    setNewCatSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, "-"));
                  }}
                  placeholder="e.g. Vegetables & Fruits"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Slug (API Identifier)</label>
                <input 
                  type="text"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="e.g. vegetables-fruits"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Mobile App Icon</label>
                <div className="relative">
                  <select 
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all appearance-none"
                  >
                    {presetIcons.map(icon => (
                      <option key={icon.name} value={icon.name}>{icon.label}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-muted mt-1 leading-relaxed flex items-center gap-1">
                  <HelpCircle size={10} /> Maps to Ionicon name inside Customer App.
                </p>
              </div>

              <button
                type="submit"
                disabled={submittingCategory}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {submittingCategory ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add Category
              </button>
            </form>
          </div>
        </div>

        {/* Right Grid: Categories List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Layers size={20} />
            <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Categories & Subcategories</h3>
          </div>

          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center text-center bg-surface border border-border rounded-2xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted">Fetching dynamic categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center bg-surface border border-border rounded-2xl p-6">
              <AlertCircle className="h-10 w-10 text-muted mb-3" />
              <h3 className="text-lg font-bold text-foreground">No Categories Found</h3>
              <p className="text-sm text-muted mt-1">Create one using the form on the left to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="rounded-2xl bg-surface border border-border overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-muted-foreground/30 transition-all duration-200"
                >
                  {/* Category Header */}
                  <div className="p-5 border-b border-border bg-muted/10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {presetIcons.find(pi => pi.name === cat.icon)?.label.split(" ")[0] || "📁"}
                        </span>
                        <h4 className="font-bold text-foreground text-sm leading-tight">{cat.name}</h4>
                      </div>
                      <p className="text-[10px] text-muted font-mono mt-1">slug: {cat.slug}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      disabled={deletingCatId === cat.id}
                      className="p-1.5 rounded-lg border border-red-500/10 text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                      title="Delete Category"
                    >
                      {deletingCatId === cat.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>

                  {/* Subcategories Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    {/* List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Subcategories</p>
                      
                      {!cat.subcategories || cat.subcategories.length === 0 ? (
                        <p className="text-xs text-muted italic">No subcategories listed</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {cat.subcategories.map((sub: any) => (
                            <div 
                              key={sub.id} 
                              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background pl-3 pr-2 py-1 text-xs font-semibold text-foreground group"
                            >
                              <span>{sub.name}</span>
                              <button
                                onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                                disabled={deletingSubcatId === sub.id}
                                className="text-muted hover:text-red-500 p-0.5 rounded transition-colors"
                              >
                                {deletingSubcatId === sub.id ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <Trash2 size={10} />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Inline Input to Add Subcategory */}
                    <div className="pt-3 border-t border-border">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSubcatNames[cat.id] || ""}
                          onChange={(e) => setNewSubcatNames(prev => ({ ...prev, [cat.id]: e.target.value }))}
                          placeholder="Add subcategory..."
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary transition-all"
                        />
                        <button
                          onClick={() => handleAddSubcategory(cat.id)}
                          disabled={submittingSubcatId === cat.id}
                          className="flex items-center justify-center p-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                          {submittingSubcatId === cat.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <ListPlus size={12} />
                          )}
                        </button>
                      </div>
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
