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
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  X
} from "lucide-react";

interface WithdrawalRequest {
  id: number;
  user_id: string;
  amount: string | number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  full_name: string;
  phone: string;
  email: string;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  upi_id: string | null;
  role?: 'delivery' | 'owner' | string;
  total_earnings: number | string;
  withdrawable_earnings: number | string;
}

export default function WithdrawalRequestsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchRequests = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/payouts/admin/requests`);
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
        setFilteredRequests(data.requests);
        setError("");
      } else {
        setError(data.error || "Failed to load withdrawal requests");
      }
    } catch (err) {
      setError("Connection error. Could not reach backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let result = requests;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(r => 
        (r.full_name?.toLowerCase().includes(lowerSearch)) ||
        (r.phone?.includes(lowerSearch)) ||
        (r.email?.toLowerCase().includes(lowerSearch)) ||
        (r.upi_id?.toLowerCase().includes(lowerSearch)) ||
        (r.bank_account_number?.includes(lowerSearch))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(r => r.status === statusFilter);
    }

    setFilteredRequests(result);
  }, [searchTerm, statusFilter, requests]);

  const handleApprove = async (id: number) => {
    if (!confirm("Are you sure you want to pass (approve) this withdrawal request? This will automatically deduct the amount from the partner's balance.")) {
      return;
    }

    setActionLoading(id);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/payouts/admin/requests/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.success) {
        alert("Withdrawal passed successfully! Partner balance updated.");
        await fetchRequests();
      } else {
        alert(data.error || "Failed to approve request");
      }
    } catch (err) {
      alert("Connection error. Could not approve request.");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (id: number) => {
    setRejectingRequestId(id);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectingRequestId) return;
    if (!rejectionReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }

    setActionLoading(rejectingRequestId);
    setShowRejectModal(false);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/payouts/admin/requests/${rejectingRequestId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: rejectionReason.trim() })
      });
      const data = await response.json();
      if (data.success) {
        alert("Withdrawal request rejected.");
        await fetchRequests();
      } else {
        alert(data.error || "Failed to reject request");
      }
    } catch (err) {
      alert("Connection error. Could not reject request.");
    } finally {
      setActionLoading(null);
      setRejectingRequestId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Metrics calculations
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pendingCount = pendingRequests.length;
  const pendingAmount = pendingRequests.reduce((sum, r) => sum + parseFloat(String(r.amount)), 0);

  const approvedRequests = requests.filter(r => r.status === 'approved');
  const approvedCount = approvedRequests.length;
  const approvedAmount = approvedRequests.reduce((sum, r) => sum + parseFloat(String(r.amount)), 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          Withdrawal Requests
        </h1>
        <p className="text-sm text-muted">Review, verify, and pass payout requests from delivery partners.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Pending Requests</span>
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Loader2 className={`h-4 w-4 text-amber-500 ${pendingCount > 0 ? 'animate-spin' : ''}`} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-foreground">{pendingCount}</h3>
            <p className="text-xs text-muted mt-1">₹{pendingAmount.toLocaleString('en-IN')} pending disbursement</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Total Disbursed (Passed)</span>
            <div className="p-2 bg-primary/10 rounded-xl">
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-primary">₹{approvedAmount.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-muted mt-1">{approvedCount} requests approved & paid</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Rejected Requests</span>
            <div className="p-2 bg-red-500/10 rounded-xl">
              <ArrowDownLeft className="h-4 w-4 text-red-500" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-red-500">{requests.filter(r => r.status === 'rejected').length}</h3>
            <p className="text-xs text-muted mt-1">Declined or incorrect bank details</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 rounded-2xl bg-surface p-4 border border-border shadow-sm">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-4 py-2 border border-border focus-within:border-primary transition-all">
          <Search className="h-4 w-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search by partner name, phone, email, UPI ID or bank account..." 
            className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted" />
            <select 
              className="bg-transparent text-sm font-medium text-muted outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved & Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {error ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-red-200 bg-red-50/50 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <h3 className="mt-3 text-sm font-semibold text-red-800">Error Loading Requests</h3>
          <p className="mt-1 text-xs text-red-600 max-w-sm">{error}</p>
          <button 
            onClick={fetchRequests}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-white border border-red-200 text-red-800 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-border bg-surface/50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted font-medium">Loading withdrawal requests...</p>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/50 p-6 text-center">
          <Wallet className="h-8 w-8 text-muted" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">No Payout Requests</h3>
          <p className="mt-1 text-xs text-muted max-w-xs">No withdrawal requests found matching your search or filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-surface shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-foreground">
            <thead>
              <tr className="border-b border-border bg-background/50 text-xs font-bold text-muted uppercase tracking-wider">
                <th className="px-6 py-4">Delivery Partner</th>
                <th className="px-6 py-4">Transfer Destination</th>
                <th className="px-6 py-4">Available / Requested</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-background/20 transition-colors">
                  {/* Partner Identity */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {req.full_name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">{req.full_name || "Unknown Partner"}</span>
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                            req.role === 'owner' 
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/15' 
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15'
                          }`}>
                            {req.role === 'owner' ? 'Store Owner' : 'Rider'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span>{req.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Transfer Destination */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs space-y-1">
                      {req.upi_id ? (
                        <div className="flex items-center gap-1.5 bg-primary/5 text-primary border border-primary/10 rounded-md px-2 py-0.5 w-fit">
                          <span className="font-bold">UPI ID:</span>
                          <span>{req.upi_id}</span>
                        </div>
                      ) : null}
                      {req.bank_account_number ? (
                        <div className="flex flex-col text-muted mt-0.5">
                          <span><span className="font-semibold text-foreground">A/C:</span> {req.bank_account_number}</span>
                          <span><span className="font-semibold text-foreground">IFSC:</span> {req.bank_ifsc}</span>
                        </div>
                      ) : null}
                      {!req.upi_id && !req.bank_account_number ? (
                        <span className="text-red-500 font-medium italic">No details provided</span>
                      ) : null}
                    </div>
                  </td>

                  {/* Available vs Requested */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-foreground text-sm">₹{parseFloat(String(req.amount)).toFixed(2)}</span>
                      <span className="text-[10px] text-muted mt-0.5">
                        Withdrawable Balance: ₹{parseFloat(String(req.withdrawable_earnings)).toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-xs text-muted">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(req.created_at)}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold w-fit ${
                        req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                        req.status === 'pending' ? 'bg-amber-500/10 text-amber-600 animate-pulse' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {req.status === 'approved' ? <CheckCircle2 className="h-3 w-3" /> :
                         req.status === 'rejected' ? <XCircle className="h-3 w-3" /> :
                         <Loader2 className="h-3 w-3 animate-spin" />}
                        {req.status === 'approved' ? 'Passed & Paid' :
                         req.status === 'rejected' ? 'Rejected' :
                         'Pending Approval'}
                      </span>
                      {req.status === 'rejected' && req.rejection_reason && (
                        <span className="text-[10px] text-red-500/80 font-medium mt-1 max-w-[200px] break-words">
                          Reason: {req.rejection_reason}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {req.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => handleApprove(req.id)}
                          className="inline-flex items-center justify-center rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/95 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          {actionLoading === req.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Pass Request"
                          )}
                        </button>
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => openRejectModal(req.id)}
                          className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted italic">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-in fade-in-50 zoom-in-95 duration-155">
            <button 
              onClick={() => setShowRejectModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-background text-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-foreground font-mont">Reject Withdrawal Request</h3>
            <p className="text-xs text-muted mt-1">Provide a brief explanation of why this request is being rejected so the partner can resolve the issue.</p>
            
            <div className="mt-4">
              <textarea
                placeholder="e.g. UPI ID is invalid or cannot receive payments. Please check your banking details."
                className="w-full h-28 p-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-colors resize-none placeholder:text-muted/40 text-foreground"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm font-semibold border border-border text-muted rounded-xl hover:bg-background transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
