"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Loader2, 
  User, 
  MapPin, 
  CheckCircle, 
  Box, 
  Truck, 
  Plus,
  IndianRupee,
  Calendar
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";

interface OrderData {
  id: string;
  user_id: string;
  store_id: string;
  items: any[];
  subtotal: string;
  handling_fee: string;
  delivery_fee: string;
  late_night_fee: string;
  delivery_tip: string;
  total_amount: string;
  delivery_address: any;
  status: string;
  is_completed: boolean;
  delivery_boy_opted: boolean;
  is_packed: boolean;
  is_given_to_delivery_boy: boolean;
  created_at: string;
  user_name?: string;
  user_phone?: string;
  store_name?: string;
  store_lat?: string;
  store_lng?: string;
  rainy_surge_fee?: string;
  payment_mode?: string;
  delivery_partner_id?: string;
  delivery_partner_name?: string;
  delivery_partner_phone?: string;
  delivery_status?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [localOrderState, setLocalOrderState] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformCommission, setPlatformCommission] = useState(10);
  const { socket } = useNotifications();

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/settings`);
        const data = await response.json();
        if (data.success && data.data?.platform_commission !== undefined) {
          setPlatformCommission(parseFloat(data.data.platform_commission));
        }
      } catch (err) {
        console.error("Failed to load platform commission rate", err);
      }
    };
    fetchCommission();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onNewOrder = (newOrder: OrderData) => {
      console.log("[OrdersPage] New order received:", newOrder.id);
      setOrders(prev => [newOrder, ...prev]);
    };

    const onStatusChanged = (updatedOrder: OrderData) => {
      console.log("[OrdersPage] Order status changed:", updatedOrder.id, updatedOrder.status);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      if (selectedOrder?.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      }
    };

    socket.on("new_order", onNewOrder);
    socket.on("order_status_changed", onStatusChanged);

    return () => {
      socket.off("new_order", onNewOrder);
      socket.off("order_status_changed", onStatusChanged);
    };
  }, [socket, selectedOrder?.id]);

  useEffect(() => {
    if (selectedOrder) {
      setLocalOrderState({
         status: selectedOrder.status === 'pending' ? 'confirmed' : selectedOrder.status,
         is_packed: selectedOrder.is_packed,
         delivery_boy_opted: selectedOrder.delivery_boy_opted,
         is_given_to_delivery_boy: selectedOrder.is_given_to_delivery_boy,
         is_completed: selectedOrder.is_completed,
      });
    } else {
      setLocalOrderState(null);
    }
  }, [selectedOrder]);

  const handleLocalChange = (updates: any) => {
    setLocalOrderState((prev: any) => ({ ...prev, ...updates }));
  };

  const handleSaveState = () => {
    if (selectedOrder && localOrderState) {
       updateOrderStatus(selectedOrder.id, localOrderState);
    }
  };

  const fetchOrders = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/orders`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      } else {
        setError(data.error || "Failed to load orders");
      }
    } catch (err) {
      setError("Connection error. Could not reach backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(o => 
        (o.id.toLowerCase().includes(lowerSearch)) ||
        (o.user_name?.toLowerCase().includes(lowerSearch)) ||
        (o.user_phone?.includes(lowerSearch))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(o => o.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateOrderStatus = async (id: string, updates: any) => {
    setSaving(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, ...data.order });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="flex gap-8">
        <div className={`flex-1 space-y-8 transition-all ${selectedOrder ? 'max-w-[65%]' : 'w-full'}`}>
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont">Orders</h1>
              <p className="text-sm text-muted">Manage incoming orders and delivery status.</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex items-center gap-4 rounded-2xl bg-surface p-4 border border-border shadow-sm">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-4 py-2 border border-border focus-within:border-primary transition-all">
              <Search className="h-4 w-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search by Order ID or Customer..." 
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
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="packed">Packed</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Orders Content Area */}
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-border bg-surface/50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted font-medium">Loading orders...</p>
              </div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Order ID & Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-background/50 transition-colors group cursor-pointer ${selectedOrder?.id === order.id ? 'bg-primary/5' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-sm font-bold">#{order.id.split('-')[0].toUpperCase()}</span>
                          <div className="flex items-center gap-1.5 text-muted text-xs">
                            <Calendar size={12} />
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                           <p className="font-bold text-foreground">{order.user_name || 'Guest'}</p>
                           <p className="text-xs text-muted">{order.user_phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center text-sm font-bold text-foreground">
                            <IndianRupee size={14} className="mr-1" />
                            {parseFloat(order.total_amount).toFixed(2)}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium capitalize ${
                          order.status === 'delivered' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 
                          order.status === 'cancelled' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 
                          order.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                          'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>
                          {order.status.replace('_', ' ')}
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
                <ShoppingBag size={40} />
              </div>
              <h3 className="text-xl font-bold text-foreground font-mont">No Orders Found</h3>
              <p className="mt-2 max-w-xs text-sm text-muted">
                {error || "We couldn't find any orders matching your search."}
              </p>
            </div>
          )}
        </div>

        {/* Details Sidebar */}
        {selectedOrder && (
          <div className="w-[35%] bg-surface rounded-3xl border border-border shadow-xl p-6 h-fit sticky top-8 overflow-y-auto max-h-[90vh] animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-mont">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-background rounded-full transition-colors">
                <Plus className="h-5 w-5 rotate-45 text-muted" />
              </button>
            </div>
            
            <div className="space-y-6">
               {/* Summary Header */}
               <div className="p-4 rounded-xl bg-background border border-border">
                  <div className="flex justify-between items-center mb-2">
                     <span className="font-mono font-bold text-sm">#{selectedOrder.id.split('-')[0].toUpperCase()}</span>
                     <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium capitalize ${
                       selectedOrder.status === 'delivered' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 
                       selectedOrder.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                       'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                     }`}>
                       {selectedOrder.status.replace('_', ' ')}
                     </span>
                  </div>
                  <p className="text-xs text-muted mb-4">{formatDate(selectedOrder.created_at)}</p>
                  
                  {/* Status Toggles */}
                  {localOrderState && (
                    <div className="space-y-3">
                       <h4 className="text-xs font-bold uppercase text-muted tracking-wider">Manage Order</h4>
                       <div className="flex items-center justify-between p-2 bg-surface rounded-lg border border-border">
                          <span className="text-sm font-medium">Confirmed</span>
                          <input 
                            type="checkbox" 
                            checked={localOrderState.status !== 'pending' && localOrderState.status !== 'declined'} 
                            onChange={(e) => handleLocalChange({ status: e.target.checked ? 'confirmed' : 'pending' })}
                            className="w-4 h-4 text-primary"
                          />
                       </div>
                       <div className="flex items-center justify-between p-2 bg-surface rounded-lg border border-border">
                          <span className="text-sm font-medium">Order Packed</span>
                          <input 
                            type="checkbox" 
                            checked={localOrderState.is_packed} 
                            onChange={(e) => handleLocalChange({ is_packed: e.target.checked, status: e.target.checked ? 'packed' : 'confirmed' })}
                            className="w-4 h-4 text-primary"
                          />
                       </div>
                       <div className="flex items-center justify-between p-2 bg-surface rounded-lg border border-border">
                          <span className="text-sm font-medium">Delivery Boy Opted</span>
                          <input 
                            type="checkbox" 
                            checked={localOrderState.delivery_boy_opted} 
                            onChange={(e) => handleLocalChange({ delivery_boy_opted: e.target.checked })}
                            className="w-4 h-4 text-primary"
                          />
                       </div>
                       <div className="flex items-center justify-between p-2 bg-surface rounded-lg border border-border">
                          <span className="text-sm font-medium">Handed to Rider</span>
                          <input 
                            type="checkbox" 
                            checked={localOrderState.is_given_to_delivery_boy} 
                            onChange={(e) => handleLocalChange({ 
                              is_given_to_delivery_boy: e.target.checked, 
                              status: e.target.checked ? 'out_for_delivery' : 'packed' 
                            })}
                            className="w-4 h-4 text-primary"
                          />
                       </div>
                       <div className="flex items-center justify-between p-2 bg-surface rounded-lg border border-border">
                          <span className="text-sm font-medium">Completed / Delivered</span>
                          <input 
                            type="checkbox" 
                            checked={localOrderState.is_completed} 
                            onChange={(e) => handleLocalChange({ 
                              is_completed: e.target.checked, 
                              status: e.target.checked ? 'delivered' : (localOrderState.is_given_to_delivery_boy ? 'out_for_delivery' : (localOrderState.delivery_boy_opted ? 'confirmed' : 'packed')) 
                            })}
                            className="w-4 h-4 text-primary"
                          />
                       </div>

                       <button 
                          onClick={handleSaveState}
                          disabled={saving}
                          className="w-full mt-2 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                       >
                          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                          Save State
                       </button>
                       
                       <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, { status: 'declined', is_completed: false })}
                          disabled={saving}
                          className="w-full mt-2 py-2 bg-red-500/10 text-red-500 font-bold rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                       >
                          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                          Decline Order
                       </button>
                    </div>
                  )}
               </div>

               {/* Items */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Items</h4>
                  <div className="space-y-2">
                     {selectedOrder.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 rounded-lg bg-background">
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">{item.quantity}x</span>
                              <span>{item.name}</span>
                           </div>
                           <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                     ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Financial Breakdown</h4>
                  <div className="p-4 rounded-xl bg-background border border-border space-y-2 text-xs">
                     <div className="flex justify-between">
                        <span className="text-muted">Item Subtotal (Order Amount):</span>
                        <span className="font-semibold text-foreground">₹{parseFloat(selectedOrder.subtotal || "0").toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-red-500">
                        <span className="text-red-500/80">Platform Commission ({platformCommission}%):</span>
                        <span className="font-semibold">-₹{(parseFloat(selectedOrder.subtotal || "0") * (platformCommission / 100)).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-green-600 dark:text-green-400 font-bold">
                        <span className="text-green-600 dark:text-green-400">Store Share Earnings:</span>
                        <span>₹{(parseFloat(selectedOrder.subtotal || "0") * (1 - (platformCommission / 100))).toFixed(2)}</span>
                     </div>
                     
                     <div className="h-[1px] bg-border my-2" />
                     
                     <div className="flex justify-between">
                        <span className="text-muted">Delivery Fee:</span>
                        <span className="font-medium">₹{parseFloat(selectedOrder.delivery_fee || "0").toFixed(2)}</span>
                     </div>
                     {parseFloat((selectedOrder as any).extra_store_charge || "0") > 0 && (
                        <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-medium">
                           <span>Extra Store Charge:</span>
                           <span>₹{parseFloat((selectedOrder as any).extra_store_charge).toFixed(2)}</span>
                        </div>
                     )}
                     {parseFloat(selectedOrder.handling_fee || "0") > 0 && (
                        <div className="flex justify-between">
                           <span className="text-muted">Handling Fee:</span>
                           <span className="font-medium">₹{parseFloat(selectedOrder.handling_fee || "0").toFixed(2)}</span>
                        </div>
                     )}
                     {parseFloat(selectedOrder.late_night_fee || "0") > 0 && (
                        <div className="flex justify-between">
                           <span className="text-muted">Late Night Fee:</span>
                           <span className="font-medium">₹{parseFloat(selectedOrder.late_night_fee || "0").toFixed(2)}</span>
                        </div>
                     )}
                     {selectedOrder.rainy_surge_fee && parseFloat(selectedOrder.rainy_surge_fee) > 0 && (
                        <div className="flex justify-between">
                           <span className="text-muted">Rainy Surge Fee:</span>
                           <span className="font-medium">₹{parseFloat(selectedOrder.rainy_surge_fee).toFixed(2)}</span>
                        </div>
                     )}
                     {parseFloat(selectedOrder.delivery_tip || "0") > 0 && (
                        <div className="flex justify-between">
                           <span className="text-muted">Delivery Rider Tip:</span>
                           <span className="font-medium">₹{parseFloat(selectedOrder.delivery_tip || "0").toFixed(2)}</span>
                        </div>
                     )}
                     
                     <div className="h-[1px] bg-border my-2" />
                     
                     <div className="flex justify-between text-sm font-bold text-foreground">
                        <span>Total Paid by Customer:</span>
                        <span>₹{parseFloat(selectedOrder.total_amount || "0").toFixed(2)}</span>
                     </div>
                     
                     <div className="flex justify-between text-[10px] mt-2 pt-1.5 border-t border-border/40 font-medium">
                        <span className="text-muted/60">Payment Mode:</span>
                        <span className="uppercase text-foreground font-semibold">{selectedOrder.payment_mode || 'COD'}</span>
                     </div>
                  </div>
                </div>

               {/* Store Details */}
               <div className="space-y-3">
                 <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Store Info</h4>
                  <div className="flex gap-2 p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                     <ShoppingBag size={16} className="text-amber-600 dark:text-amber-400 mt-1" />
                     <div>
                        <p className="font-bold text-sm text-amber-800 dark:text-amber-300">{selectedOrder.store_name || 'Generic Store'}</p>
                        <p className="text-[10px] font-mono text-amber-700 dark:text-amber-400 mt-0.5">ID: {selectedOrder.store_id}</p>
                        {(selectedOrder.store_lat && selectedOrder.store_lng) && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1">Location: {selectedOrder.store_lat}, {selectedOrder.store_lng}</p>
                        )}
                     </div>
                  </div>
               </div>

               {/* Delivery Partner Details */}
               <div className="space-y-3">
                 <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Delivery Partner</h4>
                 {selectedOrder.delivery_partner_id ? (
                    <div className="flex gap-2 p-3 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
                       <Truck size={16} className="text-blue-600 dark:text-blue-400 mt-1" />
                       <div className="space-y-1">
                          <p className="font-bold text-sm text-blue-800 dark:text-blue-300">{selectedOrder.delivery_partner_name || 'Assigned Rider'}</p>
                          {selectedOrder.delivery_partner_phone && (
                            <p className="text-xs text-muted">
                               Phone: <span className="font-semibold text-foreground">{selectedOrder.delivery_partner_phone}</span>
                            </p>
                          )}
                          {selectedOrder.delivery_status && (
                            <p className="text-xs text-muted capitalize">
                               Status: <span className="font-semibold text-foreground">{selectedOrder.delivery_status.replace('_', ' ')}</span>
                            </p>
                          )}
                          <p className="text-[10px] font-mono text-blue-700 dark:text-blue-400">ID: {selectedOrder.delivery_partner_id}</p>
                       </div>
                    </div>
                 ) : (
                    <div className="flex gap-2 p-3 rounded-xl bg-gray-500/5 dark:bg-gray-500/10 border border-gray-500/20">
                       <Truck size={16} className="text-gray-500 mt-1" />
                       <div>
                          <p className="font-bold text-sm text-gray-500">Not Assigned Yet</p>
                          <p className="text-xs text-muted mt-0.5">No delivery partner is currently assigned to this order.</p>
                       </div>
                    </div>
                 )}
               </div>

              {/* Delivery Address */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Delivery Address</h4>
                <div className="flex gap-2 p-3 rounded-xl bg-background border border-border">
                   <MapPin size={16} className="text-primary mt-1" />
                   <div>
                      <p className="font-bold text-sm">{selectedOrder.user_name}</p>
                      <p className="text-xs text-muted mt-1">{selectedOrder.delivery_address?.line1 || 'Address not provided'}</p>
                   </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
