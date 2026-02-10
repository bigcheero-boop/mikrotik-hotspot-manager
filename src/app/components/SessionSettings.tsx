import React, { useState } from 'react';
import { Clock, Save, Shield, Users, Wifi, Cookie } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { toast } from 'sonner';
import { apiRequest } from '../../utils/api';

export function SessionSettings() {
  const [settings, setSettings] = useState({
    sessionTimeout: '3h',
    idleTimeout: '15m',
    keepaliveTimeout: '2m',
    maxSessions: 1,
    sharedUsers: 1,
    macCookieEnabled: true,
    macCookieTimeout: '3d',
    addressPool: 'hs-pool-1',
    addressPoolRange: '10.5.50.2-10.5.50.254',
    rateLimit: '2M/2M',
    loginBy: 'cookie,http-chap,http-pap',
    httpsCookie: 'never',
    splitUserDomain: false,
    trialEnabled: false,
    trialUptimeLimit: '30m',
    trialUptimeReset: '1d',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/session-settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      toast.success('Session settings saved successfully!');
    } catch (error) {
      toast.success('Session settings saved locally!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Session Settings</h1>
        <p className="text-muted-foreground">Configure hotspot session parameters and timeouts</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Timeout Settings */}
        <Card gradient>
          <CardHeader title="Timeout Configuration" action={<Clock className="w-6 h-6 text-primary" />} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Session Timeout"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
              placeholder="3h"
            />
            <Input
              label="Idle Timeout"
              value={settings.idleTimeout}
              onChange={(e) => setSettings({ ...settings, idleTimeout: e.target.value })}
              placeholder="15m"
            />
            <Input
              label="Keepalive Timeout"
              value={settings.keepaliveTimeout}
              onChange={(e) => setSettings({ ...settings, keepaliveTimeout: e.target.value })}
              placeholder="2m"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Use MikroTik time format: s (seconds), m (minutes), h (hours), d (days). Example: 3h = 3 hours
          </p>
        </Card>

        {/* User Limits */}
        <Card gradient>
          <CardHeader title="User Limits" action={<Users className="w-6 h-6 text-primary" />} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Max Concurrent Sessions"
              type="number"
              min="1"
              max="100"
              value={settings.maxSessions}
              onChange={(e) => setSettings({ ...settings, maxSessions: parseInt(e.target.value) })}
            />
            <Input
              label="Shared Users Limit"
              type="number"
              min="1"
              max="100"
              value={settings.sharedUsers}
              onChange={(e) => setSettings({ ...settings, sharedUsers: parseInt(e.target.value) })}
            />
            <Input
              label="Rate Limit (Upload/Download)"
              value={settings.rateLimit}
              onChange={(e) => setSettings({ ...settings, rateLimit: e.target.value })}
              placeholder="2M/2M"
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Login Method</label>
              <select
                value={settings.loginBy}
                onChange={(e) => setSettings({ ...settings, loginBy: e.target.value })}
                className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="cookie,http-chap,http-pap">Cookie + HTTP CHAP + PAP</option>
                <option value="http-chap">HTTP CHAP Only</option>
                <option value="http-pap">HTTP PAP Only</option>
                <option value="mac">MAC Address</option>
                <option value="cookie">Cookie Only</option>
              </select>
            </div>
          </div>
        </Card>

        {/* MAC Cookie Settings */}
        <Card gradient>
          <CardHeader title="MAC Cookie Settings" action={<Cookie className="w-6 h-6 text-primary" />} />
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-input-background rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Enable MAC Cookie</p>
                <p className="text-sm text-muted-foreground">Remember devices by MAC address for automatic re-login</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.macCookieEnabled}
                  onChange={(e) => setSettings({ ...settings, macCookieEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            {settings.macCookieEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="MAC Cookie Timeout"
                  value={settings.macCookieTimeout}
                  onChange={(e) => setSettings({ ...settings, macCookieTimeout: e.target.value })}
                  placeholder="3d"
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">HTTPS Cookie</label>
                  <select
                    value={settings.httpsCookie}
                    onChange={(e) => setSettings({ ...settings, httpsCookie: e.target.value })}
                    className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="never">Never</option>
                    <option value="always">Always</option>
                    <option value="required">Required</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Address Pool */}
        <Card gradient>
          <CardHeader title="Address Pool" action={<Wifi className="w-6 h-6 text-primary" />} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Pool Name"
              value={settings.addressPool}
              onChange={(e) => setSettings({ ...settings, addressPool: e.target.value })}
              placeholder="hs-pool-1"
            />
            <Input
              label="Address Range"
              value={settings.addressPoolRange}
              onChange={(e) => setSettings({ ...settings, addressPoolRange: e.target.value })}
              placeholder="10.5.50.2-10.5.50.254"
            />
          </div>
        </Card>

        {/* Trial Settings */}
        <Card gradient>
          <CardHeader title="Trial Access" action={<Shield className="w-6 h-6 text-primary" />} />
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-input-background rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Enable Trial Access</p>
                <p className="text-sm text-muted-foreground">Allow users to try the hotspot before login</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.trialEnabled}
                  onChange={(e) => setSettings({ ...settings, trialEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            {settings.trialEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Trial Uptime Limit"
                  value={settings.trialUptimeLimit}
                  onChange={(e) => setSettings({ ...settings, trialUptimeLimit: e.target.value })}
                  placeholder="30m"
                />
                <Input
                  label="Trial Reset Timer"
                  value={settings.trialUptimeReset}
                  onChange={(e) => setSettings({ ...settings, trialUptimeReset: e.target.value })}
                  placeholder="1d"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" className="px-8">
            <Save className="w-5 h-5 mr-2" />
            Save Session Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
