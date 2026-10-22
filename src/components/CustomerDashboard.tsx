import React, { useState, useEffect } from 'react';
import { 
  Code, Download, Copy, Check, Lock, ShieldCheck, Clock, CheckCircle2, 
  AlertCircle, ExternalLink, RefreshCw, Terminal, Layers, FileText, User as UserIcon, X
} from 'lucide-react';
import { api } from '../services/api';
import type { Delivery, Order, User } from '../types/marketplace';

interface CustomerDashboardProps {
  currentUser: User;
  onRefreshUser: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  onRefreshUser,
}) => {
  const [activeTab, setActiveTab] = useState<'indicators' | 'downloads' | 'tv_access' | 'orders' | 'settings'>('indicators');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Source code viewer state
  const [viewingSource, setViewingSource] = useState<{
    deliveryId: string;
    productTitle: string;
    version: string;
    code: string;
    filename: string;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [tvUsernameInput, setTvUsernameInput] = useState(currentUser.tradingview_username || '');
  const [isUpdatingTv, setIsUpdatingTv] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [delRes, ordRes] = await Promise.all([
        api.getMyDeliveries(),
        api.getMyOrders(),
      ]);

      if (delRes.success) setDeliveries(delRes.deliveries);
      if (ordRes.success) setOrders(ordRes.orders);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch full Pine Script source code for uncompiled viewing
  const handleViewSourceCode = async (delivery: Delivery) => {
    try {
      const res = await api.getDeliverySourceCode(delivery.id);
      if (res.success) {
        setViewingSource({
          deliveryId: delivery.id,
          productTitle: res.product_title,
          version: res.version,
          code: res.pine_script_content,
          filename: res.filename,
        });
      } else {
        alert(res.error || 'Failed to load source code');
      }
    } catch (err: any) {
      alert('Error fetching code: ' + err.message);
    }
  };

  // Submit TradingView username for a specific delivery or user profile
  const handleSaveTvUsername = async (deliveryId?: string) => {
    if (!tvUsernameInput.trim()) return;
    setIsUpdatingTv(true);
    setUpdateMsg(null);

    try {
      if (deliveryId) {
        const res = await api.submitTvUsername(deliveryId, tvUsernameInput.trim());
        if (res.success) {
          setUpdateMsg(`TradingView username "${tvUsernameInput.trim()}" submitted for authorization!`);
          fetchData();
        }
      } else {
        const res = await api.updateProfile({ tradingview_username: tvUsernameInput.trim() });
        if (res.success) {
          setUpdateMsg('TradingView username updated across your active licenses.');
          onRefreshUser();
          fetchData();
        }
      }
    } catch (err: any) {
      setUpdateMsg('Error: ' + err.message);
    } finally {
      setIsUpdatingTv(false);
    }
  };

  const copySourceToClipboard = () => {
    if (!viewingSource) return;
    navigator.clipboard.writeText(viewingSource.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadPineFile = (deliveryId: string) => {
    const url = api.getDownloadUrl(deliveryId);
    window.open(url, '_blank');
  };

  return (
    <div className="w-full py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Header Card */}
      <div className="bg-[#101016]/90 backdrop-blur-xl border border-white/8 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider font-mono">
              Trader Dashboard & Licensed Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-zinc-400">
            Account: <strong className="text-zinc-200">{currentUser.email}</strong> • Role: <span className="uppercase text-red-400 font-mono">{currentUser.role}</span>
          </p>
        </div>

        {/* Quick Stats Pill Group */}
        <div className="flex items-center gap-3">
          <div className="bg-[#181824] border border-white/5 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block uppercase">Indicators</span>
            <span className="text-xl font-bold font-heading text-white">{deliveries.length}</span>
          </div>
          <div className="bg-[#181824] border border-white/5 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block uppercase">Orders</span>
            <span className="text-xl font-bold font-heading text-white">{orders.length}</span>
          </div>
          <div className="bg-[#181824] border border-white/5 rounded-2xl px-4 py-2.5 text-center">
            <span className="text-[10px] text-zinc-400 block uppercase">TV User</span>
            <span className="text-xs font-mono font-bold text-emerald-400 truncate max-w-[90px] block">
              {currentUser.tradingview_username || 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'indicators', label: 'My Indicators', count: deliveries.length },
          { id: 'downloads', label: 'Downloads & Pine Code' },
          { id: 'tv_access', label: 'TradingView Access' },
          { id: 'orders', label: 'Orders & Invoices', count: orders.length },
          { id: 'settings', label: 'Account Settings' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#ff2a3b] text-white shadow-md shadow-red-500/40 glow-pill'
                  : 'bg-[#121218] text-zinc-400 hover:text-white hover:bg-[#1a1a24] border border-white/5'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-black/30' : 'bg-white/10'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: My Indicators */}
      {activeTab === 'indicators' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-heading text-white">
              Your Purchased Indicators ({deliveries.length})
            </h3>
            <button
              onClick={fetchData}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Licenses</span>
            </button>
          </div>

          {deliveries.length === 0 ? (
            <div className="bg-[#101016] border border-white/5 rounded-3xl p-12 text-center space-y-3">
              <Code className="w-8 h-8 text-zinc-400 mx-auto" />
              <h4 className="text-base font-bold text-white">No active indicators found</h4>
              <p className="text-xs text-zinc-400">
                You haven't purchased any TradingView indicators yet or your payment is currently under verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliveries.map((del) => {
                const isOpenSource = del.delivery_type === 'source_download';
                return (
                  <div
                    key={del.id}
                    className="bg-[#101016]/90 backdrop-blur-xl border border-white/8 hover:border-red-500/30 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        {isOpenSource ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                            <Code className="w-3 h-3" /> Open-Source .pine
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-[10px] font-bold text-red-300">
                            <Lock className="w-3 h-3" /> TradingView Invite
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-zinc-400">
                          v{del.product_version || '1.0.0'}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white font-heading">
                        {del.product_title}
                      </h4>

                      {/* Status indicator */}
                      <div className="bg-[#161622] rounded-xl p-3 border border-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 text-[11px]">Access Status:</span>
                          {del.status === 'ready' && (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          )}
                          {del.status === 'access_granted' && (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> Access Active on TV
                            </span>
                          )}
                          {del.status === 'access_requested' && (
                            <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3" /> Verification Queued
                            </span>
                          )}
                          {del.status === 'awaiting_tv_username' && (
                            <span className="text-red-400 font-bold flex items-center gap-1 text-[11px]">
                              <AlertCircle className="w-3 h-3" /> Awaiting TV Username
                            </span>
                          )}
                        </div>

                        {del.tv_username && (
                          <div className="text-[11px] text-zinc-300 font-mono">
                            Username: <span className="text-white font-bold">{del.tv_username}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                      {isOpenSource ? (
                        <>
                          <button
                            onClick={() => handleViewSourceCode(del)}
                            className="flex-1 py-2 bg-[#1f1f2c] hover:bg-[#2b2b3d] text-white text-xs font-bold rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Terminal className="w-3.5 h-3.5 text-red-400" />
                            <span>Copy Pine Code</span>
                          </button>
                          <button
                            onClick={() => handleDownloadPineFile(del.id)}
                            className="p-2 bg-[#ff2a3b] hover:bg-[#e02434] text-white rounded-xl shadow-md transition-colors cursor-pointer"
                            title="Download .pine file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setActiveTab('tv_access')}
                          className="w-full py-2 bg-[#1f1f2c] hover:bg-[#2b2b3d] text-white text-xs font-bold rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                          <span>Manage TV Access</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Downloads & Pine Code */}
      {activeTab === 'downloads' && (
        <div className="space-y-6">
          <div className="bg-[#101016]/90 backdrop-blur-xl border border-white/8 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-400" />
              <span>Secure Pine Script v5 Code & Source Downloads</span>
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Every open-source indicator purchased through Aemeth is accompanied by full uncompiled Pine Script source code. Click <strong>View Code</strong> to copy syntax-highlighted code directly into your TradingView Pine Editor, or click <strong>Download File</strong> to save the <code>.pine</code> file locally.
            </p>

            <div className="space-y-3 pt-2">
              {deliveries.filter((d) => d.delivery_type === 'source_download').length === 0 ? (
                <div className="p-8 text-center bg-[#14141c] rounded-2xl text-xs text-zinc-400">
                  No open-source indicators owned yet.
                </div>
              ) : (
                deliveries
                  .filter((d) => d.delivery_type === 'source_download')
                  .map((del) => (
                    <div
                      key={del.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#14141c] rounded-2xl border border-white/5 gap-3"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{del.product_title}</h4>
                        <span className="text-[11px] font-mono text-zinc-400">
                          File: {del.product_slug}_v{del.product_version}.pine • Single-User Licensed
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewSourceCode(del)}
                          className="px-4 py-2 bg-[#1f1f2c] hover:bg-[#2b2b3d] text-white text-xs font-bold rounded-xl border border-white/10 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Terminal className="w-3.5 h-3.5 text-red-400" />
                          <span>View / Copy Code</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPineFile(del.id)}
                          className="px-4 py-2 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download .pine</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: TradingView Access Manager */}
      {activeTab === 'tv_access' && (
        <div className="space-y-6">
          <div className="bg-[#101016]/90 backdrop-blur-xl border border-white/8 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-400" />
                <span>TradingView Invite-Only Access Manager</span>
              </h3>
              <p className="text-xs text-zinc-400 max-w-2xl">
                Private indicators are authorized directly inside TradingView by our institutional publisher account.
              </p>
            </div>

            {/* TV Username update box */}
            <div className="bg-[#14141c] p-5 rounded-2xl border border-white/5 space-y-3 max-w-xl">
              <label className="text-xs font-bold text-zinc-200 block">
                Your TradingView Username
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tvUsernameInput}
                  onChange={(e) => setTvUsernameInput(e.target.value)}
                  placeholder="e.g. your_tv_username"
                  className="flex-1 bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 font-mono"
                />
                <button
                  onClick={() => handleSaveTvUsername()}
                  disabled={isUpdatingTv}
                  className="px-5 py-2.5 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingTv ? 'Saving...' : 'Update Username'}
                </button>
              </div>
              {updateMsg && (
                <div className="text-xs text-emerald-400 font-mono pt-1">
                  {updateMsg}
                </div>
              )}
            </div>

            {/* Indicator Access Status Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Protected Indicator Access Queue
              </h4>
              <div className="space-y-3">
                {deliveries.filter((d) => d.delivery_type === 'tradingview_access').length === 0 ? (
                  <div className="p-8 text-center bg-[#14141c] rounded-2xl text-xs text-zinc-400">
                    No private indicators owned yet.
                  </div>
                ) : (
                  deliveries
                    .filter((d) => d.delivery_type === 'tradingview_access')
                    .map((del) => (
                      <div
                        key={del.id}
                        className="p-4 bg-[#14141c] rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-white">{del.product_title}</h5>
                          <div className="text-xs text-zinc-400 flex items-center gap-2">
                            <span>TradingView Script ID: <strong className="text-zinc-200 font-mono">{del.tradingview_script_id}</strong></span>
                            <span>•</span>
                            <span>Target Username: <strong className="text-white font-mono">{del.tv_username || 'Not submitted'}</strong></span>
                          </div>
                        </div>

                        <div>
                          {del.status === 'access_granted' ? (
                            <span className="px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Access Active on TradingView
                            </span>
                          ) : del.status === 'access_requested' ? (
                            <span className="px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> Pending Publisher Approval
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSaveTvUsername(del.id)}
                              className="px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold hover:bg-red-900/50 cursor-pointer"
                            >
                              Submit TV Username
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* How to add to chart instructions */}
            <div className="p-5 rounded-2xl bg-[#14141c] border border-white/5 space-y-2 text-xs">
              <span className="font-bold text-white block">
                How to load your approved indicator in TradingView:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                <li>Open any TradingView chart (desktop or web app).</li>
                <li>Click the <strong>Indicators (Indicators, Metrics & Strategies)</strong> button at the top.</li>
                <li>In the left sidebar, click on <strong>Invite-Only Scripts</strong>.</li>
                <li>Click your approved Aemeth indicator to immediately apply it to your chart.</li>
              </ol>
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Orders & Invoices */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-heading text-white">
            Order History & Transaction Receipts ({orders.length})
          </h3>
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="p-5 bg-[#101016]/90 backdrop-blur-xl border border-white/8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{o.order_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      o.status === 'paid' ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Payment Method: <span className="uppercase text-zinc-200">{o.payment_method.replace('_', ' ')}</span> • Date: {new Date(o.created_at).toLocaleDateString()}
                  </div>
                  {o.items && (
                    <div className="text-xs text-zinc-300 pt-1">
                      Items: {o.items.map((i) => i.product_title).join(', ')}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block">Total</span>
                    <span className="text-base font-bold font-mono text-white">
                      ${(o.total_cents / 100).toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Account Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl bg-[#101016]/90 backdrop-blur-xl border border-white/8 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-red-400" />
            <span>Profile & Account Credentials</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">Full Name</label>
              <div className="p-3 bg-[#161622] rounded-xl text-white font-medium">{currentUser.name}</div>
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Registered Email</label>
              <div className="p-3 bg-[#161622] rounded-xl text-white font-mono">{currentUser.email}</div>
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">TradingView Username</label>
              <div className="p-3 bg-[#161622] rounded-xl text-emerald-400 font-mono font-bold">
                {currentUser.tradingview_username || 'Not configured'}
              </div>
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Account Role</label>
              <div className="p-3 bg-[#161622] rounded-xl text-red-400 uppercase font-mono font-bold">
                {currentUser.role}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pine Script Code Modal (Interactive uncompiled viewer with one-click copy) */}
      {viewingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#09090e] border border-red-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-red-950/70 my-8 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12121a]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-400" />
                <span className="font-mono text-xs font-bold text-white">
                  {viewingSource.filename}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  (Pine Script v5)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copySourceToClipboard}
                  className="px-4 py-1.5 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadPineFile(viewingSource.deliveryId)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .pine</span>
                </button>

                <button
                  onClick={() => setViewingSource(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="p-6 overflow-y-auto font-mono text-xs text-zinc-200 bg-[#06060a] leading-relaxed selection:bg-red-500/40">
              <pre className="whitespace-pre-wrap">{viewingSource.code}</pre>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
