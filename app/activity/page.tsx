"use client";

import React, { useEffect, useState } from "react";
import { 
  Activity, 
  Search, 
  Filter, 
  Loader2, 
  Smartphone, 
  Globe, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Clock
} from "lucide-react";

interface ActivityLog {
  id: number;
  phone: string;
  ip_address: string;
  device_info: string;
  action_type: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchLogs = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/activity`);
      const data = await response.json();
      if (data.success) {
        setLogs(data.data || []);
        setFilteredLogs(data.data || []);
        setError("");
      } else {
        setError(data.error || "Failed to load activity logs");
      }
    } catch (err) {
      setError("Connection error. Could not reach backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = logs;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.phone.toLowerCase().includes(lowerSearch) ||
        log.ip_address.toLowerCase().includes(lowerSearch) ||
        (log.device_info && log.device_info.toLowerCase().includes(lowerSearch)) ||
        (log.error_message && log.error_message.toLowerCase().includes(lowerSearch))
      );
    }

    if (actionFilter !== "all") {
      result = result.filter(log => log.action_type === actionFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter(log => log.status === statusFilter);
    }

    setFilteredLogs(result);
  }, [searchTerm, actionFilter, statusFilter, logs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'otp_requested':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'otp_verified':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20';
      case 'login_firebase':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
      case 'otp_failed_code':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'otp_failed_expired':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
    }
  };

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Compute stats from active logs list
  const totalAttempts = logs.length;
  const successCount = logs.filter(l => l.status === 'success').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;
  const otpRequestedCount = logs.filter(l => l.action_type === 'otp_requested').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-mont flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Activity Log
          </h1>
          <p className="text-muted mt-1">Track login attempts, OTP verifications, and client device details in real time.</p>
        </div>
        
        <button
          onClick={() => fetchLogs(true)}
          disabled={refreshing || loading}
          className="self-start bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? "Refreshing..." : "Refresh Logs"}
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Total Events logged</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{totalAttempts}</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Successful Actions</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{successCount}</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="p-4 bg-red-500/10 rounded-2xl text-red-500">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Failed Attempts</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-0.5">{failedCount}</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-3xl flex items-center gap-5 shadow-sm">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">OTPs Requested</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{otpRequestedCount}</p>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input 
            type="text"
            placeholder="Search phone number, IP or device..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-background border border-border px-4 py-3 rounded-2xl outline-none focus:border-primary text-sm font-semibold text-foreground transition-all"
            >
              <option value="all">All Actions</option>
              <option value="otp_requested">OTP Requested</option>
              <option value="otp_verified">OTP Verified</option>
              <option value="login_firebase">Firebase Login</option>
              <option value="otp_failed_code">Incorrect Code</option>
              <option value="otp_failed_expired">Expired OTP</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border px-4 py-3 rounded-2xl outline-none focus:border-primary text-sm font-semibold text-foreground transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-surface border border-border rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted font-semibold text-sm">Loading activity logs...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="text-red-600 dark:text-red-400 font-bold text-lg">Error loading data</p>
            <p className="text-muted max-w-md text-sm">{error}</p>
            <button 
              onClick={() => fetchLogs(false)} 
              className="mt-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <Activity className="h-12 w-12 text-muted/60" />
            <p className="text-foreground font-bold text-lg">No logs found</p>
            <p className="text-muted text-sm max-w-sm">No login attempts or OTP actions fit your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Time</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">Device</th>
                  <th className="py-4 px-6">IP Address</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Details / Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-background/40 transition-colors text-sm text-foreground"
                  >
                    <td className="py-4 px-6 whitespace-nowrap font-medium text-muted">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-4 px-6 font-bold tracking-wide">
                      {log.phone}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getActionBadgeColor(log.action_type)}`}>
                        {formatActionName(log.action_type)}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 shrink-0 text-muted" />
                        <span className="font-medium text-foreground">{log.device_info}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted shrink-0" />
                        <span>{log.ip_address}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          <CheckCircle className="h-4 w-4" /> Success
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold text-xs">
                          <XCircle className="h-4 w-4" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-muted max-w-sm truncate">
                      {log.error_message || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
