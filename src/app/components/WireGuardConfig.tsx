import React, { useState } from 'react';
import { Shield, Download, Copy, QrCode, Check } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { toast } from 'sonner';
import QRCode from 'qrcode';

export function WireGuardConfig() {
  const [serverConfig, setServerConfig] = useState({
    publicKey: 'SERVER_PUBLIC_KEY_PLACEHOLDER',
    privateKey: 'SERVER_PRIVATE_KEY_PLACEHOLDER',
    listenPort: 51820,
    address: '10.8.0.1/24',
    endpoint: '',
  });

  const [clientConfig, setClientConfig] = useState({
    name: '',
    address: '10.8.0.2/24',
  });

  const [generatedConfig, setGeneratedConfig] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateWireGuardConfig = async () => {
    if (!clientConfig.name) {
      toast.error('Please enter a client name');
      return;
    }

    const clientPrivateKey = 'CLIENT_PRIVATE_KEY_' + Math.random().toString(36).substring(7).toUpperCase();
    const clientPublicKey = 'CLIENT_PUBLIC_KEY_' + Math.random().toString(36).substring(7).toUpperCase();

    const config = `[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${clientConfig.address}
DNS = 8.8.8.8

[Peer]
PublicKey = ${serverConfig.publicKey}
Endpoint = ${serverConfig.endpoint || 'YOUR_SERVER_IP:51820'}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`;

    setGeneratedConfig(config);

    // Generate QR code
    try {
      const qr = await QRCode.toDataURL(config);
      setQrCodeUrl(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    toast.success('WireGuard configuration generated!');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedConfig);
      setCopied(true);
      toast.success('Configuration copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadConfig = () => {
    const blob = new Blob([generatedConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientConfig.name}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Configuration downloaded!');
  };

  const mikrotikScript = `# MikroTik WireGuard Setup Script
/interface wireguard
add listen-port=${serverConfig.listenPort} mtu=1420 name=wireguard1 private-key="${serverConfig.privateKey}"

/interface wireguard peers
add allowed-address=10.8.0.0/24 interface=wireguard1 public-key="CLIENT_PUBLIC_KEY"

/ip address
add address=${serverConfig.address} interface=wireguard1 network=10.8.0.0

/ip firewall nat
add action=masquerade chain=srcnat out-interface=ether1 src-address=10.8.0.0/24`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">WireGuard VPN Configuration</h1>
        <p className="text-muted-foreground">Configure WireGuard VPN for CGNAT/Starlink environments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server Configuration */}
        <Card gradient>
          <CardHeader title="Server Configuration" />
          <div className="space-y-4">
            <Input
              label="Server Public Key"
              value={serverConfig.publicKey}
              onChange={(e) => setServerConfig({ ...serverConfig, publicKey: e.target.value })}
              placeholder="Server public key"
            />
            <Input
              label="Server Endpoint (IP:Port)"
              value={serverConfig.endpoint}
              onChange={(e) => setServerConfig({ ...serverConfig, endpoint: e.target.value })}
              placeholder="203.0.113.1:51820"
            />
            <Input
              label="Listen Port"
              type="number"
              value={serverConfig.listenPort}
              onChange={(e) => setServerConfig({ ...serverConfig, listenPort: parseInt(e.target.value) })}
            />
            <Input
              label="Server Address"
              value={serverConfig.address}
              onChange={(e) => setServerConfig({ ...serverConfig, address: e.target.value })}
              placeholder="10.8.0.1/24"
            />
          </div>
        </Card>

        {/* Client Configuration Generator */}
        <Card gradient>
          <CardHeader title="Generate Client Config" />
          <div className="space-y-4">
            <Input
              label="Client Name"
              value={clientConfig.name}
              onChange={(e) => setClientConfig({ ...clientConfig, name: e.target.value })}
              placeholder="mikrotik-router-1"
            />
            <Input
              label="Client Address"
              value={clientConfig.address}
              onChange={(e) => setClientConfig({ ...clientConfig, address: e.target.value })}
              placeholder="10.8.0.2/24"
            />
            <Button onClick={generateWireGuardConfig} className="w-full">
              <Shield className="w-5 h-5 mr-2" />
              Generate Configuration
            </Button>
          </div>
        </Card>
      </div>

      {/* Generated Configuration */}
      {generatedConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Client Configuration" />
            <div className="space-y-4">
              <div className="bg-input-background rounded-lg p-4 font-mono text-sm text-foreground whitespace-pre-wrap border border-border">
                {generatedConfig}
              </div>
              <div className="flex gap-3">
                <Button onClick={copyToClipboard} className="flex-1" variant="secondary">
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copy Config
                    </>
                  )}
                </Button>
                <Button onClick={downloadConfig} className="flex-1" variant="accent">
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </Card>

          {/* QR Code */}
          {qrCodeUrl && (
            <Card>
              <CardHeader title="QR Code for Mobile" />
              <div className="flex flex-col items-center justify-center p-6">
                <img src={qrCodeUrl} alt="WireGuard QR Code" className="w-64 h-64 border-4 border-primary rounded-lg" />
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Scan with WireGuard mobile app
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* MikroTik Setup Script */}
      <Card>
        <CardHeader title="MikroTik Router Setup Script" subtitle="Run this script on your MikroTik router" />
        <div className="bg-input-background rounded-lg p-4 font-mono text-sm text-foreground whitespace-pre-wrap border border-border">
          {mikrotikScript}
        </div>
        <div className="mt-4">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(mikrotikScript);
              toast.success('MikroTik script copied!');
            }}
            variant="secondary"
          >
            <Copy className="w-5 h-5 mr-2" />
            Copy MikroTik Script
          </Button>
        </div>
      </Card>

      {/* Instructions */}
      <Card gradient>
        <CardHeader title="Setup Instructions" />
        <div className="space-y-4 text-sm text-foreground">
          <div>
            <h4 className="font-bold mb-2">1. Server Setup:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Install WireGuard on your VPS or cloud server</li>
              <li>Generate server keys and configure the interface</li>
              <li>Open UDP port 51820 in your firewall</li>
              <li>Enter the server details in the form above</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">2. MikroTik Router Configuration:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Generate a client configuration using the form</li>
              <li>Copy the MikroTik script provided</li>
              <li>Paste and run it in your MikroTik terminal</li>
              <li>Add the client's public key to your server</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">3. Testing:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Check WireGuard interface status on both ends</li>
              <li>Verify tunnel connectivity with ping tests</li>
              <li>Configure hotspot to route through WireGuard</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
