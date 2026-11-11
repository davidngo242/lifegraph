'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import {
  Home,
  Briefcase,
  Coffee,
  Heart,
  Flame,
  Sparkles,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Compass,
  ArrowRight,
  ArrowLeft,
  Brain,
  Shield,
  Layers,
  Lock,
  X,
  MessageSquare,
  Award,
  Footprints,
  Maximize2,
  Zap
} from 'lucide-react';

// =========================================================================
// TYPES & DATA STRUCTURES
// =========================================================================
interface HotspotDialogue {
  speaker: string;
  text: string;
  granted_knowledge?: string;
  affinity_delta?: number;
  trust_delta?: number;
  cost_ap?: number;
}

interface Hotspot {
  id: string;
  label: string;
  icon: string;
  position_x: number;
  npc_role?: string;
  dialogue?: HotspotDialogue;
}

interface Scene {
  id: string;
  name: string;
  background_theme: string;
  hotspots: Hotspot[];
}

interface ScenarioChoice {
  id: string;
  title: string;
  stance: string;
  description: string;
  knowledge_requirements?: string[];
  cost_ap?: number;
  check?: {
    type: string;
    stat: string;
    target_dc: number;
    bonus_traits?: string[];
  };
}

interface ScenarioData {
  id: string;
  title: string;
  description: string;
  scenes: Scene[];
  mind_stage?: {
    whispers?: {
      rational?: string;
      empathy?: string;
      instinct?: string;
      dilemma_prompt?: string;
    };
  };
  choices: ScenarioChoice[];
}

interface InteractiveScene2DProps {
  onScenarioResolved?: (result: any) => void;
  onAdvanceYear?: () => void;
  character?: any;
  onBackToCockpit?: () => void;
}

const KNOWLEDGE_LABELS: { [key: string]: { label: string; icon: string; desc: string } } = {
  mai_financial_caution: {
    label: "Mai cần an toàn tài chính",
    icon: "❤️",
    desc: "Mai mong muốn gia đình có quỹ dự phòng an toàn trước khi mạo hiểm."
  },
  personal_runway_verified: {
    label: "Quỹ dự phòng 120M (6 tháng)",
    icon: "💰",
    desc: "Tiết kiệm cá nhân đủ chi trả sinh hoạt 6–8 tháng nếu không có lương."
  },
  corporate_promotion_offer: {
    label: "Đề xuất Tech Lead (+30% lương)",
    icon: "💼",
    desc: "Sếp Hùng đề xuất thăng chức Tech Lead kèm thưởng cổ phiếu ESOP."
  },
  corporate_stability_and_limits: {
    label: "Quy trình tập đoàn chậm",
    icon: "🏢",
    desc: "Môi trường ổn định nhưng khó bứt phá công nghệ mới."
  },
  minh_equity_offer: {
    label: "35% cổ phần CTO từ Minh",
    icon: "🤝",
    desc: "Minh đề nghị chia 35% cổ phần sáng lập nếu bạn làm Giám đốc Kỹ thuật."
  },
  market_real_demand_confirmed: {
    label: "Hợp đồng 150M sẵn sàng ký",
    icon: "📈",
    desc: "Khách hàng Logistics sẵn sàng ký hợp đồng 150 triệu nếu có cam kết bảo mật."
  },
  infant_curiosity: {
    label: "Trí tò mò & Giác quan đầu đời",
    icon: "⭐",
    desc: "Những khối hình sắc màu kích thích não bộ và tư duy không gian từ thuở lọt lòng."
  },
  parental_unconditional_love: {
    label: "Tình yêu thương vô điều kiện của Cha Mẹ",
    icon: "❤️",
    desc: "Vòng tay phụ mẫu là bến đỗ vững chãi nhất giúp bạn an tâm khôn lớn."
  },
  infant_emergency_fever_patch: {
    label: "Khăn ấm & túi chườm hạ sốt",
    icon: "🧊",
    desc: "Khăn ấm vắt ráo chườm trán và bẹn giúp tản nhiệt an toàn, ngăn chặn co giật trước khi thuốc phát huy tác dụng."
  },
  infant_pediatric_guidance: {
    label: "Bác sĩ trực trạm xá nhi",
    icon: "🩺",
    desc: "Cơn sốt cao co giật ở trẻ nhỏ cần theo dõi sát đường thở và bù nước điện giải khẩn cấp. Mỗi giây phút đều quý giá!"
  },
  infant_maternal_prayer: {
    label: "Lời cầu nguyện & cái ôm của Mẹ",
    icon: "🙏",
    desc: "Cầu xin trời phật che chở cho con tôi bình an... Con ngoan hãy cố lên, mẹ luôn ở bên ôm chặt lấy con!"
  },
  river_current_awareness: {
    label: "Dòng nước xoáy mùa mưa lũ",
    icon: "🌊",
    desc: "Nước chảy xiết tạo thành các hố xoáy ngầm nguy hiểm. Bơi ngược dòng sẽ nhanh chóng bị kiệt sức!"
  },
  friend_panic_signal: {
    label: "Tiếng kêu cứu của bạn bè",
    icon: "🚨",
    desc: "Cứu tớ với! Chân tớ bị chuột rút rồi, nước cuốn mạnh quá không vào bờ được!"
  },
  riverbank_bamboo_grip: {
    label: "Bụi tre bờ sông cứu sinh",
    icon: "🎋",
    desc: "Những thân tre già dài và dẻo dai bên bờ là vật cứu hộ tuyệt vời để người trên bờ vươn ra cho người dưới nước bám vào."
  }
};


const HOTSPOT_LIFE_IMPACTS: { [key: string]: { perk: string; icon: string; category: string } } = {
  hs_fever_cloth: {
    perk: "Kỹ năng sơ cứu hạ nhiệt chuẩn y khoa (+5 Vitality, phòng co giật)",
    icon: "🧊",
    category: "Y Tế"
  },
  hs_doctor_clinic: {
    perk: "Đặc quyền bảo hộ y tế nhi khoa chuyên sâu (+10 Vitality, +10 Karma)",
    icon: "🩺",
    category: "Y Tế"
  },
  hs_mother_prayer: {
    perk: "Sức mạnh ý chí mẫu tử thiêng liêng (+25 Hảo cảm mẹ, hồi phục thần tốc)",
    icon: "❤️",
    category: "Gia Đạo"
  },
  hs_river_flow: {
    perk: "Bản lĩnh nhận diện dòng nước xoáy ngầm (+15% tỷ lệ sống sót sông nước)",
    icon: "🌊",
    category: "Sinh Tồn"
  },
  hs_drowning_friend: {
    perk: "Nghĩa hiệp tương thân tương ái (+20 Karma, tình bạn tri kỷ cả đời)",
    icon: "🤝",
    category: "Nhân Cách"
  },
  hs_bamboo_bank: {
    perk: "Tư duy ứng biến dụng cụ cứu nạn an toàn tuyệt đối (+15 Karma)",
    icon: "🎋",
    category: "Trí Tuệ"
  },
  hotspot_baby_blocks: {
    perk: "Ươm mầm Tư Duy Logic & Nghiên Cứu (+15% tỷ lệ đỗ trường chuyên)",
    icon: "🧩",
    category: "Trí Tuệ"
  },
  hotspot_parents_embrace: {
    perk: "Nền tảng Bản Lĩnh Gia Đình & EQ (+15 Karma, kháng stress)",
    icon: "❤️",
    category: "Gia Đạo"
  },
  hotspot_school_blackboard: {
    perk: "Kiến thức nền tảng & kỷ luật học đường (+20% điểm sát hạch)",
    icon: "📚",
    category: "Học Vấn"
  },
  hotspot_desk_study: {
    perk: "Rèn luyện khả năng tập trung sâu (Deep Work)",
    icon: "💡",
    category: "Kỹ Năng"
  },
  hotspot_workstation_dualmonitors: {
    perk: "Làm chủ công nghệ số & thu nhập khởi điểm cao (+30% lương)",
    icon: "💻",
    category: "Sự Nghiệp"
  },
  hotspot_cafe_counter: {
    perk: "Mạng lưới đối tác thương trường & quý nhân phù trợ",
    icon: "🤝",
    category: "Vốn Xã Hội"
  }
};

const cleanDialogueText = (text: string) => {
  if (!text) return '';
  return text.normalize('NFC').trim();
};

const cleanWhisper = (text: string) => {
  if (!text) return '';
  return text
    .normalize('NFC')
    .replace(/^[^:]{1,25}:\s*['"]?/, '')
    .replace(/^(Lý Trí|Trái Tim|Bản Năng|Lý trí|Trái tim|Bản năng)[\s:'"]*/i, '')
    .replace(/['"]$/, '')
    .trim();
};

// =========================================================================
// MIND SANCTUARY GENERATOR (Ambient 3D Contemplation Chamber when no scenario is active)
// =========================================================================
function getPersonalizedSanctuaryScenario(character: any, nextScenarioAge?: number | null): ScenarioData {
  const age = Number(character?.age ?? 25);
  const name = character?.name || "Bạn";
  const job = character?.job_title || character?.career || "Tự Do";
  const cash = Number(character?.cash ?? 0).toLocaleString();
  const burnout = Number(character?.burnout ?? 0);
  const health = Number(character?.vitality ?? 80);

  let statusObservation = "Bạn đang ở độ tuổi tràn đầy năng lượng.";
  if (age < 18) {
    statusObservation = "Giai đoạn học vấn và định hình nhân cách. Mỗi quyết định nhỏ hôm nay đều đặt nền móng cho tương lai.";
  } else if (age < 35) {
    statusObservation = "Những năm tháng thanh xuân lập nghiệp. Cân bằng giữa cống hiến sự nghiệp và gìn giữ thể chất.";
  } else if (age < 50) {
    statusObservation = "Giai đoạn tích lũy tài sản và khẳng định vị thế. Trách nhiệm gia đình và xã hội đang lớn dần.";
  } else {
    statusObservation = "Những năm tháng chiêm nghiệm chín chắn. Tích lũy di sản và truyền thụ trí tuệ cho thế hệ tiếp theo.";
  }

  const nextMilestoneMsg = nextScenarioAge
    ? `Cột mốc ngã rẽ cuộc đời tiếp theo dự kiến tại tuổi ${nextScenarioAge}. Bạn còn ${Math.max(1, nextScenarioAge - age)} năm để chuẩn bị.`
    : "Hiện tại cuộc sống đang trôi qua tương đối êm đềm, không có biến cố nguy cấp.";

  return {
    id: "mind_sanctuary",
    title: "Phòng Trầm Tư · Không Gian Chiêm Nghiệm Cuộc Đời",
    description: `Tâm thất tĩnh lặng của ${name} (Tuổi ${age} · ${job}). ${statusObservation} ${nextMilestoneMsg}`,
    scenes: [
      {
        id: "scene_sanctuary",
        name: "Không Gian Trầm Tư",
        background_theme: "office",
        hotspots: [
          {
            id: "hotspot_sanctuary_meditation",
            label: "Ghế Tĩnh Tâm",
            icon: "🧘",
            position_x: 220,
            dialogue: {
              speaker: `${name} (Nội tâm)`,
              text: burnout > 50
                ? `Chỉ số kiệt sức của bạn đang ở mức khá cao (${burnout}%). Một khoảng lặng hít thở sâu lúc này sẽ giúp xoa dịu thần kinh.`
                : `Tâm trí bạn hiện tại khá an định (${burnout}% căng thẳng). Hãy giữ tinh thần sáng suốt này để vượt qua mọi thử thách!`
            }
          },
          {
            id: "hotspot_sanctuary_archive",
            label: "Tủ Kỷ Niệm & Manh Mối",
            icon: "📚",
            position_x: 450,
            dialogue: {
              speaker: "Ký Ức Đã Qua",
              text: `Bạn đã sống qua ${age} năm với tài sản hiện có là $${cash}. Mọi quyết định trong quá khứ đã tôi luyện nên con người bạn hôm nay.`
            }
          },
          {
            id: "hotspot_sanctuary_window",
            label: "Cửa Sổ Nhìn Vận Mệnh",
            icon: "🪟",
            position_x: 680,
            dialogue: {
              speaker: "Tầm Nhìn Cuộc Đời",
              text: `${nextMilestoneMsg} Hãy tận dụng những năm tháng bình yên này để nâng cao kỹ năng và gia tăng tài sản phòng vệ!`
            }
          }
        ]
      }
    ],
    mind_stage: {
      whispers: {
        rational: health < 50
          ? "Sức khỏe đang suy giảm, ưu tiên hàng đầu là nghỉ ngơi và bồi bổ thể lực."
          : "Tài chính và thể lực đang ổn định. Cân nhắc đầu tư học tập thêm kỹ năng mới.",
        empathy: "Đừng quên hỏi thăm gia đình, đối tác và những người thân yêu xung quanh bạn.",
        instinct: "Mỗi ngày trôi qua là một cơ hội. Giữ vững niềm tin vào con đường đã chọn.",
        dilemma_prompt: "Tâm trí bạn đang ở trạng thái bình hòa. Bạn muốn định hướng tâm thức như thế nào?"
      }
    },
    choices: [
      {
        id: "CHOICE_REFLECT_REST",
        title: "Tọa Thiền Tĩnh Tâm (Thư Giãn Thần Kinh)",
        stance: "inner_peace",
        description: "Ngồi tĩnh lặng lắng nghe nhịp thở, buông bỏ lo toan bộn bề để lấy lại sự minh mẫn."
      },
      {
        id: "CHOICE_REVIEW_GOALS",
        title: "Chiêm Nghiệm Chiến Lược Dài Hạn",
        stance: "rational",
        description: "Rà soát lại danh mục đầu tư, kế hoạch sự nghiệp và định hướng cho các năm tiếp theo."
      },
      {
        id: "CHOICE_RETURN_COCKPIT",
        title: "Sẵn Sàng Trở Về Cockpit Sinh Tồn",
        stance: "ready",
        description: "Tâm thế đã vững vàng, quay trở lại Bàn Điều Hành Cockpit để tiếp tục hành động và bước sang năm mới."
      }
    ]
  };
}

// =========================================================================
// CINEMATIC VOLUMETRIC SUNBEAM (God Rays through Window)
// =========================================================================
function VolumetricSunbeam3D({ color = '#fef08a' }: { color?: string }) {
  const outerConeRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreConeRef = useRef<THREE.MeshBasicMaterial>(null);
  const haloRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Atmospheric breathing / multi-harmonic pulsing of volumetric god rays
    if (outerConeRef.current) {
      outerConeRef.current.opacity = 0.16 + Math.sin(t * 1.1) * 0.035;
    }
    if (coreConeRef.current) {
      coreConeRef.current.opacity = 0.11 + Math.cos(t * 1.5) * 0.025;
    }
    if (haloRef.current) {
      haloRef.current.opacity = 0.05 + Math.sin(t * 0.7) * 0.015;
    }
  });

  return (
    <group position={[0, 1.6, -1.98]} rotation={[0.89, 0, 0]}>
      {/* 1. Primary Volumetric Cone Beam */}
      <mesh>
        <cylinderGeometry args={[1.9, 3.8, 5.2, 32, 1, true]} />
        <meshBasicMaterial
          ref={outerConeRef}
          color={color}
          transparent={true}
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 2. Secondary Inner Core Beam for Concentrated Sunlight Glow */}
      <mesh>
        <cylinderGeometry args={[1.1, 2.3, 5.0, 24, 1, true]} />
        <meshBasicMaterial
          ref={coreConeRef}
          color={color}
          transparent={true}
          opacity={0.11}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 3. Soft Tertiary Atmospheric Ambient Light Halo */}
      <mesh>
        <cylinderGeometry args={[2.4, 4.4, 5.3, 24, 1, true]} />
        <meshBasicMaterial
          ref={haloRef}
          color={color}
          transparent={true}
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// =========================================================================
// FLOATING DUST MOTES (Airborne Cinematic Light Particles)
// =========================================================================
function DustMotes3D({ count = 35, color = '#fef9c3' }: { count?: number; color?: string }) {
  const pointsRef = useRef<THREE.Group>(null);

  // Generate deterministic particles within the sunbeam cone
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = i * 137.5;
      return {
        initialX: (Math.sin(seed) * 1.6),
        initialY: 0.3 + (Math.abs(Math.cos(seed * 0.7)) * 2.8),
        initialZ: -3.6 + (Math.abs(Math.sin(seed * 0.5)) * 4.0),
        speed: 0.15 + (i % 5) * 0.05,
        swaySpeed: 0.8 + (i % 7) * 0.2,
        scale: 0.015 + ((i % 4) * 0.008),
        offset: i * 0.6
      };
    });
  }, [count]);

  const itemsRef = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    particles.forEach((p, idx) => {
      const mesh = itemsRef.current[idx];
      if (!mesh) return;

      const y = ((p.initialY + t * p.speed) % 3.2);
      const x = p.initialX + Math.sin(t * p.swaySpeed + p.offset) * 0.12;
      const z = p.initialZ + Math.cos(t * p.swaySpeed * 0.8 + p.offset) * 0.1;

      mesh.position.set(x, y, z);
      if (mesh.material && 'opacity' in mesh.material) {
        (mesh.material as THREE.MeshStandardMaterial).opacity = 0.3 + Math.sin(t * 2 + p.offset) * 0.35;
      }
    });
  });

  return (
    <group ref={pointsRef}>
      {particles.map((p, idx) => (
        <mesh
          key={idx}
          ref={(el) => { itemsRef.current[idx] = el; }}
          position={[p.initialX, p.initialY, p.initialZ]}
        >
          <sphereGeometry args={[p.scale, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            transparent={true}
            opacity={0.65}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// =========================================================================
// PROCEDURAL 3D ENVIRONMENT SETS (Free Procedural Room Geometries & Shaders)
// =========================================================================
function ProceduralRoom3D({
  theme = 'nursery',
  sceneId = '',
  activeTheme = 'obsidian',
  sunbeamColor = '#fef08a'
}: {
  theme?: string;
  sceneId?: string;
  activeTheme?: 'obsidian' | 'sepia' | 'cyberpunk';
  sunbeamColor?: string;
}) {
  const isNursery = theme.includes('nursery') || sceneId.includes('nursery');
  const isSchool = theme.includes('school') || sceneId.includes('school') || sceneId.includes('class');
  const isOffice = theme.includes('office') || sceneId.includes('office');
  const isCafe = theme.includes('cafe') || sceneId.includes('cafe');
  const isArtisan = theme.includes('artisan') || sceneId.includes('workshop');

  // Multi-Theme & Setting adaptive colors
  let wallColor = isNursery ? '#2a1a1f' : isSchool ? '#13212e' : isOffice ? '#0f172a' : isCafe ? '#27160c' : '#1e1b4b';
  let floorColor = isNursery ? '#3b2229' : isSchool ? '#1e293b' : isOffice ? '#1e293b' : isCafe ? '#451a03' : '#18181b';
  let windowGlowColor = isNursery ? '#fbcfe8' : isSchool ? '#93c5fd' : isOffice ? '#60a5fa' : isCafe ? '#fed7aa' : '#c084fc';

  if (activeTheme === 'sepia') {
    floorColor = isNursery ? '#451a03' : isCafe ? '#3e1a06' : '#29180f';
    wallColor = isNursery ? '#2d1810' : '#1c1815';
    windowGlowColor = '#fed7aa';
  } else if (activeTheme === 'cyberpunk') {
    floorColor = '#090d16';
    wallColor = '#0b1120';
    windowGlowColor = '#38bdf8';
  }

  return (
    <group>
      {/* 1. Main Parquet / Tiled Floor Plane with Specular Sheen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 9]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={0.38}
          metalness={0.16}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Grid Floor Lines for 3D Depth */}
      <gridHelper
        args={[16, 16, activeTheme === 'cyberpunk' ? '#0284c7' : '#334155', activeTheme === 'cyberpunk' ? '#0369a1' : '#1e293b']}
        position={[0, 0.005, 0]}
      />

      {/* 2. Room Back Wall with Baseboard */}
      <mesh position={[0, 2.8, -4.2]} receiveShadow>
        <boxGeometry args={[16.2, 5.8, 0.4]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      {/* Baseboard molding */}
      <mesh position={[0, 0.15, -3.98]}>
        <boxGeometry args={[16.2, 0.3, 0.08]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>

      {/* 3. Scenic Picture Window with Ambient Daylight/Night Skyline */}
      <group position={[0, 3.2, -3.95]}>
        {/* Window Outer Frame */}
        <mesh>
          <boxGeometry args={[4.2, 2.8, 0.1]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        {/* Glowing Window Glass Exterior Pane */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[3.8, 2.4]} />
          <meshBasicMaterial color={windowGlowColor} />
        </mesh>
        {/* Window Cross Grids */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[0.08, 2.4, 0.04]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[3.8, 0.08, 0.04]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Volumetric Sunbeam / God Rays Streaming From Window */}
      <VolumetricSunbeam3D color={sunbeamColor} />

      {/* Floating Dust Motes Dancing in the Sunbeam */}
      <DustMotes3D count={35} color={sunbeamColor} />

      {/* 4. THEMATIC PROCEDURAL FURNITURE & PROPS */}
      {isNursery && (
        <group>
          {/* Baby Crib / Cot */}
          <group position={[-3.8, 0.7, -1.8]}>
            {/* Mattress Base */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.8, 0.35, 1.1]} />
              <meshStandardMaterial color="#f472b6" roughness={0.9} />
            </mesh>
            {/* 4 Corner Posts */}
            {[-0.85, 0.85].map((x, i) =>
              [-0.5, 0.5].map((z, j) => (
                <mesh key={`${i}-${j}`} position={[x, 0.4, z]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.3, 12]} />
                  <meshStandardMaterial color="#fbbf24" roughness={0.4} />
                </mesh>
              ))
            )}
            {/* Top Rails */}
            <mesh position={[0, 0.95, -0.5]}>
              <boxGeometry args={[1.75, 0.06, 0.06]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.95, 0.5]}>
              <boxGeometry args={[1.75, 0.06, 0.06]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.4} />
            </mesh>
          </group>

          {/* Hanging Mobile Carousel above Crib */}
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
            <group position={[-3.8, 2.3, -1.8]}>
              <mesh position={[0, 0, 0]}>
                <ringGeometry args={[0.3, 0.35, 16]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
              <mesh position={[-0.25, -0.2, 0]}>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.4} />
              </mesh>
              <mesh position={[0.25, -0.2, 0]}>
                <octahedronGeometry args={[0.08]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.4} />
              </mesh>
            </group>
          </Float>

          {/* Toy Box with Building Cubes */}
          <group position={[3.6, 0.35, -2]}>
            <mesh>
              <boxGeometry args={[1.2, 0.65, 0.8]} />
              <meshStandardMaterial color="#0284c7" roughness={0.6} />
            </mesh>
            {/* Colorful Toy Cubes on Floor */}
            <mesh position={[-0.7, -0.2, 0.5]} rotation={[0, 0.3, 0]}>
              <boxGeometry args={[0.26, 0.26, 0.26]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[-0.4, -0.2, 0.7]} rotation={[0, -0.4, 0]}>
              <boxGeometry args={[0.24, 0.24, 0.24]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
            <mesh position={[-0.8, -0.2, 0.9]} rotation={[0, 0.5, 0]}>
              <boxGeometry args={[0.22, 0.22, 0.22]} />
              <meshStandardMaterial color="#10b981" />
            </mesh>
          </group>

          {/* Warm Braided Nursery Rug */}
          <group position={[0, 0.015, -0.2]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.7, 2.2, 48]} />
              <meshStandardMaterial
                color={activeTheme === 'sepia' ? '#b45309' : activeTheme === 'cyberpunk' ? '#0ea5e9' : '#d97706'}
                roughness={0.9}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
              <circleGeometry args={[1.7, 48]} />
              <meshStandardMaterial
                color={activeTheme === 'sepia' ? '#451a03' : activeTheme === 'cyberpunk' ? '#0f172a' : '#334155'}
                roughness={0.85}
                opacity={0.65}
                transparent
              />
            </mesh>
          </group>
        </group>
      )}

      {isSchool && (
        <group>
          {/* Classroom Blackboard */}
          <mesh position={[0, 3.1, -3.96]}>
            <boxGeometry args={[4.6, 2.2, 0.08]} />
            <meshStandardMaterial color="#064e3b" roughness={0.9} />
          </mesh>
          {/* Teacher's Chalkboard Border */}
          <mesh position={[0, 3.1, -3.93]}>
            <boxGeometry args={[4.8, 2.35, 0.04]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>

          {/* Student Wooden Desk & Chair */}
          <group position={[-3.2, 0.65, -1.8]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.5, 0.08, 0.9]} />
              <meshStandardMaterial color="#92400e" roughness={0.6} />
            </mesh>
            {[-0.65, 0.65].map((x, i) =>
              [-0.35, 0.35].map((z, j) => (
                <mesh key={`${i}-${j}`} position={[x, -0.32, z]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.65, 12]} />
                  <meshStandardMaterial color="#334155" />
                </mesh>
              ))
            )}
            {/* Open Notebook on Desk */}
            <mesh position={[0.2, 0.06, 0]} rotation={[0, -0.15, 0]}>
              <boxGeometry args={[0.35, 0.02, 0.25]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          </group>

          {/* Bookshelf */}
          <group position={[3.8, 1.6, -2.6]}>
            <mesh>
              <boxGeometry args={[1.4, 3.0, 0.6]} />
              <meshStandardMaterial color="#451a03" roughness={0.7} />
            </mesh>
            {/* Book rows */}
            {[0.8, 0, -0.8].map((y, idx) => (
              <mesh key={idx} position={[0, y, 0.1]}>
                <boxGeometry args={[1.2, 0.45, 0.35]} />
                <meshStandardMaterial color={idx === 0 ? '#dc2626' : idx === 1 ? '#2563eb' : '#059669'} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {isOffice && (
        <group>
          {/* Executive Workstation */}
          <group position={[-2.8, 0.7, -1.6]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2.2, 0.08, 1.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.2} />
            </mesh>
            {/* Desk Metal Legs */}
            {[-0.95, 0.95].map((x, i) =>
              [-0.45, 0.45].map((z, j) => (
                <mesh key={`${i}-${j}`} position={[x, -0.35, z]}>
                  <boxGeometry args={[0.06, 0.7, 0.06]} />
                  <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
                </mesh>
              ))
            )}
            {/* Dual Glowing Ultrawide Monitors */}
            <mesh position={[-0.4, 0.38, -0.2]} rotation={[0, 0.15, 0]}>
              <boxGeometry args={[0.85, 0.48, 0.04]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0.45, 0.38, -0.2]} rotation={[0, -0.2, 0]}>
              <boxGeometry args={[0.85, 0.48, 0.04]} />
              <meshStandardMaterial color="#818cf8" emissive="#4f46e5" emissiveIntensity={0.6} />
            </mesh>
          </group>

          {/* Potted Office Monstera Plant */}
          <group position={[3.6, 0.75, -2]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.22, 0.7, 16]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.45, 16, 16]} />
              <meshStandardMaterial color="#15803d" roughness={0.8} />
            </mesh>
          </group>
        </group>
      )}

      {isCafe && (
        <group>
          {/* Cafe Espresso Counter Bar */}
          <group position={[-2.8, 0.8, -1.8]}>
            <mesh>
              <boxGeometry args={[2.5, 0.95, 1.1]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
            {/* Espresso Coffee Machine */}
            <mesh position={[0.4, 0.68, 0]}>
              <boxGeometry args={[0.6, 0.5, 0.45]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
          {/* Round Wooden Table & Chairs */}
          <group position={[2.8, 0.55, -1]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.65, 0.65, 0.06, 24]} />
              <meshStandardMaterial color="#b45309" roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.27, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.52, 12]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

// =========================================================================
// 3D RIGGED CHARACTER WITH ANIMATED LOCOMOTION
// =========================================================================
function StageCharacter3D({
  character,
  targetX,
  targetZ,
  onPositionUpdate
}: {
  character: any;
  targetX: number;
  targetZ: number;
  onPositionUpdate?: (x: number, z: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);

  const [currentPos, setCurrentPos] = useState({ x: targetX, z: targetZ });
  const [isMoving, setIsMoving] = useState(false);

  const isFemale = character?.gender === 'female';
  const age = character?.age ?? 25;
  const isChild = age <= 12;
  const isInfant = age <= 5;

  const skinTone = isFemale ? '#fed7aa' : '#fcd34d';
  const clothColor = isFemale ? (isInfant ? '#fce7f3' : '#db2777') : (isInfant ? '#e0f2fe' : '#4f46e5');
  const hairColor = age > 60 ? '#f1f5f9' : '#1e293b';

  const skinMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.6 }), [skinTone]);
  const clothMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.7 }), [clothColor]);
  const hairMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 }), [hairColor]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.getElapsedTime();
    const curX = groupRef.current.position.x;
    const curZ = groupRef.current.position.z;

    const dx = targetX - curX;
    const dz = targetZ - curZ;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.08) {
      setIsMoving(true);
      const speed = isInfant ? 2.4 : 4.0;
      const step = Math.min(dist, speed * delta);
      groupRef.current.position.x += (dx / dist) * step;
      groupRef.current.position.z += (dz / dist) * step;

      // Smooth rotation towards travel direction
      const targetAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, delta * 12);

      // Walking cycle animation
      const walkFreq = isInfant ? 10 : 14;
      const legSwing = Math.sin(t * walkFreq) * (isInfant ? 0.35 : 0.5);
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = legSwing;
        rightLegRef.current.rotation.x = -legSwing;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -legSwing * 0.7;
        rightArmRef.current.rotation.x = legSwing * 0.7;
      }
      // Vertical bobbing while walking
      groupRef.current.position.y = Math.abs(Math.sin(t * walkFreq)) * (isInfant ? 0.05 : 0.08);

      if (onPositionUpdate) {
        onPositionUpdate(groupRef.current.position.x, groupRef.current.position.z);
      }
    } else {
      setIsMoving(false);
      // Idle breathing cycle
      groupRef.current.position.y = Math.sin(t * 2.2) * 0.02;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={[targetX, 0, targetZ]}>
      {/* Dynamic Walking Footstep Dust Ring */}
      {isMoving && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[0.15, 0.3, 16]} />
          <meshBasicMaterial color="#a78bfa" opacity={0.4} transparent />
        </mesh>
      )}

      {/* Character Scaled Base */}
      <group scale={isInfant ? [0.75, 0.75, 0.75] : isChild ? [0.85, 0.85, 0.85] : [1, 1, 1]}>
        {/* Torso */}
        <mesh position={[0, 0.7, 0]} material={clothMaterial} castShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.5, 16]} />
        </mesh>

        {/* Left Leg */}
        <mesh ref={leftLegRef} position={[-0.12, 0.25, 0]} material={clothMaterial}>
          <cylinderGeometry args={[0.07, 0.07, 0.45, 12]} />
        </mesh>

        {/* Right Leg */}
        <mesh ref={rightLegRef} position={[0.12, 0.25, 0]} material={clothMaterial}>
          <cylinderGeometry args={[0.07, 0.07, 0.45, 12]} />
        </mesh>

        {/* Left Arm */}
        <mesh ref={leftArmRef} position={[-0.28, 0.65, 0]} material={clothMaterial}>
          <cylinderGeometry args={[0.055, 0.055, 0.4, 12]} />
        </mesh>

        {/* Right Arm */}
        <mesh ref={rightArmRef} position={[0.28, 0.65, 0]} material={clothMaterial}>
          <cylinderGeometry args={[0.055, 0.055, 0.4, 12]} />
        </mesh>

        {/* Head Group */}
        <group ref={headRef} position={[0, 1.15, 0]}>
          <mesh material={skinMaterial}>
            <sphereGeometry args={[0.26, 24, 24]} />
          </mesh>

          {/* Hair Styles */}
          {isFemale ? (
            <group>
              {/* Crown hair */}
              <mesh position={[0, 0.12, -0.02]} material={hairMaterial}>
                <sphereGeometry args={[0.28, 20, 20]} />
              </mesh>
              {/* Side flowing tresses */}
              <mesh position={[-0.22, -0.15, 0.04]} rotation={[0.08, 0, -0.1]} material={hairMaterial}>
                <cylinderGeometry args={[0.04, 0.05, 0.35, 12]} />
              </mesh>
              <mesh position={[0.22, -0.15, 0.04]} rotation={[0.08, 0, 0.1]} material={hairMaterial}>
                <cylinderGeometry args={[0.04, 0.05, 0.35, 12]} />
              </mesh>
            </group>
          ) : (
            <group>
              {/* Male crop */}
              <mesh position={[0, 0.14, -0.02]} material={hairMaterial}>
                <sphereGeometry args={[0.27, 20, 20]} />
              </mesh>
              <mesh position={[0, 0.2, 0.18]} rotation={[0.2, 0, 0]} material={hairMaterial}>
                <boxGeometry args={[0.25, 0.08, 0.1]} />
              </mesh>
            </group>
          )}

          {/* Eyes */}
          <mesh position={[-0.09, 0.03, 0.23]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.09, 0.03, 0.23]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>

          {/* Rosy cheeks for kids / female */}
          {(isInfant || isFemale) && (
            <>
              <mesh position={[-0.14, -0.06, 0.21]}>
                <sphereGeometry args={[0.04, 12, 8]} />
                <meshBasicMaterial color="#fb7185" opacity={0.6} transparent />
              </mesh>
              <mesh position={[0.14, -0.06, 0.21]}>
                <sphereGeometry args={[0.04, 12, 8]} />
                <meshBasicMaterial color="#fb7185" opacity={0.6} transparent />
              </mesh>
            </>
          )}
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// 3D INTERACTIVE HOTSPOT BEACON PILLAR
// =========================================================================

function TargetDecal3D({ position }: { position: { x: number; z: number } }) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.getElapsedTime();
    const s = 1 + Math.sin(t * 8) * 0.15;
    ringRef.current.scale.set(s, s, s);
  });
  return (
    <group position={[position.x, 0, position.z]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.22, 0.3, 32]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.8} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.5} transparent />
      </mesh>
    </group>
  );
}

function HotspotBeacon3D({
  hotspot,
  isVisited,
  onClick
}: {
  hotspot: Hotspot;
  isVisited: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const outerCageRef = useRef<THREE.Group>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const posX = ((hotspot.position_x - 450) / 450) * 4.6;
  const posZ = -0.5;

  const color = isVisited
    ? '#10b981'
    : hotspot.icon === 'heart' || hotspot.npc_role === 'parent' || hotspot.npc_role === 'partner'
    ? '#f43f5e'
    : hotspot.icon === 'briefcase' || hotspot.npc_role === 'manager'
    ? '#38bdf8'
    : hotspot.icon === 'coffee' || hotspot.npc_role === 'friend'
    ? '#a855f7'
    : '#f59e0b';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Floating vertical bounce + spin
    if (meshRef.current) {
      meshRef.current.position.y = 1.25 + Math.sin(t * 2.2 + posX) * 0.12;
      meshRef.current.rotation.y = t * 1.4;
    }

    // 2. Counter-rotating holographic outer cage
    if (outerCageRef.current) {
      outerCageRef.current.rotation.y = -t * 0.9;
      outerCageRef.current.rotation.x = Math.sin(t * 0.8) * 0.25;
    }

    // 3. Dynamic expanding shockwave ripple ring on the floor
    if (shockwaveRef.current) {
      const cycleTime = 1.4;
      const progress = ((t * 0.9 + Math.abs(posX) * 0.5) % cycleTime) / cycleTime; // 0 to 1
      const scale = 0.8 + progress * 1.5; // 0.8 to 2.3
      shockwaveRef.current.scale.set(scale, scale, 1);
      if (shockwaveRef.current.material && 'opacity' in shockwaveRef.current.material) {
        (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - progress) * 0.75);
      }
    }
  });

  return (
    <group
      position={[posX, 0, posZ]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 1. Static Floor Foundation Glow Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[0.26, 0.38, 32]} />
        <meshBasicMaterial color={color} opacity={hovered ? 0.95 : 0.65} transparent />
      </mesh>

      {/* 2. Expanding Hologram Shockwave Pulse Ring */}
      <mesh ref={shockwaveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.28, 0.36, 32]} />
        <meshBasicMaterial
          color={color}
          opacity={0.65}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Holographic Tapered Vertical Light Column Shaft */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.04, 0.22, 1.3, 16, 1, true]} />
        <meshBasicMaterial
          color={color}
          opacity={hovered ? 0.38 : 0.22}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Floating 3D Holographic Beacon Orb Assembly */}
      <group ref={meshRef} position={[0, 1.25, 0]}>
        {/* Core Glowing Energy Sphere */}
        <mesh scale={hovered ? 1.22 : 1.0}>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 2.0 : 1.3}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>

        {/* Counter-rotating Outer Holographic Lattice Cage */}
        <group ref={outerCageRef} scale={hovered ? 1.25 : 1.0}>
          <mesh>
            <icosahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.7}
              wireframe={true}
              transparent={true}
              opacity={0.85}
            />
          </mesh>
          {/* Equatorial Orbit Ring */}
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.28, 0.014, 8, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.75} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// MAIN INTERACTIVE SCENE COMPONENT (Unified 3D Stage & Story HUD)
// =========================================================================
export default function InteractiveScene2D({ onScenarioResolved, onAdvanceYear, character, onBackToCockpit }: InteractiveScene2DProps) {
  const [mounted, setMounted] = useState(false);
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string>("scene_nursery");
  const [knowledgeBase, setKnowledgeBase] = useState<string[]>([]);
  const [commitments, setCommitments] = useState<any[]>([]);
  const [actionPoints, setActionPoints] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [nextScenarioAge, setNextScenarioAge] = useState<number | null>(null);

  // 3D Character Target & Walking State
  const [char3DPos, setChar3DPos] = useState<{ x: number; z: number }>({ x: -1.5, z: 0.2 });
  const [target3DPos, setTarget3DPos] = useState<{ x: number; z: number }>({ x: -1.5, z: 0.2 });

  // Visual Novel Dialogue HUD State
  const [activeDialogue, setActiveDialogue] = useState<any | null>(null);

  // Mind Stage D20 Modal & Dual-Pane Persistent Decision Deck
  const [showMindStage, setShowMindStage] = useState<boolean>(false);
  const [activeWhisperTab, setActiveWhisperTab] = useState<'rational' | 'empathy' | 'instinct'>('rational');
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [apInvestment, setApInvestment] = useState<number>(0);
  const [safeguardTerm, setSafeguardTerm] = useState<'standard' | 'time_cap' | 'deposit'>('standard');
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [rollResult, setRollResult] = useState<any | null>(null);

  // Journal Drawer & Notices
  const [showJournal, setShowJournal] = useState<boolean>(false);
  const [sceneNotice, setSceneNotice] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Multi-Theme Lighting & Environment Synchronization
  const [activeTheme, setActiveTheme] = useState<'obsidian' | 'sepia' | 'cyberpunk'>('obsidian');

  useEffect(() => {
    const detectTheme = () => {
      const current = document.documentElement.getAttribute('data-theme') || 'obsidian';
      if (current === 'sepia' || current === 'cyberpunk' || current === 'obsidian') {
        setActiveTheme(current as any);
      }
    };
    detectTheme();
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Theme-specific light colors
  const keyLightColor = activeTheme === 'sepia' ? '#fed7aa' : activeTheme === 'cyberpunk' ? '#67e8f9' : '#fef3c7';
  const fillLightColor = activeTheme === 'sepia' ? '#fed7aa' : activeTheme === 'cyberpunk' ? '#38bdf8' : '#cbd5e1';
  const rimLightColor = activeTheme === 'sepia' ? '#fbbf24' : activeTheme === 'cyberpunk' ? '#c084fc' : '#fde68a';
  const sunbeamColor = activeTheme === 'sepia' ? '#f59e0b' : activeTheme === 'cyberpunk' ? '#38bdf8' : '#fef08a';
  const ambientLightColor = activeTheme === 'sepia' ? '#fef3c7' : activeTheme === 'cyberpunk' ? '#1e293b' : '#f8fafc';

  // Fetch Current Scenario on Mount
  useEffect(() => {
    async function fetchScenario() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/game/scenario/current');
        if (!res.ok) throw new Error("Không thể tải kịch bản.");
        const data = await res.json();
        if (data.next_scenario_age) {
          setNextScenarioAge(data.next_scenario_age);
        }
        if (data.scenario) {
          setScenario(data.scenario);
          const initialSceneId = data.current_scene_id || data.scenario.scenes?.[0]?.id || "scene_nursery";
          setCurrentSceneId(initialSceneId);
          setKnowledgeBase(data.knowledge_base || []);
          setCommitments(data.commitments || []);
          setActionPoints(data.action_points ?? 3);

          // Set default contextual thought if no dialogue is active
          if (data.scenario.description) {
            setActiveDialogue({
              speaker: `${character?.name || "Bạn"} (Quan sát)`,
              text: data.scenario.description,
              isDefaultIntro: true
            });
          }
        } else {
          // Graceful fallback to Mind Sanctuary!
          const sanctuary = getPersonalizedSanctuaryScenario(character, data.next_scenario_age);
          setScenario(sanctuary);
          setCurrentSceneId("scene_sanctuary");
          setKnowledgeBase(data.knowledge_base || []);
          setCommitments(data.commitments || []);
          setActionPoints(data.action_points ?? 3);
          setActiveDialogue({
            speaker: `${character?.name || "Bạn"} (Tĩnh tâm)`,
            text: sanctuary.description,
            isDefaultIntro: true
          });
        }
      } catch (err) {
        console.error(err);
        const sanctuary = getPersonalizedSanctuaryScenario(character, null);
        setScenario(sanctuary);
        setCurrentSceneId("scene_sanctuary");
      } finally {
        setIsLoading(false);
      }
    }
    fetchScenario();
  }, [character?.age]);

  // Current Active Scene Data
  const currentScene = useMemo(() => {
    if (!scenario) return null;
    return scenario.scenes.find(s => s.id === currentSceneId) || scenario.scenes[0] || null;
  }, [scenario, currentSceneId]);

  // All Scene Hotspots Explored (Zero Dead-End Trigger)
  const allVisited = useMemo(() => {
    if (!currentScene?.hotspots || currentScene.hotspots.length === 0) return false;
    return currentScene.hotspots.every(h =>
      h.dialogue?.granted_knowledge && knowledgeBase.includes(h.dialogue.granted_knowledge)
    );
  }, [currentScene, knowledgeBase]);

  // Keyboard navigation & Shortcuts (A/D movement, 1/2/3 selection, M for Mind Stage, J for Journal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes when user is focused in input fields
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (showJournal) {
        if (e.key === 'Escape' || e.key === 'j' || e.key === 'J') {
          setShowJournal(false);
          return;
        }
      }

      if (e.key === '1' && scenario?.choices?.[0]) {
        setSelectedChoiceId(scenario.choices[0].id);
        return;
      } else if (e.key === '2' && scenario?.choices?.[1]) {
        setSelectedChoiceId(scenario.choices[1].id);
        return;
      } else if (e.key === '3' && scenario?.choices?.[2]) {
        setSelectedChoiceId(scenario.choices[2].id);
        return;
      } else if (e.key === 'Escape') {
        if (selectedChoiceId) {
          setSelectedChoiceId(null);
          setRollResult(null);
        } else if (onBackToCockpit) {
          onBackToCockpit();
        }
        return;
      }

      const STEP = 0.8;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setTarget3DPos(prev => ({ ...prev, x: Math.min(4.5, prev.x + STEP) }));
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setTarget3DPos(prev => ({ ...prev, x: Math.max(-4.5, prev.x - STEP) }));
      } else if (e.key === 'j' || e.key === 'J') {
        setShowJournal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMindStage, showJournal, scenario]);

  // Handle 3D Floor Click
  const handleFloorClick = (worldX: number, worldZ: number) => {
    const clampedX = Math.max(-4.6, Math.min(4.6, worldX));
    const clampedZ = Math.max(-1.5, Math.min(1.5, worldZ));
    setTarget3DPos({ x: clampedX, z: clampedZ });
  };

  // Switch Scene
  const handleSwitchScene = async (sceneId: string) => {
    setCurrentSceneId(sceneId);
    setTarget3DPos({ x: -2, z: 0 });
    const targetScene = scenario?.scenes.find(s => s.id === sceneId);
    setActiveDialogue({
      speaker: `${character?.name || "Bạn"} (Bối cảnh)`,
      text: `Bạn đã bước vào không gian: ${targetScene?.name || sceneId}. Hãy quan sát các manh mối xung quanh!`,
      isDefaultIntro: true
    });
    if (scenario?.id === 'mind_sanctuary') return;
    try {
      await fetch('/api/game/scenario/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene_id: sceneId })
      });
    } catch (e) {
      console.warn("Scene transition sync failed:", e);
    }
  };

  // Trigger Hotspot Interaction
  const handleTriggerHotspot = async (hotspot: Hotspot) => {
    // 1. Walk to hotspot location in 3D
    const targetX = ((hotspot.position_x - 450) / 450) * 4.6;
    setTarget3DPos({ x: targetX, z: -0.2 });

    // In Mind Sanctuary, handle interaction locally without server API
    if (scenario?.id === 'mind_sanctuary') {
      setActiveDialogue({
        speaker: hotspot.dialogue?.speaker || hotspot.label,
        text: hotspot.dialogue?.text || "...",
        granted_knowledge: hotspot.dialogue?.granted_knowledge,
        npc_role: hotspot.npc_role
      });
      return;
    }

    // 2. Call server interaction API
    try {
      const res = await fetch('/api/game/scenario/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: currentSceneId,
          hotspot_id: hotspot.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tương tác thất bại");

      setActiveDialogue({
        speaker: data.speaker || hotspot.label,
        text: data.text || hotspot.dialogue?.text || "...",
        granted_knowledge: data.granted_knowledge || hotspot.dialogue?.granted_knowledge,
        affected_npc: data.affected_npc,
        npc_role: hotspot.npc_role
      });

      if (data.knowledge_base) setKnowledgeBase(data.knowledge_base);
      if (typeof data.ap_remaining === 'number') setActionPoints(data.ap_remaining);
    } catch (err: any) {
      setSceneNotice({
        title: "Thông Báo Khám Phá",
        message: err.message || "Không thể thực hiện tương tác lúc này."
      });
    }
  };

  // Confirm Mind Stage Choice (D20 Resolution)
  const handleConfirmChoice = async (choiceId: string) => {
    if (scenario?.id === 'mind_sanctuary') {
      if (choiceId === 'CHOICE_RETURN_COCKPIT') {
        setShowMindStage(false);
        if (onBackToCockpit) onBackToCockpit();
        return;
      }
      setIsResolving(true);
      setTimeout(() => {
        setIsResolving(false);
        setRollResult({
          success: true,
          choice_id: choiceId,
          choice_title: choiceId === 'CHOICE_REFLECT_REST' ? "Tọa Thiền Tĩnh Tâm" : "Chiêm Nghiệm Chiến Lược Dài Hạn",
          narration: choiceId === 'CHOICE_REFLECT_REST'
            ? "Tâm trí bạn trở nên thanh thản, dịu mát. Một luồng sinh khí mới lan tỏa, giúp bạn buông bỏ những áp lực đè nặng."
            : "Bạn đã sắp xếp lại các suy nghĩ và định hình rõ ràng hơn con đường sắp tới. Sự tỉnh táo này sẽ là lợi thế lớn trong tương lai.",
          character_state: {
            action_points: actionPoints,
            vitality: character?.vitality ?? 80,
            burnout: Math.max(0, (character?.burnout ?? 20) - 5),
            cash: character?.cash ?? 0
          }
        });
        if (onScenarioResolved) onScenarioResolved({ sanctuary: true });
      }, 400);
      return;
    }

    try {
      setIsResolving(true);
      const res = await fetch('/api/game/scenario/resolve-mindstage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choice_id: choiceId,
          ap_investment: apInvestment,
          safeguard_term: safeguardTerm
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể thực hiện lựa chọn");

      setRollResult(data);
      if (data.commitments) setCommitments(data.commitments);
      if (data.character_state?.action_points) setActionPoints(data.character_state.action_points);
      if (onScenarioResolved) onScenarioResolved(data);
    } catch (err: any) {
      setSceneNotice({
        title: "Thông Báo Quyết Định",
        message: err.message || "Không thể thực hiện quyết định này."
      });
    } finally {
      setIsResolving(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-slate-950 rounded-3xl border border-slate-800 p-8 shadow-2xl">
        <Compass className="w-9 h-9 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold text-slate-300">Đang khởi tạo không gian nhập vai 3D...</p>
        <span className="text-xs text-slate-500 mt-1">Đang tải kiến trúc phòng, ánh sáng và bối cảnh sống</span>
      </div>
    );
  }

  if (!scenario || !currentScene) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-slate-950 rounded-3xl border border-slate-800 p-8 shadow-2xl text-center space-y-3">
        <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
        <h3 className="text-base font-bold text-white">Không Gian Trầm Tư Đang Sẵn Sàng</h3>
        <p className="text-xs text-slate-400 max-w-md">
          Chưa có biến cố lớn nào đòi hỏi đấu trí ở tuổi này. Bạn có thể chốt năm để bước sang tuổi mới hoặc quay lại Cockpit để trải nghiệm các hoạt động thường niên!
        </p>
        <div className="flex items-center gap-3 justify-center flex-wrap pt-2">
          {onAdvanceYear && (
            <button
              onClick={() => {
                if (onAdvanceYear) onAdvanceYear();
                if (onBackToCockpit) onBackToCockpit();
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg active:scale-95 flex items-center gap-1.5"
            >
              <span>✨ Chiêm Nghiệm Cuối Năm & Gieo Mầm Tuổi Mới</span>
              <span>→</span>
            </button>
          )}
          {onBackToCockpit && (
            <button
              onClick={onBackToCockpit}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition shadow-md"
            >
              ⬅ Trở Về Cockpit Sinh Tồn
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col select-none relative group">
      {/* =========================================================================
          TOP COMMAND STRIP: AUTHORITATIVE SCENARIO HEADER & VITALS (US-01, US-03)
          ========================================================================= */}
      <div className="px-4 py-3 bg-slate-950/95 border-b border-slate-800/80 flex items-center justify-between gap-3 flex-wrap z-30">
        {/* Left: Cockpit Navigation & Scenario Identity */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBackToCockpit && (
            <button
              onClick={onBackToCockpit}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-md shrink-0"
              title="Trở về Cockpit chính (Phím Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Trở Về Cockpit (Esc)</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-mono font-bold backdrop-blur-md shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{scenario.title}</span>
            </span>

            {nextScenarioAge && scenario?.id === 'mind_sanctuary' && (
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                ⏳ Ngã Rẽ Kế: Tuổi {nextScenarioAge}
              </span>
            )}
          </div>

          {/* Scene Selector Pills if multiple */}
          {scenario.scenes.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
              {scenario.scenes.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSwitchScene(s.id)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    s.id === currentSceneId
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.id.includes('nursery') || s.id.includes('home') ? <Home className="w-3 h-3" /> : s.id.includes('school') ? <BookOpen className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Consolidated Character Vitals Bar & Journal (US-01) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-xs font-medium font-sans shadow-md">
            <span className="text-rose-400 flex items-center gap-1 font-bold" title="Sinh Lực Hiện Tại">
              <Heart className="w-3.5 h-3.5 fill-rose-400/30 text-rose-400" /> {character?.vitality ?? 80}/{character?.max_vitality ?? 100}
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-amber-400 flex items-center gap-1 font-bold" title="Căng Thẳng">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> {character?.burnout ?? 0}%
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-mono font-bold" title="Năng Lượng Hành Động Khả Dụng">
              ⚡ {character?.action_points ?? actionPoints} AP
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-mono font-bold" title="Tiền Mặt">
              ${(Number(character?.cash) || 0).toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => setShowJournal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold backdrop-blur-md shadow-md flex items-center gap-1.5 hover:bg-amber-900/60 transition"
            title="Mở Sổ Tay Manh Mối (Phím J)"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Manh Mối</span>
            <span>({knowledgeBase.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          DUAL-PANE STAGE: 3D DIORAMA (LEFT 7 COLS) + PERSISTENT DECISION DECK (RIGHT 5 COLS) (US-04)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* LEFT COLUMN: 3D Isometric Viewport + Dialogue Deck (7 cols) */}
        <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-950">
          <div className="relative w-full h-[360px] md:h-[440px] bg-slate-950 overflow-hidden">
            {/* Controls Indicator */}
            <div className="absolute top-2.5 left-3 z-10 pointer-events-none hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur border border-slate-800">
              <span>🖱️ Nhấp sàn để bước đi</span>
              <span>•</span>
              <span>✨ Nhấp đài phát quang</span>
              <span>•</span>
              <span>⌨️ Phím A/D</span>
            </div>

            {/* 3D WebGL Canvas Viewport (US-06) */}
            <Canvas
              shadows
              camera={{ position: [0, 3.2, 5.8], fov: 40 }}
              className="w-full h-full cursor-crosshair"
              gl={{ antialias: true, alpha: false }}
            >
              <ambientLight intensity={0.55} color={ambientLightColor} />
              <directionalLight
                position={[2.5, 6.5, -4.5]}
                intensity={2.2}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-bias={-0.0005}
                color={keyLightColor}
              />
              <directionalLight
                position={[-4.5, 3.5, 4.5]}
                intensity={0.6}
                color={fillLightColor}
              />
              <pointLight
                position={[0, 2.2, -1.8]}
                intensity={1.2}
                color={rimLightColor}
                distance={6}
                decay={2}
              />

              <ProceduralRoom3D
                theme={currentScene.background_theme}
                sceneId={currentSceneId}
                activeTheme={activeTheme}
                sunbeamColor={sunbeamColor}
              />

              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.02, 0]}
                visible={false}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFloorClick(e.point.x, e.point.z);
                }}
              >
                <planeGeometry args={[14, 8]} />
              </mesh>

              {currentScene.hotspots.map((h) => {
                const isVisited = h.dialogue?.granted_knowledge && knowledgeBase.includes(h.dialogue.granted_knowledge);
                return (
                  <HotspotBeacon3D
                    key={h.id}
                    hotspot={h}
                    isVisited={Boolean(isVisited)}
                    onClick={() => handleTriggerHotspot(h)}
                  />
                );
              })}

              <TargetDecal3D position={target3DPos} />

              <StageCharacter3D
                character={character}
                targetX={target3DPos.x}
                targetZ={target3DPos.z}
                onPositionUpdate={(x, z) => setChar3DPos({ x, z })}
              />
            </Canvas>

            {/* Quick Hotspot Ribbons Docked at bottom of 3D */}
            <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar pointer-events-auto">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 backdrop-blur shrink-0">
                Điểm Khám Phá:
              </span>
              {currentScene.hotspots.map((h) => {
                const isVisited = h.dialogue?.granted_knowledge && knowledgeBase.includes(h.dialogue.granted_knowledge);
                return (
                  <button
                    key={h.id}
                    onClick={() => handleTriggerHotspot(h)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap backdrop-blur-md shadow-lg ${
                      isVisited
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900'
                        : 'bg-slate-900/85 border-slate-700/80 text-slate-200 hover:border-amber-400 hover:text-white'
                    }`}
                  >
                    <span>{h.npc_role === 'parent' ? '👨‍👩‍👧' : h.npc_role === 'partner' ? '👩‍💼' : h.npc_role === 'manager' ? '👨‍💼' : h.npc_role === 'friend' ? '🧑‍💻' : '📦'}</span>
                    <span>{h.label}</span>
                    {isVisited && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zero Dead-End Golden Guidance Banner (US-05) */}
          {allVisited && (
            <div className="mx-3 my-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/60 text-amber-200 text-xs font-medium flex items-center justify-between gap-2 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span>✨ <strong>Ký ức ấu thơ đã đủ đầy!</strong> Bạn đã khám phá hết manh mối. Hãy đưa ra quyết định bên phải →</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 hidden sm:block animate-bounce" />
            </div>
          )}

          {/* Cinema Dialogue Deck (US-02 font bug resolved with font-sans font-medium & cleanDialogueText) */}
          <div className="w-full bg-[var(--bg-card)]/95 border-t border-[var(--border-subtle)] p-4 flex-1 flex flex-col justify-between backdrop-blur-xl relative">
            <div className="flex items-start gap-3.5">
              <div className="relative shrink-0">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border-2 transition-all duration-300 ${
                    activeDialogue?.npc_role === 'parent'
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.35)] ring-2 ring-rose-500/25'
                      : activeDialogue?.npc_role === 'partner'
                      ? 'bg-pink-950/80 border-pink-500 text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.35)] ring-2 ring-pink-500/25'
                      : activeDialogue?.npc_role === 'manager'
                      ? 'bg-sky-950/80 border-sky-500 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.35)] ring-2 ring-sky-500/25'
                      : activeDialogue?.npc_role === 'friend'
                      ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.35)] ring-2 ring-teal-500/25'
                      : 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/25'
                  }`}
                >
                  {activeDialogue?.npc_role === 'parent'
                    ? '👨‍👩‍👧'
                    : activeDialogue?.npc_role === 'partner'
                    ? '👩‍💼'
                    : activeDialogue?.npc_role === 'manager'
                    ? '👨‍💼'
                    : activeDialogue?.npc_role === 'friend'
                    ? '🧑‍💻'
                    : '🧠'}
                </div>
              </div>

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    {activeDialogue?.speaker || `${character?.name || "Bạn"} (Nội tâm)`}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                    {activeDialogue?.npc_role ? `Vai trò: ${activeDialogue.npc_role}` : "Bối cảnh"}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-[var(--text-primary)] leading-relaxed font-sans font-medium drop-shadow-sm">
                  &ldquo;{cleanDialogueText(activeDialogue?.text || scenario.description)}&rdquo;
                </p>

                {activeDialogue?.hotspot_id && HOTSPOT_LIFE_IMPACTS[activeDialogue.hotspot_id] && (
                  <div className="mt-1 inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-700 dark:text-amber-300 text-xs font-medium w-fit">
                    <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Định hướng tương lai: <strong>{HOTSPOT_LIFE_IMPACTS[activeDialogue.hotspot_id].perk}</strong></span>
                  </div>
                )}

                {activeDialogue?.granted_knowledge && (
                  <div className="mt-1 inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-amber-950/80 border border-amber-400/50 text-amber-300 text-xs font-medium w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Mở khóa tri thức: <strong>{KNOWLEDGE_LABELS[activeDialogue.granted_knowledge]?.label || activeDialogue.granted_knowledge}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Persistent Decision Deck (5 cols) (US-04) */}
        <div id="decision-deck" className="lg:col-span-5 flex flex-col bg-slate-950/90 p-4 sm:p-5 overflow-y-auto max-h-[820px] custom-scrollbar space-y-4">
          {/* Deck Header */}
          <div className="border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold">
                Sân Khấu Tâm Trí · Ngã Rẽ Định Mệnh
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-sans">{scenario.title}</h3>
            {scenario.mind_stage?.whispers?.dilemma_prompt && (
              <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
                {scenario.mind_stage.whispers.dilemma_prompt}
              </p>
            )}
          </div>

          {/* Tri-Prism Ego Whispers Tabs */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveWhisperTab('rational')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  activeWhisperTab === 'rational'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-sky-400" />
                <span>Lý Trí</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWhisperTab('empathy')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  activeWhisperTab === 'empathy'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-amber-400" />
                <span>Trái Tim</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWhisperTab('instinct')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  activeWhisperTab === 'instinct'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Bản Năng</span>
              </button>
            </div>

            {/* Active Whisper Quote */}
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed transition-all duration-200 ${
                activeWhisperTab === 'rational'
                  ? 'bg-sky-950/40 border-sky-400/40 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.1)]'
                  : activeWhisperTab === 'empathy'
                  ? 'bg-amber-950/40 border-amber-400/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'bg-rose-950/40 border-rose-400/40 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
              }`}
            >
              <div className="font-bold text-xs uppercase tracking-wider mb-1 opacity-80">
                {activeWhisperTab === 'rational' && '❄️ Lăng Kính Băng Giá (Lý Trí)'}
                {activeWhisperTab === 'empathy' && '✨ Lăng Kính Hổ Phách (Trái Tim)'}
                {activeWhisperTab === 'instinct' && '🔥 Lăng Kính Đỏ Thẫm (Bản Năng)'}
              </div>
              <p className="font-sans font-medium text-xs leading-snug">
                &ldquo;
                {activeWhisperTab === 'rational' && cleanWhisper(scenario.mind_stage?.whispers?.rational || '')}
                {activeWhisperTab === 'empathy' && cleanWhisper(scenario.mind_stage?.whispers?.empathy || '')}
                {activeWhisperTab === 'instinct' && cleanWhisper(scenario.mind_stage?.whispers?.instinct || '')}
                &rdquo;
              </p>
            </div>
          </div>

          {/* Roll Result Display (In-place on the right pane!) */}
          {rollResult ? (
            <div className="p-4 rounded-2xl bg-slate-900 border-2 border-emerald-500/60 shadow-xl space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    Kết Quả Định Mệnh ({rollResult.outcome_key?.toUpperCase() || 'THÀNH CÔNG'})
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{rollResult.choice_title}</h4>
                </div>

                {rollResult.roll && (
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Xúc xắc D20</div>
                    <div className="text-base font-bold font-mono text-emerald-400">
                      {rollResult.roll.d20_base} + {rollResult.roll.trait_bonus + rollResult.roll.stat_bonus + rollResult.roll.ap_bonus} = {rollResult.roll.total_score} (vs DC {rollResult.roll.target_dc})
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-200 font-sans leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                &ldquo;{rollResult.narration}&rdquo;
              </p>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setRollResult(null);
                    setSelectedChoiceId(null);
                    if (onAdvanceYear) onAdvanceYear();
                    if (onBackToCockpit) onBackToCockpit();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95"
                >
                  <span>✨ Chiêm Nghiệm Cuối Năm & Gieo Mầm Tuổi Mới</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ) : (
            /* Choices List */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Chọn Phương Án Đối Diện:</span>
                <span className="text-xs font-mono text-amber-500 lowercase font-normal">
                  (Phím 1, 2, 3)
                </span>
              </div>

              <div className="space-y-2.5">
                {scenario.choices.map((choice, idx) => {
                  const missingKnowledge = (choice.knowledge_requirements || []).filter(k => !knowledgeBase.includes(k));
                  const isUnderUncertainty = missingKnowledge.length > 0;
                  const cleanChoiceTitle = choice.title.replace(/^\[[^\]]+\]\s*/, '').trim();
                  const isSelected = selectedChoiceId === choice.id;

                  return (
                    <div
                      key={choice.id}
                      onClick={() => setSelectedChoiceId(choice.id)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-xl relative ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-slate-900 border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                          : isUnderUncertainty
                          ? 'bg-slate-900/70 border-amber-500/40 hover:border-amber-400/70 hover:bg-slate-900/85'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-xs font-mono font-bold text-slate-300">
                              Phím {idx + 1}
                            </span>
                            <span className="font-bold text-sm text-white">{cleanChoiceTitle}</span>
                            {isUnderUncertainty ? (
                              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/50 flex items-center gap-1 font-semibold">
                                <Zap className="w-3 h-3 text-amber-400" />
                                <span>Bất định (+{missingKnowledge.length * 2} DC)</span>
                              </span>
                            ) : (
                              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-semibold">
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                <span>Đủ dữ kiện (-2 DC)</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed font-sans">{choice.description}</p>

                          {/* DC Check & Stat requirements */}
                          {choice.check && (
                            <div className="flex items-center gap-2 pt-1 text-xs font-mono flex-wrap">
                              <span className="text-amber-700 dark:text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/40">
                                Thử thách: {choice.check.stat?.toUpperCase()} (DC {choice.check.target_dc})
                              </span>
                              {choice.check.bonus_traits && choice.check.bonus_traits.length > 0 && (
                                <span className="text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">
                                  Lợi thế tố chất: {choice.check.bonus_traits.join(', ')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selected Choice: Safeguards + AP Investment + Roll Button */}
                      {isSelected && (
                        <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)] space-y-3 animate-in fade-in">
                          {/* Safeguard Options */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Điều Khoản Bảo Hộ Tâm Trí:</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {[
                                { id: 'standard', label: 'Tiêu Chuẩn', desc: 'Không ràng buộc thêm' },
                                { id: 'time_cap', label: 'Bảo Toàn HP', desc: 'Chống tụt sâu sinh lực khi rủi ro' },
                                { id: 'deposit', label: 'Tối Ưu Cash', desc: 'Bảo vệ dòng tiền dự phòng' }
                              ].map(opt => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSafeguardTerm(opt.id as any);
                                  }}
                                  className={`p-2 rounded-xl border text-left text-xs transition duration-150 ${
                                    safeguardTerm === opt.id
                                      ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-200 shadow-sm ring-1 ring-amber-400/40'
                                      : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                  }`}
                                >
                                  <div className="font-bold text-xs">{opt.label}</div>
                                  <div className="text-xs text-slate-400 mt-0.5 leading-snug">{opt.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* AP Energy Booster & Roll Action */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                            {actionPoints > 0 ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Dồn AP:</span>
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {[0, 1, 2].map(ap => (
                                    <button
                                      key={ap}
                                      type="button"
                                      disabled={actionPoints < ap}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setApInvestment(ap);
                                      }}
                                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1 ${
                                        apInvestment === ap
                                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                                          : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)]'
                                      }`}
                                    >
                                      <span>+{ap} AP</span>
                                      {ap > 0 && <span className="text-xs opacity-80">(+{ap * 2} DC)</span>}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : <div />}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmChoice(choice.id);
                              }}
                              disabled={isResolving}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
                            >
                              {isResolving ? (
                                <>
                                  <Compass className="w-4 h-4 animate-spin text-amber-300" />
                                  <span>Đang Đổ Xúc Xắc D20...</span>
                                </>
                              ) : (
                                <>
                                  <span>Đổ Xúc Xắc D20 & Quyết Định</span>
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Postpone Option */}
              <div className="pt-2 border-t border-slate-800/80">
                <div
                  onClick={() => setSelectedChoiceId('CHOICE_POSTPONE_OBSERVE')}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedChoiceId === 'CHOICE_POSTPONE_OBSERVE'
                      ? 'bg-slate-900 border-slate-400 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      [Trì Hoãn Quyết Định] Tiếp Tục Quan Sát & Tích Lũy Thêm (0 AP)
                    </span>
                    <span className="text-xs font-mono text-slate-500">Miễn phí</span>
                  </div>

                  {selectedChoiceId === 'CHOICE_POSTPONE_OBSERVE' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmChoice('CHOICE_POSTPONE_OBSERVE');
                        }}
                        disabled={isResolving}
                        className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
                      >
                        Xác Nhận Trì Hoãn
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SỔ TAY TRI THỨC (JOURNAL DRAWER)
          ========================================================================= */}
      {showJournal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in">
          <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-bold text-white font-sans">Sổ Tay Manh Mối Cuộc Đời</h3>
                </div>
                <button
                  onClick={() => setShowJournal(false)}
                  className="p-1.5 rounded-full bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {knowledgeBase.length === 0 ? (
                  <p className="text-xs text-slate-500 italic font-sans">
                    Bạn chưa khám phá manh mối nào. Hãy tương tác với các đài phát quang và nhân vật trong không gian 3D.
                  </p>
                ) : (
                  knowledgeBase.map((k, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
                      <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                        <span>{KNOWLEDGE_LABELS[k]?.icon || "💡"}</span>
                        <span>{KNOWLEDGE_LABELS[k]?.label || k}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {KNOWLEDGE_LABELS[k]?.desc || "Thông tin đã ghi nhận từ trải nghiệm thực tế."}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setShowJournal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold font-sans"
            >
              Đóng Sổ Tay
            </button>
          </div>
        </div>
      )}

      {/* Interactive Scene Notice Modal */}
      {sceneNotice && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm text-white flex items-center gap-2 font-sans">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                {sceneNotice.title}
              </h4>
              <button onClick={() => setSceneNotice(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {sceneNotice.message}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSceneNotice(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition font-sans"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
