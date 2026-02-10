import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Download, Ticket } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';

interface Voucher {
  id: string;
  code: string;
  profile: string;
  bandwidth: string;
  validity: string;
  used: boolean;
  createdAt: string;
}

export function VoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    count: 10,
    profile: '1Hour',
    bandwidth: '2M/2M',
    validity: '1 Day',
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await apiRequest('/vouchers');
      if (response.success) {
        setVouchers(response.data);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast.error('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVouchers = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest('/vouchers/generate', {
        method: 'POST',
        body: JSON.stringify({
          count: formData.count,
          template: {
            profile: formData.profile,
            bandwidth: formData.bandwidth,
            validity: formData.validity,
          },
        }),
      });
      
      if (response.success) {
        toast.success(`Generated ${formData.count} vouchers successfully`);
        setShowGenerateModal(false);
        fetchVouchers();
      }
    } catch (error) {
      console.error('Error generating vouchers:', error);
      toast.error('Failed to generate vouchers');
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this voucher?')) return;
    
    try {
      await apiRequest(`/vouchers/${id}`, { method: 'DELETE' });
      toast.success('Voucher deleted successfully');
      fetchVouchers();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error('Failed to delete voucher');
    }
  };

  const escapeHtml = (str: string) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const printVouchers = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const unusedVouchers = vouchers.filter(v => !v.used);

    printWindow.document.write(`
      <html>
        <head>
          <title>Voucher Codes</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .voucher {
              border: 2px dashed #8B5CF6;
              padding: 15px;
              margin: 10px 0;
              page-break-inside: avoid;
              border-radius: 8px;
            }
            .code {
              font-size: 24px;
              font-weight: bold;
              color: #8B5CF6;
              letter-spacing: 2px;
            }
            .details { font-size: 12px; color: #666; margin-top: 8px; }
            @media print {
              .voucher { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>SKYNITY Hotspot Vouchers</h1>
          ${unusedVouchers.map(v => `
            <div class="voucher">
              <div class="code">${escapeHtml(v.code)}</div>
              <div class="details">
                <div>Profile: ${escapeHtml(v.profile)}</div>
                <div>Bandwidth: ${escapeHtml(v.bandwidth)}</div>
                <div>Valid for: ${escapeHtml(v.validity)}</div>
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const unusedCount = vouchers.filter(v => !v.used).length;
  const usedCount = vouchers.filter(v => v.used).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vouchers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Voucher Management</h1>
          <p className="text-muted-foreground">Generate and manage voucher codes</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={printVouchers}
            disabled={unusedCount === 0}
            className="flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print Vouchers
          </Button>
          <Button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate Vouchers
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Vouchers</p>
              <p className="text-3xl font-bold text-foreground">{vouchers.length}</p>
            </div>
            <Ticket className="w-12 h-12 text-primary" />
          </div>
        </Card>
        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Unused Vouchers</p>
              <p className="text-3xl font-bold text-secondary">{unusedCount}</p>
            </div>
            <Ticket className="w-12 h-12 text-secondary" />
          </div>
        </Card>
        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Used Vouchers</p>
              <p className="text-3xl font-bold text-accent">{usedCount}</p>
            </div>
            <Ticket className="w-12 h-12 text-accent" />
          </div>
        </Card>
      </div>

      {/* Vouchers Grid */}
      <Card>
        <CardHeader title="Voucher Codes" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className={`border-2 border-dashed rounded-lg p-4 ${
                voucher.used 
                  ? 'border-muted bg-muted/10' 
                  : 'border-primary bg-primary/5'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="font-mono text-2xl font-bold tracking-wider text-primary">
                  {voucher.code}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteVoucher(voucher.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profile:</span>
                  <span className="text-foreground font-medium">{voucher.profile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bandwidth:</span>
                  <span className="text-foreground font-medium">{voucher.bandwidth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validity:</span>
                  <span className="text-foreground font-medium">{voucher.validity}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${
                    voucher.used ? 'text-destructive' : 'text-secondary'
                  }`}>
                    {voucher.used ? 'Used' : 'Available'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {vouchers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No vouchers generated</h3>
              <p className="text-muted-foreground mb-4">Generate your first batch of vouchers</p>
              <Button onClick={() => setShowGenerateModal(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Generate Vouchers
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Generate Vouchers Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader title="Generate Vouchers" />
            <form onSubmit={handleGenerateVouchers} className="space-y-4">
              <Input
                label="Number of Vouchers"
                type="number"
                min="1"
                max="1000"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Profile / Time Limit
                </label>
                <select
                  value={formData.profile}
                  onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1Hour">1 Hour</option>
                  <option value="3Hours">3 Hours</option>
                  <option value="1Day">1 Day</option>
                  <option value="1Week">1 Week</option>
                  <option value="1Month">1 Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bandwidth Limit
                </label>
                <select
                  value={formData.bandwidth}
                  onChange={(e) => setFormData({ ...formData, bandwidth: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1M/1M">1 Mbps</option>
                  <option value="2M/2M">2 Mbps</option>
                  <option value="5M/5M">5 Mbps</option>
                  <option value="10M/10M">10 Mbps</option>
                  <option value="Unlimited">Unlimited</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Valid For
                </label>
                <select
                  value={formData.validity}
                  onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1 Day">1 Day</option>
                  <option value="3 Days">3 Days</option>
                  <option value="1 Week">1 Week</option>
                  <option value="1 Month">1 Month</option>
                  <option value="Never">Never Expires</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Generate</Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
