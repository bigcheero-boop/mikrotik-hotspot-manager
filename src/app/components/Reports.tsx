import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Activity, Wifi, AlertCircle, LogIn, LogOut as LogOutIcon } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'auth' | 'connection' | 'error' | 'system';
  message: string;
  username?: string;
  ipAddress?: string;
}

interface TrafficEntry {
  time: string;
  download: number;
  upload: number;
  users: number;
}

export function Reports() {
  const [activeTab, setActiveTab] = useState<'traffic' | 'logs'>('traffic');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [logFilter, setLogFilter] = useState<string>('all');

  const [trafficData] = useState<TrafficEntry[]>([
    { time: '00:00', download: 120, upload: 30, users: 8 },
    { time: '02:00', download: 80, upload: 15, users: 4 },
    { time: '04:00', download: 45, upload: 10, users: 2 },
    { time: '06:00', download: 90, upload: 25, users: 12 },
    { time: '08:00', download: 250, upload: 65, users: 28 },
    { time: '10:00', download: 380, upload: 95, users: 42 },
    { time: '12:00', download: 520, upload: 140, users: 55 },
    { time: '14:00', download: 450, upload: 120, users: 48 },
    { time: '16:00', download: 600, upload: 150, users: 62 },
    { time: '18:00', download: 480, upload: 130, users: 52 },
    { time: '20:00', download: 350, upload: 90, users: 38 },
    { time: '22:00', download: 200, upload: 50, users: 20 },
  ]);

  const [logs] = useState<LogEntry[]>([
    { id: '1', timestamp: '2026-02-10 14:32:15', type: 'auth', message: 'User login successful', username: 'user001', ipAddress: '10.5.50.2' },
    { id: '2', timestamp: '2026-02-10 14:30:45', type: 'connection', message: 'New device connected', username: 'user002', ipAddress: '10.5.50.3' },
    { id: '3', timestamp: '2026-02-10 14:28:10', type: 'error', message: 'Authentication failed - invalid password', username: 'unknown', ipAddress: '10.5.50.99' },
    { id: '4', timestamp: '2026-02-10 14:25:30', type: 'auth', message: 'Voucher redeemed: ABC12345', username: 'voucher_ABC123', ipAddress: '10.5.50.5' },
    { id: '5', timestamp: '2026-02-10 14:20:00', type: 'system', message: 'Hotspot server restarted', ipAddress: '192.168.88.1' },
    { id: '6', timestamp: '2026-02-10 14:15:22', type: 'auth', message: 'User session expired', username: 'user005', ipAddress: '10.5.50.6' },
    { id: '7', timestamp: '2026-02-10 14:10:05', type: 'connection', message: 'Device disconnected - idle timeout', username: 'user003', ipAddress: '10.5.50.4' },
    { id: '8', timestamp: '2026-02-10 14:05:18', type: 'error', message: 'Rate limit exceeded', username: 'user007', ipAddress: '10.5.50.8' },
    { id: '9', timestamp: '2026-02-10 14:00:00', type: 'system', message: 'Daily backup completed successfully' },
    { id: '10', timestamp: '2026-02-10 13:55:30', type: 'auth', message: 'Admin login from WinBox', username: 'admin', ipAddress: '192.168.88.100' },
    { id: '11', timestamp: '2026-02-10 13:50:12', type: 'connection', message: 'WireGuard tunnel established', ipAddress: '10.8.0.1' },
    { id: '12', timestamp: '2026-02-10 13:45:00', type: 'error', message: 'DNS resolution failed for hotspot.skynity.net' },
  ]);

  const filteredLogs = logs.filter(log => logFilter === 'all' || log.type === logFilter);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'auth': return <LogIn className="w-4 h-4 text-primary" />;
      case 'connection': return <Wifi className="w-4 h-4 text-secondary" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'system': return <Activity className="w-4 h-4 text-accent" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getLogBadgeColor = (type: string) => {
    switch (type) {
      case 'auth': return 'bg-primary/20 text-primary';
      case 'connection': return 'bg-secondary/20 text-secondary';
      case 'error': return 'bg-destructive/20 text-destructive';
      case 'system': return 'bg-accent/20 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const exportCSV = () => {
    const headers = 'Timestamp,Type,Message,Username,IP Address\n';
    const rows = filteredLogs.map(log =>
      `"${log.timestamp}","${log.type}","${log.message}","${log.username || ''}","${log.ipAddress || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skynity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Logs exported as CSV');
  };

  const perUserTraffic = [
    { user: 'user001', download: 145, upload: 23 },
    { user: 'user002', download: 52, upload: 8 },
    { user: 'user003', download: 89, upload: 12 },
    { user: 'voucher_ABC', download: 15, upload: 3 },
    { user: 'user005', download: 312, upload: 45 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports</h1>
          <p className="text-muted-foreground">Traffic monitoring and system logs</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'logs' && (
            <Button variant="secondary" onClick={exportCSV}>
              <Download className="w-5 h-5 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'traffic' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('traffic')}
        >
          <Activity className="w-5 h-5 mr-2" />
          Traffic Monitor
        </Button>
        <Button
          variant={activeTab === 'logs' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('logs')}
        >
          <FileText className="w-5 h-5 mr-2" />
          System Logs
        </Button>
      </div>

      {activeTab === 'traffic' ? (
        <>
          {/* Bandwidth Chart */}
          <Card gradient>
            <CardHeader title="Real-Time Bandwidth Usage" subtitle="Download and Upload (MB) over 24 hours" />
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" label={{ value: 'MB', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12141a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="download" stroke="#3B82F6" strokeWidth={3} name="Download (MB)" dot={{ fill: '#3B82F6', r: 3 }} />
                <Line type="monotone" dataKey="upload" stroke="#8B5CF6" strokeWidth={3} name="Upload (MB)" dot={{ fill: '#8B5CF6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Connected Users Chart */}
          <Card gradient>
            <CardHeader title="Connected Users Over Time" />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12141a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="users" fill="#10B981" radius={[8, 8, 0, 0]} name="Active Users" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Per-User Traffic */}
          <Card>
            <CardHeader title="Per-User Traffic" subtitle="Current session data" />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={perUserTraffic} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="user" type="category" stroke="#9ca3af" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12141a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="download" fill="#3B82F6" name="Download (MB)" />
                <Bar dataKey="upload" fill="#8B5CF6" name="Upload (MB)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      ) : (
        <>
          {/* Log Filters */}
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="w-5 h-5 text-muted-foreground" />
              {['all', 'auth', 'connection', 'error', 'system'].map((filter) => (
                <Button
                  key={filter}
                  variant={logFilter === filter ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setLogFilter(filter)}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
              <div className="flex-1" />
              <span className="text-sm text-muted-foreground">{filteredLogs.length} entries</span>
            </div>
          </Card>

          {/* Logs Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Message</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-sm text-muted-foreground font-mono whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getLogBadgeColor(log.type)}`}>
                          {getLogIcon(log.type)}
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground text-sm">{log.message}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{log.username || '-'}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{log.ipAddress || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No logs found</h3>
                  <p className="text-muted-foreground">No log entries match the current filter</p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
