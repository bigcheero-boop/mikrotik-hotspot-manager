import React, { useEffect, useState } from 'react';
import { Router, Users, Ticket, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { StatCard } from './StatCard';
import { Card, CardHeader } from './Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiRequest } from '../../utils/api';

interface DashboardStats {
  totalRouters: number;
  activeRouters: number;
  totalUsers: number;
  activeUsers: number;
  totalVouchers: number;
  usedVouchers: number;
  unusedVouchers: number;
}

interface TrafficData {
  date: string;
  upload: number;
  download: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRouters: 0,
    activeRouters: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalVouchers: 0,
    usedVouchers: 0,
    unusedVouchers: 0,
  });
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, trafficResponse] = await Promise.all([
        apiRequest('/analytics/dashboard'),
        apiRequest('/analytics/traffic'),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      if (trafficResponse.success) {
        setTrafficData(trafficResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your SKYNITY hotspot network</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Routers"
          value={stats.totalRouters}
          icon={Router}
          color="primary"
          trend={`${stats.activeRouters} active`}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Users}
          color="secondary"
          trend={`${stats.totalUsers} total users`}
        />
        <StatCard
          title="Available Vouchers"
          value={stats.unusedVouchers}
          icon={Ticket}
          color="accent"
          trend={`${stats.usedVouchers} used`}
        />
        <StatCard
          title="Network Status"
          value="Healthy"
          icon={Activity}
          color="secondary"
          trend="All systems operational"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <Card gradient>
          <CardHeader title="Network Traffic (Last 7 Days)" subtitle="Upload and Download (MB)" />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12141a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="upload" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Upload"
              />
              <Line 
                type="monotone" 
                dataKey="download" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Download"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Router Status */}
        <Card gradient>
          <CardHeader title="Router Distribution" subtitle="Online vs Offline routers" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Online', value: stats.activeRouters, fill: '#10B981' },
                { name: 'Offline', value: stats.totalRouters - stats.activeRouters, fill: '#ef4444' },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12141a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader title="Quick Statistics" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Voucher Usage</p>
              <p className="text-2xl font-bold">
                {stats.totalVouchers > 0 
                  ? Math.round((stats.usedVouchers / stats.totalVouchers) * 100)
                  : 0}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Activity className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Router className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Router Uptime</p>
              <p className="text-2xl font-bold">
                {stats.totalRouters > 0 
                  ? Math.round((stats.activeRouters / stats.totalRouters) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
