import React from 'react';
import {
  LayoutDashboard,
  Router,
  Users,
  Ticket,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  Wifi,
  Clock,
  FileCode,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'hotspot', icon: Wifi, label: 'Hotspot' },
  { id: 'routers', icon: Router, label: 'Routers' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'vouchers', icon: Ticket, label: 'Vouchers' },
  { id: 'sessions', icon: Clock, label: 'Session Settings' },
  { id: 'template', icon: FileCode, label: 'Template Editor' },
  { id: 'reports', icon: FileText, label: 'Reports' },
  { id: 'wireguard', icon: Shield, label: 'WireGuard' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ activeView, onViewChange, onLogout }: SidebarProps) {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">SKYNITY</h1>
            <p className="text-xs text-muted-foreground">Hotspot Manager</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                ${isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground
            hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </div>
  );
}
