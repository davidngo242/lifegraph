// Pure node generation for the Life Tree (Đợt 2: 2.1). No React/DOM; testable with node.
import type { Unlocks } from './unlocks';

export interface LifeTreeNode {
  id: string;
  title: string;
  category: 'vitality' | 'wisdom' | 'family' | 'career' | 'destiny';
  icon: string;
  apCost: number;
  gainText: string;
  flavor: string;
  isBreakthrough?: boolean;
  disabled?: boolean;
  angleDeg: number;
  distanceRatio: number;
  color: {
    border: string;
    bg: string;
    glow: string;
    text: string;
    line: string;
  };
}

export interface LifeTreeNodeInput {
  character?: any;
  characterAge: number;
  breakthroughAction?: { id: string; title: string; icon?: string; description: string; costAp?: number; costCash?: number } | null;
  unlocks: Unlocks;
}

export function getBaseNodes({ character, characterAge, breakthroughAction, unlocks }: LifeTreeNodeInput): LifeTreeNode[] {
  // Stage 1: Sơ sinh & Ấu thơ (0 - 5 Tuổi)
  if (characterAge <= 5) {
    const nodes: LifeTreeNode[] = [
      {
        id: 'cuddle_parents',
        title: 'Làm Nũng Phụ Mẫu',
        category: 'family',
        icon: '💖',
        apCost: 1,
        gainText: '+15 Tình cảm, -10 Stress',
        flavor: 'Dụi đầu vào cổ mẹ nũng nịu đòi bế, nghe tiếng cha cười vang gian nhà',
        angleDeg: 180, // Cánh Tây hạ cân đối
        distanceRatio: 0.94,
        color: {
          border: 'border-pink-400/60 dark:border-pink-500/50',
          bg: 'bg-pink-50/95 dark:bg-pink-950/70',
          glow: '#f43f5e',
          text: 'text-pink-900 dark:text-pink-300',
          line: '#e11d48'
        }
      },
      {
        id: 'toy_brain',
        title: 'Đồ Chơi Trí Não',
        category: 'wisdom',
        icon: '🧸',
        apCost: 1,
        gainText: '+10 Trí tuệ, +5 Karma',
        flavor: 'Lắc chiếc lục lạc leng keng, tò mò gặm thử mẩu gỗ vuông cha đẽo',
        angleDeg: -145, // Cánh Tây Bắc Trí Tuệ (tách biệt hẳn nút Đột Phá -90°)
        distanceRatio: 0.88,
        color: {
          border: 'border-sky-400/60 dark:border-sky-500/50',
          bg: 'bg-sky-50/95 dark:bg-sky-950/70',
          glow: '#0284c7',
          text: 'text-sky-900 dark:text-sky-300',
          line: '#0284c7'
        }
      },
      {
        id: 'sunbath',
        title: 'Tắm Nắng Sớm',
        category: 'vitality',
        icon: '☀️',
        apCost: 1,
        gainText: '+10 Đề kháng, -5 Stress',
        flavor: 'Nằm phơi nắng sớm ngoài hiên, gió phe phẩy làm khô lớp mồ hôi trộm',
        angleDeg: -35, // Cánh Đông Bắc thoáng đạt
        distanceRatio: 0.88,
        color: {
          border: 'border-amber-400/60 dark:border-amber-500/50',
          bg: 'bg-amber-50/95 dark:bg-amber-950/70',
          glow: '#f59e0b',
          text: 'text-amber-900 dark:text-amber-300',
          line: '#d97706'
        }
      },
      {
        id: 'toddler_walk',
        title: 'Tập Đi & Bập Bẹ',
        category: 'vitality',
        icon: '👶',
        apCost: 1,
        gainText: '+3 Max HP, +8 Thể lực',
        flavor: 'Bám thành giường lò dò từng bước, ngã dập mông lại lồm cồm bò dậy',
        angleDeg: 0, // Cánh Đông hạ cân đối
        distanceRatio: 0.94,
        color: {
          border: 'border-teal-400/60 dark:border-teal-500/50',
          bg: 'bg-teal-50/95 dark:bg-teal-950/70',
          glow: '#14b8a6',
          text: 'text-teal-900 dark:text-teal-300',
          line: '#0d9488'
        }
      },
      {
        id: 'eat_grow',
        title: 'Bú Mẹ & Ăn Dặm',
        category: 'vitality',
        icon: '🍼',
        apCost: 1,
        gainText: '+15 Thể chất, +5 HP',
        flavor: 'Ngậm bầu sữa ấm của mẹ, no bụng rồi chìm vào giấc ngủ thật say',
        angleDeg: 142, // Tây Nam cội rễ (tách hẳn nút Bệ Gốc & Rễ Gia Đình)
        distanceRatio: 0.86,
        color: {
          border: 'border-emerald-400/60 dark:border-emerald-500/50',
          bg: 'bg-emerald-50/95 dark:bg-emerald-950/70',
          glow: '#10b981',
          text: 'text-emerald-900 dark:text-emerald-300',
          line: '#059669'
        }
      }
    ];

    if (breakthroughAction && unlocks.breakthrough) {
      nodes.push({
        id: 'breakthrough',
        title: breakthroughAction.title,
        category: 'destiny',
        icon: breakthroughAction.icon || '🚀',
        apCost: breakthroughAction.costAp || 2,
        gainText: 'ĐỘT PHÁ SỐ MỆNH',
        flavor: breakthroughAction.description,
        isBreakthrough: true,
        angleDeg: -90, // Vươn cao Thiên Đỉnh (Zenith)
        distanceRatio: 0.86,
        color: {
          border: 'border-amber-500 dark:border-amber-400',
          bg: 'bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 dark:from-amber-950 dark:via-yellow-950 dark:to-amber-950',
          glow: '#eab308',
          text: 'text-amber-950 dark:text-amber-200',
          line: '#f59e0b'
        }
      });
    }

    return nodes;
  }

  // Stage 2: Tuổi Học Trò (6 - 17 Tuổi)
  if (characterAge <= 17) {
    const nodes: LifeTreeNode[] = [
      {
        id: 'school_study',
        title: 'Học Bài Ở Trường',
        category: 'wisdom',
        icon: '🎒',
        apCost: 1,
        gainText: '+12 Karma học vấn',
        flavor: 'Nắn nót từng dòng mực tím, quyết tâm giải bằng được bài toán đố hóc búa',
        angleDeg: -145,
        distanceRatio: 0.88,
        color: {
          border: 'border-sky-400/60 dark:border-sky-500/50',
          bg: 'bg-sky-50/95 dark:bg-sky-950/70',
          glow: '#38bdf8',
          text: 'text-sky-900 dark:text-sky-300',
          line: '#0284c7'
        }
      },
      {
        id: 'help_chores',
        title: 'Việc Nhà Phụ Mẹ',
        category: 'family',
        icon: '🧹',
        apCost: 1,
        gainText: '+$25 tiền tiêu vặt, +Gia đạo',
        flavor: 'Quét sạch hiên nhà, rửa xong chồng bát đũa mỡ màng để mẹ về đỡ nhọc',
        angleDeg: -35,
        distanceRatio: 0.88,
        color: {
          border: 'border-emerald-400/60 dark:border-emerald-500/50',
          bg: 'bg-emerald-50/95 dark:bg-emerald-950/70',
          glow: '#10b981',
          text: 'text-emerald-900 dark:text-emerald-300',
          line: '#059669'
        }
      },
      {
        id: 'play_sports',
        title: 'Đá Bóng Cùng Bạn',
        category: 'vitality',
        icon: '⚽',
        apCost: 1,
        gainText: '+10 HP, -20 Stress',
        flavor: 'Tranh bóng trên sân đất nứt nẻ, mồ hôi ướt đẫm lưng áo mà vui hết nấc',
        angleDeg: 0,
        distanceRatio: 0.94,
        color: {
          border: 'border-amber-400/60 dark:border-amber-500/50',
          bg: 'bg-amber-50/95 dark:bg-amber-950/70',
          glow: '#f59e0b',
          text: 'text-amber-900 dark:text-amber-300',
          line: '#d97706'
        }
      },
      {
        id: 'explore_nature',
        title: 'Khám Phá Thiên Nhiên',
        category: 'wisdom',
        icon: '🌲',
        apCost: 1,
        gainText: '+Khám phá, Nuôi dưỡng tâm hồn',
        flavor: 'Trèo cây hái quả dại, lội mương bắt ốc cùng đám bạn xóm dưới',
        angleDeg: 38,
        distanceRatio: 0.86,
        color: {
          border: 'border-teal-400/60 dark:border-teal-500/50',
          bg: 'bg-teal-50/95 dark:bg-teal-950/70',
          glow: '#14b8a6',
          text: 'text-teal-900 dark:text-teal-300',
          line: '#0d9488'
        }
      },
      {
        id: 'talk_parents',
        title: 'Tâm Sự Cha Mẹ',
        category: 'family',
        icon: '👨‍👩‍👧',
        apCost: 1,
        gainText: '+Hảo cảm, Gia đạo thuận hòa',
        flavor: 'Ngồi bên mâm cơm tối kể chuyện trường lớp, nghe cha thở dài chuyện tiền nong',
        angleDeg: 180,
        distanceRatio: 0.94,
        color: {
          border: 'border-amber-400/60 dark:border-amber-500/40',
          bg: 'bg-amber-50/95 dark:bg-amber-500/10',
          glow: '#f59e0b',
          text: 'text-amber-900 dark:text-amber-300',
          line: '#d97706'
        }
      }
    ];

    if (breakthroughAction && unlocks.breakthrough) {
      nodes.push({
        id: 'breakthrough',
        title: breakthroughAction.title,
        category: 'destiny',
        icon: breakthroughAction.icon || '🏆',
        apCost: breakthroughAction.costAp || 2,
        gainText: 'ĐỘT PHÁ SỐ MỆNH',
        flavor: breakthroughAction.description,
        isBreakthrough: true,
        angleDeg: -90,
        distanceRatio: 0.86,
        color: {
          border: 'border-amber-500 dark:border-amber-400',
          bg: 'bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 dark:from-amber-950 dark:via-yellow-950 dark:to-amber-950',
          glow: '#eab308',
          text: 'text-amber-950 dark:text-amber-200',
          line: '#f59e0b'
        }
      });
    }

    return nodes;
  }

  // Stage 3 & Trưởng thành (18+ Tuổi): Dynamic Career Foliage (Quyết định 1)
  const careerCategory = String(character?.career_category || character?.occupation_field || '').toLowerCase();
  const jobTitle = String(character?.job || character?.career || character?.profession || '').toLowerCase();

  let workNode: LifeTreeNode;
  if (careerCategory.includes('health') || jobTitle.includes('bác sĩ') || jobTitle.includes('y tế') || jobTitle.includes('dược')) {
    workNode = {
      id: 'work_ot',
      title: 'Ca Mổ Cấp Cứu',
      category: 'career',
      icon: '🩺',
      apCost: 1,
      gainText: '+$3.5k Thặng dư, +15 Karma',
      flavor: 'Tập trung cao độ trong phòng mổ, giật lại sự sống cho bệnh nhân từ tay tử thần',
      angleDeg: 180,
      distanceRatio: 0.94,
      color: {
        border: 'border-emerald-400/60 dark:border-emerald-500/50',
        bg: 'bg-emerald-50/95 dark:bg-emerald-950/70',
        glow: '#10b981',
        text: 'text-emerald-950 dark:text-emerald-300',
        line: '#059669'
      }
    };
  } else if (careerCategory.includes('tech') || jobTitle.includes('coder') || jobTitle.includes('kỹ sư') || jobTitle.includes('phần mềm') || jobTitle.includes('dev')) {
    workNode = {
      id: 'work_ot',
      title: 'Kiến Trúc & Fix Bug Đêm',
      category: 'career',
      icon: '💻',
      apCost: 1,
      gainText: '+$3.2k Thặng dư, +10 Trí tuệ',
      flavor: 'Tối ưu thuật toán chịu tải hàng triệu người dùng, hoàn thành bản phát hành quan trọng',
      angleDeg: 180,
      distanceRatio: 0.94,
      color: {
        border: 'border-cyan-400/60 dark:border-cyan-500/50',
        bg: 'bg-cyan-50/95 dark:bg-cyan-950/70',
        glow: '#06b6d4',
        text: 'text-cyan-950 dark:text-cyan-300',
        line: '#0891b2'
      }
    };
  } else if (careerCategory.includes('finance') || careerCategory.includes('business') || jobTitle.includes('doanh') || jobTitle.includes('giám đốc') || jobTitle.includes('ceo')) {
    workNode = {
      id: 'work_ot',
      title: 'Đàm Phán & Gọi Vốn',
      category: 'career',
      icon: '📊',
      apCost: 1,
      gainText: '+$4.5k Thặng dư, +Uy quyền',
      flavor: 'Bảo vệ kế hoạch kinh doanh trước các quỹ mạo hiểm, ký kết hợp đồng thương mại lớn',
      angleDeg: 180,
      distanceRatio: 0.94,
      color: {
        border: 'border-amber-400/60 dark:border-amber-500/50',
        bg: 'bg-amber-50/95 dark:bg-amber-950/70',
        glow: '#f59e0b',
        text: 'text-amber-950 dark:text-amber-300',
        line: '#d97706'
      }
    };
  } else if (careerCategory.includes('art') || jobTitle.includes('nghệ sĩ') || jobTitle.includes('nhà văn') || jobTitle.includes('họa sĩ') || jobTitle.includes('thiết kế')) {
    workNode = {
      id: 'work_ot',
      title: 'Sáng Tác Tuyệt Phẩm',
      category: 'career',
      icon: '🎨',
      apCost: 1,
      gainText: '+$2.8k, +Danh vọng vang xa',
      flavor: 'Đốt cháy đam mê trên từng nét vẽ trang sách, tạo nên tác phẩm để đời cho công chúng',
      angleDeg: 180,
      distanceRatio: 0.94,
      color: {
        border: 'border-purple-400/60 dark:border-purple-500/50',
        bg: 'bg-purple-50/95 dark:bg-purple-950/70',
        glow: '#a855f7',
        text: 'text-purple-950 dark:text-purple-300',
        line: '#9333ea'
      }
    };
  } else {
    workNode = {
      id: 'work_ot',
      title: 'Cày Cuốc Kiếm Tiền',
      category: 'career',
      icon: '💼',
      apCost: 1,
      gainText: '+$1.5k~$3k Thặng dư',
      flavor: 'Tăng ca mỏi mắt bên bàn làm việc, đổi mồ hôi lấy từng đồng tiền nuôi sống bản thân',
      angleDeg: 180, // Cành Hoàng Kim Tài Sản
      distanceRatio: 0.94,
      color: {
        border: 'border-emerald-400/60 dark:border-emerald-500/50',
        bg: 'bg-emerald-50/95 dark:bg-emerald-950/70',
        glow: '#10b981',
        text: 'text-emerald-950 dark:text-emerald-300',
        line: '#059669'
      }
    };
  }

  const adultNodes: LifeTreeNode[] = [
    workNode,
    {
      id: 'study_specialty',
      title: 'Đèn Sách Tri Thức',
      category: 'wisdom',
      icon: '📚',
      apCost: 1,
      gainText: '+8 Karma, Nâng trình chuyên môn',
      flavor: 'Thức trắng đêm nghiên cứu tài liệu chuyên ngành, mở rộng tầm nhìn học thuật',
      angleDeg: -145, // Cành Tây Bắc Trí Tuệ (tách biệt hẳn nút Đột Phá -90°)
      distanceRatio: 0.88,
      color: {
        border: 'border-sky-400/60 dark:border-sky-500/50',
        bg: 'bg-sky-50/95 dark:bg-sky-950/70',
        glow: '#0284c7',
        text: 'text-sky-900 dark:text-sky-300',
        line: '#0284c7'
      }
    },
    {
      id: 'expand_network',
      title: 'Mở Rộng Nhân Mạch',
      category: 'family',
      icon: '🤝',
      apCost: 1,
      gainText: 'Gặp gỡ tri kỷ, Mở lối làm ăn',
      flavor: 'Mời ly cà phê vỉa hè hay bữa tối thân tình, kết nối những mối quan hệ vàng ngọc',
      angleDeg: -35, // Cành Đông Bắc Nhân Mạch
      distanceRatio: 0.88,
      color: {
        border: 'border-amber-400/60 dark:border-amber-500/40',
        bg: 'bg-amber-50/95 dark:bg-amber-500/10',
        glow: '#f59e0b',
        text: 'text-amber-900 dark:text-amber-300',
        line: '#d97706'
      }
    },
    {
      id: 'stock_trading',
      title: 'Lướt Sóng & Thử Vận',
      category: 'career',
      icon: '📈',
      apCost: 1,
      gainText: 'Cơ hội x2 vốn hoặc rút củi',
      flavor: 'Đặt lệnh mua mã cổ phiếu tiềm năng, tim đập thình thịch theo từng nhịp bảng điện tử',
      angleDeg: 0, // Cánh Đông Tài Sản
      distanceRatio: 0.94,
      color: {
        border: 'border-pink-400/60 dark:border-pink-500/50',
        bg: 'bg-pink-50/95 dark:bg-pink-950/70',
        glow: '#f43f5e',
        text: 'text-pink-900 dark:text-pink-300',
        line: '#e11d48'
      }
    },
    {
      id: 'restore_vitality',
      title: 'Dưỡng Sinh Hồi Phục',
      category: 'vitality',
      icon: '🌿',
      apCost: 1,
      gainText: '+15 Sinh lực, -25 Stress',
      flavor: 'Tắm nước nóng xua tan cơn đau nhức xương khớp, ngủ một giấc sâu không mộng mị',
      angleDeg: 142, // Cội Rễ Sinh Mệnh Tây Nam (tránh bệ gốc, rễ gia đình & nhãn đáy)
      distanceRatio: 0.86,
      color: {
        border: 'border-teal-400/60 dark:border-teal-500/50',
        bg: 'bg-teal-50/95 dark:bg-teal-950/70',
        glow: '#14b8a6',
        text: 'text-teal-900 dark:text-teal-300',
        line: '#0d9488'
      }
    }
  ];

  if (breakthroughAction && unlocks.breakthrough) {
    adultNodes.push({
      id: 'breakthrough',
      title: breakthroughAction.title,
      category: 'destiny',
      icon: breakthroughAction.icon || '🚀',
      apCost: breakthroughAction.costAp || 2,
      gainText: 'ĐỘT PHÁ SỐ MỆNH',
      flavor: breakthroughAction.description,
      isBreakthrough: true,
      angleDeg: -90, // Vươn cao Thiên Đỉnh (Zenith) - cách biệt rõ với Đèn Sách (-152°)
      distanceRatio: 0.86,
      color: {
        border: 'border-amber-500 dark:border-amber-400',
        bg: 'bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 dark:from-amber-950 dark:via-yellow-950 dark:to-amber-950',
        glow: '#eab308',
        text: 'text-amber-950 dark:text-amber-200',
        line: '#f59e0b'
      }
    });
  }

  return adultNodes;
}

export const YEAR_FOCUSES = ['career', 'family', 'health', 'learning', 'experience'] as const;
export type YearFocus = (typeof YEAR_FOCUSES)[number];

export const YEAR_FOCUS_META: Record<YearFocus, { label: string; icon: string; hint: string }> = {
  career: { label: 'Sự nghiệp', icon: '💼', hint: 'Việc làm, tiền bạc' },
  family: { label: 'Gia đình', icon: '🏡', hint: 'Người thân, bữa cơm' },
  health: { label: 'Sức khỏe', icon: '🌿', hint: 'Thể lực, tĩnh dưỡng' },
  learning: { label: 'Học hỏi', icon: '📚', hint: 'Sách vở, chuyên môn' },
  experience: { label: 'Trải nghiệm', icon: '🧭', hint: 'Khám phá, gặp gỡ' },
};

export function normalizeYearFocus(v: unknown): YearFocus | null {
  return (YEAR_FOCUSES as readonly string[]).includes(v as string) ? (v as YearFocus) : null;
}

// Node ids that belong to each focus, per life stage (ids reuse existing handlers).
const ADULT_FOCUS_IDS: Record<YearFocus, string[]> = {
  career: ['work_ot', 'stock_trading', 'study_specialty'],
  family: ['expand_network', 'talk_parents', 'family_meal'],
  health: ['restore_vitality', 'health_checkup'],
  learning: ['study_specialty'],
  experience: ['explore_nature', 'expand_network'],
};
const TEEN_FOCUS_IDS: Record<YearFocus, string[]> = {
  career: ['help_chores', 'school_study'],
  family: ['talk_parents', 'help_chores'],
  health: ['play_sports'],
  learning: ['school_study'],
  experience: ['explore_nature'],
};
const ADULT_FOUNDATION = ['restore_vitality', 'study_specialty', 'expand_network'];
const TEEN_FOUNDATION = ['play_sports', 'school_study', 'talk_parents'];
const MAX_FOUNDATION = 2;

const reangle = (n: LifeTreeNode, angleDeg: number, distanceRatio = n.distanceRatio): LifeTreeNode => ({ ...n, angleDeg, distanceRatio });

function extraNode(id: string, input: LifeTreeNodeInput): LifeTreeNode | undefined {
  const teen = () => getBaseNodes({ ...input, characterAge: 10 });
  if (id === 'talk_parents') {
    const n = teen().find(x => x.id === id);
    return n && reangle(n, 180, 0.94);
  }
  if (id === 'explore_nature') {
    const n = teen().find(x => x.id === id);
    return n && reangle(n, 0, 0.94);
  }
  const adult = getBaseNodes({ ...input, characterAge: 30 });
  if (id === 'family_meal') {
    return {
      id, title: 'Bữa Cơm Sum Vầy', category: 'family', icon: '🍚', apCost: 0,
      gainText: 'Hồi sức, thêm gắn bó gia đình', flavor: 'Cả nhà quây quần bên mâm cơm, kể nhau nghe chuyện trong năm',
      angleDeg: 0, distanceRatio: 0.94,
      color: { border: 'border-rose-400/60 dark:border-rose-500/50', bg: 'bg-rose-50/95 dark:bg-rose-950/70', glow: '#f43f5e', text: 'text-rose-950 dark:text-rose-300', line: '#e11d48' },
    };
  }
  if (id === 'health_checkup') {
    const base = adult.find(x => x.id === 'restore_vitality');
    return base && {
      ...reangle(base, 180, 0.94), id, title: 'Khám Sức Khỏe', icon: '🩺',
      gainText: 'Tầm soát thể lực, đẩy lùi bệnh tật', flavor: 'Đến phòng khám kiểm tra tổng quát trước khi cơ thể lên tiếng',
    };
  }
  return undefined;
}

/** First cast member with a non-empty memory (a "hot" story), or null. */
export function getHotCastMember(character: any): { id: string; name: string } | null {
  const cast = Array.isArray(character?.cast) ? character.cast : [];
  for (const m of cast) {
    const mem = m?.memory;
    const has = Array.isArray(mem) ? mem.length > 0 : typeof mem === 'string' ? mem.trim().length > 0 : Boolean(mem && typeof mem === 'object' && Object.keys(mem).length);
    if (m?.id && m?.name && has) return { id: String(m.id), name: String(m.name) };
  }
  return null;
}

export function getNodesForState(input: LifeTreeNodeInput): LifeTreeNode[] {
  const { character, characterAge } = input;
  const base = getBaseNodes(input);
  const focus = normalizeYearFocus(character?.year_focus);
  let nodes = base;

  if (focus && characterAge >= 6) {
    const teen = characterAge <= 17;
    const focusIds = (teen ? TEEN_FOCUS_IDS : ADULT_FOCUS_IDS)[focus];
    const pool = new Map<string, LifeTreeNode>(base.map(n => [n.id, n]));
    const picked: LifeTreeNode[] = [];
    for (const id of focusIds) {
      const n = pool.get(id) || extraNode(id, input);
      if (n) picked.push(n);
    }
    // Career-only nodes never leak into other foci via the foundation list.
    const foundation = (teen ? TEEN_FOUNDATION : ADULT_FOUNDATION)
      .filter(id => !focusIds.includes(id) && pool.has(id))
      .slice(0, MAX_FOUNDATION)
      .map(id => pool.get(id)!);
    const bt = base.filter(n => n.isBreakthrough);
    nodes = [...picked, ...foundation, ...bt];
  }

  const hot = characterAge >= 6 ? getHotCastMember(character) : null;
  if (hot) {
    nodes = [...nodes, {
      id: `npc_meet:${hot.id}`, title: `Gặp ${hot.name}`, category: 'family', icon: '🗣️', apCost: 0,
      gainText: 'Câu chuyện đang nóng', flavor: `${hot.name} vẫn nhớ chuyện cũ, đến gặp để nói chuyện`,
      angleDeg: 35, distanceRatio: 0.9,
      color: { border: 'border-violet-400/60 dark:border-violet-500/50', bg: 'bg-violet-50/95 dark:bg-violet-950/70', glow: '#8b5cf6', text: 'text-violet-950 dark:text-violet-300', line: '#7c3aed' },
    }];
  }
  return nodes;
}
