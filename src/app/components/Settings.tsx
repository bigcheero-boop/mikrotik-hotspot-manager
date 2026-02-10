import React, { useState } from 'react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Save, Globe, Bell, Shield, Database } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const [settings, setSettings] = useState({
    siteName: 'SKYNITY Hotspot Manager',
    language: 'en',
    timezone: 'UTC',
    sessionTimeout: 15,
    enableNotifications: true,
    autoBackup: true,
    backupInterval: 24,
    maxConcurrentLogins: 1,
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the backend
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your hotspot manager</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* General Settings */}
        <Card gradient>
          <CardHeader 
            title="General Settings" 
            action={
              <Globe className="w-6 h-6 text-primary" />
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Site Name"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা (Bengali)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Dhaka">Asia/Dhaka</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
            <Input
              label="Session Timeout (minutes)"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            />
          </div>
        </Card>

        {/* Security Settings */}
        <Card gradient>
          <CardHeader 
            title="Security Settings" 
            action={
              <Shield className="w-6 h-6 text-primary" />
            }
          />
          <div className="space-y-4">
            <Input
              label="Max Concurrent Logins per User"
              type="number"
              min="1"
              max="10"
              value={settings.maxConcurrentLogins}
              onChange={(e) => setSettings({ ...settings, maxConcurrentLogins: parseInt(e.target.value) })}
            />
            <div className="flex items-center justify-between p-4 bg-input-background rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Enable Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts about system events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Backup Settings */}
        <Card gradient>
          <CardHeader 
            title="Backup & Maintenance" 
            action={
              <Database className="w-6 h-6 text-primary" />
            }
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-input-background rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Automatic Backups</p>
                <p className="text-sm text-muted-foreground">Automatically backup database</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            {settings.autoBackup && (
              <Input
                label="Backup Interval (hours)"
                type="number"
                min="1"
                max="168"
                value={settings.backupInterval}
                onChange={(e) => setSettings({ ...settings, backupInterval: parseInt(e.target.value) })}
              />
            )}
            
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1">
                <Database className="w-5 h-5 mr-2" />
                Backup Now
              </Button>
              <Button variant="ghost" className="flex-1">
                <Database className="w-5 h-5 mr-2" />
                Restore Backup
              </Button>
            </div>
          </div>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader title="System Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-3 bg-input-background rounded-lg">
              <span className="text-muted-foreground">Version:</span>
              <span className="text-foreground font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between p-3 bg-input-background rounded-lg">
              <span className="text-muted-foreground">Database:</span>
              <span className="text-foreground font-medium">PostgreSQL</span>
            </div>
            <div className="flex justify-between p-3 bg-input-background rounded-lg">
              <span className="text-muted-foreground">Server Uptime:</span>
              <span className="text-foreground font-medium">7 days, 12 hours</span>
            </div>
            <div className="flex justify-between p-3 bg-input-background rounded-lg">
              <span className="text-muted-foreground">Last Backup:</span>
              <span className="text-foreground font-medium">2 hours ago</span>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" className="px-8">
            <Save className="w-5 h-5 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
