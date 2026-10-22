import React, { useState, useEffect } from 'react';
import { 
  Shield, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, 
  Layers, Lock, Code, Eye, RefreshCw, Check, Plus, Settings, FileText, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import type { User, Product } from '../types/marketplace';

interface AdminDashboardProps {
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'orders' | 'tv_access' | 'products' | 'audit' | 'settings'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [tvRequests, setTvRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Form state for creating product
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newLongDesc, setNewLongDesc] = useState('');
  const [newType, setNewType] = useState('open_source');
  const [newCategory, setNewCategory] = useState('liquidity');
  const [newPriceUsd, setNewPriceUsd] = useState('89');
  const [newVersion, setNewVersion] = useState('1.0.0');
  const [newPineCode, setNewPineCode] = useState('');
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [metRes, ordRes, tvRes, audRes, setRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminOrders(),
        api.getTvAccessRequests(),
        api.getAuditLogs(),
        api.getAdminSettings(),
      ]);

      if (metRes.success) setMetrics(metRes.metrics);
      if (ordRes.success) setOrders(ordRes.orders);
      if (tvRes.success) setTvRequests(tvRes.requests);
      if (audRes.success) setAuditLogs(audRes.logs);
      if (setRes.success) setSettings(setRes.settings);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveOrder = async (orderId: string) => {
    if (!confirm('Approve this order and provision digital delivery to the customer?')) return;
    try {
      const res = await api.approveOrder(orderId, 'Verified payment proof');
      if (res.success) {
        alert(res.message);
        fetchAdminData();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt('Enter reason for payment rejection (e.g. Invalid transfer receipt, Underpaid):');
    if (!reason) return;
    try {
      const res = await api.rejectOrder(orderId, reason);
      if (res.success) {
        alert(res.message);
        fetchAdminData();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleTvAccessAction = async (deliveryId: string, action: 'grant' | 'reject' | 'revoke') => {
    try {
      const res = await api.actionTvAccess(deliveryId, action);
      if (res.success) {
        alert(res.message);
        fetchAdminData();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg(null);
    try {
      const res = await api.createProduct({
        title: newTitle,
        slug: newSlug || newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        short_desc: newShortDesc,
        long_desc: newLongDesc,
        type: newType,
        category: newCategory,
        price_cents: Math.round(parseFloat(newPriceUsd) * 100),
        version: newVersion,
        features: ['Institutional Quantitative Algorithm', 'Zero-Repaint Candle 1 Directive', 'Lifetime Updates'],
        initial_pine_code: newPineCode,
      });

      if (res.success) {
        setCreateMsg('Product created successfully!');
        setIsCreatingProduct(false);
        fetchAdminData();
      } else {
        setCreateMsg('Error: ' + res.error);
      }
    } catch (err: any) {
      setCreateMsg('Error: ' + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateAdminSettings(settings);
      if (res.success) {
        alert('Settings updated successfully!');
        fetchAdminData();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="w-full py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="bg-[#12121c]/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Institutional Admin Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Marketplace Command & Fulfillment
          </h1>
          <p className="text-xs text-zinc-400">
            Logged in as <strong className="text-zinc-200">{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-full border border-white/10 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Metrics' },
          { id: 'orders', label: 'Orders & Payments', count: metrics?.pendingReviewCount },
          { id: 'tv_access', label: 'TradingView Access Queue', count: metrics?.pendingTvAccessCount },
          { id: 'products', label: 'Products & Pine Scripts' },
          { id: 'audit', label: 'Audit Logs' },
          { id: 'settings', label: 'Payment Settings' },
        ].map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-black shadow-md font-extrabold'
                  : 'bg-[#121218] text-zinc-400 hover:text-white hover:bg-[#1a1a24] border border-white/5'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-black text-amber-400' : 'bg-red-500 text-white'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section 1: Overview */}
      {activeSection === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#101016] border border-white/8 rounded-3xl p-6 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Verified Revenue (USD)
              </span>
              <div className="text-3xl font-extrabold font-heading text-emerald-400">
                ${metrics.totalRevenueUsd}
              </div>
              <span className="text-[10px] text-zinc-400 block pt-1">
                Strictly completed payments only
              </span>
            </div>

            <div className="bg-[#101016] border border-white/8 rounded-3xl p-6 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Pending Payment Reviews
              </span>
              <div className={`text-3xl font-extrabold font-heading ${metrics.pendingReviewCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                {metrics.pendingReviewCount}
              </div>
              <span className="text-[10px] text-zinc-400 block pt-1">
                Awaiting manual bank/crypto verification
              </span>
            </div>

            <div className="bg-[#101016] border border-white/8 rounded-3xl p-6 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Pending TradingView Invites
              </span>
              <div className={`text-3xl font-extrabold font-heading ${metrics.pendingTvAccessCount > 0 ? 'text-red-400' : 'text-white'}`}>
                {metrics.pendingTvAccessCount}
              </div>
              <span className="text-[10px] text-zinc-400 block pt-1">
                Customers awaiting script access grant
              </span>
            </div>

            <div className="bg-[#101016] border border-white/8 rounded-3xl p-6 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Active Deliveries
              </span>
              <div className="text-3xl font-extrabold font-heading text-white">
                {metrics.totalDeliveriesCount}
              </div>
              <span className="text-[10px] text-zinc-400 block pt-1">
                Scripts & invite licenses issued
              </span>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-[#101016] border border-white/8 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold font-heading text-white">Recent 10 Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono">
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Customer Email</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {metrics.recentOrders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-white">{o.order_number}</td>
                      <td className="py-3 px-3 text-zinc-300">{o.customer_email}</td>
                      <td className="py-3 px-3 font-mono font-bold text-white">${(o.total_cents / 100).toFixed(2)}</td>
                      <td className="py-3 px-3 uppercase text-zinc-400 font-mono text-[11px]">{o.payment_method}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          o.status === 'paid' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Orders & Payment Review */}
      {activeSection === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-heading text-white">
              All Orders & Manual Verification Queue ({orders.length})
            </h3>
          </div>

          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-[#101016] border border-white/8 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{o.order_number}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      o.status === 'paid'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : o.status === 'verifying'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {o.status}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Payment Status: <strong className="text-zinc-200">{o.payment_status || 'unpaid'}</strong>
                    </span>
                  </div>

                  <div className="text-xs text-zinc-300">
                    Customer: <strong className="text-white">{o.customer_email}</strong> • TV Username: <span className="font-mono text-emerald-400">{o.customer_tv_username || 'N/A'}</span>
                  </div>

                  {o.items && (
                    <div className="text-xs text-zinc-400">
                      Purchased: {o.items.map((i: any) => `${i.product_title} ($${(i.unit_price_cents / 100).toFixed(0)})`).join(', ')}
                    </div>
                  )}

                  {o.proof_data && (
                    <div className="text-xs bg-[#161622] p-2.5 rounded-xl border border-white/5 font-mono text-zinc-300 max-w-xl break-all">
                      Proof / Notes: {o.proof_data}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block font-mono">Amount</span>
                    <span className="text-lg font-bold font-mono text-white">
                      ${(o.total_cents / 100).toFixed(2)}
                    </span>
                  </div>

                  {o.status !== 'paid' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveOrder(o.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-md"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve & Fulfill</span>
                      </button>
                      <button
                        onClick={() => handleRejectOrder(o.id)}
                        className="px-3 py-2 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-300 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: TradingView Access Queue */}
      {activeSection === 'tv_access' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-heading text-white">
              TradingView Invite-Only Access Queue ({tvRequests.length})
            </h3>
          </div>

          <div className="space-y-3">
            {tvRequests.map((req) => (
              <div
                key={req.delivery_id}
                className="bg-[#101016] border border-white/8 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white font-heading">{req.product_title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      req.status === 'access_granted'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-300">
                    Customer: <strong className="text-white">{req.customer_name}</strong> ({req.customer_email}) • Order: <span className="font-mono">{req.order_number}</span>
                  </div>

                  <div className="text-xs text-zinc-400 font-mono">
                    TradingView Script ID: <strong className="text-zinc-200">{req.tradingview_script_id}</strong>
                  </div>

                  <div className="text-xs text-emerald-400 font-mono font-bold pt-1">
                    Target Username to Authorize: <span className="bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300 text-sm">{req.tv_username || 'Awaiting customer submission'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {req.status !== 'access_granted' ? (
                    <button
                      onClick={() => handleTvAccessAction(req.delivery_id, 'grant')}
                      disabled={!req.tv_username}
                      className="px-4 py-2 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Grant Access on TradingView</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTvAccessAction(req.delivery_id, 'revoke')}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-xl cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Products & Create Product */}
      {activeSection === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-heading text-white">
              Product & Script Management
            </h3>
            <button
              onClick={() => setIsCreatingProduct(!isCreatingProduct)}
              className="px-4 py-2 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingProduct ? 'Cancel' : 'Create New Indicator'}</span>
            </button>
          </div>

          {isCreatingProduct && (
            <form onSubmit={handleCreateProductSubmit} className="bg-[#101016] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
              <h4 className="text-base font-bold text-white font-heading">
                Publish New Pine Script Indicator
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Indicator Title *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Aemeth Momentum Matrix"
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="aemeth-momentum-matrix"
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Delivery Type *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="open_source">Open-Source (.pine uncompiled code)</option>
                    <option value="private_protected">TradingView Invite-Only (Protected)</option>
                    <option value="bundle">Bundle (Multi-Product Suite)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="liquidity">Liquidity & Order Flow</option>
                    <option value="volume">Volume Delta</option>
                    <option value="trend">Trend Cascade</option>
                    <option value="reversal">Reversal Sniper</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Price (USD) *</label>
                  <input
                    type="number"
                    value={newPriceUsd}
                    onChange={(e) => setNewPriceUsd(e.target.value)}
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Short Description</label>
                <input
                  type="text"
                  value={newShortDesc}
                  onChange={(e) => setNewShortDesc(e.target.value)}
                  placeholder="One sentence summary for catalog cards"
                  className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Detailed Technical Specifications</label>
                <textarea
                  value={newLongDesc}
                  onChange={(e) => setNewLongDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#181824] border border-white/10 rounded-xl p-3 text-xs text-white"
                  placeholder="Comprehensive explanation of algorithmic methodology, markets, and timeframes..."
                />
              </div>

              {newType === 'open_source' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-mono">
                    Paste Pine Script v5 Codebase (Encrypted & Stored in Private Vault)
                  </label>
                  <textarea
                    value={newPineCode}
                    onChange={(e) => setNewPineCode(e.target.value)}
                    rows={6}
                    placeholder="//@version=5&#10;indicator('Aemeth...', overlay=true)&#10;..."
                    className="w-full bg-[#08080c] border border-white/10 rounded-xl p-3 text-xs text-zinc-200 font-mono"
                  />
                </div>
              )}

              {createMsg && (
                <div className="text-xs text-emerald-400 font-mono">{createMsg}</div>
              )}

              <button
                type="submit"
                className="px-6 py-3 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-full cursor-pointer shadow-lg"
              >
                Publish Indicator to Marketplace
              </button>
            </form>
          )}
        </div>
      )}

      {/* Section 5: Audit Logs */}
      {activeSection === 'audit' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-heading text-white">
            Security & Administration Audit Trail ({auditLogs.length})
          </h3>
          <div className="bg-[#101016] border border-white/8 rounded-3xl p-6 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Admin</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target Entity</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-zinc-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-amber-400 font-bold">{log.admin_name}</td>
                    <td className="py-3 px-3 text-white font-bold">{log.action}</td>
                    <td className="py-3 px-3 text-zinc-400">{log.target_entity}</td>
                    <td className="py-3 px-3 text-zinc-300 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 6: Payment Settings */}
      {activeSection === 'settings' && (
        <div className="max-w-2xl bg-[#101016] border border-white/8 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Marketplace Banking & Wallet Addresses</span>
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="space-y-3">
              <span className="font-bold text-zinc-200 block uppercase font-mono">
                Bank Transfer Configuration
              </span>
              <div>
                <label className="text-zinc-400 block mb-1">BCA Account Number</label>
                <input
                  type="text"
                  value={settings.bank_bca_account || ''}
                  onChange={(e) => setSettings({ ...settings, bank_bca_account: e.target.value })}
                  className="w-full bg-[#181824] border border-white/10 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Mandiri Account Number</label>
                <input
                  type="text"
                  value={settings.bank_mandiri_account || ''}
                  onChange={(e) => setSettings({ ...settings, bank_mandiri_account: e.target.value })}
                  className="w-full bg-[#181824] border border-white/10 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/5">
              <span className="font-bold text-zinc-200 block uppercase font-mono">
                Crypto Receiving Wallets
              </span>
              <div>
                <label className="text-zinc-400 block mb-1">USDT (TRC-20) Address</label>
                <input
                  type="text"
                  value={settings.crypto_usdt_trc20 || ''}
                  onChange={(e) => setSettings({ ...settings, crypto_usdt_trc20: e.target.value })}
                  className="w-full bg-[#181824] border border-white/10 rounded-xl p-2.5 text-emerald-400 font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">USDT (ERC-20) Address</label>
                <input
                  type="text"
                  value={settings.crypto_usdt_erc20 || ''}
                  onChange={(e) => setSettings({ ...settings, crypto_usdt_erc20: e.target.value })}
                  className="w-full bg-[#181824] border border-white/10 rounded-xl p-2.5 text-emerald-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-full cursor-pointer shadow-lg"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
