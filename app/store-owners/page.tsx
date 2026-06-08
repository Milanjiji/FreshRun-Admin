"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  Loader2, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Activity,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ZoomIn,
  Eye,
  Store,
  Copy,
  ArrowUpRight,
  Wallet
} from "lucide-react";

interface UserData {
  id: string;
  phone: string;
  role: string;
  fullName: string | null;
  email: string | null;
  houseNumber: string | null;
  addressLine: string | null;
  landmark: string | null;
  pincode: string | null;
  city: string | null;
  deliveryMessage: string | null;
  isProfileComplete: boolean;
  isActive: boolean;
  createdAt: string;
  approvalStatus: string;
  aadharNumber: string | null;
  aadharImage: string | null;
  upiId?: string | null;
  upiQrImage?: string | null;
  totalEarnings?: number | null;
  withdrawableEarnings?: number | null;
}

export default function StoreOwnersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const fetchTransactions = async (ownerId: string) => {
    setTransactionsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/user/${ownerId}/transactions`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchTransactions(selectedUser.id);
    } else {
      setTransactions([]);
    }
  }, [selectedUser?.id]);

  const handleRecordPayout = async () => {
    if (!selectedUser) return;
    const withdrawable = parseFloat(String(selectedUser.withdrawableEarnings)) || 0;
    if (withdrawable <= 0) {
      alert("No withdrawable earnings available for this owner.");
      return;
    }

    const amountInput = prompt(`Enter payout amount (Max: ₹${withdrawable.toFixed(2)}):`, withdrawable.toFixed(2));
    if (amountInput === null) return; // Cancelled

    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0 || amount > withdrawable) {
      alert("Invalid payout amount entered.");
      return;
    }

    const description = prompt("Enter description (optional):", "Manual Payout");
    if (description === null) return;

    setUpdatingId(selectedUser.id);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/user/${selectedUser.id}/payout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description })
      });
      const data = await response.json();
      if (data.success) {
        alert("Payout recorded successfully!");
        // Update local selectedUser state with new balances
        setSelectedUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            totalEarnings: data.data.totalEarnings,
            withdrawableEarnings: data.data.withdrawableEarnings
          };
        });
        // Refetch users list to update main table
        await fetchUsers();
        // Refetch transaction logs
        await fetchTransactions(selectedUser.id);
      } else {
        alert(data.error || "Failed to record payout");
      }
    } catch (err) {
      alert("Connection error. Could not record payout.");
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchUsers = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      // Fetch only owners
      const response = await fetch(`${baseUrl}/user/all?role=owner`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setFilteredUsers(data.data);
        if (selectedUser) {
          const updated = data.data.find((u: UserData) => u.id === selectedUser.id);
          if (updated) setSelectedUser(updated);
        }
      } else {
        setError(data.error || "Failed to load store owners");
      }
    } catch (err) {
      setError("Connection error. Could not reach backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/user/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Failed to update approval status", err);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.fullName?.toLowerCase().includes(lowerSearch)) ||
        (u.phone.includes(lowerSearch)) ||
        (u.email?.toLowerCase().includes(lowerSearch)) ||
        (u.id.toLowerCase().includes(lowerSearch)) ||
        (u.aadharNumber?.includes(lowerSearch))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(u => u.approvalStatus === statusFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, statusFilter, users]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Metrics
  const totalCount = users.length;
  const pendingCount = users.filter(u => u.approvalStatus === 'pending').length;
  const approvedCount = users.filter(u => u.approvalStatus === 'approved').length;

  return (
    <div className="relative min-h-screen">
      <div className="flex gap-8">
        <div className={`flex-1 space-y-8 transition-all ${selectedUser ? 'max-w-[65%]' : 'w-full'}`}>
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont">Store Owners</h1>
              <p className="text-sm text-muted">Verify and manage shop owners on your platform.</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-sm">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Total Owners</span>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalCount}</h3>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-sm">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Pending Approval</span>
              <h3 className="text-2xl font-bold text-amber-500 mt-1">{pendingCount}</h3>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-sm">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Verified Owners</span>
              <h3 className="text-2xl font-bold text-primary mt-1">{approvedCount}</h3>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex items-center gap-4 rounded-2xl bg-surface p-4 border border-border shadow-sm">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-4 py-2 border border-border focus-within:border-primary transition-all">
              <Search className="h-4 w-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search by name, phone, email or Aadhar..." 
                className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted" />
              <select 
                className="bg-transparent text-sm font-medium text-muted outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Users Content Area */}
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-border bg-surface/50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted font-medium">Loading store owners...</p>
              </div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Owner Details</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Aadhar Number</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Joined</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-background/50 transition-colors group cursor-pointer ${selectedUser?.id === user.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl overflow-hidden border border-border bg-primary/10 flex items-center justify-center text-primary">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground font-mont">{user.fullName || 'Unnamed Owner'}</p>
                            <p className="text-xs text-muted font-medium">{user.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-foreground font-semibold">
                          <FileText size={14} className="text-muted" />
                          <span>{user.aadharNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-muted text-xs">
                          <Calendar size={14} className="text-primary/60" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium capitalize ${
                          user.approvalStatus === 'approved' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 
                          user.approvalStatus === 'rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 
                          'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                        }`}>
                          {user.approvalStatus}
                        </span>
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
              <h3 className="text-xl font-bold text-foreground font-mont">No Owners Found</h3>
              <p className="mt-2 max-w-xs text-sm text-muted">
                {error || "We couldn't find any store owners matching your search."}
              </p>
            </div>
          )}
        </div>

        {/* Details Sidebar */}
        {selectedUser && (
          <div className="w-[35%] bg-surface rounded-3xl border border-border shadow-xl p-6 h-[85vh] sticky top-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-mont">Owner Verification & Ledger</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-background rounded-full transition-colors">
                <Plus className="h-5 w-5 rotate-45 text-muted" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center p-6 rounded-2xl bg-background border border-border">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-lg shadow-primary/10">
                  <User size={40} />
                </div>
                <h3 className="text-xl font-bold font-mont text-center">{selectedUser.fullName || 'Unnamed Owner'}</h3>
                <div className="mt-4">
                   <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      selectedUser.approvalStatus === 'approved' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 
                      selectedUser.approvalStatus === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-red-500/10 text-red-600'
                   }`}>
                      {selectedUser.approvalStatus}
                   </span>
                </div>
              </div>

              {/* Earnings Ledger Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 space-y-4">
                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Wallet size={18} className="text-primary" />
                    <span className="font-bold text-foreground text-sm font-mont">Earnings Ledger</span>
                  </div>
                  <span className="text-xs text-muted font-medium">Manual Settlement</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase">Total Earned</p>
                    <p className="text-xl font-bold text-foreground mt-1 font-mont">
                      ₹{(parseFloat(String(selectedUser.totalEarnings)) || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase">Remaining Balance</p>
                    <p className="text-xl font-bold text-primary mt-1 font-mont">
                      ₹{(parseFloat(String(selectedUser.withdrawableEarnings)) || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleRecordPayout}
                  disabled={updatingId === selectedUser.id || (parseFloat(String(selectedUser.withdrawableEarnings)) || 0) <= 0}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-md shadow-primary/10 text-xs"
                >
                  <ArrowUpRight size={16} />
                  Record Manual Payout
                </button>
              </div>

              {/* UPI Details Card */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">UPI & QR Code</h4>
                <div className="p-4 rounded-xl bg-background border border-border space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase">UPI ID</p>
                    {selectedUser.upiId ? (
                      <div className="flex items-center justify-between mt-1.5 p-2 bg-surface rounded-lg border border-border">
                        <span className="font-mono text-xs font-bold text-foreground truncate mr-2">{selectedUser.upiId}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(selectedUser.upiId || "");
                            setCopiedId(true);
                            setTimeout(() => setCopiedId(false), 2000);
                          }}
                          className="p-1.5 hover:bg-background rounded-md transition-colors text-primary"
                        >
                          {copiedId ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-muted mt-1">No UPI ID registered</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase mb-2">UPI QR Code</p>
                    {selectedUser.upiQrImage ? (
                      <div className="relative group overflow-hidden rounded-xl border border-border bg-surface h-48 flex items-center justify-center">
                        <img 
                          src={selectedUser.upiQrImage} 
                          alt="UPI QR Code" 
                          className="object-contain w-full h-full p-2"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200">
                          <button 
                            onClick={() => setZoomImage(selectedUser.upiQrImage || null)}
                            className="p-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm rounded-xl text-white transition-colors"
                            title="Zoom QR Code"
                          >
                            <ZoomIn size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border bg-surface p-6 flex flex-col items-center justify-center gap-2 text-center">
                        <AlertCircle size={24} className="text-amber-500" />
                        <p className="text-xs text-muted font-medium">No QR Code uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transaction Statement Ledger */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Statement Ledger</h4>
                {transactionsLoading ? (
                  <div className="flex py-8 justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-3 bg-background border border-border rounded-xl flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-foreground leading-tight">{tx.description}</p>
                          <p className="text-[10px] text-muted">{new Date(tx.created_at).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-bold font-mono text-sm ${
                            tx.type === 'earning' ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                          }`}>
                            {tx.type === 'earning' ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
                          </span>
                          <p className="text-[9px] uppercase tracking-wider text-muted font-bold mt-0.5">{tx.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted text-center py-6">No transactions recorded yet.</p>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Contact Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <Phone size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase">Phone Number</p>
                      <p className="text-sm font-medium">{selectedUser.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <Mail size={14} className="text-primary" />
                    </div>
                    <div className="truncate">
                      <p className="text-[10px] font-bold text-muted uppercase">Email Address</p>
                      <p className="text-sm font-medium truncate">{selectedUser.email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Aadhar Verification</h4>
                <div className="p-4 rounded-xl bg-background border border-border space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase">Aadhar Card Number</p>
                    <p className="text-sm font-bold font-mono mt-1 text-foreground">{selectedUser.aadharNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase mb-2">Uploaded Document</p>
                    {selectedUser.aadharImage ? (
                      <div className="relative group overflow-hidden rounded-xl border border-border bg-surface h-36 flex items-center justify-center">
                        <img 
                          src={selectedUser.aadharImage} 
                          alt="Aadhar Document" 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200">
                          <button 
                            onClick={() => setZoomImage(selectedUser.aadharImage || null)}
                            className="p-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm rounded-xl text-white transition-colors"
                          >
                            <ZoomIn size={18} />
                          </button>
                          <a 
                            href={selectedUser.aadharImage} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm rounded-xl text-white transition-colors"
                          >
                            <Eye size={18} />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border bg-surface p-6 flex flex-col items-center justify-center gap-2 text-center">
                        <AlertCircle size={24} className="text-amber-500" />
                        <p className="text-xs text-muted font-medium">No document uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                {selectedUser.approvalStatus !== 'approved' && (
                  <button 
                    onClick={() => handleApproval(selectedUser.id, 'approved')}
                    disabled={updatingId === selectedUser.id}
                    className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-md shadow-primary/10"
                  >
                    <CheckCircle2 size={18} />
                    Approve Owner
                  </button>
                )}
                {selectedUser.approvalStatus !== 'rejected' && (
                  <button 
                    onClick={() => handleApproval(selectedUser.id, 'rejected')}
                    disabled={updatingId === selectedUser.id}
                    className="w-full bg-red-500/10 text-red-500 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all disabled:opacity-50 border border-red-500/20"
                  >
                    <XCircle size={18} />
                    Reject Owner
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-4xl max-h-[90vh] p-4 flex flex-col items-center justify-center">
            <button 
              onClick={() => setZoomImage(null)} 
              className="absolute -top-12 right-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors flex items-center justify-center"
            >
              <Plus className="h-6 w-6 rotate-45" />
            </button>
            <img 
              src={zoomImage} 
              alt="Zoomed Document" 
              className="object-contain max-w-full max-h-[80vh] rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
