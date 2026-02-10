import React, { useState } from 'react';
import { FileCode, Eye, Download, Copy, Check, RotateCcw } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { toast } from 'sonner';

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SKYNITY - WiFi Login</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, sans-serif;
      background: linear-gradient(135deg, #0a0b0e 0%, #1a1c2e 50%, #0a0b0e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #f3f4f6;
    }
    .container {
      width: 100%;
      max-width: 420px;
      padding: 20px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-icon {
      width: 70px; height: 70px;
      background: linear-gradient(135deg, #8B5CF6, #3B82F6);
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
    }
    .logo-icon svg { width: 36px; height: 36px; fill: white; }
    .logo h1 { font-size: 28px; font-weight: 700; }
    .logo p { color: #9ca3af; font-size: 14px; margin-top: 4px; }
    .card {
      background: rgba(18, 20, 26, 0.9);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 32px;
      backdrop-filter: blur(20px);
    }
    .card h2 { font-size: 22px; text-align: center; margin-bottom: 8px; }
    .card .subtitle { text-align: center; color: #9ca3af; font-size: 14px; margin-bottom: 24px; }
    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; }
    .form-group input {
      width: 100%;
      padding: 12px 16px;
      background: #1a1c24;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      color: #f3f4f6;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-group input:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139,92,246,0.2); }
    .form-group input::placeholder { color: #6b7280; }
    .btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #8B5CF6, #7c3aed);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 4px 16px rgba(139,92,246,0.3);
    }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(139,92,246,0.4); }
    .btn:active { transform: translateY(0); }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
    .footer a { color: #8B5CF6; text-decoration: none; }
    $(if error)
    .error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; padding: 12px; text-align: center; color: #ef4444; margin-bottom: 18px; font-size: 14px; }
    $(endif)
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
      </div>
      <h1>SKYNITY</h1>
      <p>High-Speed WiFi Access</p>
    </div>

    <div class="card">
      <h2>Connect to WiFi</h2>
      <p class="subtitle">Enter your credentials to get online</p>

      $(if error)
      <div class="error">$(error)</div>
      $(endif)

      <form name="login" action="$(link-login-only)" method="post">
        <input type="hidden" name="dst" value="$(link-orig)" />
        <input type="hidden" name="popup" value="true" />

        <div class="form-group">
          <label>Username</label>
          <input type="text" name="username" placeholder="Enter username or voucher code" value="$(username)" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" name="password" placeholder="Enter password" />
        </div>

        <button type="submit" class="btn">Connect Now</button>
      </form>

      <div class="footer">
        <p>Powered by <a href="#">SKYNITY</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;

export function TemplateEditor() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      toast.success('Template copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'login.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded as login.html');
  };

  const handleReset = () => {
    setTemplate(DEFAULT_TEMPLATE);
    toast.success('Template reset to default');
  };

  const getPreviewHtml = () => {
    return template
      .replace(/\$\(link-login-only\)/g, '#')
      .replace(/\$\(link-orig\)/g, 'http://example.com')
      .replace(/\$\(username\)/g, 'demo_user')
      .replace(/\$\(if error\)/g, '')
      .replace(/\$\(endif\)/g, '')
      .replace(/\$\(error\)/g, '');
  };

  const variables = [
    { name: '$(username)', desc: 'Current username value' },
    { name: '$(password)', desc: 'Current password value' },
    { name: '$(link-login)', desc: 'Full login URL' },
    { name: '$(link-login-only)', desc: 'Login action URL' },
    { name: '$(link-orig)', desc: 'Original requested URL' },
    { name: '$(link-logout)', desc: 'Logout URL' },
    { name: '$(error)', desc: 'Error message text' },
    { name: '$(if error)...$(endif)', desc: 'Conditional error block' },
    { name: '$(uptime-limit)', desc: 'Session time limit' },
    { name: '$(bytes-in)', desc: 'Downloaded bytes' },
    { name: '$(bytes-out)', desc: 'Uploaded bytes' },
    { name: '$(session-time-left)', desc: 'Remaining session time' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Template Editor</h1>
          <p className="text-muted-foreground">Customize the MikroTik hotspot login page</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
          <Button variant="secondary" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-5 h-5 mr-2" />
            {showPreview ? 'Editor' : 'Preview'}
          </Button>
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor / Preview */}
        <div className="lg:col-span-2">
          {showPreview ? (
            <Card className="h-[700px] overflow-hidden">
              <CardHeader title="Live Preview" />
              <iframe
                srcDoc={getPreviewHtml()}
                className="w-full h-[630px] rounded-lg border border-border bg-white"
                title="Template Preview"
                sandbox="allow-scripts"
              />
            </Card>
          ) : (
            <Card className="h-[700px]">
              <CardHeader title="HTML Editor" subtitle="Edit the login page template" />
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full h-[610px] bg-input-background border border-border rounded-lg p-4 font-mono text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                spellCheck={false}
              />
            </Card>
          )}
        </div>

        {/* Variables Reference */}
        <div>
          <Card className="h-[700px] overflow-y-auto">
            <CardHeader title="MikroTik Variables" subtitle="Available template variables" />
            <div className="space-y-3">
              {variables.map((v) => (
                <div
                  key={v.name}
                  className="p-3 bg-input-background rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(v.name);
                    toast.success(`Copied ${v.name}`);
                  }}
                >
                  <code className="text-primary text-sm font-bold">{v.name}</code>
                  <p className="text-xs text-muted-foreground mt-1">{v.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-bold text-foreground mb-2">Upload Instructions</h4>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Download the template file</li>
                <li>Open WinBox and go to Files</li>
                <li>Navigate to hotspot folder</li>
                <li>Upload/replace login.html</li>
                <li>Clear browser cache and test</li>
              </ol>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
