'use client';

import React, { useMemo } from 'react';
import Tooltip from '../Tooltip';

export interface CulturalLandscapeBackdropProps {
  nationality?: string;
  currentCity?: string;
  seasonId?: 'spring' | 'summer' | 'autumn' | 'winter';
  characterAge?: number;
  className?: string;
}

export interface LandscapeProfile {
  id: string;
  name: string;
  flag: string;
  landmark: string;
  subLandmarks: string;
  description: string;
  atmosphereColor: {
    farHills: string;
    midHills: string;
    nearLandmarks: string;
    accentGlow: string;
    waterFog: string;
  };
}

export const CULTURAL_LANDSCAPES: Record<string, LandscapeProfile> = {
  poland: {
    id: 'poland',
    name: 'Ba Lan',
    flag: '🇵🇱',
    landmark: 'Dãy Núi Tatra & Lâu Đài Hoàng Gia Wawel',
    subLandmarks: 'Sông Vistula • Phố Cổ Stare Miasto • Rừng Thông Tuyết',
    description: 'Phong cảnh Trung Âu tráng lệ với dãy núi Tatra hùng vĩ phủ tuyết, pháo đài Wawel cổ kính bên dòng Vistula và tháp chuông Gothic Kraków.',
    atmosphereColor: {
      farHills: '#64748b',
      midHills: '#475569',
      nearLandmarks: '#334155',
      accentGlow: '#dc2626',
      waterFog: '#cbd5e1'
    }
  },
  vietnam: {
    id: 'vietnam',
    name: 'Việt Nam',
    flag: '🇻🇳',
    landmark: 'Vịnh Hạ Long & Ruộng Bậc Thang Tây Bắc',
    subLandmarks: 'Chùa Một Cột • Đầm Sen Tháp Mười • Rặng Tre Làng',
    description: 'Cảnh quan non nước hữu tình Việt Nam với quần thể karst Vịnh Hạ Long kỳ vĩ, ruộng bậc thang uốn lượn và mái cong Khuê Văn Các nghìn năm.',
    atmosphereColor: {
      farHills: '#059669',
      midHills: '#047857',
      nearLandmarks: '#065f46',
      accentGlow: '#eab308',
      waterFog: '#a7f3d0'
    }
  },
  japan: {
    id: 'japan',
    name: 'Nhật Bản',
    flag: '🇯🇵',
    landmark: 'Núi Phú Sĩ Tuyết Phủ & Cổng Thần Đạo Torii',
    subLandmarks: 'Chùa Cổ Chureito Pagoda • Tùng Bách Bonsai • Mây Ukiyo-e',
    description: 'Bức tranh phong cảnh xứ Phù Tang với đỉnh núi Phú Sĩ tuyết phủ đối xứng hoàn mỹ, cổng Torii son đỏ nổi trên hồ nước và chùa cổ ngũ tầng.',
    atmosphereColor: {
      farHills: '#4338ca',
      midHills: '#3730a3',
      nearLandmarks: '#312e81',
      accentGlow: '#e11d48',
      waterFog: '#c7d2fe'
    }
  },
  korea: {
    id: 'korea',
    name: 'Hàn Quốc',
    flag: '🇰🇷',
    landmark: 'Cung Điện Gyeongbokgung & Đỉnh Núi Namsan',
    subLandmarks: 'Tháp N Seoul • Làng Cổ Bukchon Hanok • Phong Đỏ',
    description: 'Sự hòa quyện giữa nét vương giả của Cung điện Gyeongbokgung, mái ngói cong Hanok truyền thống và ngọn tháp Namsan vươn cao trên sườn núi.',
    atmosphereColor: {
      farHills: '#0284c7',
      midHills: '#0369a1',
      nearLandmarks: '#075985',
      accentGlow: '#f59e0b',
      waterFog: '#bae6fd'
    }
  },
  thailand: {
    id: 'thailand',
    name: 'Thái Lan',
    flag: '🇹🇭',
    landmark: 'Wat Arun Chùa Bình Minh & Sông Chao Phraya',
    subLandmarks: 'Bảo Tháp Chedi Dát Vàng • Mái Đao Rồng Naga • Voi Thần',
    description: 'Vùng đất Chùa Vàng rực rỡ với tháp Wat Arun vút cao bên sông Chao Phraya, mái chùa nhiều tầng dát vàng và rặng thốt nốt nhiệt đới.',
    atmosphereColor: {
      farHills: '#d97706',
      midHills: '#b45309',
      nearLandmarks: '#92400e',
      accentGlow: '#eab308',
      waterFog: '#fde68a'
    }
  },
  usa: {
    id: 'usa',
    name: 'Hoa Kỳ',
    flag: '🇺🇸',
    landmark: 'Cầu Cổng Vàng & Đại Vực Grand Canyon',
    subLandmarks: 'Manhattan Skyline • Hẻm Núi Sa Thạch • Rừng Thông Khổng Lồ',
    description: 'Sự kỳ vĩ của thiên nhiên Bắc Mỹ từ hẻm núi Grand Canyon tầng tầng sa thạch đến nhịp cầu Golden Gate kiêu hãnh vươn qua làn sương vịnh.',
    atmosphereColor: {
      farHills: '#ea580c',
      midHills: '#c2410c',
      nearLandmarks: '#9a3412',
      accentGlow: '#3b82f6',
      waterFog: '#fed7aa'
    }
  },
  germany: {
    id: 'germany',
    name: 'Cộng Hòa Liên Bang Đức',
    flag: '🇩🇪',
    landmark: 'Lâu Đài Neuschwanstein & Dãy Alps Bavaria',
    subLandmarks: 'Cổng Brandenburg • Thung Lũng Sông Rhine • Rừng Đen',
    description: 'Châu Âu cổ kính với lâu đài cổ tích Neuschwanstein kiêu hãnh trên đỉnh vách đá dãy Alps, rừng thông bạt ngàn và thung lũng sông Rhine.',
    atmosphereColor: {
      farHills: '#475569',
      midHills: '#334155',
      nearLandmarks: '#1e293b',
      accentGlow: '#eab308',
      waterFog: '#e2e8f0'
    }
  },
  syria: {
    id: 'syria',
    name: 'Syria & Vùng Trung Đông',
    flag: '🇸🇾',
    landmark: 'Thành Cổ Cột Đá Palmyra & Ốc Đảo Sa Mạc',
    subLandmarks: 'Mái Vòm Damascus • Tháp Minaret • Biển Cát Hoàng Kim',
    description: 'Chứng nhân lịch sử nghìn lẻ một đêm với hàng cột đá La Mã Palmyra ngạo nghễ giữa sa mạc cát vàng và mái vòm Hồi giáo tráng lệ.',
    atmosphereColor: {
      farHills: '#b45309',
      midHills: '#92400e',
      nearLandmarks: '#78350f',
      accentGlow: '#f59e0b',
      waterFog: '#fef3c7'
    }
  },
  somalia: {
    id: 'somalia',
    name: 'Somalia',
    flag: '🇸🇴',
    landmark: 'Hải Đăng Cổ Mogadishu & Bờ Biển Ấn Độ Dương',
    subLandmarks: 'Cổng Vòm Đá San Hô Shangani • Tháp Minaret • Cảng Biển Banadir',
    description: 'Vùng Sừng Châu Phi rực nắng gió Ấn Độ Dương với ngọn hải đăng cổ Mogadishu, vòm cổng san hô trắng Shangani và những rặng dừa ven biển Lido.',
    atmosphereColor: {
      farHills: '#0284c7',
      midHills: '#0369a1',
      nearLandmarks: '#0c4a6e',
      accentGlow: '#f59e0b',
      waterFog: '#bae6fd'
    }
  },
  norway: {
    id: 'norway',
    name: 'Na Uy',
    flag: '🇳🇴',
    landmark: 'Vịnh Hẹp Geirangerfjord & Bầu Trời Cực Quang',
    subLandmarks: 'Vách Đá Trolltunga • Phố Gỗ Bergen Bryggen • Rừng Thông Bắc Âu',
    description: 'Vương quốc Bắc Âu huyền ảo với vịnh hẹp Geirangerfjord sâu thẳm, những dãy nhà gỗ màu sắc tại bến cảng Bergen và dải cực quang xanh ngọc.',
    atmosphereColor: {
      farHills: '#0369a1',
      midHills: '#0f766e',
      nearLandmarks: '#134e4a',
      accentGlow: '#34d399',
      waterFog: '#cffafe'
    }
  },
  switzerland: {
    id: 'switzerland',
    name: 'Thụy Sĩ',
    flag: '🇨🇭',
    landmark: 'Đỉnh Tuyết Matterhorn & Hồ Geneva',
    subLandmarks: 'Dãy Alps Hùng Vĩ • Cầu Gỗ Chapel Lucerne • Tháp Zytglogge',
    description: 'Trái tim châu Âu với đỉnh Matterhorn tuyết phủ sừng sững trên dãy Alps, mặt hồ Geneva xanh ngọc và những mái nhà gỗ Chalet thanh bình.',
    atmosphereColor: {
      farHills: '#3b82f6',
      midHills: '#1d4ed8',
      nearLandmarks: '#1e3a8a',
      accentGlow: '#e11d48',
      waterFog: '#dbeafe'
    }
  },
  brazil: {
    id: 'brazil',
    name: 'Brazil',
    flag: '🇧🇷',
    landmark: 'Tượng Chúa Cứu Thế Rio & Núi Sugarloaf',
    subLandmarks: 'Vịnh Biển Copacabana • Rừng Rậm Amazon • Đỉnh Corcovado',
    description: 'Xứ sở Samba đầy sức sống với đỉnh Corcovado nâng đỡ Tượng Chúa Cứu Thế sải tay ôm trọn vịnh Copacabana và dãy núi đá Sugarloaf.',
    atmosphereColor: {
      farHills: '#16a34a',
      midHills: '#15803d',
      nearLandmarks: '#166534',
      accentGlow: '#facc15',
      waterFog: '#dcfce7'
    }
  },
  haiti: {
    id: 'haiti',
    name: 'Haiti',
    flag: '🇭🇹',
    landmark: 'Pháo Đài Đá Citadelle Laferrière & Biển Caribe',
    subLandmarks: 'Cung Điện Sans-Souci • Đỉnh Pic la Selle • Vịnh Xanh Caribe',
    description: 'Hòn ngọc kiên cường vùng Caribe với pháo đài đá khổng lồ Citadelle Laferrière ngự trên đỉnh núi cao nhìn ra biển xanh ngắt.',
    atmosphereColor: {
      farHills: '#2563eb',
      midHills: '#1d4ed8',
      nearLandmarks: '#1e3a8a',
      accentGlow: '#f43f5e',
      waterFog: '#e0f2fe'
    }
  },
  uk: {
    id: 'uk',
    name: 'Vương Quốc Anh',
    flag: '🇬🇧',
    landmark: 'Tháp Đồng Hồ Big Ben & Cầu Tháp London',
    subLandmarks: 'Sông Thames Sương Mù • Vòng Quay London Eye • Đồi Xanh Cotswolds',
    description: 'Xứ sở sương mù cổ kính với tháp đồng hồ Big Ben soi bóng sông Thames, nhịp cầu Tower Bridge Gothic và nét trầm mặc London.',
    atmosphereColor: {
      farHills: '#475569',
      midHills: '#334155',
      nearLandmarks: '#1e293b',
      accentGlow: '#dc2626',
      waterFog: '#e2e8f0'
    }
  },
  universal: {
    id: 'universal',
    name: 'Cao Nguyên Thần Mộc',
    flag: '🌐',
    landmark: 'Dãy Núi Thái Sơ & Thung Lũng Thiên Thai',
    subLandmarks: 'Rừng Nguyên Sinh • Suối Nguồn Sinh Mệnh • Đỉnh Trường Sinh',
    description: 'Vùng đất khởi nguyên nơi linh khí đất trời hội tụ, những dãy núi điệp trùng bao bọc lấy cội rễ Thần Mộc Sinh Mệnh vĩ đại.',
    atmosphereColor: {
      farHills: '#6366f1',
      midHills: '#4f46e5',
      nearLandmarks: '#4338ca',
      accentGlow: '#10b981',
      waterFog: '#e0e7ff'
    }
  }
};

export function resolveCountryLandscape(nationality?: string, city?: string): LandscapeProfile {
  const query = `${nationality || ''} ${city || ''}`.toLowerCase();

  if (query.includes('ba lan') || query.includes('poland') || query.includes('warsaw') || query.includes('kraków') || query.includes('krakow') || query.includes('zł') || query.includes('zloty')) {
    return CULTURAL_LANDSCAPES.poland;
  }
  if (query.includes('việt') || query.includes('vietnam') || query.includes('hà nội') || query.includes('sài gòn') || query.includes('đà nẵng') || query.includes('hạ long')) {
    return CULTURAL_LANDSCAPES.vietnam;
  }
  if (query.includes('nhật') || query.includes('japan') || query.includes('tokyo') || query.includes('kyoto') || query.includes('osaka')) {
    return CULTURAL_LANDSCAPES.japan;
  }
  if (query.includes('hàn') || query.includes('korea') || query.includes('seoul') || query.includes('busan')) {
    return CULTURAL_LANDSCAPES.korea;
  }
  if (query.includes('thái') || query.includes('thailand') || query.includes('bangkok') || query.includes('chiang')) {
    return CULTURAL_LANDSCAPES.thailand;
  }
  if (query.includes('mỹ') || query.includes('hoa kỳ') || query.includes('usa') || query.includes('united states') || query.includes('york') || query.includes('angeles') || query.includes('francisco')) {
    return CULTURAL_LANDSCAPES.usa;
  }
  if (query.includes('đức') || query.includes('germany') || query.includes('berlin') || query.includes('munich') || query.includes('frankfurt')) {
    return CULTURAL_LANDSCAPES.germany;
  }
  if (query.includes('syria') || query.includes('damascus') || query.includes('palmyra') || query.includes('trung đông')) {
    return CULTURAL_LANDSCAPES.syria;
  }
  if (query.includes('somalia') || query.includes('mogadishu') || query.includes('banadir') || query.includes('hargeisa') || query.includes('shangani')) {
    return CULTURAL_LANDSCAPES.somalia;
  }
  if (query.includes('na uy') || query.includes('norway') || query.includes('oslo') || query.includes('bergen') || query.includes('geiranger')) {
    return CULTURAL_LANDSCAPES.norway;
  }
  if (query.includes('thụy sĩ') || query.includes('switzerland') || query.includes('zurich') || query.includes('zürich') || query.includes('geneva') || query.includes('bern')) {
    return CULTURAL_LANDSCAPES.switzerland;
  }
  if (query.includes('brazil') || query.includes('brasil') || query.includes('rio') || query.includes('paulo') || query.includes('copacabana')) {
    return CULTURAL_LANDSCAPES.brazil;
  }
  if (query.includes('haiti') || query.includes('port-au-prince') || query.includes('cap-haitien') || query.includes('laferrière')) {
    return CULTURAL_LANDSCAPES.haiti;
  }
  if (query.includes('vương quốc anh') || query.includes('nước anh') || query.includes('united kingdom') || query.includes('britain') || query.includes('england') || query.includes('london') || /\buk\b/.test(query)) {
    return CULTURAL_LANDSCAPES.uk;
  }

  return CULTURAL_LANDSCAPES.universal;
}

export default function CulturalLandscapeBackdrop({
  nationality = 'Việt Nam',
  currentCity,
  seasonId = 'spring',
  characterAge = 20,
  className = ''
}: CulturalLandscapeBackdropProps) {
  const landscape = useMemo(() => resolveCountryLandscape(nationality, currentCity), [nationality, currentCity]);

  // Seasonal tint overlay adjustments
  const isWinter = seasonId === 'winter';
  const isAutumn = seasonId === 'autumn';
  const isSpring = seasonId === 'spring';

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Atmospheric Silhouette Panorama SVG Canvas */}
      <svg
        className="w-full h-full object-cover opacity-35 dark:opacity-25 transition-opacity duration-1000"
        viewBox="0 0 1200 560"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients tailored to cultural profile */}
          <linearGradient id={`grad-far-${landscape.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={landscape.atmosphereColor.farHills} stopOpacity="0.4" />
            <stop offset="100%" stopColor={landscape.atmosphereColor.farHills} stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id={`grad-mid-${landscape.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={landscape.atmosphereColor.midHills} stopOpacity="0.65" />
            <stop offset="100%" stopColor={landscape.atmosphereColor.midHills} stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id={`grad-near-${landscape.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={landscape.atmosphereColor.nearLandmarks} stopOpacity="0.85" />
            <stop offset="100%" stopColor={landscape.atmosphereColor.nearLandmarks} stopOpacity="0.25" />
          </linearGradient>

          {/* Winter Snow Cap Frost Highlight */}
          <linearGradient id="snow-cap-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={isWinter ? "0.85" : "0.3"} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>

          {/* Sunset / Sunrise Golden Mist */}
          <radialGradient id="sun-golden-glow" cx="50%" cy="25%" r="60%">
            <stop offset="0%" stopColor={landscape.atmosphereColor.accentGlow} stopOpacity={isAutumn ? "0.28" : isSpring ? "0.2" : "0.15"} />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Sky Aura behind mountains */}
        <circle cx="600" cy="180" r="380" fill="url(#sun-golden-glow)" />

        {/* ========================================================================= */}
        {/* COUNTRY-SPECIFIC CULTURAL LANDMARK SILHOUETTES */}
        {/* ========================================================================= */}

        {/* 1. BA LAN (POLAND) — Dãy Núi Tatra, Lâu Đài Wawel & Tháp Chuông Kraków */}
        {landscape.id === 'poland' && (
          <g className="transition-all duration-700">
            {/* Layer 1: Distant Jagged Peaks of High Tatras (Rysy, Kasprowy Wierch) */}
            <path
              d="M0 340 L80 250 L140 280 L220 190 L280 240 L360 170 L430 230 L520 150 L610 220 L700 160 L780 210 L880 140 L970 230 L1050 170 L1130 220 L1200 160 L1200 560 L0 560 Z"
              fill="url(#grad-far-poland)"
            />
            {/* Snow caps on High Tatra peaks */}
            <path
              d="M220 190 L205 215 L235 215 Z M360 170 L345 195 L375 195 Z M520 150 L500 180 L540 180 Z M700 160 L685 185 L715 185 Z M880 140 L860 175 L900 175 Z M1050 170 L1035 195 L1065 195 Z"
              fill="url(#snow-cap-grad)"
            />

            {/* Layer 2: Midground Rolling Foothills & Spruce Forests of Małopolska */}
            <path
              d="M0 380 Q150 310 300 360 T600 340 T900 370 T1200 330 L1200 560 L0 560 Z"
              fill="url(#grad-mid-poland)"
            />

            {/* Layer 3: Left Bank — Wawel Royal Castle Fortress Silhouette (Kraków) */}
            <g transform="translate(60, 240)" fill="url(#grad-near-poland)">
              {/* Fortress Bastion Walls */}
              <rect x="0" y="80" width="160" height="70" rx="4" />
              {/* Senator Tower */}
              <rect x="15" y="30" width="22" height="60" />
              <polygon points="12,30 26,5 40,30" />
              {/* Wawel Cathedral Gothic Spire */}
              <rect x="50" y="10" width="26" height="80" />
              <polygon points="46,10 63,-25 80,10" />
              {/* Sigismund Chapel Golden Dome */}
              <path d="M90 60 Q105 35 120 60 Z" />
              <circle cx="105" cy="35" r="3" fill="#eab308" opacity="0.6" />
              {/* Thieves Tower */}
              <rect x="135" y="45" width="20" height="50" />
              <polygon points="130,45 145,25 160,45" />
            </g>

            {/* Layer 3: Right Bank — St. Mary's Basilica Twin Asymmetric Spires */}
            <g transform="translate(980, 250)" fill="url(#grad-near-poland)">
              {/* Taller Gothic Spire with Crown */}
              <rect x="30" y="10" width="24" height="90" />
              <polygon points="26,10 42,-30 58,10" />
              {/* Lower Renaissance Spire */}
              <rect x="62" y="35" width="24" height="65" />
              <polygon points="58,35 74,5 90,35" />
              {/* Cloth Hall Sukiennice Arches */}
              <rect x="0" y="85" width="130" height="40" rx="3" />
            </g>

            {/* Soaring Polish White Eagle in Sky */}
            <path
              d="M320 120 Q335 105 350 120 Q365 105 380 120 Q350 135 320 120 Z"
              fill={landscape.atmosphereColor.accentGlow}
              opacity="0.35"
            />
          </g>
        )}

        {/* 2. VIỆT NAM — Núi Đá Vôi Vịnh Hạ Long, Khuê Văn Các & Ruộng Bậc Thang */}
        {landscape.id === 'vietnam' && (
          <g className="transition-all duration-700">
            {/* Layer 1: Majestic Karst Mountain Formations of Hạ Long Bay */}
            <path
              d="M0 360 C50 260 90 240 140 330 C180 200 240 160 300 320 C360 220 410 190 470 310 C530 180 600 150 670 320 C730 210 790 180 850 300 C910 170 970 140 1030 310 C1090 220 1140 250 1200 320 L1200 560 L0 560 Z"
              fill="url(#grad-far-vietnam)"
            />

            {/* Layer 2: Terraced Rice Fields (Ruộng Bậc Thang Tây Bắc) */}
            <path
              d="M0 430 Q180 370 360 410 T720 380 T1080 420 T1200 390 L1200 560 L0 560 Z"
              fill="url(#grad-mid-vietnam)"
            />
            <path
              d="M60 460 Q240 420 450 450 T880 430 T1200 450 L1200 560 L0 560 Z"
              fill="url(#grad-mid-vietnam)"
              opacity="0.6"
            />

            {/* Layer 3: Left Bank — Iconic Khuê Văn Các & One Pillar Pagoda Rooflines */}
            <g transform="translate(80, 270)" fill="url(#grad-near-vietnam)">
              {/* Four Pillar Base */}
              <rect x="25" y="60" width="8" height="50" />
              <rect x="75" y="60" width="8" height="50" />
              {/* Lower Pavilion Floor */}
              <rect x="15" y="45" width="78" height="18" rx="2" />
              {/* Upper Pavilion with Sun-Disc Round Windows */}
              <rect x="25" y="15" width="58" height="32" rx="3" />
              {/* Traditional Curved Flying Eaves (Mái Đao Cong Vút) */}
              <path d="M10 20 Q54 5 98 20 Q54 10 10 20 Z" />
              <path d="M2 3 L54 -18 L106 3 Q54 -6 2 3 Z" />
            </g>

            {/* Layer 3: Right Bank — Hạ Long Traditional Junk Sailboat (Thuyền Buồm Nâu) */}
            <g transform="translate(1000, 310)" fill="url(#grad-near-vietnam)">
              {/* Hull */}
              <path d="M10 50 Q60 65 120 50 L110 65 Q60 75 18 65 Z" />
              {/* Fan-Shaped Batten Sails */}
              <path d="M40 45 Q70 0 75 -20 Q85 10 80 45 Z" />
              <path d="M78 45 Q98 10 105 -5 Q110 20 105 45 Z" />
              <line x1="72" y1="-25" x2="72" y2="48" stroke="currentColor" strokeWidth="2" />
            </g>

            {/* Bamboo Grove Sprigs on Horizon */}
            <g transform="translate(260, 360)" stroke={landscape.atmosphereColor.nearLandmarks} strokeWidth="1.5" opacity="0.4">
              <line x1="0" y1="50" x2="-8" y2="0" />
              <line x1="8" y1="50" x2="14" y2="5" />
              <line x1="16" y1="50" x2="30" y2="10" />
            </g>

            {/* White Cranes / Storks Soaring */}
            <path
              d="M780 140 Q795 125 810 140 Q825 125 840 140 Q810 155 780 140 Z"
              fill="#ffffff"
              opacity="0.4"
            />
          </g>
        )}

        {/* 3. NHẬT BẢN (JAPAN) — Núi Phú Sĩ, Cổng Torii & Chùa Chureito Pagoda */}
        {landscape.id === 'japan' && (
          <g className="transition-all duration-700">
            {/* Layer 1: Perfect Majestic Cone of Mount Fuji */}
            <path
              d="M200 480 L520 130 Q600 110 680 130 L1000 480 L1200 480 L1200 560 L0 560 L0 480 Z"
              fill="url(#grad-far-japan)"
            />
            {/* Fuji Snow Cap */}
            <path
              d="M520 130 Q600 110 680 130 L730 210 Q660 230 600 200 Q540 230 470 210 Z"
              fill="url(#snow-cap-grad)"
            />

            {/* Rising Sun Disc behind Fuji */}
            <circle cx="600" cy="190" r="110" fill="#e11d48" opacity="0.22" />

            {/* Layer 2: Rolling Misty Foothills & Pine Groves */}
            <path
              d="M0 410 Q250 340 500 390 T1000 360 T1200 380 L1200 560 L0 560 Z"
              fill="url(#grad-mid-japan)"
            />

            {/* Layer 3: Left Bank — Vermilion Shinto Torii Gate (Itsukushima) */}
            <g transform="translate(100, 280)" fill="url(#grad-near-japan)">
              {/* Twin Pillar Pillars */}
              <rect x="20" y="20" width="10" height="90" />
              <rect x="70" y="20" width="10" height="90" />
              {/* Top Curved Kasagi Lintels */}
              <path d="M5 12 Q50 -4 95 12 L92 22 Q50 8 8 22 Z" />
              {/* Secondary Tie-Beam Shimaki */}
              <rect x="12" y="28" width="76" height="8" />
              {/* Center Gakuzuka Plaque */}
              <rect x="46" y="24" width="8" height="14" />
            </g>

            {/* Layer 3: Right Bank — Five-Story Chureito Pagoda */}
            <g transform="translate(980, 240)" fill="url(#grad-near-japan)">
              {/* Tier 5 (Top) */}
              <polygon points="50,0 30,16 70,16" />
              <polygon points="20,16 50,8 80,16" />
              <rect x="42" y="16" width="16" height="12" />
              {/* Tier 4 */}
              <polygon points="12,28 50,20 88,28" />
              <rect x="38" y="28" width="24" height="12" />
              {/* Tier 3 */}
              <polygon points="5,40 50,30 95,40" />
              <rect x="34" y="40" width="32" height="14" />
              {/* Tier 2 */}
              <polygon points="-2,54 50,42 102,54" />
              <rect x="30" y="54" width="40" height="16" />
              {/* Tier 1 (Base) */}
              <polygon points="-8,70 50,56 108,70" />
              <rect x="25" y="70" width="50" height="30" rx="2" />
              {/* Pagoda Spire (Sorin Finial) */}
              <line x1="50" y1="-25" x2="50" y2="0" stroke="currentColor" strokeWidth="2.5" />
            </g>
          </g>
        )}

        {/* 4. HÀN QUỐC (KOREA) — Cung Điện Gyeongbokgung & Tháp Namsan */}
        {landscape.id === 'korea' && (
          <g className="transition-all duration-700">
            {/* Distant Mountain Ridges of Bukhansan */}
            <path
              d="M0 360 Q180 230 360 310 T720 220 T1080 300 T1200 240 L1200 560 L0 560 Z"
              fill="url(#grad-far-korea)"
            />
            {/* Namsan Peak with N Seoul Tower Silhouette */}
            <g transform="translate(750, 140)" fill="url(#grad-far-korea)">
              <rect x="30" y="20" width="6" height="60" />
              <circle cx="33" cy="35" r="12" />
              <line x1="33" y1="-10" x2="33" y2="20" stroke="currentColor" strokeWidth="2" />
            </g>

            {/* Midground Traditional Korean Hanok Rooflines */}
            <path
              d="M0 420 Q220 350 480 390 T960 370 T1200 390 L1200 560 L0 560 Z"
              fill="url(#grad-mid-korea)"
            />

            {/* Left Bank — Gyeongbokgung Grand Gate (Gwanghwamun) */}
            <g transform="translate(90, 270)" fill="url(#grad-near-korea)">
              {/* Stone Base with 3 Arches */}
              <rect x="0" y="60" width="160" height="45" rx="3" />
              {/* Two-Story Wooden Pavilion with Sweeping Eaves */}
              <rect x="20" y="30" width="120" height="30" />
              <path d="M5 32 Q80 15 155 32 Z" />
              <rect x="35" y="10" width="90" height="22" />
              <path d="M18 12 Q80 -3 142 12 Z" />
            </g>
          </g>
        )}

        {/* 5. THÁI LAN (THAILAND) — Wat Arun Chùa Bình Minh & Sông Chao Phraya */}
        {landscape.id === 'thailand' && (
          <g className="transition-all duration-700">
            {/* Distant Tropical Forest Canopy */}
            <path
              d="M0 370 Q160 290 340 330 T700 280 T1060 340 T1200 300 L1200 560 L0 560 Z"
              fill="url(#grad-far-thailand)"
            />

            {/* Wat Arun Central Grand Prang (Tháp Phra Prang 82m) */}
            <g transform="translate(540, 160)" fill="url(#grad-far-thailand)">
              {/* Stepped Terraces Base */}
              <rect x="30" y="140" width="60" height="20" />
              <rect x="38" y="110" width="44" height="30" />
              <rect x="44" y="60" width="32" height="50" />
              {/* Crown Spear Finial (Trident of Shiva) */}
              <polygon points="48,60 60,0 72,60" />
              <line x1="60" y1="-15" x2="60" y2="0" stroke="currentColor" strokeWidth="2" />
            </g>

            {/* Wat Phra Kaew Multi-Tiered Temple Roofs on Left */}
            <g transform="translate(90, 270)" fill="url(#grad-near-thailand)">
              <polygon points="10,60 80,10 150,60" />
              <polygon points="25,40 80,0 135,40" />
              {/* Soaring Naga Gable Finials (Chofah) */}
              <path d="M8 58 Q-4 40 4 30 L14 45 Z" />
              <path d="M152 58 Q164 40 156 30 L146 45 Z" />
            </g>

            {/* Sacred Elephant Silhouette on Right */}
            <g transform="translate(1000, 360)" fill="url(#grad-near-thailand)" opacity="0.6">
              <ellipse cx="60" cy="40" rx="35" ry="25" />
              <circle cx="28" cy="28" r="16" />
              <path d="M22 36 Q10 45 8 60 Q14 62 18 52 Z" />
              <rect x="40" y="55" width="10" height="25" rx="3" />
              <rect x="65" y="55" width="10" height="25" rx="3" />
            </g>
          </g>
        )}

        {/* 6. MỸ (USA) — Cầu Cổng Vàng & Đại Vực Grand Canyon */}
        {landscape.id === 'usa' && (
          <g className="transition-all duration-700">
            {/* Grand Canyon Stratified Red Butte Ridges */}
            <path
              d="M0 310 L120 310 L150 250 L280 250 L320 330 L450 330 L500 220 L650 220 L700 320 L860 320 L910 240 L1060 240 L1100 310 L1200 310 L1200 560 L0 560 Z"
              fill="url(#grad-far-usa)"
            />

            {/* Left Bank — Golden Gate Bridge Suspension Tower (San Francisco) */}
            <g transform="translate(100, 180)" fill="url(#grad-near-usa)">
              {/* Twin Tower Legs */}
              <rect x="25" y="30" width="12" height="180" />
              <rect x="75" y="30" width="12" height="180" />
              {/* Cross Struts (Art Deco Portals) */}
              <rect x="25" y="65" width="62" height="12" />
              <rect x="25" y="110" width="62" height="12" />
              <rect x="25" y="155" width="62" height="12" />
              {/* Sweeping Main Suspension Cables */}
              <path d="M-80 90 Q30 180 80 40 Q130 180 240 100" stroke="currentColor" strokeWidth="3" fill="none" />
            </g>

            {/* Right Bank — Manhattan Skyline Silhouettes */}
            <g transform="translate(960, 260)" fill="url(#grad-near-usa)">
              <rect x="0" y="60" width="30" height="80" />
              <rect x="35" y="15" width="28" height="125" />
              <polygon points="35,15 49,-15 63,15" />
              <rect x="68" y="45" width="25" height="95" />
              <rect x="98" y="70" width="35" height="70" />
            </g>
          </g>
        )}

        {/* 7. ĐỨC (GERMANY) — Lâu Đài Neuschwanstein & Dãy Alps Bavaria */}
        {landscape.id === 'germany' && (
          <g className="transition-all duration-700">
            {/* Bavarian Alps Rugged Peaks */}
            <path
              d="M0 360 L140 220 L260 310 L420 180 L560 290 L740 160 L880 280 L1040 190 L1200 320 L1200 560 L0 560 Z"
              fill="url(#grad-far-germany)"
            />

            {/* Fairytale Neuschwanstein Castle on Rocky Crag */}
            <g transform="translate(140, 210)" fill="url(#grad-near-germany)">
              {/* Palace Body */}
              <rect x="30" y="70" width="110" height="70" rx="3" />
              {/* Tall Turret Tower with Conical Spire */}
              <rect x="40" y="15" width="22" height="60" />
              <polygon points="36,15 51,-18 66,15" />
              {/* Gatehouse Tower */}
              <rect x="105" y="30" width="26" height="50" />
              <polygon points="101,30 118,2 135,30" />
              {/* Small Pepper-Pot Corner Turrets */}
              <polygon points="26,60 32,45 38,60" />
              <polygon points="134,60 140,45 146,60" />
            </g>
          </g>
        )}

        {/* 8. SYRIA & TRUNG ĐÔNG — Cột Đá Palmyra & Sa Mạc Hoàng Kim */}
        {landscape.id === 'syria' && (
          <g className="transition-all duration-700">
            {/* Vast Sand Dunes of the Syrian Desert */}
            <path
              d="M0 380 Q240 290 520 360 T1040 310 T1200 350 L1200 560 L0 560 Z"
              fill="url(#grad-far-syria)"
            />

            {/* Ancient Roman Colonnade of Palmyra (Hàng Cột Đá Khổng Lồ) */}
            <g transform="translate(80, 260)" fill="url(#grad-near-syria)">
              {[15, 45, 75, 105, 135].map((x, i) => (
                <g key={`col-${i}`}>
                  <rect x={x} y="30" width="10" height="90" rx="1" />
                  <rect x={x - 3} y="22" width="16" height="8" rx="1" />
                  <rect x={x - 4} y="115" width="18" height="6" rx="1" />
                </g>
              ))}
              {/* Arch of Triumph Archway */}
              <path d="M160 120 L160 40 Q190 10 220 40 L220 120 Z" />
            </g>

            {/* Desert Date Palm Oasis on Right */}
            <g transform="translate(1020, 310)" stroke={landscape.atmosphereColor.nearLandmarks} strokeWidth="2.5" opacity="0.6">
              <path d="M30 90 Q38 40 45 10" fill="none" />
              <path d="M45 10 Q20 -10 0 5" fill="none" />
              <path d="M45 10 Q40 -20 60 -15" fill="none" />
              <path d="M45 10 Q70 -5 80 15" fill="none" />
            </g>
          </g>
        )}

        {/* 9. SOMALIA — Hải Đăng Mogadishu, Cổng Vòm San Hô Shangani & Bờ Biển Ấn Độ Dương */}
        {landscape.id === 'somalia' && (
          <g className="transition-all duration-700">
            {/* Indian Ocean Gentle Horizon & Coastal Dunes */}
            <path
              d="M0 390 Q240 340 520 375 T1020 350 T1200 370 L1200 560 L0 560 Z"
              fill="url(#grad-far-somalia)"
            />
            <path
              d="M0 440 Q280 410 600 430 T1200 415 L1200 560 L0 560 Z"
              fill="url(#grad-mid-somalia)"
            />
            {/* Left Bank — Historic Mogadishu Old Stone Lighthouse & White-Washed Shangani Arches */}
            <g transform="translate(80, 225)" fill="url(#grad-near-somalia)">
              {/* White-washed coastal stone base & arched colonnade */}
              <rect x="0" y="100" width="170" height="65" rx="3" />
              <path d="M20 140 L20 115 Q35 98 50 115 L50 140 Z" fill="var(--bg-canvas)" opacity="0.45" />
              <path d="M68 140 L68 115 Q83 98 98 115 L98 140 Z" fill="var(--bg-canvas)" opacity="0.45" />
              {/* Coral-stone Minaret Dome */}
              <path d="M122 100 L122 55 L154 55 L154 100 Z" />
              <path d="M120 55 Q138 25 156 55 Z" />
              {/* Old Mogadishu Lighthouse Tower */}
              <polygon points="34,100 40,22 64,22 70,100" />
              <rect x="38" y="10" width="28" height="12" rx="2" />
              <circle cx="52" cy="16" r="10" fill={landscape.atmosphereColor.accentGlow} opacity="0.5" />
            </g>
            {/* Right Bank — Traditional Dhow Lateen Sailboat & Coastal Date Palms */}
            <g transform="translate(970, 300)" fill="url(#grad-near-somalia)">
              <path d="M15 95 Q70 110 135 95 L120 108 Q68 118 25 108 Z" />
              <polygon points="65,90 120,10 92,90" opacity="0.85" />
              <line x1="65" y1="5" x2="65" y2="95" stroke="currentColor" strokeWidth="2.5" />
              <g transform="translate(155, 10)" stroke={landscape.atmosphereColor.nearLandmarks} strokeWidth="2.5" opacity="0.65" fill="none">
                <path d="M20 100 Q28 45 35 12" />
                <path d="M35 12 Q10 -5 -5 10" />
                <path d="M35 12 Q42 -15 62 -5" />
                <path d="M35 12 Q60 5 72 24" />
              </g>
            </g>
          </g>
        )}

        {/* 10. NA UY (NORWAY) — Vịnh Hẹp Geirangerfjord, Nhà Gỗ Bergen & Cực Quang */}
        {landscape.id === 'norway' && (
          <g className="transition-all duration-700">
            {/* Aurora Borealis Ribbons in Nordic Sky */}
            <path
              d="M120 110 Q340 40 580 120 T1060 75 L1060 150 Q800 185 560 160 T120 175 Z"
              fill={landscape.atmosphereColor.accentGlow}
              opacity="0.22"
            />
            {/* Towering Fjord Cliffs & Trolltunga Promontory */}
            <path
              d="M0 170 L180 210 L290 360 L440 390 L600 370 L760 390 L910 340 L1020 190 L1200 160 L1200 560 L0 560 Z"
              fill="url(#grad-far-norway)"
            />
            <path
              d="M0 320 L120 280 L230 350 L480 410 L760 405 L960 330 L1200 280 L1200 560 L0 560 Z"
              fill="url(#grad-mid-norway)"
            />
            {/* Left Bank — Bergen Bryggen Pointed Timber Gables */}
            <g transform="translate(75, 290)" fill="url(#grad-near-norway)">
              <polygon points="0,35 20,0 40,35" />
              <rect x="0" y="35" width="40" height="75" />
              <polygon points="44,40 64,5 84,40" />
              <rect x="44" y="40" width="40" height="70" />
              <polygon points="88,30 108,-5 128,30" />
              <rect x="88" y="30" width="40" height="80" />
            </g>
            {/* Right Bank — Nordic Spruce Grove Silhouette */}
            <g transform="translate(990, 290)" fill="url(#grad-near-norway)">
              <polygon points="30,10 10,85 50,85" />
              <polygon points="75,-5 50,85 100,85" />
              <polygon points="120,20 100,85 140,85" />
            </g>
          </g>
        )}

        {/* 11. THỤY SĨ (SWITZERLAND) — Đỉnh Tuyết Matterhorn & Hồ Geneva */}
        {landscape.id === 'switzerland' && (
          <g className="transition-all duration-700">
            {/* Iconic Matterhorn Pyramid Peak */}
            <path
              d="M0 390 L220 260 L380 310 L590 115 L635 125 L820 310 L990 245 L1200 360 L1200 560 L0 560 Z"
              fill="url(#grad-far-switzerland)"
            />
            {/* Matterhorn Crisp Snow Cap */}
            <path
              d="M590 115 L635 125 L695 215 L610 190 L535 225 Z"
              fill="url(#snow-cap-grad)"
            />
            {/* Left Bank — Zytglogge Clock Tower Bern */}
            <g transform="translate(95, 250)" fill="url(#grad-near-switzerland)">
              <rect x="25" y="45" width="42" height="105" rx="2" />
              <polygon points="20,45 46,0 72,45" />
              <circle cx="46" cy="70" r="10" fill={landscape.atmosphereColor.accentGlow} opacity="0.55" />
              <rect x="70" y="85" width="75" height="65" rx="2" />
            </g>
            {/* Right Bank — Lucerne Chapel Bridge & Timber Tower */}
            <g transform="translate(950, 315)" fill="url(#grad-near-switzerland)">
              <rect x="75" y="15" width="34" height="80" />
              <polygon points="70,15 92,-10 114,15" />
              <path d="M-40 60 L90 45 L140 60 L140 75 L-40 85 Z" />
            </g>
          </g>
        )}

        {/* 12. BRAZIL — Tượng Chúa Cứu Thế Rio & Núi Đường Sugarloaf */}
        {landscape.id === 'brazil' && (
          <g className="transition-all duration-700">
            {/* Rounded Granite Sugarloaf Mountain & Corcovado Ridge */}
            <path
              d="M0 380 Q140 240 280 350 Q450 280 610 210 Q740 310 920 270 Q1070 180 1200 340 L1200 560 L0 560 Z"
              fill="url(#grad-far-brazil)"
            />
            {/* Christ the Redeemer Statue perched on Corcovado Summit */}
            <g transform="translate(578, 132)" fill="url(#grad-near-brazil)">
              <rect x="26" y="25" width="12" height="54" rx="2" />
              <circle cx="32" cy="18" r="7" />
              <rect x="0" y="28" width="64" height="8" rx="3" />
            </g>
            {/* Copacabana Coastal Palms & Curved Harbor */}
            <g transform="translate(80, 310)" stroke={landscape.atmosphereColor.nearLandmarks} strokeWidth="3" fill="none" opacity="0.75">
              <path d="M30 115 Q38 60 55 20" />
              <path d="M55 20 Q25 5 10 22" />
              <path d="M55 20 Q55 -10 80 0" />
              <path d="M55 20 Q85 15 98 35" />
            </g>
          </g>
        )}

        {/* 13. HAITI — Pháo Đài Đá Citadelle Laferrière & Đỉnh Pic la Selle */}
        {landscape.id === 'haiti' && (
          <g className="transition-all duration-700">
            {/* Caribbean Mountain Ridges */}
            <path
              d="M0 390 L180 260 L360 320 L580 190 L790 300 L990 230 L1200 350 L1200 560 L0 560 Z"
              fill="url(#grad-far-haiti)"
            />
            {/* Citadelle Laferrière Prow-Shaped Fortress Silhouette */}
            <g transform="translate(495, 162)" fill="url(#grad-near-haiti)">
              <polygon points="10,70 55,10 140,25 160,70" />
              <rect x="50" y="0" width="22" height="20" />
              <rect x="95" y="10" width="30" height="20" />
            </g>
            {/* Sans-Souci Arch Ruins & Palms */}
            <g transform="translate(90, 320)" fill="url(#grad-near-haiti)">
              <rect x="0" y="30" width="130" height="75" rx="3" />
              <path d="M25 105 L25 55 Q45 35 65 55 L65 105 Z" fill="var(--bg-canvas)" opacity="0.4" />
              <path d="M80 105 L80 55 Q100 35 120 55 L120 105 Z" fill="var(--bg-canvas)" opacity="0.4" />
            </g>
          </g>
        )}

        {/* 14. VƯƠNG QUỐC ANH (UK) — Tháp Đồng Hồ Big Ben & Cầu Tháp London */}
        {landscape.id === 'uk' && (
          <g className="transition-all duration-700">
            {/* Misty Thames Horizon & Westminster Skyline */}
            <path
              d="M0 390 Q280 340 580 375 T1200 360 L1200 560 L0 560 Z"
              fill="url(#grad-far-uk)"
            />
            {/* Left Bank — Elizabeth Tower (Big Ben) & Houses of Parliament */}
            <g transform="translate(80, 210)" fill="url(#grad-near-uk)">
              <rect x="20" y="65" width="32" height="125" />
              <polygon points="16,65 36,10 56,65" />
              <circle cx="36" cy="86" r="10" fill={landscape.atmosphereColor.accentGlow} opacity="0.6" />
              <rect x="55" y="120" width="125" height="70" rx="2" />
              <polygon points="75,120 85,95 95,120" />
              <polygon points="135,120 145,95 155,120" />
            </g>
            {/* Right Bank — Tower Bridge Twin Gothic Towers */}
            <g transform="translate(940, 250)" fill="url(#grad-near-uk)">
              <rect x="25" y="30" width="24" height="110" />
              <polygon points="21,30 37,2 53,30" />
              <rect x="95" y="30" width="24" height="110" />
              <polygon points="91,30 107,2 123,30" />
              <rect x="49" y="52" width="46" height="10" />
              <rect x="-15" y="105" width="165" height="12" />
            </g>
          </g>
        )}

        {/* 15. UNIVERSAL / HIGHLANDS — Dãy Núi Thái Sơ Điệp Trùng */}
        {landscape.id === 'universal' && (
          <g className="transition-all duration-700">
            <path
              d="M0 340 Q180 210 380 290 T780 180 T1140 270 T1200 230 L1200 560 L0 560 Z"
              fill="url(#grad-far-universal)"
            />
            <path
              d="M0 410 Q260 320 540 370 T1040 330 T1200 370 L1200 560 L0 560 Z"
              fill="url(#grad-mid-universal)"
            />
          </g>
        )}

        {/* ========================================================================= */}
        {/* HORIZON ATMOSPHERIC MIST & SEAMLESS CANVAS INTEGRATION FADE */}
        {/* ========================================================================= */}
        {/* Soft bottom fog gradient blending the landscape seamlessly into the canvas floor */}
        <rect
          x="0"
          y="340"
          width="1200"
          height="220"
          fill="url(#horizon-mist-blend)"
        />

        <defs>
          <linearGradient id="horizon-mist-blend" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" stopOpacity="0" />
            <stop offset="45%" stopColor="var(--bg-canvas)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--bg-canvas)" stopOpacity="0.95" />
          </linearGradient>
        </defs>
      </svg>

      {/* 2. ELEGANT CULTURAL HERITAGE BADGE (Pill Góc Dưới Trái Canvas) */}
      <div className="absolute bottom-2.5 left-3 sm:left-4 z-20 pointer-events-auto">
        <Tooltip
          position="top"
          align="left"
          content={
            <div className="space-y-1.5 text-xs max-w-xs leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                <span className="text-base">{landscape.flag}</span>
                <span>Di Sản Văn Hóa & Phong Cảnh: {landscape.name}</span>
              </div>
              <div className="text-[var(--text-primary)] font-semibold">
                {landscape.landmark}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {landscape.description}
              </div>
              <div className="text-[10px] text-amber-800 dark:text-amber-400 font-mono italic pt-1 border-t border-[var(--border-subtle)]">
                ✦ {landscape.subLandmarks}
              </div>
            </div>
          }
        >
          <div className="px-2.5 py-1 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-amber-500/40 text-[10.5px] font-sans text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md cursor-help transition-all duration-200 hover:scale-105 active:scale-95 group">
            <span className="text-xs group-hover:scale-125 transition-transform">{landscape.flag}</span>
            <span className="truncate max-w-[140px] sm:max-w-[215px]">
              {landscape.name} • {landscape.landmark.split('&')[0].trim()}
            </span>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
