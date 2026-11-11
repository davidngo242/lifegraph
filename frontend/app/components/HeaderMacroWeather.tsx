'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Radio } from 'lucide-react';
import Tooltip from './Tooltip';

interface HeaderMacroWeatherProps {
  currentCity?: string;
  countryName?: string;
  countryTier?: string;
}

export default function HeaderMacroWeather({
  currentCity = "Hà Nội",
  countryName = "Việt Nam",
  countryTier = "T2"
}: HeaderMacroWeatherProps) {
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
    const interval = setInterval(fetchMacroData, 30000);
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
    <div className="hidden lg:flex items-center gap-2">
      <Tooltip
        position="bottom"
        content={
          <div className="space-y-1.5 text-xs max-w-xs p-1">
            <div className="flex items-center justify-between gap-3 pb-1 border-b border-[var(--border-subtle)] font-bold">
              <span className="text-sky-800 dark:text-sky-300">🌍 {currentCity} ({countryName})</span>
              <span className="text-amber-800 dark:text-amber-300 font-mono">Cõi {countryTier}</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
              <div>Thời tiết: <strong className="text-[var(--text-primary)]">{weather.condition} · {weather.temp_celsius}°C</strong></div>
              <div>Lạm phát: <strong className="text-amber-800 dark:text-amber-300 font-mono">{playerServer.inflation_rate}%</strong></div>
              <div>Bất ổn xã hội: <strong className="text-rose-800 dark:text-rose-300 font-mono">{playerServer.social_unrest}%</strong></div>
              <div>Áp lực sinh thái: <strong className="text-emerald-800 dark:text-emerald-300 font-mono">{playerServer.environmental_pressure}%</strong></div>
            </div>
            {latestNews && (
              <div className="pt-1 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed italic">
                📰 {latestNews.headline}
              </div>
            )}
          </div>
        }
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-amber-500/50 text-xs font-semibold text-[var(--text-primary)] cursor-pointer transition shadow-sm">
          <span className="text-sm select-none">{weather.icon}</span>
          <span className="truncate max-w-[90px]">{currentCity.split(" ")[0]}</span>
          <span className="font-mono font-bold text-amber-800 dark:text-amber-400">{weather.temp_celsius}°C</span>
          <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] opacity-50" />
          <span className="flex items-center gap-1 font-mono text-xs text-[var(--text-secondary)]">
            <Globe className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-[var(--text-primary)]">{countryTier}</span>
          </span>
        </div>
      </Tooltip>
    </div>
  );
}
