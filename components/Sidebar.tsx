"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Truck, 
  Settings, 
  ChevronRight,
  LogOut,
  Store,
  UserCheck
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Stores", href: "/stores", icon: Store },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Users", href: "/users", icon: Users },
  { label: "Delivery Partners", href: "/delivery-partners", icon: UserCheck },
  { label: "Products", href: "/products", icon: Package },
  { label: "Delivery Settings", href: "/delivery", icon: Truck },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-surface transition-transform">
      <div className="flex h-full flex-col px-4 py-6">
        {/* Logo Section */}
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Image 
              src="/logo.png" 
              alt="FreshRun Logo" 
              width={32} 
              height={32} 
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-mont">
            Fresh<span className="text-primary">Run</span>
          </span>
        </div>

        {/* User Badge (from reference image style) */}
        <div className="mb-8 flex items-center justify-between rounded-xl bg-background p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">Admin User</span>
              <span className="text-[10px] text-muted">Super Admin</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                    : "text-muted hover:bg-background hover:text-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-muted group-hover:text-primary"
                  )} />
                  {item.label}
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto border-t border-border pt-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
