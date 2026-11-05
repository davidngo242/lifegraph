'use client';

import React, { useState, useEffect } from 'react';
import { Globe, TrendingUp, TrendingDown, Radio, AlertCircle } from 'lucide-react';
import Tooltip from './Tooltip';

interface MmoWeatherBarProps {
  currentCity?: string;
  countryName?: string;
  countryTier?: string;
}

export default function MmoWeatherBar({
  currentCity = "Hà Nội",
  countryName = "Việt Nam",
  countryTier = "T2"
}: MmoWeatherBarProps) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [mmoData, setMmoData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMacroData = async () => {
      try {
        const [resWeather, resMmo] = await Promise.all([
          fetch(`/api/game/macro/realworld?city=${encodeURIComponent(currentCity)}&country=${encodeURIComponent(countryName)}`),
          fetch(`/api/game/macro/mmo-state`)
        ]);

        if (resWeather.ok) {
          const w = await resWeather.json();
          if (isMounted) setWeatherData(w.data);
        }
        if (resMmo.ok) {
          const m = await resMmo.json();
          if (isMounted) setMmoData(m.data);
        }
      } catch (err) {
        // Silently fallback without disrupting UI
      }
    };

    fetchMacroData();
    const interval = setInterval(fetchMacroData, 30000); // 30s poll
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentCity, countryName]);

  const weather = weatherData?.weather || { temp_celsius: 25, condition: "Nắng nhẹ", icon: "🌤️" };
  const playerServer = mmoData?.player_server || {
    tier_name: `Cõi ${countryTier}`,
    inflation_rate: 38,
    social_unrest: 42,
    environmental_pressure: 64,
    status_label: "Tăng Trưởng Ổn Định"
  };
  const latestNews = mmoData?.breaking_news?.[0];

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl px-3 py-1.5 backdrop-blur-md flex items-center justify-between gap-2.5 text-[12px] overflow-hidden">
      {/* Left: Real-World Weather Pill with Tooltip */}
      <Tooltip
        content={
          <div>
            <div className="font-bold text-sky-300 mb-0.5">Thời Tiết Thế Giới Thực (Open-Meteo)</div>
            <div className="text-[12px] text-slate-300">
              Đồng bộ trực tiếp theo tọa độ thực của <span className="text-white font-semibold">{currentCity}</span>. Ảnh hưởng đến cảnh quan và chi phí sinh hoạt.
            </div>
          </div>
        }
      >
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-sky-950/40 border border-sky-500/30 text-sky-200 cursor-pointer hover:border-sky-400 transition shrink-0">
          <span>{weather.icon}</span>
          <span className="font-medium truncate max-w-[120px] md:max-w-none">{currentCity.split(" ")[0]}:</span>
          <span className="font-sans tabular-nums font-bold text-white">{weather.temp_celsius}°C</span>
          <span className="hidden sm:inline text-slate-400">({weather.condition})</span>
        </div>
      </Tooltip>

      {/* Middle: Global Breaking News / MMO Ticker */}
      <div className="flex-1 min-w-0 flex items-center gap-2 px-2 overflow-hidden">
        <span className="text-[12px] font-sans tabular-nums normal-case px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold shrink-0 flex items-center gap-1">
          <Radio className="w-2.5 h-2.5 animate-pulse text-rose-400" /> MMO Vĩ Mô
        </span>
        <span className="truncate text-slate-300 text-[12px]">
          {latestNews ? (
            <span>{latestNews.headline}</span>
          ) : (
            <span>Thị trường toàn cầu duy trì trạng thái cân bằng. Cán cân cung cầu ổn định.</span>
          )}
        </span>
      </div>

      {/* Right: MMO Macro Equilibrium Pill with Tooltip */}
      <Tooltip
        content={
          <div>
            <div className="font-bold text-amber-300 mb-0.5">Cán Cân Vĩ Mô Dùng Chung ({countryTier})</div>
            <div className="text-[12px] text-slate-300 space-y-0.5">
              <div>Lạm phát vùng: <strong className="text-amber-400 font-sans tabular-nums">{playerServer.inflation_rate}%</strong></div>
              <div>Bất ổn xã hội: <strong className="text-rose-400 font-sans tabular-nums">{playerServer.social_unrest}%</strong></div>
              <div>Áp lực sinh thái: <strong className="text-emerald-400 font-sans tabular-nums">{playerServer.environmental_pressure}%</strong></div>
              <p className="pt-1 text-[12px] text-slate-400 italic">Tổng hợp từ hành vi của toàn bộ người chơi đang hoạt động.</p>
            </div>
          </div>
        }
      >
        <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 cursor-pointer hover:border-indigo-400 transition shrink-0">
          <Globe className="w-3 h-3 text-indigo-400" />
          <span className="font-bold text-white font-sans tabular-nums">{countryTier}</span>
          <span className="text-slate-400 hidden md:inline">• Lạm phát:</span>
          <span className="font-sans tabular-nums font-bold text-amber-300">{playerServer.inflation_rate}%</span>
          <span className="text-slate-400 hidden md:inline">• Bất ổn:</span>
          <span className="font-sans tabular-nums font-bold text-rose-300">{playerServer.social_unrest}%</span>
        </div>
      </Tooltip>
    </div>
  );
}

