"use client";

import React, { useEffect, useState } from "react";
import { X, ShoppingBag, UserPlus, CheckCircle2, Info } from "lucide-react";
import { Notification } from "@/context/NotificationContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const Toast = ({ notification, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order": return <ShoppingBag size={18} className="text-blue-500" />;
      case "registration": return <UserPlus size={18} className="text-amber-500" />;
      case "delivery": return <CheckCircle2 size={18} className="text-primary" />;
      default: return <Info size={18} className="text-muted" />;
    }
  };

  return (
    <div className="animate-in slide-in-from-right fade-in duration-300 pointer-events-auto">
      <div className="w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex p-4 gap-3">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 shadow-sm">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mont text-foreground leading-none">
                {notification.title}
              </h3>
              <button 
                onClick={() => onClose(notification.id)}
                className="rounded-full p-1 hover:bg-background transition-colors -mr-1"
              >
                <X size={14} className="text-muted" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted leading-relaxed line-clamp-2">
              {notification.message}
            </p>
          </div>
        </div>
        <div className="h-1 bg-primary/10 w-full overflow-hidden">
           <div className="h-full bg-primary animate-progress-shrink origin-left" />
        </div>
      </div>
    </div>
  );
};

export default function ToastContainer({ 
  toasts, 
  removeToast 
}: { 
  toasts: Notification[], 
  removeToast: (id: string) => void 
}) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} notification={toast} onClose={removeToast} />
      ))}
    </div>
  );
}
