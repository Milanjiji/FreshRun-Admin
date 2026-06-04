"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ToastContainer from "@/components/ToastContainer";
import { NotificationProvider, useNotifications } from "@/context/NotificationContext";

const publicRoutes = ["/privacy", "/terms", "/refund", "/shipping", "/contact", "/about"];

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useNotifications();

  return (
    <>
      <Sidebar />
      <div 
        className="flex min-h-screen flex-col transition-[margin-left] duration-75"
        style={{ marginLeft: "var(--sidebar-width, 256px)" }}
      >
        <Header />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = publicRoutes.includes(pathname);

  if (isPublic) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-background">
        <main className="w-full max-w-4xl p-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </NotificationProvider>
  );
}
