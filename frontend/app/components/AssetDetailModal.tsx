'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Trash2,
  ShieldCheck,
  X,
  AlertCircle,
  Home,
  MapPin,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Layers,
  Lock
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';

interface Asset {
  id: string;
  name: string;
  type: string;
  buy_price: number;
  current_value: number;
  annual_cash_flow?: number;
  maintenance_cost?: number;
  age_acquired?: number;
}

interface MarketAsset {
  id: string;
  tier: number;
  tier_label: string;
  type: string;
  icon?: string;
  name: string;
  cost: number;
  cash_flow: number;
  maintenance: number;
  ap_cost: number;
  desc: string;
  risk_level?: string;
}

interface HousingTier {
  tier: number;
  id: string;
  name: string;
  rent_per_year: number;
  buy_price?: number;
  min_wealth: number;
  happiness_bonus: number;
  health_bonus: number;
  description: string;
}

interface AssetDetailModalProps {
  assets: Asset[];
  cash: number;
  actionPoints: number;
  character?: any;
  onBuyAsset: (assetData: {
    name: string;
    type: string;
    cost: number;
    cash_flow: number;
    maintenance: number;
    apCost: number;
  }) => Promise<void>;
  onSellAsset: (assetId: string) => Promise<void>;
  onUpgradeHousing?: (targetTier: number) => Promise<string>;
  onClose: () => void;
}

export default function AssetDetailModal({
  assets,
  cash,
  actionPoints,
  character,
  onBuyAsset,
  onSellAsset,
  onUpgradeHousing,
  onClose
}: AssetDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'market' | 'housing'>('portfolio');
  const [marketAssets, setMarketAssets] = useState<MarketAsset[]>([]);
  const [housingTiers, setHousingTiers] = useState<HousingTier[]>([]);
  const [selectedTierFilter, setSelectedTierFilter] = useState<number | 'all'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const age = Number(character?.age ?? 0);
  const isMinor = age < 18; // Dưới 18 tuổi: Chưa có tư cách pháp nhân giao dịch tài sản
  const nationality = character?.nationality || "Việt Nam";
  const currentCity = character?.current_city || (nationality === "Việt Nam" ? "Hà Nội" : nationality);
  const currentHousing = character?.housing || {
    tier: 1,
    name: "Phòng trọ / Mái ấm gia đình",
    address: `Khu dân cư, ${currentCity}`,
    status: "rented"
  };

  // Fetch bigdata market assets & housing tiers from backend
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await fetch('/api/game/market/assets');
        if (res.ok) {
          const data = await res.json();
          if (data.market_assets) setMarketAssets(data.market_assets);
          if (data.housing_tiers) setHousingTiers(data.housing_tiers);
        }
      } catch (err) {
        console.error("Failed to load BigData market assets", err);
      }
    };
    fetchMarketData();
  }, []);

  const totalValue = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
  const totalCashFlow = assets.reduce((sum, a: any) => sum + Number(a.annual_cash_flow || a.cash_flow || 0), 0);
  const totalMaintenance = assets.reduce((sum, a: any) => sum + Number(a.maintenance_cost || a.maintenance_cost_per_tick || 0), 0);
  const netAnnualFlow = totalCashFlow - totalMaintenance;

  // Helper render tiền tệ gọn gàng, cân đối chữ to chữ nhỏ
  const renderMoney = (usd: number, showSign: boolean = false) => {
    const c = formatCurrency(usd, nationality);
    const sign = showSign && usd > 0 ? "+" : "";
    return (
      <span className="inline-flex items-baseline gap-1">
        <span className="font-mono font-bold">{sign}{c.primary}</span>
        <span className="text-[10px] text-slate-400 font-sans font-normal">{c.secondaryVnd}</span>
      </span>
    );
  };

  const handleBuy = async (item: MarketAsset) => {
    if (isMinor) {
      setErrorMsg(`Bạn đang trong độ tuổi vị thành niên (${age} tuổi). Chưa đủ 18 tuổi để mở tài khoản chứng khoán hoặc đứng tên tài sản!`);
      return;
    }
    if (cash < item.cost) {
      setErrorMsg(`Không đủ tiền mặt! (Cần ${formatCurrency(item.cost, nationality).primary})`);
      return;
    }
    if (actionPoints < item.ap_cost) {
      setErrorMsg(`Không đủ Điểm Hành Động! (Cần ${item.ap_cost} AP)`);
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setLoadingId(item.id);
      await onBuyAsset({
        name: item.name,
        type: item.type,
        cost: item.cost,
        cash_flow: item.cash_flow,
        maintenance: item.maintenance,
        apCost: item.ap_cost
      });
      setSuccessMsg(`Đã giải ngân đầu tư thành công: ${item.name}!`);
    } catch (err: any) {
      setErrorMsg(err.message || "Giao dịch mua thất bại.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSell = async (assetId: string) => {
    if (isMinor) {
      setErrorMsg(`Bạn chưa đủ 18 tuổi để tự ý thanh lý tài sản gia đình!`);
      return;
    }
    if (actionPoints < 1) {
      setErrorMsg("Cần ít nhất 1 AP để thực hiện thủ tục thanh lý tài sản!");
      return;
    }
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setLoadingId(assetId);
      await onSellAsset(assetId);
      setSuccessMsg("Đã thanh lý tài sản và thu hồi vốn thành công.");
    } catch (err: any) {
      setErrorMsg(err.message || "Bán thanh lý thất bại.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpgradeHome = async (targetTier: number) => {
    if (isMinor) {
      setErrorMsg(`Bạn đang ${age} tuổi, nơi cư trú phụ thuộc vào gia đình và người giám hộ!`);
      return;
    }
    if (!onUpgradeHousing) return;
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setLoadingId(`housing_${targetTier}`);
      const msg = await onUpgradeHousing(targetTier);
      setSuccessMsg(msg || "Nâng cấp nơi cư trú thành công!");
    } catch (err: any) {
      setErrorMsg(err.message || "Nâng cấp nơi cư trú thất bại.");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredAssets = selectedTierFilter === 'all'
    ? marketAssets
    : marketAssets.filter(a => a.tier === selectedTierFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Header: Kích thước tinh gọn, cân đối */}
        <div className="flex items-center gap-3 mb-3.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Building2 className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
                Quản Trị Tài Sản & Nơi Cư Trú
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Thị Trường {nationality}
              </span>
              {isMinor && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Vị Thành Niên ({age}T)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              Định vị: <strong className="text-slate-300 font-medium">{currentCity}</strong> • Quản lý danh mục đầu tư tích lũy và điều kiện sinh hoạt
            </p>
          </div>
        </div>

        {/* 2. Banner Cảnh Báo Vị Thành Niên (Nếu dưới 18 tuổi) */}
        {isMinor && (
          <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Quy Chế Pháp Lý ({age} Tuổi): </span>
              <span>
                Bạn chưa đủ 18 tuổi để có tư cách pháp nhân mở tài khoản chứng khoán, đứng tên vàng hay mua bất động sản. Tiền mặt hiện do gia đình/người giám hộ quản lý. Sàn giao dịch sẽ mở khóa hoàn toàn khi bạn tròn <strong>18 tuổi</strong>.
              </span>
            </div>
          </div>
        )}

        {/* 3. Overview Stats Bar: Bố cục chữ to chữ nhỏ hài hòa */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Tổng Giá Trị Tài Sản</span>
            <div className="text-sm md:text-base text-emerald-400 mt-0.5">
              {renderMoney(totalValue)}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Dòng Tiền Thuần / Năm</span>
            <div className={`text-sm md:text-base mt-0.5 ${netAnnualFlow >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
              {renderMoney(netAnnualFlow, true)}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Nguồn Lực Hiện Có</span>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
              <span>Tiền: {renderMoney(cash)}</span>
              <span>•</span>
              <span>AP: <strong className="text-amber-400 font-mono">{actionPoints}</strong></span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-2.5 p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-2.5 p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 mb-2.5 gap-2">
          <button
            onClick={() => { setActiveTab('portfolio'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'portfolio'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Tài Sản Sở Hữu ({assets.length})
          </button>
          <button
            onClick={() => { setActiveTab('market'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'market'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sàn Đầu Tư Thị Trường ({marketAssets.length})
          </button>
          <button
            onClick={() => { setActiveTab('housing'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'housing'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Không Gian Cư Trú (Nơi Ở)
          </button>
        </div>

        {/* Tier Filter Pills in Market */}
        {activeTab === 'market' && (
          <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none text-[11px]">
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
              <Layers className="w-3 h-3 text-indigo-400" /> Cấp Vốn:
            </span>
            {[
              { id: 'all', label: `Tất Cả (${marketAssets.length})` },
              { id: 1, label: 'Vi Mô ($500+)' },
              { id: 2, label: 'Tăng Trưởng ($5k+)' },
              { id: 3, label: 'Dòng Tiền ($50k+)' },
              { id: 4, label: 'Thượng Lưu ($300k+)' },
              { id: 5, label: 'Đế Chế ($2M+)' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setSelectedTierFilter(pill.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition ${
                  selectedTierFilter === pill.id
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {/* TAB 1: PORTFOLIO */}
          {activeTab === 'portfolio' && (
            assets.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs md:text-sm font-medium">Bạn chưa sở hữu tài sản nào.</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isMinor
                    ? `Hiện tại bạn đang ${age} tuổi. Hãy rèn luyện kỹ năng và học tập, khi đủ 18 tuổi bạn sẽ có thể tham gia đầu tư!`
                    : `Hãy chuyển sang tab "Sàn Đầu Tư Thị Trường" để mua cổ phiếu, vàng hoặc bất động sản tại ${currentCity}!`}
                </p>
              </div>
            ) : (
              assets.map(asset => (
                <div
                  key={asset.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-semibold text-white">{asset.name}</h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5 flex-wrap">
                        <span>Giá trị: <strong className="text-emerald-300">{renderMoney(asset.current_value)}</strong></span>
                        {Number((asset as any).annual_cash_flow || (asset as any).cash_flow || 0) > 0 && (
                          <span className="text-teal-400">Thu về: {renderMoney(Number((asset as any).annual_cash_flow || (asset as any).cash_flow), true)}/năm</span>
                        )}
                        {Number((asset as any).maintenance_cost || (asset as any).maintenance_cost_per_tick || 0) > 0 && (
                          <span className="text-rose-400">Bảo trì: -{renderMoney(Number((asset as any).maintenance_cost || (asset as any).maintenance_cost_per_tick))}/năm</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={loadingId === asset.id || isMinor || actionPoints < 1}
                    onClick={() => handleSell(asset.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-40 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Bán (-1 AP)
                  </button>
                </div>
              ))
            )
          )}

          {/* TAB 2: MARKET BIGDATA */}
          {activeTab === 'market' && (
            filteredAssets.map(item => {
              const canAfford = cash >= item.cost;
              const hasAp = actionPoints >= item.ap_cost;

              let buttonLabel = "Đầu Tư Ngay";
              let isDisabled = loadingId === item.id;

              if (isMinor) {
                buttonLabel = "Khóa (<18T)";
                isDisabled = true;
              } else if (!canAfford) {
                buttonLabel = "Thiếu Tiền";
                isDisabled = true;
              } else if (!hasAp) {
                buttonLabel = `Cần ${item.ap_cost} AP`;
                isDisabled = true;
              }

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base">{item.icon || '💼'}</span>
                      <h4 className="text-xs md:text-sm font-semibold text-white truncate">{item.name}</h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {item.tier_label}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {item.ap_cost} AP
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
                    <div className="text-[11px] text-slate-300 flex items-center gap-3.5 mt-1.5 flex-wrap">
                      <span>Giá: <strong className="text-emerald-400">{renderMoney(item.cost)}</strong></span>
                      {item.cash_flow > 0 && (
                        <span className="text-teal-400">Lợi tức: {renderMoney(item.cash_flow, true)}/năm</span>
                      )}
                      {item.maintenance > 0 && (
                        <span className="text-rose-400">Bảo trì: -{renderMoney(item.maintenance)}/năm</span>
                      )}
                      {item.risk_level && (
                        <span className="text-slate-400 text-[10px]">Rủi ro: <strong className="text-slate-300">{item.risk_level}</strong></span>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={isDisabled}
                    onClick={() => handleBuy(item)}
                    className={`px-3.5 py-2 rounded-xl font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0 ${
                      isMinor || !canAfford || !hasAp
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    }`}
                  >
                    {isMinor ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <PlusCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{buttonLabel}</span>
                  </button>
                </div>
              );
            })
          )}

          {/* TAB 3: HOUSING */}
          {activeTab === 'housing' && (
            <div className="space-y-3">
              {/* Current Residence Spotlight */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      Nơi Ở Hiện Tại ({currentHousing.status === 'owned' ? 'Chính Chủ' : isMinor ? 'Gia Đình Giám Hộ' : 'Thuê Nhà'})
                    </div>
                    <h3 className="text-xs md:text-sm font-bold text-white truncate mt-0.5">{currentHousing.name}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{currentHousing.address || `Khu dân cư, ${currentCity}`}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Housing Tiers Roadmap */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Lộ Trình Cư Trú ({currentCity}):
                </div>

                {housingTiers.map(ht => {
                  const isCurrent = ht.tier === currentHousing.tier;
                  const isPast = ht.tier < currentHousing.tier;
                  const cost = ht.buy_price || ht.rent_per_year;
                  const canAfford = cash >= cost;

                  return (
                    <div
                      key={ht.id}
                      className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                          : isPast
                          ? 'bg-slate-900/30 border-slate-800/60 opacity-60'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            Cấp {ht.tier}
                          </span>
                          <h4 className="text-xs md:text-sm font-semibold text-white">{ht.name}</h4>
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Đang Ở
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{ht.description}</p>
                        <div className="text-[11px] text-slate-300 flex items-center gap-3 mt-1.5 flex-wrap">
                          <span>Chi phí: <strong className="text-emerald-400">{renderMoney(cost)}</strong> {ht.buy_price ? '(Sở hữu)' : '/năm'}</span>
                          <span className="text-teal-300">Hạnh phúc: +{ht.happiness_bonus}%</span>
                          <span className="text-rose-300">Sức khỏe: +{ht.health_bonus} HP</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <div className="text-[11px] font-bold text-amber-400 py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                            Đang Sinh Sống
                          </div>
                        ) : isPast ? (
                          <div className="text-[11px] text-slate-500 py-1.5 px-3 text-center">
                            Đã Vượt Qua
                          </div>
                        ) : (
                          <button
                            disabled={loadingId === `housing_${ht.tier}` || isMinor || !canAfford || actionPoints < 2}
                            onClick={() => handleUpgradeHome(ht.tier)}
                            className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                              isMinor || !canAfford || actionPoints < 2
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/40'
                            }`}
                          >
                            {isMinor ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Khóa (&lt;18T)</span>
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>{canAfford ? 'Chuyển Đến (-2 AP)' : 'Thiếu Tiền'}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
