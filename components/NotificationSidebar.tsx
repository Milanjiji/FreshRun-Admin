"use client";

import React from "react";
import { 
  X, 
  ShoppingBag, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  CheckCheck 
} from "lucide-react";
import { useNotifications, Notification } from "@/context/NotificationContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function NotificationSidebar() {
  const { 
    notifications, 
    isSidebarOpen, 
    setSidebarOpen, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order": return <ShoppingBag size={18} className="text-blue-500" />;
      case "registration": return <UserPlus size={18} className="text-amber-500" />;
      case "delivery": return <CheckCircle2 size={18} className="text-primary" />;
      default: return <Clock size={18} className="text-muted" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px]" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={cn(
          "fixed right-0 top-0 z-[70] h-screen w-96 border-l border-border bg-surface shadow-2xl transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h2 className="text-lg font-bold font-mont">Notifications</h2>
              <p className="text-xs text-muted">Stay updated with platform activity</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="rounded-full p-2 hover:bg-background transition-colors"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>

          {/* Actions Row */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 bg-background/50 border-b border-border">
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary-dark transition-colors"
              >
                <CheckCheck size={12} />
                Mark all as read
              </button>
              <button 
                onClick={clearAll}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={12} />
                Clear all
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              <div className="divide-y divide-border">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onMouseEnter={() => !notif.isRead && markAsRead(notif.id)}
                    className={cn(
                      "group relative p-6 transition-colors hover:bg-background/80 cursor-default",
                      !notif.isRead ? "bg-primary/5" : ""
                    )}
                  >
                    <div className="flex gap-4">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface border border-border shadow-sm">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={cn(
                            "text-sm font-bold font-mont",
                            !notif.isRead ? "text-foreground" : "text-muted"
                          )}>
                            {notif.title}
                          </h3>
                          <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                            {formatTime(notif.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                    
                    {!notif.isRead && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-6 text-primary">
                  <Clock size={32} />
                </div>
                <h3 className="text-sm font-bold text-foreground font-mont">No Notifications</h3>
                <p className="mt-2 text-xs text-muted leading-relaxed">
                  We'll notify you when new orders arrive or users join the platform.
                </p>
              </div>
            )}
          </div>

          {/* Footer (Optional) */}
          <div className="border-t border-border p-6 bg-background/30">
            <p className="text-[10px] text-center text-muted font-medium uppercase tracking-[0.2em]">
              Real-time feed active
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
