import React from "react";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page Title Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mont">Dashboard</h1>
          <p className="text-sm text-muted">Welcome back, here's what's happening with FreshRush today.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 rounded-xl bg-surface border border-primary text-primary px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-primary/5 transition-all">
            <Plus className="h-4 w-4" />
            List New Store
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-primary/40 hover:bg-primary-dark transition-all">
            <Plus className="h-4 w-4" />
            List New Product
          </button>
        </div>
      </div>

      {/* Main Banner (Reference Style) */}
      <div className="relative overflow-hidden rounded-2xl bg-primary/10 p-8">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-xl font-bold text-primary-dark mb-2">Power your business with FreshRush Admin</h2>
          <p className="text-sm text-primary/80 mb-6 leading-relaxed">
            Manage your restaurants, delivery partners, and orders in one unified platform. 
            Track real-time performance and grow your business efficiently.
          </p>
          <button className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-dark shadow-md shadow-primary/20 transition-all">
            Take a Tour →
          </button>
        </div>
        {/* Decorative elements could go here */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-20">
          <ShoppingBag size={120} className="text-secondary" />
        </div>
      </div>

      {/* Stat Cards Grid (The "Boxes" in content area) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Sales" 
          value="₹1,24,500" 
          trend="+12.5%" 
          isUp={true} 
          icon={TrendingUp} 
        />
        <StatCard 
          title="New Orders" 
          value="456" 
          trend="+8.2%" 
          isUp={true} 
          icon={ShoppingBag} 
        />
        <StatCard 
          title="Active Users" 
          value="2,840" 
          trend="-2.4%" 
          isUp={false} 
          icon={Users} 
        />
        <StatCard 
          title="Deliveries" 
          value="182" 
          trend="+15.0%" 
          isUp={true} 
          icon={Truck} 
        />
      </div>

      {/* Secondary Grid Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-[400px] rounded-2xl bg-surface border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-foreground">Sales Analytics</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-background rounded-lg text-xs font-medium text-muted">Weekly</span>
              <span className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-medium">Monthly</span>
            </div>
          </div>
          <div className="w-full h-full flex items-center justify-center text-muted italic">
            Chart Visualization Area
          </div>
        </div>
        
        <div className="h-[400px] rounded-2xl bg-surface border border-border p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-6">Recent Activities</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-background flex items-center justify-center">
                  <Users size={18} className="text-muted" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">New User Registered</p>
                  <p className="text-xs text-muted">A few minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, isUp, icon: Icon }: any) {
  return (
    <div className="rounded-2xl bg-surface p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="rounded-xl p-2.5 bg-primary/10 text-primary">
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-bold ${isUp ? "text-primary" : "text-red-500"}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted">{title}</p>
        <h4 className="text-2xl font-bold text-foreground mt-1">{value}</h4>
      </div>
    </div>
  );
}
