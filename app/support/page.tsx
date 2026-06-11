"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  Loader2, 
  Check, 
  MessageSquare, 
  Clock, 
  User, 
  ShoppingBag, 
  Copy, 
  ExternalLink,
  Send,
  AlertCircle,
  CheckCircle2,
  Plus,
  Image as ImageIcon
} from "lucide-react";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [error, setError] = useState("");
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Admin reply states
  const [newReply, setNewReply] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const replyEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/support/admin/tickets`);
      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets || []);
      } else {
        setError(data.error || "Failed to load support tickets");
      }
    } catch (err) {
      setError("Connection error. Could not reach backend.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (ticketId: string) => {
    setLoadingReplies(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/support/tickets/${ticketId}`);
      const data = await response.json();
      if (data.success) {
        setReplies(data.replies || []);
        // Also refresh selected ticket details if store_phone or anything is updated
        setSelectedTicket(data.ticket);
      }
    } catch (err) {
      console.error("Failed to load replies:", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket?.id) {
      fetchReplies(selectedTicket.id);
    } else {
      setReplies([]);
    }
  }, [selectedTicket?.id]);

  useEffect(() => {
    // Scroll replies to bottom when a new reply arrives
    replyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !selectedTicket) return;

    setIsSendingReply(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/support/tickets/${selectedTicket.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newReply.trim(),
          sender_type: "admin",
          sender_id: "admin_user"
        })
      });
      const data = await response.json();
      if (data.success) {
        setReplies(prev => [...prev, data.reply]);
        setNewReply("");
        // Re-fetch tickets list to update last updated timestamp and status in the list
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;

    setIsUpdatingStatus(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/support/admin/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        setTickets((prev: any[]) => prev.map((t: any) => t.id === selectedTicket.id ? { ...t, status } : t));
        setSelectedTicket((prev: any) => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  // Search and Filter computation
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(ticket.id).includes(searchQuery);

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="relative min-h-screen">
      <div className="flex gap-8">
        
        {/* Left Side: Ticket List */}
        <div className={`flex-1 space-y-8 transition-all ${selectedTicket ? 'max-w-[55%]' : 'w-full'}`}>
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont flex items-center gap-2">
                <LifeBuoy className="h-6 w-6 text-primary" />
                Support Desk
              </h1>
              <p className="text-sm text-muted">Manage customer service requests, check refund claims, and reply to chats.</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl bg-surface p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 rounded-xl bg-background px-4 py-2 border border-border focus-within:border-primary transition-all col-span-1 md:col-span-1">
              <Search className="h-4 w-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search tickets or users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted/50"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted font-mono whitespace-nowrap">STATUS:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted font-mono whitespace-nowrap">CATEGORY:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none transition-colors"
              >
                <option value="all">All Categories</option>
                <option value="General">General</option>
                <option value="Payment">Payment</option>
                <option value="Bad Order">Bad Order</option>
              </select>
            </div>
          </div>

          {/* Ticket Listing Content */}
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-border bg-surface/50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted font-medium">Loading tickets...</p>
              </div>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
              <div className="divide-y divide-border">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-5 hover:bg-background/50 transition-all cursor-pointer flex justify-between items-start gap-4 ${
                      selectedTicket?.id === ticket.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          ticket.category === 'Bad Order' ? 'bg-red-500/10 text-red-600' :
                          ticket.category === 'Payment' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-gray-500/10 text-gray-600'
                        }`}>
                          {ticket.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.status === 'open' ? 'bg-amber-500/10 text-amber-600 animate-pulse' :
                          ticket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-green-500/10 text-green-600'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        {ticket.order_id && (
                          <span className="text-[10px] text-muted font-mono font-bold">
                            Order: #{String(ticket.order_id).split('-')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-foreground font-mont flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted" />
                        {ticket.user_name || 'Guest User'}
                      </p>
                      <p className="text-xs text-muted leading-relaxed line-clamp-2">{ticket.message}</p>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] text-muted font-medium">
                        {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-[9px] text-muted/60 font-mono">
                        {new Date(ticket.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface/50 p-12 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LifeBuoy size={40} />
              </div>
              <h3 className="text-xl font-bold text-foreground font-mont">No Tickets Found</h3>
              <p className="mt-2 max-w-xs text-sm text-muted">
                No support requests are matches with filters or search parameters.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Ticket Details and Chat panel */}
        {selectedTicket && (
          <div className="w-[45%] bg-surface rounded-3xl border border-border shadow-2xl flex flex-col h-[85vh] sticky top-8 animate-in slide-in-from-right duration-300 overflow-hidden">
            {/* Panel Header */}
            <div className="p-6 border-b border-border bg-background/30 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold font-mont flex items-center gap-2 text-foreground">
                  Ticket #{selectedTicket.id}
                </h2>
                <p className="text-[10px] text-muted font-medium">Category: {selectedTicket.category.toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedTicket.status}
                  disabled={isUpdatingStatus}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="text-xs font-bold rounded-xl border border-border bg-surface px-3 py-1.5 outline-none focus:border-primary transition-all"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                
                <button 
                  onClick={() => setSelectedTicket(null)} 
                  className="p-2 hover:bg-background rounded-full transition-colors"
                >
                  <Plus className="h-5 w-5 rotate-45 text-muted" />
                </button>
              </div>
            </div>

            {/* Scrollable details and chat */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Customer Profile & Info */}
              <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
                <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider">Customer details</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {selectedTicket.user_name?.substring(0,2).toUpperCase() || 'US'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{selectedTicket.user_name}</p>
                      <p className="text-xs text-muted">{selectedTicket.user_phone}</p>
                    </div>
                  </div>
                  <a href={`tel:${selectedTicket.user_phone}`} className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                    Call Customer
                  </a>
                </div>
                {selectedTicket.device_info && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[10px] text-muted/60 font-mono">Device: {selectedTicket.device_info}</p>
                  </div>
                )}
              </div>

              {/* Connected Order context */}
              {selectedTicket.order_id && (
                <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider">Order Context</h3>
                    <a href={`/orders`} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                      View all orders <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-foreground">ID: #{String(selectedTicket.order_id).split('-')[0].toUpperCase()}</p>
                      <p className="text-xs text-muted">Merchant: {selectedTicket.store_name}</p>
                    </div>
                    <p className="text-sm font-black text-foreground font-mont">₹{selectedTicket.total_amount}</p>
                  </div>
                </div>
              )}

              {/* Support Subject message & screenshot */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider">Reported Issue</h3>
                <div className="p-4 rounded-2xl border border-border bg-surface text-sm text-foreground leading-relaxed">
                  {selectedTicket.message}
                </div>
                {selectedTicket.attachment_url && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted">ATTACHED SCREENSHOT:</p>
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-background">
                      <img 
                        src={selectedTicket.attachment_url} 
                        alt="Issue Screenshot" 
                        className="h-full w-full object-contain hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* UPI details for Bad Order refunds */}
              {selectedTicket.category === 'Bad Order' && (selectedTicket.upi_id || selectedTicket.upi_qr_url) && (
                <div className="p-5 rounded-2xl border border-red-500/10 bg-red-500/5 space-y-4">
                  <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                    <AlertCircle size={16} /> Refund routing details
                  </div>
                  
                  {selectedTicket.upi_id && (
                    <div className="flex items-center justify-between rounded-xl bg-surface p-3 border border-border shadow-sm">
                      <div>
                        <p className="text-[9px] font-bold text-muted uppercase tracking-wider">UPI Address</p>
                        <p className="text-sm font-bold text-foreground font-mono mt-0.5">{selectedTicket.upi_id}</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(selectedTicket.upi_id)}
                        className="p-2 hover:bg-background rounded-lg border border-border text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Copy size={13} /> Copy ID
                      </button>
                    </div>
                  )}

                  {selectedTicket.upi_qr_url && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-muted uppercase tracking-wider">UPI QR Screenshot</p>
                      <div className="relative h-48 w-48 mx-auto rounded-xl overflow-hidden border border-border bg-surface p-2 shadow-sm">
                        <img 
                          src={selectedTicket.upi_qr_url} 
                          alt="UPI QR Code" 
                          className="h-full w-full object-contain" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2 leading-relaxed">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>
                      Make sure you have completed verification of incorrect or damaged items before issuing money refund to the client UPI.
                    </span>
                  </div>
                </div>
              )}

              {/* Conversations timeline */}
              <div className="pt-6 border-t border-border space-y-4">
                <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider">Chat timeline</h3>
                
                {loadingReplies ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : replies.length > 0 ? (
                  <div className="space-y-4">
                    {replies.map((reply) => {
                      const isAdmin = reply.sender_type === 'admin';
                      return (
                        <div key={reply.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm border ${
                            isAdmin 
                              ? 'bg-primary text-white border-primary/20 rounded-tr-none' 
                              : 'bg-background text-foreground border-border rounded-tl-none'
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                            <div className="flex justify-between items-center mt-2 gap-4">
                              <span className={`text-[8px] font-bold uppercase ${isAdmin ? 'text-white/60' : 'text-muted/60'}`}>
                                {reply.sender_type}
                              </span>
                              <span className={`text-[8px] font-mono ${isAdmin ? 'text-white/80' : 'text-muted'}`}>
                                {new Date(reply.created_at).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={replyEndRef} />
                  </div>
                ) : (
                  <p className="text-xs text-muted text-center py-6 bg-background rounded-2xl border border-dashed border-border italic">
                    No chat conversations started yet. Type below to send a reply.
                  </p>
                )}
              </div>
            </div>

            {/* Admin chat input box */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-border bg-background/20 flex gap-3 shrink-0 items-center">
              <input
                type="text"
                value={newReply}
                disabled={isSendingReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Type your response reply..."
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground placeholder:text-muted/40"
              />
              <button
                type="submit"
                disabled={!newReply.trim() || isSendingReply}
                className="p-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
              >
                {isSendingReply ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
