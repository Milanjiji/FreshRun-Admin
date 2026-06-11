"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  UserCheck,
  GripVertical,
  LifeBuoy,
  Layers
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Stores", href: "/stores", icon: Store },
  { label: "Store Owners", href: "/store-owners", icon: UserCheck },
  { label: "Delivery Partners", href: "/delivery-partners", icon: Truck },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Products", href: "/products", icon: Package },
  { label: "Categories", href: "/categories", icon: Layers },
  { label: "Support Tickets", href: "/support", icon: LifeBuoy },
  { label: "System Settings", href: "/delivery", icon: Settings },
];

const legalItems = [
  { label: "About Us", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Contact Us", href: "/contact" },
];

const MIN_WIDTH = 80;
const COLLAPSE_THRESHOLD = 160;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 256;

export default function Sidebar() {
  const pathname = usePathname();
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const isCollapsed = width < COLLAPSE_THRESHOLD;

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        let newWidth = mouseMoveEvent.clientX;
        if (newWidth < COLLAPSE_THRESHOLD) {
          // If moving towards collapse, but not quite there, keep it at threshold
          // unless it goes really small, then snap to MIN_WIDTH
          if (newWidth < 120) {
            newWidth = MIN_WIDTH;
          } else {
            newWidth = COLLAPSE_THRESHOLD;
          }
        }
        if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
        setWidth(newWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Sync width to CSS variable for ClientLayoutWrapper to use
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
  }, [width]);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-surface transition-[width] duration-75",
        isResizing ? "select-none" : ""
      )}
      style={{ width: `${width}px` }}
    >
      <div className="flex h-full flex-col px-4 py-6 overflow-hidden">
        {/* Logo Section */}
        <div className={cn(
          "mb-10 flex items-center gap-3 px-2 transition-all",
          isCollapsed ? "justify-center" : ""
        )}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Image 
              src="/logo.png" 
              alt="FreshRush Logo" 
              width={32} 
              height={32} 
              className="object-contain"
            />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-tight text-foreground font-mont whitespace-nowrap">
              Fresh<span className="text-primary">Rush</span>
            </span>
          )}
        </div>

        {/* User Badge */}
        {!isCollapsed ? (
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
        ) : (
          <div className="mb-8 flex justify-center">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-1 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                    : "text-muted hover:bg-background hover:text-primary",
                  isCollapsed ? "justify-center" : "justify-between"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-white" : "text-muted group-hover:text-primary"
                  )} />
                  {!isCollapsed && item.label}
                </div>
                {isActive && !isCollapsed && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Legal Section */}
        {!isCollapsed && (
          <div className="mt-6 pt-6 border-t border-border space-y-4">
             <span className="px-3 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Legal & Info</span>
             <nav className="space-y-0.5">
                {legalItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                      pathname === item.href ? "text-primary bg-primary/5 font-bold" : "text-muted hover:text-primary hover:bg-background"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
             </nav>
          </div>
        )}

        {/* Bottom Section */}
        <div className="mt-auto border-t border-border pt-4">
          <button className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors",
            isCollapsed ? "justify-center" : ""
          )}>
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && "Logout"}
          </button>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={startResizing}
        className={cn(
          "absolute -right-1.5 top-0 flex h-full w-3 cursor-col-resize items-center justify-center transition-opacity hover:opacity-100",
          isResizing ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="h-full w-[1px] bg-border group-hover:bg-primary" />
        <div className="absolute flex h-8 w-3 items-center justify-center rounded-full bg-border text-muted">
          <GripVertical size={10} />
        </div>
      </div>
    </aside>
  );
}
