'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FxParticles, FxEmit, useAssets, usePrefersReducedMotion } from './avatarFx';

// Vòng ký hiệu (rune): các nét mảnh gộp thành một geometry duy nhất, dựng một lần.
const GLYPHS: number[][][] = [
  [[0, -1, 0, 1], [0, 0.1, -0.7, 1], [0, 0.1, 0.7, 1]],
  [[-0.5, -1, -0.5, 1], [-0.5, 0.9, 0.5, 0.3], [-0.5, 0.1, 0.5, -0.5]],
  [[0, -1, 0.7, 0], [0.7, 0, 0, 1], [0, 1, -0.7, 0], [-0.7, 0, 0, -1]],
  [[0, -1, 0, 1], [-0.7, 0.3, 0, 1], [0, 1, 0.7, 0.3]],
  [[-0.6, -1, -0.6, 1], [0.6, -1, 0.6, 1], [-0.6, 0, 0.6, 0]],
  [[-0.6, -1, 0.6, 1], [0.6, -1, -0.6, 1]],
];

function buildGlyphRing(count: number, rMid: number, gw: number, gh: number, stroke: number) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let k = 0; k < count; k++) {
    const a = (k / count) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const toWorld = (u: number, v: number): [number, number] => [
      (rMid + v * gh) * ca - u * gw * sa,
      (rMid + v * gh) * sa + u * gw * ca,
    ];
    for (const [u1, v1, u2, v2] of GLYPHS[k % GLYPHS.length]) {
      const [x1, z1] = toWorld(u1, v1);
      const [x2, z2] = toWorld(u2, v2);
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz) || 1;
      const nx = ((-dz / len) * stroke) / 2;
      const nz = ((dx / len) * stroke) / 2;
      const base = pos.length / 3;
      pos.push(x1 + nx, 0, z1 + nz, x1 - nx, 0, z1 - nz, x2 - nx, 0, z2 - nz, x2 + nx, 0, z2 + nz);
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setIndex(idx);
  return g;
}

/** Vầng sáng: tâm xanh nhạt (phản chiếu bề mặt) + viền vàng neon quanh mép bục. */
function makeHaloTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  if (g) {
    const R = 1.3; // bán kính đĩa halo (đơn vị thế giới)
    const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    const st = (r: number) => Math.min(1, r / R);
    grd.addColorStop(0, 'rgba(56,189,248,0.22)');
    grd.addColorStop(st(0.5), 'rgba(56,189,248,0.10)');
    grd.addColorStop(st(0.8), 'rgba(56,189,248,0)');
    grd.addColorStop(st(0.88), 'rgba(251,191,36,0)');
    grd.addColorStop(st(0.97), 'rgba(251,191,36,0.7)');
    grd.addColorStop(st(1.07), 'rgba(251,191,36,0.22)');
    grd.addColorStop(1, 'rgba(251,191,36,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, S, S);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// Số hạt và bảng màu tăng theo tier (tổng hạt bục tối đa 56).
const TIER_PARTICLES = [16, 24, 34, 44, 56];
const TIER_COLORS: string[][] = [
  ['#f59e0b', '#fbbf24'],
  ['#f59e0b', '#fbbf24', '#0ea5e9'],
  ['#f59e0b', '#fbbf24', '#0ea5e9', '#22d3ee'],
  ['#f59e0b', '#fbbf24', '#0ea5e9', '#a855f7', '#c084fc'],
  ['#f59e0b', '#fbbf24', '#0ea5e9', '#a855f7', '#ec4899', '#34d399'],
];

// 3D Magic Dais with 5-Tier Level Progression (Bục Ma Pháp Hoàng Kim Thăng Hoa Theo Cấp Độ RPG)
export default function GoldenMagicDais({
  level = 1,
  isMeditating = false,
}: {
  level?: number;
  isMeditating?: boolean;
}) {
  const outerRuneRef = useRef<THREE.Group>(null);
  const midRuneRef = useRef<THREE.Group>(null);
  const footAuraRef = useRef<THREE.Group>(null);
  const lightBeamsRef = useRef<THREE.Group>(null);
  const floatingCrystalsRef = useRef<THREE.Group>(null);
  const glyphRef = useRef<THREE.Group>(null);
  const sheenRef = useRef<THREE.Group>(null);
  const ripple1 = useRef<THREE.Mesh>(null);
  const ripple2 = useRef<THREE.Mesh>(null);
  const medHalo = useRef<THREE.Mesh>(null);
  const med = useRef(0); // 0..1, mượt theo isMeditating
  const flow = useRef(0); // đồng hồ riêng cho hạt (nhanh hơn khi thiền)
  const medTarget = useRef(isMeditating);
  medTarget.current = isMeditating;
  const reducedRef = usePrefersReducedMotion();

  // Level Progression Tiers (Giữ vững cốt cách Hoàng Kim Sang Trọng, tăng dần hiệu ứng thần thoại theo cấp)
  const daisTier = level >= 71 ? 5 : level >= 46 ? 4 : level >= 26 ? 3 : level >= 11 ? 2 : 1;

  const A = useAssets(() => {
    const goldGlow = new THREE.MeshBasicMaterial({
      color: '#fbbf24',
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const cyanRune = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    return {
      core: new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.6, metalness: 0.3 }),
      goldGlow,
      cyanRune,
      shadow: new THREE.MeshBasicMaterial({
        color: '#020617',
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      crystalAmethyst: new THREE.MeshStandardMaterial({
        color: '#c084fc',
        roughness: 0.15,
        metalness: 0.4,
        emissive: '#9333ea',
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9,
      }),
      crystalAstral: new THREE.MeshStandardMaterial({
        color: '#fef08a',
        roughness: 0.1,
        metalness: 0.6,
        emissive: '#38bdf8',
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.92,
      }),
      // Mới: rune, viền neon, halo, gợn sáng, vệt sáng quét
      glyphGeo: buildGlyphRing(12, 0.72, 0.034, 0.05, 0.011),
      glyphGeoRich: buildGlyphRing(16, 0.72, 0.03, 0.05, 0.011),
      glyphMat: new THREE.MeshBasicMaterial({
        color: '#f59e0b',
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      rimMat: new THREE.MeshBasicMaterial({ color: '#fde68a', transparent: true, opacity: 0.9, depthWrite: false }),
      sheenMat: new THREE.MeshBasicMaterial({
        color: '#fffbeb',
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      haloTex: makeHaloTexture(),
      rippleMatA: new THREE.MeshBasicMaterial({ color: '#f59e0b', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
      rippleMatB: new THREE.MeshBasicMaterial({ color: '#0ea5e9', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
    };
  });

  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({ map: A.haloTex, transparent: true, opacity: 0.8, depthWrite: false }),
    [A.haloTex]
  );
  const medHaloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: A.haloTex,
        color: '#fde68a',
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [A.haloTex]
  );
  React.useEffect(
    () => () => {
      haloMat.dispose();
      medHaloMat.dispose();
    },
    [haloMat, medHaloMat]
  );

  // Lustrous Gold Plate (Bục Vàng Kim Sang Trọng Cho Mọi Cấp Độ)
  const daisGoldPlate = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: daisTier >= 5 ? '#fef08a' : '#f59e0b',
        roughness: 0.18,
        metalness: 0.92,
        emissive: daisTier >= 4 ? '#b45309' : '#78350f',
        emissiveIntensity: 0.35,
      }),
    [daisTier]
  );
  const verticalBeamMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: daisTier >= 5 ? '#67e8f9' : daisTier >= 4 ? '#c084fc' : '#fef08a',
        transparent: true,
        opacity: daisTier >= 4 ? 0.09 : 0.06,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [daisTier]
  );
  React.useEffect(
    () => () => {
      daisGoldPlate.dispose();
      verticalBeamMaterial.dispose();
    },
    [daisGoldPlate, verticalBeamMaterial]
  );
  const beamBase = daisTier >= 4 ? 0.09 : 0.06;

  const particleCount = TIER_PARTICLES[daisTier - 1];
  const particleColors = TIER_COLORS[daisTier - 1];

  const emit: FxEmit = (i, _t, o) => {
    const tt = flow.current;
    const P = 5 + o.s0 * 3.2;
    const u = (tt / P + o.s1) % 1;
    const ang = o.s2 * 6.2832 + tt * (0.22 + o.s3 * 0.3);
    const r = (0.36 + o.s3 * 0.58) * (1 - 0.22 * u);
    o.x = Math.cos(ang) * r;
    o.z = Math.sin(ang) * r;
    o.y = 0.03 + u * 1.2;
    const sparkle = o.s2 > 0.5;
    o.shape = sparkle ? 1 : 0;
    o.size = (0.13 + o.s0 * 0.11) * (sparkle ? 1.35 : 1) * (1 - 0.3 * u);
    const twinkle = 0.78 + 0.22 * Math.sin(tt * 3.5 + o.s1 * 25 + i);
    o.alpha = Math.pow(Math.sin(Math.PI * u), 0.9) * (0.62 + 0.38 * med.current) * twinkle;
  };

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const still = reducedRef.current;
    med.current += ((medTarget.current ? 1 : 0) - med.current) * Math.min(1, dt * 3);
    const m = med.current;
    if (!still) flow.current += dt * (1 + 0.6 * m);
    const breath = 0.5 + 0.5 * Math.sin((still ? 0 : t) * (1.1 + 0.5 * m));

    if (!still) {
      if (outerRuneRef.current) outerRuneRef.current.rotation.y = t * (daisTier >= 4 ? 0.22 : 0.16);
      if (midRuneRef.current) midRuneRef.current.rotation.y = -t * (daisTier >= 4 ? 0.28 : 0.22);
      if (footAuraRef.current) footAuraRef.current.rotation.y = t * 0.35;
      if (glyphRef.current) glyphRef.current.rotation.y = t * (0.1 + 0.08 * m);
      if (sheenRef.current) sheenRef.current.rotation.y = -t * 0.55;
      if (lightBeamsRef.current) lightBeamsRef.current.position.y = Math.sin(t * 2.2) * 0.02;
      if (floatingCrystalsRef.current) {
        floatingCrystalsRef.current.rotation.y = t * 0.35;
        floatingCrystalsRef.current.position.y = (daisTier === 5 ? 0.3 : 0.26) + Math.sin(t * 2.5) * 0.035;
      }
    }

    // Nhịp thở sáng chậm: halo, viền neon, màn quang; thiền thì sáng mạnh hơn.
    haloMat.opacity = 0.62 + 0.3 * breath + 0.08 * m;
    A.rimMat.opacity = 0.72 + 0.28 * breath;
    A.sheenMat.opacity = 0.35 + 0.25 * breath;
    A.glyphMat.opacity = 0.78 + 0.22 * breath;
    verticalBeamMaterial.opacity = beamBase * (0.8 + 0.4 * breath) * (1 + 1.4 * m);
    medHaloMat.opacity = 0.75 * m * (0.7 + 0.3 * breath);
    if (medHalo.current) {
      const s = 1 + 0.05 * m * breath;
      medHalo.current.scale.set(s, s, s);
    }

    // Gợn sáng lan ra từ tâm bục (2 vòng so le)
    const rippleSpeed = 0.28 + 0.1 * m;
    const rs = [ripple1.current, ripple2.current];
    const rm = [A.rippleMatA, A.rippleMatB];
    for (let k = 0; k < 2; k++) {
      const mesh = rs[k];
      if (!mesh) continue;
      if (still) {
        rm[k].opacity = 0;
        continue;
      }
      const u = (t * rippleSpeed + k * 0.5) % 1;
      const sc = 0.2 + 0.78 * u;
      mesh.scale.set(sc, sc, sc);
      rm[k].opacity = (1 - u) * (1 - u) * 0.5 * (0.8 + 0.6 * m);
    }
  });

  const runeCount = daisTier >= 4 ? 12 : 8;
  const runeAngles = Array.from({ length: runeCount }, (_, i) => (i * 360) / runeCount);

  return (
    <group position={[0, -0.98, 0]}>
      {/* 0. Halo neon quanh mép + phản chiếu bề mặt (phẳng, trong suốt, không che nền) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} material={haloMat}>
        <circleGeometry args={[1.3, 64]} />
      </mesh>
      <mesh ref={medHalo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} material={medHaloMat}>
        <circleGeometry args={[1.3, 64]} />
      </mesh>

      {/* 1. Dais Stepped Plinth Base (Đế Bục Hoàng Kim Cẩm Thạch Sang Trọng) */}
      <mesh position={[0, -0.085, 0]} material={A.core}>
        <cylinderGeometry args={[1.05, 1.12, 0.05, 48]} />
      </mesh>
      <mesh position={[0, -0.04, 0]} material={A.core}>
        <cylinderGeometry args={[0.92, 1.05, 0.06, 48]} />
      </mesh>
      <mesh position={[0, -0.015, 0]} material={daisGoldPlate}>
        <cylinderGeometry args={[0.94, 0.96, 0.025, 48]} />
      </mesh>
      {/* Viền neon vàng quanh mép bục + gờ vàng chân đế */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.0, 0]} material={A.rimMat}>
        <torusGeometry args={[0.955, 0.011, 8, 96]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} material={daisGoldPlate}>
        <torusGeometry args={[1.085, 0.014, 8, 96]} />
      </mesh>

      {/* 2. Soft Realistic Foot Contact Shadows (Bóng đổ dưới từng bàn chân, không che phủ tâm bục) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.14, 0.003, 0.04]} material={A.shadow}>
        <ringGeometry args={[0, 0.11, 16]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.14, 0.003, 0.04]} material={A.shadow}>
        <ringGeometry args={[0, 0.11, 16]} />
      </mesh>

      {/* 3. Outer Golden Magic Rune Ring (Vòng Trận Pháp Ngoại Vi Hoàng Kim) */}
      <group ref={outerRuneRef} position={[0, 0.008, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={A.goldGlow}>
          <ringGeometry args={[0.82, 0.89, 64]} />
        </mesh>
        {/* Perimeter Rune Marks */}
        {runeAngles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const rx = Math.cos(rad) * 0.855;
          const rz = Math.sin(rad) * 0.855;
          return (
            <mesh key={`outer-rune-${i}`} position={[rx, 0.004, rz]} rotation={[0, -rad, 0]} material={A.goldGlow}>
              <boxGeometry args={[0.045, 0.005, 0.016]} />
            </mesh>
          );
        })}
      </group>

      {/* 3b. Vòng ký hiệu (rune) xoay chậm, nằm giữa vòng vàng ngoài và vòng lam ngọc */}
      <group ref={glyphRef} position={[0, 0.009, 0]}>
        <mesh geometry={daisTier >= 3 ? A.glyphGeoRich : A.glyphGeo} material={A.glyphMat} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={A.glyphMat}>
          <ringGeometry args={[0.652, 0.658, 64]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={A.glyphMat}>
          <ringGeometry args={[0.782, 0.788, 64]} />
        </mesh>
      </group>

      {/* 3c. Vệt sáng quét dọc mép bục (giả phản chiếu kim loại) */}
      <group ref={sheenRef} position={[0, 0.006, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={A.sheenMat}>
          <ringGeometry args={[0.9, 0.955, 32, 1, 0, 0.8]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={A.sheenMat}>
          <ringGeometry args={[0.9, 0.955, 32, 1, Math.PI, 0.5]} />
        </mesh>
      </group>

      {/* 4. Mid Cyan / Teal Magic Circle Ring & Star Spokes (Vòng Trận Pháp Trung Tâm Lam Ngọc) */}
      <group ref={midRuneRef} position={[0, 0.01, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={A.cyanRune}>
          <ringGeometry args={[0.55, 0.62, 48]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={A.goldGlow}>
          <ringGeometry args={[0.49, 0.51, 48]} />
        </mesh>
        {[0, 60, 120].map((rotDeg, idx) => {
          const rad = (rotDeg * Math.PI) / 180;
          return (
            <mesh key={`spoke-${idx}`} rotation={[-Math.PI / 2, 0, rad]} material={A.goldGlow}>
              <planeGeometry args={[1.1, 0.012]} />
            </mesh>
          );
        })}
      </group>

      {/* 5. VÒNG HÀO QUANG TRỰC TIẾP DƯỚI CHÂN NHÂN VẬT (Foot Aura Halo Ring - Ôm Sát Dưới Chân Rực Rỡ) */}
      <group ref={footAuraRef} position={[0, 0.012, 0]}>
        {/* Vòng Hào Quang Hoàng Kim Dưới Chân */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={A.goldGlow}>
          <ringGeometry args={[0.33, 0.39, 48]} />
        </mesh>
        {/* Vòng Viền Lam Ngọc Hộ Thể */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={A.cyanRune}>
          <ringGeometry args={[0.26, 0.28, 40]} />
        </mesh>
        {/* 4 Ngọc Ấn Rune Nhỏ Quanh Chân */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const fx = Math.cos(rad) * 0.36;
          const fz = Math.sin(rad) * 0.36;
          return (
            <mesh key={`foot-gem-${i}`} position={[fx, 0.003, fz]} rotation={[-Math.PI / 2, 0, rad]} material={A.goldGlow}>
              <planeGeometry args={[0.026, 0.026]} />
            </mesh>
          );
        })}
      </group>

      {/* 6. Center Golden Core Sun Disc (Tâm Trận Thái Dương Phát Quang) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]} material={A.goldGlow}>
        <ringGeometry args={[0.13, 0.18, 32]} />
      </mesh>

      {/* 6b. Gợn sáng lan ra từ tâm */}
      <mesh ref={ripple1} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]} material={A.rippleMatA}>
        <ringGeometry args={[0.95, 1.0, 64]} />
      </mesh>
      <mesh ref={ripple2} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]} material={A.rippleMatB}>
        <ringGeometry args={[0.95, 1.0, 64]} />
      </mesh>

      {/* 7. Vertical Light Shroud & Rising Energy Beams (Màn Quang Thiên Giới) */}
      <group ref={lightBeamsRef}>
        <mesh position={[0, 0.35, 0]} material={verticalBeamMaterial}>
          <cylinderGeometry args={[0.82, 0.9, 0.7, 24, 1, true]} />
        </mesh>
        {daisTier >= 3 &&
          [
            [-0.45, 0.25, 0.3],
            [0.45, 0.25, 0.3],
            [-0.35, 0.35, -0.4],
            [0.35, 0.35, -0.4],
          ].map(([bx, by, bz], i) => (
            <mesh key={`beam-${i}`} position={[bx, by, bz]} material={A.goldGlow}>
              <cylinderGeometry args={[0.01, 0.02, 0.5, 8]} />
            </mesh>
          ))}
      </group>

      {/* 7b. Hạt sáng bay lên từ bục: level cao nhiều hạt, nhiều màu hơn */}
      <FxParticles key={daisTier} count={particleCount} colors={particleColors} emit={emit} reducedRef={reducedRef} />

      {/* 8. Tier 4 & 5 Floating Magic Crystals */}
      {daisTier === 4 && (
        <group ref={floatingCrystalsRef} position={[0, 0.26, 0]}>
          {[0, 90, 180, 270].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const cx = Math.cos(rad) * 0.95;
            const cz = Math.sin(rad) * 0.95;
            return (
              <mesh key={`amethyst-${i}`} position={[cx, 0, cz]} rotation={[0.4, rad, 0.2]} material={A.crystalAmethyst}>
                <octahedronGeometry args={[0.045, 0]} />
              </mesh>
            );
          })}
        </group>
      )}

      {daisTier === 5 && (
        <group ref={floatingCrystalsRef} position={[0, 0.3, 0]}>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const cx = Math.cos(rad) * 1.05;
            const cz = Math.sin(rad) * 1.05;
            return (
              <mesh key={`astral-gem-${i}`} position={[cx, 0, cz]} rotation={[0.5, rad, 0.3]} material={A.crystalAstral}>
                <octahedronGeometry args={[0.052, 0]} />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}
