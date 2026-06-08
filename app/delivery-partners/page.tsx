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
  ShieldX, 
  Plus, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye,
  ZoomIn,
  Truck,
  Copy,
  ArrowUpRight,
  Wallet
} from "lucide-react";

interface DeliveryPartner {
  id: string;
  phone: string;
  full_name: string | null;
  email: string | null;
  aadhar_number: string | null;
  aadhar_image: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  razorpay_kyc_status: string | null;
  razorpay_rejection_reason: string | null;
  upi_id?: string | null;
  upi_qr_image?: string | null;
  total_earnings?: number | string | null;
  withdrawable_earnings?: number | string | null;
}

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const fetchTransactions = async (partnerId: string) => {
    setTransactionsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/user/${partnerId}/transactions`);
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
    if (selectedPartner) {
      fetchTransactions(selectedPartner.id);
    } else {
      setTransactions([]);
    }
  }, [selectedPartner?.id]);

  const handleRecordPayout = async () => {
    if (!selectedPartner) return;
    const withdrawable = parseFloat(String(selectedPartner.withdrawable_earnings)) || 0;
    if (withdrawable <= 0) {
      alert("No withdrawable earnings available for this partner.");
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

    setActionLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/user/${selectedPartner.id}/payout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description })
      });
      const data = await response.json();
      if (data.success) {
        alert("Payout recorded successfully!");
        // Update local selectedPartner state with new balances
        setSelectedPartner(prev => {
          if (!prev) return null;
          return {
            ...prev,
            total_earnings: data.data.totalEarnings,
            withdrawable_earnings: data.data.withdrawableEarnings
          };
        });
        // Refetch partners list to update main table
        await fetchPartners();
        // Refetch transaction logs
        await fetchTransactions(selectedPartner.id);
      } else {
        alert(data.error || "Failed to record payout");
      }
    } catch (err) {
      alert("Connection error. Could not record payout.");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      // Fetch only delivery partners from backend (using the specialized endpoint for correct field mapping)
      const response = await fetch(`${baseUrl}/user/delivery-partners`);
      const data = await response.json();
      if (data.success) {
        setPartners(data.data);
        setFilteredPartners(data.data);
        // If a partner is selected, update their details in sidebar from fresh data
        if (selectedPartner) {
          const updated = data.data.find((p: DeliveryPartner) => p.id === selectedPartner.id);
          if (updated) {
            setSelectedPartner(updated);
          }
        }
      } else {
        setError(data.error || "Failed to load delivery partners");
      }
    } catch (err) {
      setError("Connection error. Could not reach backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    let result = partners;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p => 
        (p.full_name?.toLowerCase().includes(lowerSearch)) ||
        (p.phone.includes(lowerSearch)) ||
        (p.email?.toLowerCase().includes(lowerSearch)) ||
        (p.aadhar_number?.includes(lowerSearch)) ||
        (p.id.toLowerCase().includes(lowerSearch))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(p => p.approval_status === statusFilter);
    }

    setFilteredPartners(result);
  }, [searchTerm, statusFilter, partners]);

  const handleApproveStatus = async (partnerId: string, status: 'approved' | 'rejected') => {
    let rejectionReason = null;
    if (status === 'rejected') {
      const reasonInput = prompt("Please enter the reason for rejection:");
      if (reasonInput === null) {
        // Cancelled
        return;
      }
      rejectionReason = reasonInput.trim() || "Documents or profile details were invalid.";
    }

    setActionLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      // Use the new generic approval endpoint
      const response = await fetch(`${baseUrl}/user/${partnerId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason })
      });
      const data = await response.json();
      if (data.success) {
        await fetchPartners();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Connection error. Could not update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Metrics
  const totalCount = partners.length;
  const pendingCount = partners.filter(p => p.approval_status === 'pending').length;
  const approvedCount = partners.filter(p => p.approval_status === 'approved').length;
  const rejectedCount = partners.filter(p => p.approval_status === 'rejected').length;

  return (
    <div className="relative min-h-screen">
      <div className="flex gap-8">
        <div className={`flex-1 space-y-8 transition-all ${selectedPartner ? 'max-w-[65%]' : 'w-full'}`}>
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont">Delivery Partners</h1>
              <p className="text-sm text-muted">Review, verify, and approve delivery rider registration requests.</p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-sm flex flex-col justify-between min-h-[100px]">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Total Registrations</span>
              <h3 className="text-2xl font-bold text-foreground mt-2">{totalCount}</h3>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-sm flex flex-col justify-between min-h-[100px]">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Pending Verification</span>
              <h3 className="text-2xl font-bold text-amber-500 mt-2">{pendingCount}</h3>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-sm flex flex-col justify-between min-h-[100px]">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Approved Riders</span>
              <h3 className="text-2xl font-bold text-primary mt-2">{approvedCount}</h3>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-sm flex flex-col justify-between min-h-[100px]">
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Rejected Requests</span>
              <h3 className="text-2xl font-bold text-red-500 mt-2">{rejectedCount}</h3>
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

          {/* Table Content Area */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-border bg-surface/50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted font-medium">Loading delivery partners...</p>
              </div>
            </div>
          ) : filteredPartners.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Partner</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Aadhar Number</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Registration Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredPartners.map((partner) => (
                    <tr 
                      key={partner.id} 
                      className={`hover:bg-background/50 transition-colors group cursor-pointer ${selectedPartner?.id === partner.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl overflow-hidden border border-border bg-primary/10 flex items-center justify-center text-primary">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground font-mont">{partner.full_name || 'Unnamed Rider'}</p>
                            <p className="text-xs text-muted font-medium">{partner.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-foreground font-semibold">
                          <FileText size={14} className="text-muted" />
                          <span>{partner.aadhar_number || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-primary/60" />
                          <span>{formatDate(partner.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium capitalize ${
                          partner.approval_status === 'approved' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 
                          partner.approval_status === 'rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 
                          'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                        }`}>
                          {partner.approval_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface/50 p-12 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Truck size={40} />
              </div>
              <h3 className="text-xl font-bold text-foreground font-mont">No Riders Found</h3>
              <p className="mt-2 max-w-xs text-sm text-muted">
                {error || "We couldn't find any delivery partners matching your search."}
              </p>
            </div>
          )}
        </div>

        {/* Details Sidebar */}
        {selectedPartner && (
          <div className="w-[35%] bg-surface rounded-3xl border border-border shadow-xl p-6 h-[85vh] sticky top-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-mont">Rider Verification & Ledger</h2>
              <button onClick={() => setSelectedPartner(null)} className="p-2 hover:bg-background rounded-full transition-colors">
                <Plus className="h-5 w-5 rotate-45 text-muted" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center p-6 rounded-2xl bg-background border border-border">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-lg shadow-primary/10">
                  <User size={40} />
                </div>
                <h3 className="text-xl font-bold font-mont text-center">{selectedPartner.full_name || 'Unnamed Rider'}</h3>
                <div className="mt-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    selectedPartner.approval_status === 'approved' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 
                    selectedPartner.approval_status === 'rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 
                    'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                  }`}>
                    {selectedPartner.approval_status}
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
                      ₹{(parseFloat(String(selectedPartner.total_earnings)) || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase">Remaining Balance</p>
                    <p className="text-xl font-bold text-primary mt-1 font-mont">
                      ₹{(parseFloat(String(selectedPartner.withdrawable_earnings)) || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleRecordPayout}
                  disabled={actionLoading || (parseFloat(String(selectedPartner.withdrawable_earnings)) || 0) <= 0}
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
                    {selectedPartner.upi_id ? (
                      <div className="flex items-center justify-between mt-1.5 p-2 bg-surface rounded-lg border border-border">
                        <span className="font-mono text-xs font-bold text-foreground truncate mr-2">{selectedPartner.upi_id}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(selectedPartner.upi_id || "");
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
                    {selectedPartner.upi_qr_image ? (
                      <div className="relative group overflow-hidden rounded-xl border border-border bg-surface h-48 flex items-center justify-center">
                        <img 
                          src={selectedPartner.upi_qr_image} 
                          alt="UPI QR Code" 
                          className="object-contain w-full h-full p-2"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200">
                          <button 
                            onClick={() => setZoomImage(selectedPartner.upi_qr_image || null)}
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
                <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Contact Info</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <Phone size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase">Phone Number</p>
                      <p className="text-sm font-medium">{selectedPartner.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                    <div className="p-2 rounded-lg bg-surface border border-border">
                      <Mail size={14} className="text-primary" />
                    </div>
                    <div className="truncate">
                      <p className="text-[10px] font-bold text-muted uppercase">Email Address</p>
                      <p className="text-sm font-medium truncate">{selectedPartner.email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Aadhar Verification</h4>
                <div className="p-4 rounded-xl bg-background border border-border space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase">Aadhar Card Number</p>
                    <p className="text-sm font-bold font-mono mt-1 text-foreground">{selectedPartner.aadhar_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase mb-2">Uploaded Document</p>
                    {selectedPartner.aadhar_image ? (
                      <div className="relative group overflow-hidden rounded-xl border border-border bg-surface h-36 flex items-center justify-center">
                        <img 
                          src={selectedPartner.aadhar_image} 
                          alt="Aadhar Document" 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200">
                          <button 
                            onClick={() => setZoomImage(selectedPartner.aadhar_image || null)}
                            className="p-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm rounded-xl text-white transition-colors"
                            title="Zoom Document"
                          >
                            <ZoomIn size={18} />
                          </button>
                          <a 
                            href={selectedPartner.aadhar_image} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2.5 bg-white/20 hover:bg-white/35 backdrop-blur-sm rounded-xl text-white transition-colors"
                            title="Open in New Tab"
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
                {selectedPartner.approval_status !== 'approved' && (
                  <button 
                    onClick={() => handleApproveStatus(selectedPartner.id, 'approved')}
                    disabled={actionLoading}
                    className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-md shadow-primary/10"
                  >
                    <CheckCircle2 size={18} />
                    Approve Partner
                  </button>
                )}
                {selectedPartner.approval_status !== 'rejected' && (
                  <button 
                    onClick={() => handleApproveStatus(selectedPartner.id, 'rejected')}
                    disabled={actionLoading}
                    className="w-full bg-red-500/10 text-red-500 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all disabled:opacity-50 border border-red-500/20"
                  >
                    <XCircle size={18} />
                    Reject Partner
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
