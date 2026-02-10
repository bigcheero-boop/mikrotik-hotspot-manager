import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from './Card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiRequest } from '../../utils/api';
import { TrendingUp, Users, Router, Ticket } from 'lucide-react';

interface TrafficData {
  date: string;
  upload: number;
  download: number;
}

export function Analytics() {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiRequest('/analytics/traffic');
      if (response.success) {
        setTrafficData(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: '1 Hour', value: 400, color: '#8B5CF6' },
    { name: '1 Day', value: 300, color: '#3B82F6' },
    { name: '1 Week', value: 200, color: '#10B981' },
    { name: '1 Month', value: 100, color: '#f59e0b' },
  ];

  const usageData = [
    { hour: '00:00', users: 12 },
    { hour: '04:00', users: 5 },
    { hour: '08:00', users: 28 },
    { hour: '12:00', users: 45 },
    { hour: '16:00', users: 52 },
    { hour: '20:00', users: 38 },
    { hour: '23:00', users: 22 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h1>
        <p className="text-muted-foreground">Detailed insights into your network performance</p>
      </div>

      {/* Traffic Overview */}
      <Card gradient>
        <CardHeader title="Network Traffic Overview" subtitle="Last 7 days" />
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" label={{ value: 'MB', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#12141a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="upload" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              name="Upload (MB)"
              dot={{ fill: '#8B5CF6', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="download" 
              stroke="#3B82F6" 
              strokeWidth={3}
              name="Download (MB)"
              dot={{ fill: '#3B82F6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <Card gradient>
          <CardHeader title="Peak Usage Hours" subtitle="Active users by hour" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12141a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="users" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Voucher Distribution */}
        <Card gradient>
          <CardHeader title="Voucher Distribution by Profile" />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12141a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Daily Traffic</p>
              <p className="text-2xl font-bold text-foreground">2.4 GB</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Users className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peak Users</p>
              <p className="text-2xl font-bold text-foreground">52</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Router className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Bandwidth</p>
              <p className="text-2xl font-bold text-foreground">5.2 Mbps</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Ticket className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Voucher Usage</p>
              <p className="text-2xl font-bold text-foreground">73%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
