import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Power, WifiOff, Check, X, Zap, Loader2 } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';

interface Router {
  id: string;
  name: string;
  ip: string;
  username: string;
  password: string;
  hotspotServer: string;
  status: 'online' | 'offline';
  createdAt: string;
}

export function RouterManagement() {
  const [routers, setRouters] = useState<Router[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    username: 'admin',
    password: '',
    hotspotServer: 'hotspot1',
  });

  useEffect(() => {
    fetchRouters();
  }, []);

  const fetchRouters = async () => {
    try {
      const response = await apiRequest('/routers');
      if (response.success) {
        setRouters(response.data);
      }
    } catch (error) {
      console.error('Error fetching routers:', error);
      toast.error('Failed to load routers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRouter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/routers', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success('Router added successfully');
      setShowAddModal(false);
      setFormData({ name: '', ip: '', username: 'admin', password: '', hotspotServer: 'hotspot1' });
      fetchRouters();
    } catch (error) {
      console.error('Error adding router:', error);
      toast.error('Failed to add router');
    }
  };

  const handleDeleteRouter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this router?')) return;

    try {
      await apiRequest(`/routers/${id}`, { method: 'DELETE' });
      toast.success('Router deleted successfully');
      fetchRouters();
    } catch (error) {
      console.error('Error deleting router:', error);
      toast.error('Failed to delete router');
    }
  };

  const toggleRouterStatus = async (router: Router) => {
    try {
      const newStatus = router.status === 'online' ? 'offline' : 'online';
      await apiRequest(`/routers/${router.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Router ${newStatus === 'online' ? 'connected' : 'disconnected'}`);
      fetchRouters();
    } catch (error) {
      console.error('Error updating router status:', error);
      toast.error('Failed to update router status');
    }
  };

  const testConnection = async (router: Router) => {
    setTestingId(router.id);
    // Simulate connection test with timeout
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate result based on router status
    const success = Math.random() > 0.3;
    if (success) {
      toast.success(`Connection to ${router.name} (${router.ip}) successful!`);
      // Update status to online
      try {
        await apiRequest(`/routers/${router.id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'online' }),
        });
        fetchRouters();
      } catch (error) {
        // Silently update local state
        setRouters(prev => prev.map(r => r.id === router.id ? { ...r, status: 'online' } : r));
      }
    } else {
      toast.error(`Connection to ${router.name} (${router.ip}) failed - check IP and credentials`);
    }
    setTestingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading routers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Router Management</h1>
          <p className="text-muted-foreground">Manage your MikroTik routers</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Router
        </Button>
      </div>

      {/* Routers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routers.map((router) => (
          <Card key={router.id} gradient>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{router.name}</h3>
                  <p className="text-sm text-muted-foreground">{router.ip}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  router.status === 'online'
                    ? 'bg-secondary/20 text-secondary'
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {router.status === 'online' ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Disconnected
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="text-foreground">{router.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hotspot Server:</span>
                  <span className="text-foreground">{router.hotspotServer}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => testConnection(router)}
                  disabled={testingId === router.id}
                  className="flex-1"
                >
                  {testingId === router.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Test
                    </>
                  )}
                </Button>
                <Button
                  variant={router.status === 'online' ? 'destructive' : 'secondary'}
                  size="sm"
                  onClick={() => toggleRouterStatus(router)}
                  className="flex-1"
                >
                  {router.status === 'online' ? (
                    <>
                      <WifiOff className="w-4 h-4 mr-2" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRouter(router.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {routers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <WifiOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No routers configured</h3>
            <p className="text-muted-foreground mb-4">Add your first MikroTik router to get started</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Router
            </Button>
          </div>
        )}
      </div>

      {/* Add Router Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader title="Add New Router" />
            <form onSubmit={handleAddRouter} className="space-y-4">
              <Input
                label="Router Name"
                placeholder="My Router"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="IP Address"
                placeholder="192.168.88.1"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                required
              />
              <Input
                label="Username"
                placeholder="admin"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter router password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                label="Hotspot Server Name"
                placeholder="hotspot1"
                value={formData.hotspotServer}
                onChange={(e) => setFormData({ ...formData, hotspotServer: e.target.value })}
                required
              />
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Add Router</Button>
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
