"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import io from "socket.io-client";

export interface Notification {
  id: string;
  type: "order" | "registration" | "delivery";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  toasts: Notification[];
  unreadCount: number;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeToast: (id: string) => void;
  socket: any;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const socketRef = useRef<any>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("admin_notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("admin_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    socketRef.current = io(baseUrl);

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("[NotificationContext] Connected to socket");
      socket.emit("join_room", "admin");
    });

    const addNotification = (notif: Omit<Notification, "isRead">) => {
      const fullNotif = { ...notif, isRead: false };
      setNotifications(prev => [
        fullNotif,
        ...prev.slice(0, 49) // Keep last 50
      ]);
      
      // Add to toast list
      setToasts(prev => [...prev, fullNotif]);
    };

    socket.on("new_order", (order: any) => {
      addNotification({
        id: `order-${order.id}-${Date.now()}`,
        type: "order",
        title: "New Order Received",
        message: `Order #${order.id.split('-')[0].toUpperCase()} from ${order.user_name || 'Guest'} for ₹${order.total_amount}`,
        timestamp: new Date().toISOString(),
        data: order
      });
    });

    socket.on("new_registration", (reg: any) => {
      const roleName = reg.role === 'delivery' ? 'Delivery Partner' : 
                       reg.role === 'owner' ? 'Store Owner' : 'Customer';
      addNotification({
        id: `reg-${reg.id}-${Date.now()}`,
        type: "registration",
        title: `New ${roleName}`,
        message: `${reg.fullName || 'A new user'} (${reg.phone}) has joined the platform.`,
        timestamp: reg.timestamp || new Date().toISOString(),
        data: reg
      });
    });

    socket.on("order_delivered", (data: any) => {
      addNotification({
        id: `delivery-${data.id}-${Date.now()}`,
        type: "delivery",
        title: "Order Delivered 🎁",
        message: `Order #${data.id.split('-')[0].toUpperCase()} has been successfully delivered to ${data.userName || 'Customer'}.`,
        timestamp: data.timestamp || new Date().toISOString(),
        data: data
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      toasts,
      unreadCount,
      isSidebarOpen,
      setSidebarOpen,
      markAsRead,
      markAllAsRead,
      clearAll,
      removeToast,
      socket: socketRef.current
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
