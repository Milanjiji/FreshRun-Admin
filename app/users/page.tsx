"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Loader2, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Activity,
  Plus
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
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/user/all`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setFilteredUsers(data.data);
      } else {
        setError(data.error || "Failed to load users");
      }
    } catch (err) {
      setError("Connection error. Could not reach backend.");
    } finally {
      setLoading(false);
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
        (u.id.toLowerCase().includes(lowerSearch))
      );
    }

    if (roleFilter !== "all") {
      result = result.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="relative min-h-screen">
      <div className="flex gap-8">
        <div className={`flex-1 space-y-8 transition-all ${selectedUser ? 'max-w-[65%]' : 'w-full'}`}>
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont">Users</h1>
              <p className="text-sm text-muted">Manage your customers, admins and delivery partners.</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 border border-border shadow-sm">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-4 py-2 border border-border focus-within:border-primary transition-all">
              <Search className="h-4 w-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search by name, phone or email..." 
                className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted" />
              <select 
                className="bg-transparent text-sm font-medium text-muted outline-none cursor-pointer"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">Customers</option>
                <option value="admin">Admins</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>

          {/* Users Content Area */}
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-border bg-white/50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted font-medium">Loading users...</p>
              </div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">User Details</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Contact Info</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Role</th>
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
                            <p className="font-bold text-foreground font-mont">{user.fullName || 'Unnamed User'}</p>
                            <p className="text-[10px] text-muted font-mono uppercase truncate w-32">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Phone size={12} className="text-muted" />
                            <span>{user.phone}</span>
                          </div>
                          {user.email && (
                            <div className="flex items-center gap-2 text-xs">
                              <Mail size={12} className="text-muted" />
                              <span className="truncate w-32">{user.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium capitalize ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                          user.role === 'delivery' ? 'bg-blue-100 text-blue-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-muted text-xs">
                          <Calendar size={14} className="text-primary/60" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-primary' : 'bg-muted'}`} />
                          <span className={`text-xs font-bold ${user.isActive ? 'text-primary' : 'text-muted'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-white/50 p-12 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-bold text-foreground font-mont">No Users Found</h3>
              <p className="mt-2 max-w-xs text-sm text-muted">
                {error || "We couldn't find any users matching your search."}
              </p>
            </div>
          )}
        </div>

        {/* Details Sidebar */}
        {selectedUser && (
          <div className="w-[35%] bg-white rounded-3xl border border-border shadow-xl p-6 h-fit sticky top-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-mont">User Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-background rounded-full transition-colors">
                <Plus className="h-5 w-5 rotate-45 text-muted" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center p-6 rounded-2xl bg-background border border-border">
                <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
                  <User size={40} />
                </div>
                <h3 className="text-xl font-bold font-mont text-center">{selectedUser.fullName || 'Unnamed User'}</h3>
                <p className="text-xs text-muted font-mono uppercase mt-1">{selectedUser.id}</p>
                <div className="mt-4 flex gap-2">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      selectedUser.role === 'delivery' ? 'bg-blue-100 text-blue-700' : 
                      'bg-green-100 text-green-700'
                   }`}>
                      {selectedUser.role}
                   </span>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedUser.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted'
                   }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                   </span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Contact Details</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                    <div className="p-2 rounded-lg bg-white border border-border">
                      <Phone size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase">Phone Number</p>
                      <p className="text-sm font-medium">{selectedUser.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                    <div className="p-2 rounded-lg bg-white border border-border">
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
                <h4 className="text-sm font-bold font-mont uppercase tracking-widest text-muted border-b border-border pb-2">Address Information</h4>
                <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                  <div className="flex gap-2">
                    <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">
                        {selectedUser.houseNumber ? `${selectedUser.houseNumber}, ` : ''}
                        {selectedUser.addressLine || 'Address not complete'}
                      </p>
                      <p className="text-muted text-xs mt-1">
                        {selectedUser.landmark ? `Landmark: ${selectedUser.landmark}, ` : ''}
                        {selectedUser.city ? `${selectedUser.city}, ` : ''}
                        {selectedUser.pincode ? `PIN: ${selectedUser.pincode}` : ''}
                      </p>
                    </div>
                  </div>
                  {selectedUser.deliveryMessage && (
                    <div className="p-2 rounded-lg bg-white border border-border italic text-xs text-muted">
                      "{selectedUser.deliveryMessage}"
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-3">
                 <div className="p-3 rounded-xl border border-border bg-background">
                    <p className="text-[10px] font-bold text-muted uppercase">Joined On</p>
                    <p className="text-xs font-bold mt-1">{formatDate(selectedUser.createdAt)}</p>
                 </div>
                 <div className="p-3 rounded-xl border border-border bg-background">
                    <p className="text-[10px] font-bold text-muted uppercase">Profile Status</p>
                    <div className="flex items-center gap-1.5 mt-1">
                       {selectedUser.isProfileComplete ? (
                          <>
                             <ShieldCheck size={14} className="text-primary" />
                             <span className="text-xs font-bold text-primary">Complete</span>
                          </>
                       ) : (
                          <>
                             <Activity size={14} className="text-amber-500" />
                             <span className="text-xs font-bold text-amber-500">Incomplete</span>
                          </>
                       )}
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
