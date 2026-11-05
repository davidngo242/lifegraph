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
  Sparkles,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Compass,
  ArrowRight,
  Brain,
  Shield,
  Layers,
  Lock,
  X,
  MessageSquare,
  Award,
  Footprints,
  Maximize2
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
  character?: any;
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
  }
};

const cleanWhisper = (text: string) => {
  if (!text) return '';
  return text
    .replace(/^[^:]{1,25}:\s*['"]?/, '')
    .replace(/^(Lý Trí|Trái Tim|Bản Năng|Lý trí|Trái tim|Bản năng)[\s:'"]*/i, '')
    .replace(/['"]$/, '')
    .trim();
};

// =========================================================================
// PROCEDURAL 3D ENVIRONMENT SETS (Free Procedural Room Geometries & Shaders)
// =========================================================================
function ProceduralRoom3D({ theme = 'nursery', sceneId = '' }: { theme?: string; sceneId?: string }) {
  const isNursery = theme.includes('nursery') || sceneId.includes('nursery');
  const isSchool = theme.includes('school') || sceneId.includes('school') || sceneId.includes('class');
  const isOffice = theme.includes('office') || sceneId.includes('office');
  const isCafe = theme.includes('cafe') || sceneId.includes('cafe');
  const isArtisan = theme.includes('artisan') || sceneId.includes('workshop');

  // Theme-specific colors
  const wallColor = isNursery ? '#2a1a1f' : isSchool ? '#13212e' : isOffice ? '#0f172a' : isCafe ? '#27160c' : '#1e1b4b';
  const floorColor = isNursery ? '#3b2229' : isSchool ? '#1e293b' : isOffice ? '#1e293b' : isCafe ? '#451a03' : '#18181b';
  const windowGlowColor = isNursery ? '#fbcfe8' : isSchool ? '#93c5fd' : isOffice ? '#60a5fa' : isCafe ? '#fed7aa' : '#c084fc';

  return (
    <group>
      {/* 1. Main Parquet / Tiled Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 9]} />
        <meshStandardMaterial color={floorColor} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Grid Floor Lines for 3D Depth */}
      <gridHelper args={[16, 16, '#475569', '#334155']} position={[0, 0.005, 0]} />

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

          {/* Soft Circular Rug under Player Area */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -0.2]}>
            <circleGeometry args={[2.2, 32]} />
            <meshStandardMaterial color="#be185d" roughness={0.9} opacity={0.6} transparent />
          </mesh>
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
  const posX = ((hotspot.position_x - 450) / 450) * 4.6;
  const posZ = -0.5;

  const color = isVisited ? '#10b981' : hotspot.icon === 'heart' ? '#f43f5e' : hotspot.icon === 'briefcase' ? '#38bdf8' : '#f59e0b';

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 1.5;
  });

  return (
    <group position={[posX, 0, posZ]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Pulsing Floor Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.35, 0.48, 32]} />
        <meshBasicMaterial color={color} opacity={0.8} transparent />
      </mesh>

      {/* Holographic Vertical Light Column */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.05, 0.18, 1.3, 16]} />
        <meshBasicMaterial color={color} opacity={0.25} transparent />
      </mesh>

      {/* Rotating 3D Floating Gemstone / Diamond */}
      <group ref={meshRef} position={[0, 1.3, 0]}>
        <mesh>
          <octahedronGeometry args={[0.22]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </group>
    </group>
  );
}

// =========================================================================
// MAIN INTERACTIVE SCENE COMPONENT (Unified 3D Stage & Story HUD)
// =========================================================================
export default function InteractiveScene2D({ onScenarioResolved, character }: InteractiveScene2DProps) {
  const [mounted, setMounted] = useState(false);
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string>("scene_nursery");
  const [knowledgeBase, setKnowledgeBase] = useState<string[]>([]);
  const [commitments, setCommitments] = useState<any[]>([]);
  const [actionPoints, setActionPoints] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 3D Character Target & Walking State
  const [char3DPos, setChar3DPos] = useState<{ x: number; z: number }>({ x: -1.5, z: 0.2 });
  const [target3DPos, setTarget3DPos] = useState<{ x: number; z: number }>({ x: -1.5, z: 0.2 });

  // Visual Novel Dialogue HUD State
  const [activeDialogue, setActiveDialogue] = useState<any | null>(null);

  // Mind Stage D20 Modal
  const [showMindStage, setShowMindStage] = useState<boolean>(false);
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

  // Fetch Current Scenario on Mount
  useEffect(() => {
    async function fetchScenario() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/game/scenario/current');
        if (!res.ok) throw new Error("Không thể tải kịch bản.");
        const data = await res.json();
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
        }
      } catch (err) {
        console.error(err);
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

  // Keyboard navigation A/D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showMindStage) return;
      const STEP = 0.8;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setTarget3DPos(prev => ({ ...prev, x: Math.min(4.5, prev.x + STEP) }));
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setTarget3DPos(prev => ({ ...prev, x: Math.max(-4.5, prev.x - STEP) }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMindStage]);

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
        <Compass className="w-9 h-9 animate-spin text-purple-400 mb-3" />
        <p className="text-sm font-semibold text-slate-300">Đang khởi tạo không gian nhập vai 3D...</p>
        <span className="text-xs text-slate-500 mt-1">Đang tải kiến trúc phòng, ánh sáng và bối cảnh sống</span>
      </div>
    );
  }

  if (!scenario || !currentScene) return null;

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col select-none relative group">
      {/* =========================================================================
          PHẦN 1: KHÔNG GIAN 3D ĐA CHIỀU (3D ISOMETRIC / PERSPECTIVE VIEWPORT)
          ========================================================================= */}
      <div className="relative w-full h-[360px] md:h-[420px] bg-slate-950 overflow-hidden">
        {/* Floating Top Control HUD */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
          {/* Left: Scenario & Scene Identity */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="px-2.5 py-1 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[10.5px] font-mono font-bold backdrop-blur-md shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{scenario.title}</span>
            </span>

            {/* Scene Selector Pills */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md">
              {scenario.scenes.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSwitchScene(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    s.id === currentSceneId
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.id.includes('nursery') || s.id.includes('home') ? <Home className="w-3 h-3" /> : s.id.includes('school') ? <BookOpen className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Quick AP & Clues Indicators */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setShowJournal(true)}
              className="px-2.5 py-1 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10.5px] font-mono font-bold backdrop-blur-md shadow-md flex items-center gap-1.5 hover:bg-amber-900/60 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Manh Mối ({knowledgeBase.length})</span>
            </button>

            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10.5px] font-mono font-bold backdrop-blur-md shadow-md">
              ⚡ {actionPoints} AP
            </span>

            <button
              onClick={() => setShowMindStage(true)}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/40 flex items-center gap-1.5 transition active:scale-95"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Ngã Rẽ Tâm Trí</span>
            </button>
          </div>
        </div>

        {/* Floating 3D Interaction Tip */}
        <div className="absolute top-12 left-3 z-10 pointer-events-none hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-md backdrop-blur border border-slate-800">
          <span>🖱️ Nhấp sàn 3D để bước đi</span>
          <span>•</span>
          <span>✨ Nhấp đài phát quang để khám phá</span>
          <span>•</span>
          <span>⌨️ Phím A/D</span>
        </div>

        {/* 3D WebGL Canvas Stage */}
        <Canvas
          shadows
          camera={{ position: [0, 4.4, 7.2], fov: 38 }}
          className="w-full h-full cursor-crosshair"
          gl={{ antialias: true, alpha: false }}
        >
          {/* Lighting Rig */}
          <ambientLight intensity={0.7} color="#fffbeb" />
          <directionalLight
            position={[5, 8, 4]}
            intensity={1.3}
            castShadow
            shadow-mapSize={[1024, 1024]}
            color="#ffffff"
          />
          <pointLight position={[0, 3.5, 0]} intensity={0.9} color="#e0e7ff" distance={10} />

          {/* Procedural 3D Environment Room */}
          <ProceduralRoom3D
            theme={currentScene.background_theme}
            sceneId={currentSceneId}
          />

          {/* Clickable 3D Invisible Raycast Floor */}
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

          {/* 3D Interactive Hotspot Beacons */}
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

          {/* 3D Rigged Animated Character */}
          <StageCharacter3D
            character={character}
            targetX={target3DPos.x}
            targetZ={target3DPos.z}
            onPositionUpdate={(x, z) => setChar3DPos({ x, z })}
          />
        </Canvas>

        {/* Quick Hotspot Ribbons (Docked at the bottom edge of the 3D Stage) */}
        <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar pointer-events-auto">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 backdrop-blur shrink-0">
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
                    : 'bg-slate-900/85 border-slate-700/80 text-slate-200 hover:border-purple-400 hover:text-white'
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

      {/* =========================================================================
          PHẦN 2: KHUNG ĐỐI THOẠI & CỐT TRUYỆN LIỀN MẠCH (VISUAL NOVEL STORY DECK)
          Tích hợp trực tiếp trong CÙNG 1 BLOCK hoạt ảnh như Game nhập vai đỉnh cao
          ========================================================================= */}
      <div className="w-full bg-slate-900/95 border-t border-slate-800/80 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl">
        {/* Left: Speaker Portrait Box */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 shadow-xl ${
              activeDialogue?.npc_role === 'parent'
                ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                : activeDialogue?.npc_role === 'partner'
                ? 'bg-pink-950/80 border-pink-500 text-pink-300'
                : activeDialogue?.npc_role === 'manager'
                ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                : activeDialogue?.npc_role === 'friend'
                ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                : 'bg-purple-950/80 border-purple-500 text-purple-300'
            }`}>
              {activeDialogue?.npc_role === 'parent' ? '👨‍👩‍👧' : activeDialogue?.npc_role === 'partner' ? '👩‍💼' : activeDialogue?.npc_role === 'manager' ? '👨‍💼' : activeDialogue?.npc_role === 'friend' ? '🧑‍💻' : '🧠'}
            </div>
            <div className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-black/85 text-[8.5px] font-mono font-bold text-amber-300 border border-amber-500/40">
              LIVE
            </div>
          </div>

          {/* Dialogue Speaker & Narrative Content */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white">
                {activeDialogue?.speaker || `${character?.name || "Bạn"} (Nội tâm)`}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {activeDialogue?.npc_role ? `Vai trò: ${activeDialogue.npc_role}` : "Bối cảnh hiện tại"}
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-serif italic max-w-3xl">
              "{activeDialogue?.text || scenario.description}"
            </p>

            {/* Clue Discovered Notification Banner */}
            {activeDialogue?.granted_knowledge && (
              <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium animate-in fade-in slide-in-from-left-2 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Mở khóa tri thức: </span>
                <span className="font-bold">{KNOWLEDGE_LABELS[activeDialogue.granted_knowledge]?.label || activeDialogue.granted_knowledge}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Navigation Hub */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <button
            onClick={() => setShowJournal(true)}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Mở Sổ Tay Manh Mối"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => setShowMindStage(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-purple-600/30 transition active:scale-95"
          >
            <Brain className="w-4 h-4" />
            <span>Đối Diện Ngã Rẽ</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PHẦN 3: SÂN KHẤU TÂM TRÍ - D20 MIND STAGE MODAL
          ========================================================================= */}
      {showMindStage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-slate-950 border border-purple-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar space-y-6">
            <button
              onClick={() => {
                setShowMindStage(false);
                setSelectedChoiceId(null);
                setRollResult(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mind Stage Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                  Sân Khấu Tâm Trí · Ngã Rẽ Định Mệnh
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">{scenario.title}</h2>
              <p className="text-xs text-slate-300 mt-1 font-serif">{scenario.mind_stage?.whispers?.dilemma_prompt}</p>
            </div>

            {/* 3 Internal Ego Whispers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs space-y-1">
                <div className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-blue-400" />
                  <span>Lý Trí</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-serif text-[11.5px]">
                  {cleanWhisper(scenario.mind_stage?.whispers?.rational || '')}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs space-y-1">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Trái Tim</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-serif text-[11.5px]">
                  {cleanWhisper(scenario.mind_stage?.whispers?.empathy || '')}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bản Năng</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-serif text-[11.5px]">
                  {cleanWhisper(scenario.mind_stage?.whispers?.instinct || '')}
                </p>
              </div>
            </div>

            {/* Roll Result Display (If resolved) */}
            {rollResult ? (
              <div className="p-5 rounded-2xl bg-slate-900 border-2 border-emerald-500/60 shadow-xl space-y-3 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      Kết Quả Định Mệnh ({rollResult.outcome_key?.toUpperCase()})
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{rollResult.choice_title}</h3>
                  </div>

                  {rollResult.roll && (
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Xúc xắc D20</div>
                      <div className="text-lg font-bold font-mono text-emerald-400">
                        {rollResult.roll.d20_base} + {rollResult.roll.trait_bonus + rollResult.roll.stat_bonus + rollResult.roll.ap_bonus} = {rollResult.roll.total_score} (vs DC {rollResult.roll.target_dc})
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-200 font-serif leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  "{rollResult.narration}"
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowMindStage(false);
                      setRollResult(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
                  >
                    Tiếp Tục Hành Trình
                  </button>
                </div>
              </div>
            ) : (
              /* Choices List */
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Chọn Phương Án Đối Diện Ngã Rẽ:
                </div>

                <div className="space-y-2.5">
                  {scenario.choices.map(choice => {
                    const missingKnowledge = (choice.knowledge_requirements || []).filter(k => !knowledgeBase.includes(k));
                    const isUnderUncertainty = missingKnowledge.length > 0;
                    const cleanChoiceTitle = choice.title.replace(/^\[[^\]]+\]\s*/, '').trim();

                    return (
                      <div
                        key={choice.id}
                        onClick={() => setSelectedChoiceId(choice.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          selectedChoiceId === choice.id
                            ? 'bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-900/20'
                            : isUnderUncertainty
                            ? 'bg-slate-900/70 border-amber-500/30 hover:border-amber-500/60'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-white">{cleanChoiceTitle}</span>
                              {isUnderUncertainty ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-semibold">
                                  <span>⚡ Bất định (+{missingKnowledge.length * 2} DC)</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50 font-semibold">
                                  {choice.stance}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-serif">{choice.description}</p>
                          </div>

                          {choice.check && (
                            <div className="shrink-0 text-right">
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                                DC {choice.check.target_dc + (missingKnowledge.length * 2)} ({choice.check.stat})
                              </span>
                            </div>
                          )}
                        </div>

                        {isUnderUncertainty && (
                          <div className="mt-2 text-[11px] text-amber-400/90 font-mono flex items-center gap-1.5 pt-1.5 border-t border-slate-800/60">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                            <span>Cần khám phá thêm: {missingKnowledge.map(k => KNOWLEDGE_LABELS[k]?.label || k).join(", ")}</span>
                          </div>
                        )}

                        {selectedChoiceId === choice.id && (
                          <div className="mt-3.5 pt-3.5 border-t border-slate-800 space-y-3 animate-in fade-in">
                            {/* Strategic Negotiation Safeguard Clauses */}
                            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5 text-indigo-400" /> Điều Khoản Đảm Bảo Đàm Phán:
                                </span>
                                <span className="text-[10px] font-mono text-indigo-300 font-semibold">
                                  {safeguardTerm === 'time_cap' ? 'Giới hạn 15h/tuần (-50% Burnout)' : safeguardTerm === 'deposit' ? 'Tạm ứng bảo đảm (+10% Tiền)' : 'Mặc định'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                                {[
                                  { id: 'standard', label: 'Tiêu Chuẩn', desc: 'Không ràng buộc phụ' },
                                  { id: 'time_cap', label: 'Khống Chế 15h/Tuần', desc: 'Giảm 50% nguy cơ kiệt sức' },
                                  { id: 'deposit', label: 'Tạm Ứng Tiền Mặt', desc: 'Tăng 10% dòng tiền ban đầu' }
                                ].map(opt => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSafeguardTerm(opt.id as any);
                                    }}
                                    className={`p-2 rounded-lg border text-left text-xs transition ${
                                      safeguardTerm === opt.id
                                        ? 'bg-indigo-950/80 border-indigo-400 text-white shadow-sm'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                                    }`}
                                  >
                                    <div className="font-semibold text-[11px]">{opt.label}</div>
                                    <div className="text-[9.5px] text-slate-400">{opt.desc}</div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              {actionPoints > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400 font-mono">Dồn thêm AP (+2 DC/AP):</span>
                                  <div className="flex items-center gap-1">
                                    {[0, 1, 2].map(ap => (
                                      <button
                                        key={ap}
                                        type="button"
                                        disabled={actionPoints < ap}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setApInvestment(ap);
                                        }}
                                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                          apInvestment === ap
                                            ? 'bg-amber-500 text-black'
                                            : 'bg-slate-800 text-slate-300'
                                        }`}
                                      >
                                        +{ap} AP
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmChoice(choice.id);
                                }}
                                disabled={isResolving}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
                              >
                                {isResolving ? (
                                  <>
                                    <Compass className="w-3.5 h-3.5 animate-spin" />
                                    <span>Đang Đổ Xúc Xắc...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Đổ Xúc Xắc D20 & Quyết Định</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
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

                {/* Option to Postpone Decision */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div
                    onClick={() => setSelectedChoiceId('CHOICE_POSTPONE_OBSERVE')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedChoiceId === 'CHOICE_POSTPONE_OBSERVE'
                        ? 'bg-slate-900 border-slate-400 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-300">
                        [Trì Hoãn Quyết Định] Tiếp Tục Quan Sát & Tích Lũy Thêm (0 AP)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Không tốn AP</span>
                    </div>

                    {selectedChoiceId === 'CHOICE_POSTPONE_OBSERVE' && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmChoice('CHOICE_POSTPONE_OBSERVE');
                          }}
                          disabled={isResolving}
                          className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
                        >
                          Xác Nhận Trì Hoãn & Quay Lại Cảnh 3D
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          PHẦN 4: SỔ TAY TRI THỨC (JOURNAL DRAWER)
          ========================================================================= */}
      {showJournal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in">
          <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Sổ Tay Manh Mối Cuộc Đời</h3>
                </div>
                <button
                  onClick={() => setShowJournal(false)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {knowledgeBase.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Bạn chưa khám phá manh mối nào. Hãy tương tác với các đài phát quang và nhân vật trong không gian 3D.
                  </p>
                ) : (
                  knowledgeBase.map((k, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
                      <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                        <span>{KNOWLEDGE_LABELS[k]?.icon || "💡"}</span>
                        <span>{KNOWLEDGE_LABELS[k]?.label || k}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-serif">
                        {KNOWLEDGE_LABELS[k]?.desc || "Thông tin đã ghi nhận từ trải nghiệm thực tế."}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setShowJournal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold"
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
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                {sceneNotice.title}
              </h4>
              <button onClick={() => setSceneNotice(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 font-serif leading-relaxed">
              {sceneNotice.message}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSceneNotice(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
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
