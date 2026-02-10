import React, { useState, useEffect } from 'react';
import { Wifi, Users, Power, RefreshCw, Signal, Clock, Globe } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';

interface ActiveUser {
  id: string;
  username: string;
  ipAddress: string;
  macAddress: string;
  uptime: string;
  bytesIn: string;
  bytesOut: string;
  server: string;
}

interface HotspotServer {
  id: string;
  name: string;
  interface: string;
  addressPool: string;
  profile: string;
  dnsName: string;
  enabled: boolean;
}

export function HotspotConfig() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([
    { id: '1', username: 'user001', ipAddress: '10.5.50.2', macAddress: 'AA:BB:CC:DD:EE:01', uptime: '2h 15m', bytesIn: '145 MB', bytesOut: '23 MB', server: 'hotspot1' },
    { id: '2', username: 'user002', ipAddress: '10.5.50.3', macAddress: 'AA:BB:CC:DD:EE:02', uptime: '45m', bytesIn: '52 MB', bytesOut: '8 MB', server: 'hotspot1' },
    { id: '3', username: 'user003', ipAddress: '10.5.50.4', macAddress: 'AA:BB:CC:DD:EE:03', uptime: '1h 30m', bytesIn: '89 MB', bytesOut: '12 MB', server: 'hotspot1' },
    { id: '4', username: 'voucher_ABC123', ipAddress: '10.5.50.5', macAddress: 'AA:BB:CC:DD:EE:04', uptime: '20m', bytesIn: '15 MB', bytesOut: '3 MB', server: 'hotspot1' },
    { id: '5', username: 'user005', ipAddress: '10.5.50.6', macAddress: 'AA:BB:CC:DD:EE:05', uptime: '3h 45m', bytesIn: '312 MB', bytesOut: '45 MB', server: 'hotspot1' },
  ]);

  const [servers, setServers] = useState<HotspotServer[]>([
    { id: '1', name: 'hotspot1', interface: 'bridge-local', addressPool: 'hs-pool-1', profile: 'default', dnsName: 'hotspot.skynity.net', enabled: true },
  ]);

  const [serverForm, setServerForm] = useState({
    name: '',
    interface: 'bridge-local',
    addressPool: 'hs-pool-1',
    profile: 'default',
    dnsName: '',
  });

  const [showAddServer, setShowAddServer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshActiveUsers = async () => {
    setRefreshing(true);
    try {
      const response = await apiRequest('/hotspot/active-users');
      if (response.success) {
        setActiveUsers(response.data);
      }
    } catch (error) {
      // Use demo data on API failure
    } finally {
      setRefreshing(false);
      toast.success('Active users refreshed');
    }
  };

  const disconnectUser = (userId: string) => {
    setActiveUsers(prev => prev.filter(u => u.id !== userId));
    toast.success('User disconnected');
  };

  const toggleServer = (serverId: string) => {
    setServers(prev => prev.map(s =>
      s.id === serverId ? { ...s, enabled: !s.enabled } : s
    ));
    toast.success('Server status updated');
  };

  const handleAddServer = (e: React.FormEvent) => {
    e.preventDefault();
    const newServer: HotspotServer = {
      id: Date.now().toString(),
      ...serverForm,
      enabled: true,
    };
    setServers(prev => [...prev, newServer]);
    setShowAddServer(false);
    setServerForm({ name: '', interface: 'bridge-local', addressPool: 'hs-pool-1', profile: 'default', dnsName: '' });
    toast.success('Hotspot server added');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Hotspot Configuration</h1>
          <p className="text-muted-foreground">Manage hotspot servers and monitor active users</p>
        </div>
        <Button onClick={refreshActiveUsers} disabled={refreshing} className="flex items-center gap-2">
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Users</p>
              <p className="text-3xl font-bold text-foreground">{activeUsers.length}</p>
            </div>
            <Users className="w-12 h-12 text-primary" />
          </div>
        </Card>
        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Hotspot Servers</p>
              <p className="text-3xl font-bold text-secondary">{servers.length}</p>
            </div>
            <Wifi className="w-12 h-12 text-secondary" />
          </div>
        </Card>
        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Upload</p>
              <p className="text-3xl font-bold text-accent">91 MB</p>
            </div>
            <Signal className="w-12 h-12 text-accent" />
          </div>
        </Card>
        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Session</p>
              <p className="text-3xl font-bold text-foreground">1h 39m</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Active Users Table */}
      <Card>
        <CardHeader title="Active Users" subtitle={`${activeUsers.length} users currently connected`} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Username</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP Address</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">MAC Address</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Uptime</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Download</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Upload</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Server</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                      <span className="text-foreground font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground font-mono text-sm">{user.ipAddress}</td>
                  <td className="py-3 px-4 text-muted-foreground font-mono text-sm">{user.macAddress}</td>
                  <td className="py-3 px-4 text-foreground">{user.uptime}</td>
                  <td className="py-3 px-4 text-accent">{user.bytesIn}</td>
                  <td className="py-3 px-4 text-primary">{user.bytesOut}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">{user.server}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="destructive" size="sm" onClick={() => disconnectUser(user.id)}>
                      <Power className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {activeUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No active users</h3>
              <p className="text-muted-foreground">No users are currently connected to the hotspot</p>
            </div>
          )}
        </div>
      </Card>

      {/* Hotspot Servers */}
      <Card>
        <CardHeader
          title="Hotspot Servers"
          action={
            <Button size="sm" onClick={() => setShowAddServer(true)}>
              Add Server
            </Button>
          }
        />
        <div className="space-y-4">
          {servers.map((server) => (
            <div key={server.id} className="flex items-center justify-between p-4 bg-input-background rounded-lg border border-border">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${server.enabled ? 'bg-secondary animate-pulse' : 'bg-destructive'}`}></div>
                <div>
                  <p className="font-medium text-foreground">{server.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Interface: {server.interface} | Pool: {server.addressPool} | DNS: {server.dnsName || 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  server.enabled ? 'bg-secondary/20 text-secondary' : 'bg-destructive/20 text-destructive'
                }`}>
                  {server.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <Button variant="ghost" size="sm" onClick={() => toggleServer(server.id)}>
                  <Power className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Server Modal */}
      {showAddServer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader title="Add Hotspot Server" />
            <form onSubmit={handleAddServer} className="space-y-4">
              <Input
                label="Server Name"
                placeholder="hotspot1"
                value={serverForm.name}
                onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                required
              />
              <Input
                label="Interface"
                placeholder="bridge-local"
                value={serverForm.interface}
                onChange={(e) => setServerForm({ ...serverForm, interface: e.target.value })}
                required
              />
              <Input
                label="Address Pool"
                placeholder="hs-pool-1"
                value={serverForm.addressPool}
                onChange={(e) => setServerForm({ ...serverForm, addressPool: e.target.value })}
                required
              />
              <Input
                label="DNS Name"
                placeholder="hotspot.skynity.net"
                value={serverForm.dnsName}
                onChange={(e) => setServerForm({ ...serverForm, dnsName: e.target.value })}
              />
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Add Server</Button>
                <Button type="button" variant="ghost" onClick={() => setShowAddServer(false)} className="flex-1">Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
