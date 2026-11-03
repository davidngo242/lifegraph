'use client';

import React, { useState } from 'react';
import {
  Users,
  Heart,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Gift,
  Clock,
  Compass,
  AlertCircle,
  Briefcase,
  Home,
  CheckCircle2
} from 'lucide-react';

interface NPCData {
  id: string;
  name: string;
  role: string;
  category: 'partner' | 'friend' | 'colleague' | 'family';
  avatar_icon: string;
  concerns: string;
  affinity: number; // -100 to 100 (or 0 to 100)
  trust: number;    // 0 to 100
  sharedMemories?: string[];
  activeCommitment?: {
    title: string;
    condition: string;
    deadline?: string;
  };
  locationHint?: string;
}

interface RelationshipsViewProps {
  character: any;
  relationships?: any[];
  onNavigateToScene?: (sceneId?: string) => void;
  onFamilyMeal?: () => Promise<any>;
  onFamilyAction?: (actionType: 'date' | 'marry' | 'have_child' | 'gift_parent' | 'educate_child') => Promise<any>;
}

export default function RelationshipsView({
  character,
  relationships = [],
  onNavigateToScene,
  onFamilyMeal,
  onFamilyAction
}: RelationshipsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'key_npcs' | 'family'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Default core NPCs from Section 6 and Chapter 1
  const coreNPCs: NPCData[] = [
    {
      id: 'npc_mai',
      name: 'Mai',
      role: 'Người yêu / Bạn đời',
      category: 'partner',
      avatar_icon: '❤️',
      concerns: 'An toàn tài chính gia đình, quỹ dự phòng ổn định, tương lai an cư gắn bó.',
      affinity: 85,
      trust: 80,
      sharedMemories: [
        'Cùng chia sẻ những buổi tối ấm áp tại căn hộ nhỏ.',
        'Mai bày tỏ mong muốn có quỹ dự phòng an toàn trước khi An mạo hiểm.'
      ],
      activeCommitment: {
        title: 'Giữ vững an toàn tài chính',
        condition: 'Duy trì quỹ dự phòng không để rơi vào cảnh nợ nần.',
        deadline: 'Giai đoạn tuổi 28-30'
      },
      locationHint: 'Căn hộ riêng (Nhà)'
    },
    {
      id: 'npc_minh',
      name: 'Minh',
      role: 'Bạn thân & Co-founder AI',
      category: 'friend',
      avatar_icon: '🤝',
      concerns: 'Ra mắt sản phẩm công nghệ MVP, kêu gọi vốn hạt giống, xây dựng nền tảng độc lập.',
      affinity: 75,
      trust: 70,
      sharedMemories: [
        'Bạn bè từ thời đại học, cùng ấp ủ giấc mơ lập nghiệp.',
        'Minh đề nghị chia 35% cổ phần sáng lập nếu bạn làm CTO.'
      ],
      activeCommitment: {
        title: 'Thử nghiệm dự án ngoài giờ',
        condition: 'Xác nhận hợp đồng với khách hàng đầu tiên.',
        deadline: 'Trước khi kết thúc năm nay'
      },
      locationHint: 'Quán Cafe Công nghệ'
    },
    {
      id: 'npc_hung',
      name: 'Anh Hùng',
      role: 'Trưởng phòng Kỹ thuật',
      category: 'colleague',
      avatar_icon: '💼',
      concerns: 'Sự ổn định của bộ máy, tiến độ bàn giao dự án tập đoàn, sự trung thành nghề nghiệp.',
      affinity: 60,
      trust: 65,
      sharedMemories: [
        'Đã đồng hành qua nhiều đợt sprint căng thẳng tại tập đoàn.',
        'Đề xuất thăng chức Tech Lead kèm thưởng cổ phiếu ESOP.'
      ],
      locationHint: 'Văn phòng Tập đoàn'
    }
  ];

  // Merge with procedural family relationships from character
  const familyNPCs: NPCData[] = relationships.map((r, i) => ({
    id: r.id || `rel_${i}`,
    name: r.name || (r.type === 'father' ? 'Cha' : r.type === 'mother' ? 'Mẹ' : r.type === 'spouse' ? 'Vợ / Chồng' : 'Con cái'),
    role: r.type === 'father' ? 'Cha ruột' : r.type === 'mother' ? 'Mẹ ruột' : r.type === 'spouse' ? 'Bạn đời' : r.type === 'child' ? 'Con ruột' : 'Người thân',
    category: 'family',
    avatar_icon: r.type === 'child' ? '👶' : r.type === 'spouse' ? '💍' : '🏡',
    concerns: 'Sự bình an, sức khoẻ và hạnh phúc của gia đình.',
    affinity: r.affinity ?? 75,
    trust: 85,
    sharedMemories: [
      `Gắn bó trong gia đình từ những năm đầu đời.`
    ]
  }));

  const allNPCs = [...coreNPCs, ...familyNPCs];

  const filteredNPCs = allNPCs.filter(npc => {
    if (selectedCategory === 'key_npcs') return npc.category !== 'family';
    if (selectedCategory === 'family') return npc.category === 'family';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-400" />
            <span>Mối Quan Hệ & Bằng Hữu</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi Thiện cảm, Tin tưởng và các Cam kết có trách nhiệm với những người quan trọng trong đời.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({allNPCs.length})
          </button>
          <button
            onClick={() => setSelectedCategory('key_npcs')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedCategory === 'key_npcs'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nhân vật then chốt ({coreNPCs.length})
          </button>
          <button
            onClick={() => setSelectedCategory('family')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedCategory === 'family'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gia đình ({familyNPCs.length})
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* NPC Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNPCs.map(npc => (
          <div
            key={npc.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-sm"
          >
            {/* Top row: Avatar & Identity */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {npc.avatar_icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <span>{npc.name}</span>
                    <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-purple-300">
                      {npc.role}
                    </span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {npc.locationHint ? (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Home className="w-3 h-3 text-slate-500" /> Hiện ở: {npc.locationHint}
                      </span>
                    ) : (
                      'Quan hệ gia đình'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Core Concerns (Điều họ quan tâm) */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Điều họ quan tâm:
              </span>
              <p className="text-slate-300 font-serif leading-relaxed">
                {npc.concerns}
              </p>
            </div>

            {/* Metrics: Thiện cảm & Tin tưởng */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Thiện cảm (Affinity) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" /> Thiện cảm
                  </span>
                  <span className="font-mono font-bold text-rose-300 text-xs">
                    {npc.affinity > 0 ? `+${npc.affinity}` : npc.affinity}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, (npc.affinity + 100) / 2))}%` }}
                  />
                </div>
              </div>

              {/* Tin tưởng (Trust) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Tin tưởng
                  </span>
                  <span className="font-mono font-bold text-indigo-300 text-xs">
                    {npc.trust}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, npc.trust))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Active Commitments (Cam kết) */}
            {npc.activeCommitment && (
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-purple-300 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> Cam kết: {npc.activeCommitment.title}
                  </span>
                  {npc.activeCommitment.deadline && (
                    <span className="font-mono text-amber-400 text-[10px]">{npc.activeCommitment.deadline}</span>
                  )}
                </div>
                <div className="text-slate-400 text-[11px] font-serif">
                  {npc.activeCommitment.condition}
                </div>
              </div>
            )}

            {/* Actions / Scene Link */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              {npc.locationHint && onNavigateToScene ? (
                <button
                  onClick={() => onNavigateToScene()}
                  className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Trò chuyện tại cảnh 2D</span>
                </button>
              ) : (
                <button
                  onClick={async () => {
                    if (onFamilyMeal) {
                      await onFamilyMeal();
                      setActionNotice(`Đã tổ chức bữa cơm sum họp cùng ${npc.name} (+Thiện cảm & Tình thân).`);
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Gắn kết tình thân (+Tình cảm)</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
