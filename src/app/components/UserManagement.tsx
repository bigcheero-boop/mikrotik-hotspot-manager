import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserCheck, UserX, Search, Download, Users, Shuffle } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  password: string;
  profile: string;
  active: boolean;
  createdAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    profile: '1Hour',
  });
  const [bulkForm, setBulkForm] = useState({
    count: 10,
    prefix: 'user',
    passwordLength: 8,
    profile: '1Hour',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const response = await apiRequest('/users');
      if (response.success) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success('User created successfully');
      setShowAddModal(false);
      setFormData({ username: '', password: '', profile: '1Hour' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const generateRandomPassword = (length: number): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bulkUsers = [];
      for (let i = 1; i <= bulkForm.count; i++) {
        bulkUsers.push({
          username: `${bulkForm.prefix}${String(i).padStart(3, '0')}`,
          password: generateRandomPassword(bulkForm.passwordLength),
          profile: bulkForm.profile,
        });
      }

      await apiRequest('/users/bulk', {
        method: 'POST',
        body: JSON.stringify({ users: bulkUsers }),
      });

      toast.success(`Generated ${bulkForm.count} users successfully`);
      setShowBulkModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error bulk generating users:', error);
      toast.error('Failed to generate users');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await apiRequest(`/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !user.active }),
      });
      toast.success(`User ${!user.active ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const exportUsers = () => {
    const headers = 'Username,Password,Profile,Status,Created\n';
    const rows = users.map(u =>
      `"${u.username}","${u.password}","${u.profile}","${u.active ? 'Active' : 'Inactive'}","${new Date(u.createdAt).toLocaleDateString()}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skynity-users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Users exported as CSV');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage hotspot users</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportUsers} disabled={users.length === 0}>
            <Download className="w-5 h-5 mr-2" />
            Export
          </Button>
          <Button variant="accent" onClick={() => setShowBulkModal(true)}>
            <Shuffle className="w-5 h-5 mr-2" />
            Bulk Generate
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-primary">{users.length}</p>
          </div>
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-secondary">{users.filter(u => u.active).length}</p>
          </div>
          <UserCheck className="w-8 h-8 text-secondary" />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Username</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Password</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Profile</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{user.username}</td>
                  <td className="py-3 px-4 text-muted-foreground font-mono text-sm">{user.password}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                      {user.profile}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.active
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant={user.active ? 'ghost' : 'secondary'}
                        size="sm"
                        onClick={() => toggleUserStatus(user)}
                      >
                        {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try a different search term' : 'Create your first user to get started'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader title="Create New User" />
            <form onSubmit={handleAddUser} className="space-y-4">
              <Input
                label="Username"
                placeholder="user123"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Profile / Time Limit</label>
                <select
                  title="Profile / Time Limit"
                  value={formData.profile}
                  onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1Hour">1 Hour</option>
                  <option value="3Hours">3 Hours</option>
                  <option value="1Day">1 Day</option>
                  <option value="1Week">1 Week</option>
                  <option value="1Month">1 Month</option>
                  <option value="Unlimited">Unlimited</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Create User</Button>
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader title="Bulk Generate Users" subtitle="Create multiple users with random passwords" />
            <form onSubmit={handleBulkGenerate} className="space-y-4">
              <Input
                label="Number of Users"
                type="number"
                min="1"
                max="500"
                value={bulkForm.count}
                onChange={(e) => setBulkForm({ ...bulkForm, count: parseInt(e.target.value) })}
                required
              />
              <Input
                label="Username Prefix"
                placeholder="user"
                value={bulkForm.prefix}
                onChange={(e) => setBulkForm({ ...bulkForm, prefix: e.target.value })}
                required
              />
              <Input
                label="Password Length"
                type="number"
                min="4"
                max="20"
                value={bulkForm.passwordLength}
                onChange={(e) => setBulkForm({ ...bulkForm, passwordLength: parseInt(e.target.value) })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Profile / Time Limit</label>
                <select
                  title="Profile / Time Limit"
                  value={bulkForm.profile}
                  onChange={(e) => setBulkForm({ ...bulkForm, profile: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1Hour">1 Hour</option>
                  <option value="3Hours">3 Hours</option>
                  <option value="1Day">1 Day</option>
                  <option value="1Week">1 Week</option>
                  <option value="1Month">1 Month</option>
                  <option value="Unlimited">Unlimited</option>
                </select>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm text-muted-foreground">
                Preview: {bulkForm.prefix}001, {bulkForm.prefix}002, ... {bulkForm.prefix}{String(bulkForm.count).padStart(3, '0')}
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Shuffle className="w-4 h-4 mr-2" />
                  Generate {bulkForm.count} Users
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowBulkModal(false)} className="flex-1">Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
