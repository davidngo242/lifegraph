'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  FxParticles,
  FxEmit,
  FxOut,
  useAssets,
  usePrefersReducedMotion,
  blinkScale,
  glanceAmount,
  bendGeometry,
  paintGradient,
  taperedTube,
  makeShadowTexture,
} from './avatarFx';

// =========================================================================
// PROCEDURAL 3D PET COMPANION (Linh Thú Chibi Anime - Mắt Long Lanh, Hiệu Ứng Linh Vật Riêng Từng Loài)
// Hình khối thuần procedural (không asset ngoài). Hiệu ứng = 1 Points/loài, không thêm đèn.
// =========================================================================

type RR = React.MutableRefObject<boolean>;
const SIDES = [-1, 1] as const;
const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------- Mắt chibi: lòng trắng + mống mắt 2 tầng + đồng tử + 2 điểm sáng; chớp mắt & liếc theo nhân vật ----------
function makeEyeMats(dark: string, light: string, pupil = '#0b0a14') {
  return {
    white: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    dark: new THREE.MeshBasicMaterial({ color: dark }),
    light: new THREE.MeshBasicMaterial({ color: light }),
    pupil: new THREE.MeshBasicMaterial({ color: pupil }),
    shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
  };
}
type EyeMats = ReturnType<typeof makeEyeMats>;

function PetEyes({
  y,
  z,
  dx,
  s,
  mats,
  lookRef,
  reducedRef,
  blinkOffset = 0,
  tilt = 0,
}: {
  y: number;
  z: number;
  dx: number;
  s: number;
  mats: EyeMats;
  lookRef: React.MutableRefObject<number>;
  reducedRef: RR;
  blinkOffset?: number;
  tilt?: number;
}) {
  const eyes = useRef<(THREE.Group | null)[]>([null, null]);
  const irises = useRef<(THREE.Group | null)[]>([null, null]);
  const shines = useRef<(THREE.Group | null)[]>([null, null]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const still = reducedRef.current;
    const bl = still ? 1 : blinkScale(t, blinkOffset);
    for (let k = 0; k < 2; k++) {
      const e = eyes.current[k];
      if (e) e.scale.y = bl;
      const ir = irises.current[k];
      if (ir) ir.position.x = lookRef.current * s * 0.22;
      const sh = shines.current[k];
      if (sh) sh.scale.setScalar(still ? 1 : 1 + 0.15 * Math.sin(t * 3.1 + k * 1.7));
    }
  });

  return (
    <group position={[0, y, z]}>
      {SIDES.map((side, k) => (
        <group key={side} position={[side * dx, 0, 0]} rotation={[0, side * 0.2, side * tilt]}>
          <group ref={(el) => { eyes.current[k] = el; }}>
            <mesh material={mats.white} scale={[1, 1.1, 0.55]}>
              <sphereGeometry args={[s, 16, 12]} />
            </mesh>
            <group ref={(el) => { irises.current[k] = el; }}>
              <mesh position={[0, 0, 0.27 * s]} scale={[1, 1.08, 0.4]} material={mats.dark}>
                <sphereGeometry args={[0.8 * s, 16, 12]} />
              </mesh>
              <mesh position={[0, -0.22 * s, 0.31 * s]} scale={[0.86, 0.7, 0.4]} material={mats.light}>
                <sphereGeometry args={[0.66 * s, 16, 12]} />
              </mesh>
              <mesh position={[0, 0.04 * s, 0.46 * s]} scale={[1, 1.12, 0.4]} material={mats.pupil}>
                <sphereGeometry args={[0.4 * s, 12, 10]} />
              </mesh>
            </group>
            <group ref={(el) => { shines.current[k] = el; }}>
              <mesh position={[-0.28 * s, 0.32 * s, 0.68 * s]} material={mats.shine}>
                <sphereGeometry args={[0.22 * s, 10, 8]} />
              </mesh>
              <mesh position={[0.26 * s, -0.3 * s, 0.66 * s]} material={mats.shine}>
                <sphereGeometry args={[0.11 * s, 8, 6]} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}

// ---------- Bóng giả + vòng sáng dưới chân + vòng xung kích khi mới trang bị ----------
function PetGroundFx({ ringColor, reducedRef }: { ringColor: string; reducedRef: RR }) {
  const burstRing = useRef<THREE.Mesh>(null);
  const t0 = useRef(-1);
  const A = useAssets(() => {
    const tex = makeShadowTexture();
    return {
    tex,
    shadow: new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
    ring: new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false }),
    burst: new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    };
  });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    A.ring.opacity = reducedRef.current ? 0.7 : 0.62 + 0.18 * Math.sin(t * 2.2);
    if (t0.current < 0) t0.current = t;
    const n = (t - t0.current) / 0.9;
    const r = burstRing.current;
    if (r) {
      if (n >= 0 && n <= 1 && !reducedRef.current) {
        const sc = 0.4 + n * 2.4;
        r.scale.set(sc, sc, sc);
        A.burst.opacity = (1 - n) * 0.85;
      } else {
        A.burst.opacity = 0;
      }
    }
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} material={A.shadow}>
        <planeGeometry args={[0.4, 0.4]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} material={A.ring}>
        <ringGeometry args={[0.1, 0.15, 36]} />
      </mesh>
      <mesh ref={burstRing} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} material={A.burst}>
        <ringGeometry args={[0.1, 0.125, 40]} />
      </mesh>
    </>
  );
}

// ---------- Hiệu ứng linh vật: hạt môi trường + 1 lần burst khi pet vừa được trang bị (mount) ----------
type BurstCfg = {
  center: number[];
  centerAt?: (t0: number, c: number[]) => void;
  speed: number;
  size: number;
  shapes: number[];
  up: number;
  life?: number;
};

function PetFx({
  amb,
  burst,
  ambient,
  colors,
  reducedRef,
  cfg,
  position,
}: {
  amb: number;
  burst: number;
  ambient: (i: number, t: number, o: FxOut) => void;
  colors: string[];
  reducedRef: RR;
  cfg: BurstCfg;
  position?: [number, number, number];
}) {
  const t0 = useRef(-1);
  const center = useRef<number[]>([...cfg.center]);
  const emit: FxEmit = (i, t, o) => {
    if (i < amb) {
      ambient(i, t, o);
      return;
    }
    if (o.still) return;
    if (t0.current < 0) {
      t0.current = t;
      cfg.centerAt?.(t, center.current);
    }
    const life = cfg.life ?? 1.2;
    const age = t - t0.current;
    if (age < 0 || age > life) return;
    const n = age / life;
    const th = o.s2 * 6.2832;
    const ph = (o.s3 - 0.5) * 2.2;
    const reach = cfg.speed * (0.55 + o.s0 * 0.7) * life * 0.6 * (1 - (1 - n) * (1 - n));
    const c = center.current;
    o.x = c[0] + Math.cos(th) * Math.cos(ph) * reach;
    o.y = c[1] + Math.sin(ph) * reach + cfg.up * n;
    o.z = c[2] + Math.sin(th) * Math.cos(ph) * reach;
    o.shape = cfg.shapes[(i - amb) % cfg.shapes.length];
    o.size = cfg.size * (0.8 + o.s1 * 0.6) * (1 - 0.4 * n);
    o.alpha = 1 - n * n;
  };
  return <FxParticles count={amb + burst} colors={colors} emit={emit} reducedRef={reducedRef} position={position} />;
}

// ======================= MÈO THẦN TÀI =======================
function CatPet({ reducedRef }: { reducedRef: RR }) {
  const body = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const earL = useRef<THREE.Group>(null);
  const coin = useRef<THREE.Group>(null);
  const look = useRef(0);

  const A = useAssets(() => {
    const bodyG = paintGradient(new THREE.SphereGeometry(0.085, 28, 20), 'y', -0.085, 0.085, '#dcd3f0', '#ffffff');
    const headG = paintGradient(new THREE.SphereGeometry(0.105, 32, 24), 'y', -0.1, 0.1, '#ece6fa', '#ffffff');
    const ear = new THREE.ConeGeometry(0.036, 0.078, 14, 4);
    ear.translate(0, 0.039, 0);
    bendGeometry(ear, 'y', 'z', -6);
    const earIn = new THREE.ConeGeometry(0.022, 0.056, 12, 3);
    earIn.translate(0, 0.028, 0);
    bendGeometry(earIn, 'y', 'z', -6);
    const tailG = taperedTube(
      [V3(0, 0, 0), V3(0, 0.025, -0.045), V3(0, 0.07, -0.075), V3(0.012, 0.12, -0.07), V3(0.035, 0.158, -0.04)],
      0.021, 0.013, 24, 10
    );
    return {
      bodyG, headG, ear, earIn, tailG,
      furGrad: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, emissive: '#ffffff', emissiveIntensity: 0.1 }),
      fur: new THREE.MeshStandardMaterial({ color: '#fbf9ff', roughness: 0.72, emissive: '#ffffff', emissiveIntensity: 0.1 }),
      pink: new THREE.MeshStandardMaterial({ color: '#f9a8d4', roughness: 0.5 }),
      blush: new THREE.MeshBasicMaterial({ color: '#fda4af', transparent: true, opacity: 0.7, depthWrite: false }),
      gold: new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.18, metalness: 0.9, emissive: '#b45309', emissiveIntensity: 0.45 }),
      goldDark: new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.4, metalness: 0.6 }),
      red: new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4, emissive: '#991b1b', emissiveIntensity: 0.25 }),
      mouth: new THREE.MeshBasicMaterial({ color: '#7c5a6b' }),
      whisker: new THREE.MeshBasicMaterial({ color: '#a69fc0' }),
      eye: makeEyeMats('#3b2a7a', '#a78bfa'),
    };
  });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const ts = reducedRef.current ? 0 : t;
    const g = reducedRef.current ? 0 : glanceAmount(t, 1.3);
    look.current = -g;
    if (head.current) {
      head.current.rotation.y = -0.38 * g + Math.sin(ts * 0.7) * 0.05;
      head.current.rotation.z = Math.sin(ts * 0.9) * 0.03;
    }
    if (body.current) body.current.scale.set(1, 1.02 * (1 + 0.03 * Math.sin(ts * 2.6)), 0.96);
    if (arm.current) arm.current.rotation.x = -0.1 + Math.sin(ts * 4.8) * 0.4;
    if (tail.current) {
      tail.current.rotation.z = Math.sin(ts * 2.2) * 0.35;
      tail.current.rotation.y = Math.sin(ts * 1.5) * 0.15;
    }
    if (earL.current) {
      const p = ts % 6;
      earL.current.rotation.z = 0.32 + (p < 0.25 ? Math.sin((p / 0.25) * Math.PI) * 0.28 : 0);
    }
    if (coin.current) coin.current.rotation.y = Math.sin(ts * 1.4) * 0.12;
  });

  const ambient = (i: number, t: number, o: FxOut) => {
    const P = 3.2 + o.s0 * 2.4;
    const u = (t / P + o.s1) % 1;
    const ang = o.s2 * 6.2832 + t * (0.5 + o.s3 * 0.5);
    const r = 0.14 + o.s3 * 0.12;
    o.x = Math.cos(ang) * r;
    o.z = Math.sin(ang) * r;
    o.y = 0.03 + u * 0.4;
    const isCoin = o.s2 > 0.62;
    o.shape = isCoin ? 4 : o.s0 > 0.5 ? 1 : 0;
    o.size = (isCoin ? 0.046 : 0.05) * (0.8 + o.s0 * 0.7);
    o.alpha = Math.sin(Math.PI * u) * (0.7 + 0.3 * Math.sin(t * 4 + i * 2.1));
  };

  return (
    <>
      <PetGroundFx ringColor="#38bdf8" reducedRef={reducedRef} />
      {/* Thân mochi */}
      <mesh ref={body} position={[0, 0.085, 0]} geometry={A.bodyG} material={A.furGrad} />
      {/* Chân trước */}
      {SIDES.map((s) => (
        <mesh key={`foot${s}`} position={[s * 0.045, 0.022, 0.07]} scale={[1, 0.7, 1.25]} material={A.fur}>
          <sphereGeometry args={[0.026, 14, 10]} />
        </mesh>
      ))}
      {/* Vòng cổ + chuông */}
      <mesh position={[0, 0.138, 0.012]} rotation={[Math.PI / 2 + 0.2, 0, 0]} material={A.red}>
        <torusGeometry args={[0.07, 0.012, 10, 28]} />
      </mesh>
      <mesh position={[0, 0.122, 0.082]} material={A.gold}>
        <sphereGeometry args={[0.016, 14, 10]} />
      </mesh>
      {/* Đồng koban ôm trong tay trái */}
      <group ref={coin} position={[-0.012, 0.082, 0.088]} rotation={[-0.2, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.82, 1, 1.05]} material={A.gold}>
          <cylinderGeometry args={[0.05, 0.05, 0.012, 24]} />
        </mesh>
        <mesh position={[0, 0, 0.0068]} scale={[0.82, 1.05, 1]} material={A.goldDark}>
          <torusGeometry args={[0.036, 0.0035, 8, 28]} />
        </mesh>
        {[0.012, 0, -0.012].map((yy, k) => (
          <mesh key={k} position={[0, yy, 0.0068]} material={A.goldDark}>
            <boxGeometry args={[0.03 - Math.abs(yy) * 0.8, 0.0035, 0.002]} />
          </mesh>
        ))}
      </group>
      <mesh position={[-0.064, 0.085, 0.07]} rotation={[0, 0, 0.35]} scale={[0.8, 1.2, 0.8]} material={A.fur}>
        <sphereGeometry args={[0.03, 14, 10]} />
      </mesh>
      {/* Tay phải vẫy gọi may mắn */}
      <group ref={arm} position={[0.078, 0.122, 0.04]} rotation={[0, 0, -0.55]}>
        <mesh position={[0, 0.03, 0]} scale={[0.8, 1.55, 0.8]} material={A.fur}>
          <sphereGeometry args={[0.03, 14, 10]} />
        </mesh>
        <mesh position={[0, 0.062, 0.02]} material={A.pink}>
          <sphereGeometry args={[0.011, 10, 8]} />
        </mesh>
      </group>
      {/* Đuôi cong */}
      <group ref={tail} position={[0, 0.07, -0.07]}>
        <mesh geometry={A.tailG} material={A.fur} />
        <mesh position={[0.035, 0.158, -0.04]} material={A.fur}>
          <sphereGeometry args={[0.015, 12, 10]} />
        </mesh>
      </group>
      {/* Đầu to chibi */}
      <group ref={head} position={[0, 0.215, 0.01]}>
        <mesh geometry={A.headG} material={A.furGrad} scale={[1.15, 0.92, 1]} />
        {SIDES.map((s) => {
          const ref = s === -1 ? earL : undefined;
          return (
            <group key={`ear${s}`} ref={ref} position={[s * 0.07, 0.075, -0.005]} rotation={[-0.12, 0, -s * 0.32]}>
              <mesh geometry={A.ear} material={A.fur} scale={[1, 1, 0.62]} />
              <mesh geometry={A.earIn} material={A.pink} scale={[1, 1, 0.5]} position={[0, 0, 0.009]} />
            </group>
          );
        })}
        <PetEyes y={0.012} z={0.088} dx={0.047} s={0.022} mats={A.eye} lookRef={look} reducedRef={reducedRef} />
        <mesh position={[0, -0.012, 0.103]} scale={[1.1, 0.8, 0.8]} material={A.pink}>
          <sphereGeometry args={[0.008, 10, 8]} />
        </mesh>
        {SIDES.map((s) => (
          <React.Fragment key={`m${s}`}>
            <mesh position={[s * 0.0085, -0.03, 0.0985]} rotation={[0, 0, Math.PI]} material={A.mouth}>
              <torusGeometry args={[0.0085, 0.0016, 6, 12, Math.PI]} />
            </mesh>
            <mesh position={[s * 0.076, -0.022, 0.07]} rotation={[0, s * 0.6, 0]} scale={[1, 0.7, 0.3]} material={A.blush}>
              <sphereGeometry args={[0.02, 12, 8]} />
            </mesh>
            {[-0.012, 0, 0.012].map((yy, k) => (
              <mesh key={k} position={[s * 0.118, -0.012 + yy, 0.056]} rotation={[0, s * 0.45, s * (k - 1) * 0.14]} material={A.whisker}>
                <boxGeometry args={[0.05, 0.0014, 0.0014]} />
              </mesh>
            ))}
          </React.Fragment>
        ))}
      </group>
      <PetFx
        amb={24}
        burst={12}
        ambient={ambient}
        colors={['#d97706', '#f59e0b', '#fbbf24', '#eab308']}
        reducedRef={reducedRef}
        cfg={{ center: [0, 0.14, 0.02], speed: 0.5, size: 0.055, shapes: [4, 1, 4, 0], up: 0.12 }}
      />
    </>
  );
}

// ======================= CÚN CỎ (SHIBA) =======================
function PuppyPet({ reducedRef }: { reducedRef: RR }) {
  const body = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const tongue = useRef<THREE.Mesh>(null);
  const earR = useRef<THREE.Group>(null);
  const look = useRef(0);

  const A = useAssets(() => {
    const bodyG = paintGradient(new THREE.SphereGeometry(0.088, 28, 20), 'y', -0.088, 0.088, '#fcd592', '#f4a21f');
    const headG = paintGradient(new THREE.SphereGeometry(0.105, 32, 24), 'y', -0.1, 0.1, '#fbc368', '#f4a21f');
    const ear = new THREE.ConeGeometry(0.04, 0.085, 4, 4);
    ear.translate(0, 0.0425, 0);
    bendGeometry(ear, 'y', 'z', -5);
    const earIn = new THREE.ConeGeometry(0.024, 0.06, 4, 3);
    earIn.translate(0, 0.03, 0);
    bendGeometry(earIn, 'y', 'z', -5);
    const tailG = taperedTube(
      [V3(0, 0, 0), V3(0, 0.03, -0.025), V3(0, 0.075, -0.03), V3(0, 0.11, -0.005), V3(0, 0.115, 0.03), V3(0, 0.088, 0.048)],
      0.021, 0.013, 28, 10, '#f4a21f', '#fde7bd'
    );
    return {
      bodyG, headG, ear, earIn, tailG,
      fur: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, emissive: '#b45309', emissiveIntensity: 0.16 }),
      furPlain: new THREE.MeshStandardMaterial({ color: '#f6a823', roughness: 0.62, emissive: '#b45309', emissiveIntensity: 0.16 }),
      cream: new THREE.MeshStandardMaterial({ color: '#fff7e4', roughness: 0.6, emissive: '#fff7e4', emissiveIntensity: 0.1 }),
      blush: new THREE.MeshBasicMaterial({ color: '#fb7185', transparent: true, opacity: 0.6, depthWrite: false }),
      nose: new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.25, metalness: 0.2 }),
      tongueM: new THREE.MeshStandardMaterial({ color: '#fb7185', roughness: 0.5 }),
      red: new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4, emissive: '#991b1b', emissiveIntensity: 0.25 }),
      gold: new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.18, metalness: 0.9, emissive: '#b45309', emissiveIntensity: 0.45 }),
      mouth: new THREE.MeshBasicMaterial({ color: '#5b3a1e' }),
      eye: makeEyeMats('#3a2210', '#b9722b'),
    };
  });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const ts = reducedRef.current ? 0 : t;
    const g = reducedRef.current ? 0 : glanceAmount(t, 3.1);
    look.current = -g;
    if (head.current) {
      head.current.rotation.y = -0.4 * g + Math.sin(ts * 0.8) * 0.05;
      head.current.rotation.z = Math.sin(ts * 1.1) * 0.05;
    }
    if (body.current) body.current.scale.set(1, 1 + 0.035 * Math.sin(ts * 3.4), 0.96);
    if (tail.current) tail.current.rotation.z = Math.sin(ts * 14) * 0.45;
    if (tongue.current) tongue.current.scale.set(1, 0.8 + 0.25 * Math.sin(ts * 5), 1);
    if (earR.current) {
      const p = (ts + 2.2) % 7;
      earR.current.rotation.z = -0.28 - (p < 0.25 ? Math.sin((p / 0.25) * Math.PI) * 0.3 : 0);
    }
  });

  const ambient = (_i: number, t: number, o: FxOut) => {
    const P = 3.6 + o.s0 * 2.4;
    const u = (t / P + o.s1) % 1;
    const dir = o.s3 > 0.5 ? 1 : -1;
    const ang = o.s2 * 6.2832 + dir * t * (0.7 + o.s0 * 0.5);
    const r = 0.15 + o.s3 * 0.08 + Math.sin(t * 2 + o.s1 * 9) * 0.015;
    o.x = Math.cos(ang) * r;
    o.z = Math.sin(ang) * r;
    o.y = 0.03 + u * 0.4 + Math.sin(t * 3 + o.s2 * 9) * 0.01;
    o.shape = o.s2 > 0.5 ? 3 : 6;
    o.size = (o.shape === 3 ? 0.058 : 0.062) * (0.8 + o.s0 * 0.6);
    o.alpha = Math.sin(Math.PI * u) * 0.95;
  };

  return (
    <>
      <PetGroundFx ringColor="#fbbf24" reducedRef={reducedRef} />
      <mesh ref={body} position={[0, 0.088, 0]} geometry={A.bodyG} material={A.fur} />
      <mesh position={[0, 0.08, 0.05]} scale={[0.9, 1, 0.7]} material={A.cream}>
        <sphereGeometry args={[0.055, 18, 14]} />
      </mesh>
      {/* Chân (vớ trắng) */}
      {SIDES.map((s) => (
        <mesh key={`foot${s}`} position={[s * 0.045, 0.022, 0.07]} scale={[1, 0.7, 1.25]} material={A.cream}>
          <sphereGeometry args={[0.026, 14, 10]} />
        </mesh>
      ))}
      {/* Vòng cổ + thẻ vàng */}
      <mesh position={[0, 0.142, 0.012]} rotation={[Math.PI / 2 + 0.2, 0, 0]} material={A.red}>
        <torusGeometry args={[0.072, 0.012, 10, 28]} />
      </mesh>
      <mesh position={[0, 0.124, 0.085]} rotation={[0.2, 0, 0]} material={A.gold}>
        <cylinderGeometry args={[0.014, 0.014, 0.006, 16]} />
      </mesh>
      {/* Đuôi xoắn vẫy */}
      <group ref={tail} position={[0, 0.085, -0.075]}>
        <mesh geometry={A.tailG} material={A.furPlain} />
        <mesh position={[0, 0.088, 0.048]} material={A.cream}>
          <sphereGeometry args={[0.014, 10, 8]} />
        </mesh>
      </group>
      {/* Đầu */}
      <group ref={head} position={[0, 0.215, 0.012]}>
        <mesh geometry={A.headG} material={A.fur} scale={[1.14, 0.93, 1]} />
        {/* Tai shiba dựng đứng */}
        {SIDES.map((s) => (
          <group key={`ear${s}`} ref={s === 1 ? earR : undefined} position={[s * 0.066, 0.07, -0.005]} rotation={[-0.1, 0, -s * 0.28]}>
            <mesh geometry={A.ear} material={A.furPlain} scale={[1, 1, 0.55]} />
            <mesh geometry={A.earIn} material={A.cream} scale={[1, 1, 0.5]} position={[0, 0, 0.008]} />
          </group>
        ))}
        {/* Má lông kem */}
        {SIDES.map((s) => (
          <mesh key={`cheek${s}`} position={[s * 0.07, -0.032, 0.05]} scale={[1, 0.8, 0.8]} material={A.cream}>
            <sphereGeometry args={[0.038, 14, 10]} />
          </mesh>
        ))}
        {/* Mõm kem + mũi + lưỡi */}
        <mesh position={[0, -0.03, 0.082]} scale={[1, 0.78, 1]} material={A.cream}>
          <sphereGeometry args={[0.04, 16, 12]} />
        </mesh>
        <mesh position={[0, -0.012, 0.118]} scale={[1.2, 0.85, 0.9]} material={A.nose}>
          <sphereGeometry args={[0.011, 10, 8]} />
        </mesh>
        <mesh ref={tongue} position={[0, -0.062, 0.1]} scale={[1, 1, 0.5]} material={A.tongueM}>
          <sphereGeometry args={[0.014, 10, 8]} />
        </mesh>
        {SIDES.map((s) => (
          <mesh key={`mo${s}`} position={[s * 0.0105, -0.044, 0.102]} rotation={[0, 0, Math.PI]} material={A.mouth}>
            <torusGeometry args={[0.0105, 0.0016, 6, 12, Math.PI]} />
          </mesh>
        ))}
        <PetEyes y={0.014} z={0.088} dx={0.05} s={0.023} mats={A.eye} lookRef={look} reducedRef={reducedRef} blinkOffset={1.1} />
        {/* Chấm mày kem đặc trưng shiba */}
        {SIDES.map((s) => (
          <mesh key={`brow${s}`} position={[s * 0.05, 0.05, 0.086]} scale={[1, 0.8, 0.5]} material={A.cream}>
            <sphereGeometry args={[0.011, 10, 8]} />
          </mesh>
        ))}
        {SIDES.map((s) => (
          <mesh key={`bl${s}`} position={[s * 0.078, -0.012, 0.066]} rotation={[0, s * 0.6, 0]} scale={[1, 0.7, 0.3]} material={A.blush}>
            <sphereGeometry args={[0.02, 12, 8]} />
          </mesh>
        ))}
      </group>
      <PetFx
        amb={24}
        burst={12}
        ambient={ambient}
        colors={['#16a34a', '#22c55e', '#4ade80', '#15803d']}
        reducedRef={reducedRef}
        cfg={{ center: [0, 0.14, 0.02], speed: 0.5, size: 0.068, shapes: [3, 6, 6, 3], up: 0.1 }}
      />
    </>
  );
}

// ======================= HỒ LY (KITSUNE) =======================
const FOX_TAIL_ANGLES = [-0.8, 0, 0.8];
const FOX_TAIL_TIP = V3(0.0, 0.22, -0.03);

function FoxPet({ reducedRef }: { reducedRef: RR }) {
  const body = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const tails = useRef<THREE.Group>(null);
  const tailEach = useRef<(THREE.Group | null)[]>([null, null, null]);
  const crest = useRef<THREE.Mesh>(null);
  const earL = useRef<THREE.Group>(null);
  const look = useRef(0);

  const A = useAssets(() => {
    const bodyG = paintGradient(new THREE.SphereGeometry(0.088, 28, 20), 'y', -0.088, 0.088, '#fb923c', '#ea580c');
    const headG = paintGradient(new THREE.SphereGeometry(0.103, 32, 24), 'y', -0.1, 0.1, '#fb923c', '#f0620f');
    const ear = new THREE.ConeGeometry(0.04, 0.1, 14, 5);
    ear.translate(0, 0.05, 0);
    bendGeometry(ear, 'y', 'z', -5);
    paintGradient(ear, 'y', 0.0, 0.1, '#ea580c', '#3b1d12');
    const earIn = new THREE.ConeGeometry(0.024, 0.07, 12, 3);
    earIn.translate(0, 0.035, 0);
    bendGeometry(earIn, 'y', 'z', -5);
    const tuft = new THREE.ConeGeometry(0.028, 0.07, 10, 3);
    tuft.translate(0, 0.035, 0);
    bendGeometry(tuft, 'y', 'z', -3);
    const tailG = taperedTube(
      [V3(0, 0, 0), V3(0, 0.05, -0.06), V3(0, 0.11, -0.08), V3(0, 0.17, -0.06), FOX_TAIL_TIP],
      0.026, 0.05, 28, 12, '#ea580c', '#fb923c'
    );
    const flameCore = new THREE.IcosahedronGeometry(0.02, 1);
    return {
      bodyG, headG, ear, earIn, tuft, tailG, flameCore,
      fur: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, emissive: '#9a3412', emissiveIntensity: 0.2 }),
      earM: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.65, emissive: '#7c2d12', emissiveIntensity: 0.15 }),
      white: new THREE.MeshStandardMaterial({ color: '#fffaf2', roughness: 0.6, emissive: '#fffaf2', emissiveIntensity: 0.12 }),
      dark: new THREE.MeshStandardMaterial({ color: '#27181a', roughness: 0.3 }),
      blush: new THREE.MeshBasicMaterial({ color: '#fb7185', transparent: true, opacity: 0.55, depthWrite: false }),
      gold: new THREE.MeshStandardMaterial({ color: '#fde047', roughness: 0.2, metalness: 0.85, emissive: '#ca8a04', emissiveIntensity: 0.6 }),
      spirit: new THREE.MeshBasicMaterial({ color: '#a5b4fc', transparent: true, opacity: 0.5, depthWrite: false }),
      mouth: new THREE.MeshBasicMaterial({ color: '#6b3a22' }),
      eye: makeEyeMats('#7c2d12', '#fbbf24'),
    };
  });

  // Vị trí đầu 3 ngọn đuôi trong hệ toạ độ nhóm đuôi (để hồ hỏa lơ lửng đúng chỗ).
  const tips = React.useMemo(
    () => FOX_TAIL_ANGLES.map((a) => FOX_TAIL_TIP.clone().applyEuler(new THREE.Euler(0, a, a * 0.75))),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const ts = reducedRef.current ? 0 : t;
    const g = reducedRef.current ? 0 : glanceAmount(t, 5.2);
    look.current = -g;
    if (head.current) {
      head.current.rotation.y = -0.4 * g + Math.sin(ts * 0.6) * 0.05;
      head.current.rotation.z = Math.sin(ts * 0.9) * 0.04;
    }
    if (body.current) body.current.scale.set(1, 1 + 0.03 * Math.sin(ts * 2.8), 0.96);
    for (let k = 0; k < 3; k++) {
      const e = tailEach.current[k];
      if (e) {
        e.rotation.z = FOX_TAIL_ANGLES[k] * 0.75 + Math.sin(ts * 2.1 + k * 1.3) * 0.14;
        e.rotation.x = Math.sin(ts * 1.7 + k) * 0.06;
      }
    }
    if (crest.current) {
      crest.current.rotation.y = ts * 1.2;
      const s = 1 + 0.12 * Math.sin(ts * 2.4);
      crest.current.scale.set(s, s, s);
    }
    if (earL.current) {
      const p = (ts + 4) % 6.5;
      earL.current.rotation.z = 0.2 + (p < 0.25 ? Math.sin((p / 0.25) * Math.PI) * 0.3 : 0);
    }
  });

  // Hồ hỏa xanh/tím: 3 ngọn lơ lửng trên đầu đuôi + các tàn lửa bốc lên quanh đuôi.
  const ambient = (_i: number, t: number, o: FxOut) => {
    const k = _i % 3;
    const tip = tips[k];
    if (_i < 3) {
      o.x = tip.x;
      o.z = tip.z;
      o.y = tip.y + 0.05 + Math.sin(t * 2.6 + k * 2) * 0.012;
      o.shape = 5;
      o.size = 0.13 * (0.92 + 0.08 * Math.sin(t * 9 + k * 3));
      o.alpha = 0.95;
      return;
    }
    const P = 2.4 + o.s0 * 1.8;
    const u = (t / P + o.s1) % 1;
    const ang = o.s2 * 6.2832 + t * (0.9 + o.s3);
    const r = 0.035 + o.s3 * 0.05;
    o.x = tip.x + Math.cos(ang) * r;
    o.z = tip.z + Math.sin(ang) * r;
    o.y = tip.y + 0.02 + u * 0.16;
    o.shape = o.s2 > 0.45 ? 5 : 0;
    o.size = o.shape === 5 ? 0.075 * (1 - 0.4 * u) : 0.05;
    o.alpha = Math.sin(Math.PI * u) * 0.9;
  };

  return (
    <>
      <PetGroundFx ringColor="#fb923c" reducedRef={reducedRef} />
      <mesh ref={body} position={[0, 0.088, 0]} geometry={A.bodyG} material={A.fur} />
      <mesh position={[0, 0.08, 0.052]} scale={[0.9, 1, 0.7]} material={A.white}>
        <sphereGeometry args={[0.055, 18, 14]} />
      </mesh>
      {SIDES.map((s) => (
        <mesh key={`foot${s}`} position={[s * 0.045, 0.022, 0.07]} scale={[1, 0.7, 1.25]} material={A.dark}>
          <sphereGeometry args={[0.026, 14, 10]} />
        </mesh>
      ))}
      {/* 3 đuôi bồng bềnh, chóp trắng + hồ hỏa */}
      <group ref={tails} position={[0, 0.07, -0.06]}>
        {FOX_TAIL_ANGLES.map((a, k) => (
          <group key={k} ref={(el) => { tailEach.current[k] = el; }} rotation={[0, a, a * 0.75]}>
            <mesh geometry={A.tailG} material={A.fur} />
            <mesh position={[0, 0.22, -0.03]} scale={[1, 1.15, 1]} material={A.white}>
              <sphereGeometry args={[0.05, 14, 12]} />
            </mesh>
          </group>
        ))}
        <PetFx
          amb={20}
          burst={12}
          ambient={ambient}
          colors={['#38bdf8', '#818cf8', '#a78bfa', '#22d3ee']}
          reducedRef={reducedRef}
          cfg={{ center: [0, 0.06, 0.08], speed: 0.5, size: 0.09, shapes: [5, 1, 5, 0], up: 0.1 }}
        />
      </group>
      {/* Đầu */}
      <group ref={head} position={[0, 0.215, 0.012]}>
        <mesh geometry={A.headG} material={A.fur} scale={[1.18, 0.9, 1.04]} />
        {SIDES.map((s) => (
          <group key={`ear${s}`} ref={s === -1 ? earL : undefined} position={[s * 0.062, 0.07, -0.004]} rotation={[-0.1, 0, -s * 0.2]}>
            <mesh geometry={A.ear} material={A.earM} scale={[1, 1, 0.55]} />
            <mesh geometry={A.earIn} material={A.white} scale={[1, 1, 0.5]} position={[0, 0, 0.009]} />
          </group>
        ))}
        {/* Má lông trắng nhọn hai bên */}
        {SIDES.map((s) => (
          <mesh key={`tuft${s}`} geometry={A.tuft} material={A.white} position={[s * 0.1, -0.025, 0.03]} rotation={[0, s * 0.25, -s * (Math.PI / 2 + 0.25)]} scale={[1, 1, 0.8]} />
        ))}
        <mesh position={[0, -0.028, 0.084]} scale={[0.85, 0.72, 1.2]} material={A.white}>
          <sphereGeometry args={[0.04, 16, 12]} />
        </mesh>
        <mesh position={[0, -0.014, 0.124]} scale={[1.2, 0.85, 0.9]} material={A.dark}>
          <sphereGeometry args={[0.009, 10, 8]} />
        </mesh>
        {SIDES.map((s) => (
          <mesh key={`mo${s}`} position={[s * 0.009, -0.04, 0.112]} rotation={[0, 0, Math.PI]} material={A.mouth}>
            <torusGeometry args={[0.009, 0.0015, 6, 12, Math.PI]} />
          </mesh>
        ))}
        <PetEyes y={0.014} z={0.088} dx={0.05} s={0.023} mats={A.eye} lookRef={look} reducedRef={reducedRef} blinkOffset={2.3} tilt={0.16} />
        {SIDES.map((s) => (
          <mesh key={`bl${s}`} position={[s * 0.08, -0.012, 0.062]} rotation={[0, s * 0.6, 0]} scale={[1, 0.7, 0.3]} material={A.blush}>
            <sphereGeometry args={[0.02, 12, 8]} />
          </mesh>
        ))}
        {/* Ấn vàng trên trán (nhịp sáng) */}
        <mesh ref={crest} position={[0, 0.062, 0.088]} material={A.gold}>
          <octahedronGeometry args={[0.014, 0]} />
        </mesh>
      </group>
    </>
  );
}

// ======================= ẤU LONG =======================
const D_RX = 0.82;
const D_RZ = 0.54;
const D_W = 1.35;
function dragonPos(t: number, c: number[]) {
  const a = t * D_W;
  c[0] = Math.cos(a) * D_RX;
  c[1] = 0.24 + Math.sin(t * 2.8) * 0.12;
  c[2] = Math.sin(a) * D_RZ;
}

function buildWingShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.03, 0.09, 0.12, 0.15, 0.23, 0.13);
  s.quadraticCurveTo(0.18, 0.06, 0.19, 0.0);
  s.quadraticCurveTo(0.14, 0.045, 0.12, -0.03);
  s.quadraticCurveTo(0.08, 0.03, 0.058, -0.05);
  s.quadraticCurveTo(0.03, -0.005, 0, 0);
  const g = new THREE.ShapeGeometry(s, 16);
  bendGeometry(g, 'x', 'z', -2.2);
  paintGradient(g, 'x', 0, 0.23, '#10b981', '#a7f3d0');
  return g;
}

function DragonPet({ reducedRef }: { reducedRef: RR }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const wings = useRef<(THREE.Group | null)[]>([null, null]);
  const tailSegs = useRef<(THREE.Group | null)[]>([null, null, null]);
  const pearl = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Mesh>(null);
  const look = useRef(0);

  const A = useAssets(() => {
    const dragonTex = makeShadowTexture();
    const bodyG = paintGradient(new THREE.SphereGeometry(0.085, 28, 20), 'y', -0.085, 0.085, '#8be6bd', '#12b886');
    const headG = paintGradient(new THREE.SphereGeometry(0.088, 32, 24), 'y', -0.085, 0.085, '#8be6bd', '#12b886');
    const horn = taperedTube([V3(0, 0, 0), V3(0.012, 0.04, -0.02), V3(0.03, 0.075, -0.06), V3(0.045, 0.092, -0.11)], 0.018, 0.003, 14, 8);
    const wing = buildWingShape();
    const bone = taperedTube([V3(0, 0, 0), V3(0.07, 0.05, 0), V3(0.15, 0.105, 0), V3(0.225, 0.13, 0)], 0.007, 0.0035, 12, 6);
    const seg = (r0: number, r1: number) => taperedTube([V3(0, 0, 0), V3(0, 0.006, -0.035), V3(0, 0.012, -0.07)], r0, r1, 10, 8, '#12b886', '#34d399');
    const spike = new THREE.ConeGeometry(0.017, 0.044, 8, 1);
    spike.translate(0, 0.022, 0);
    bendGeometry(spike, 'y', 'z', -6);
    return {
      bodyG, headG, horn, wing, bone, spike,
      seg0: seg(0.034, 0.026), seg1: seg(0.026, 0.017), seg2: seg(0.017, 0.008),
      tex: dragonTex,
      shadowM: new THREE.MeshBasicMaterial({ map: dragonTex, transparent: true, opacity: 0.3, depthWrite: false }),
      green: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.2, emissive: '#047857', emissiveIntensity: 0.3 }),
      belly: new THREE.MeshStandardMaterial({ color: '#fff3bf', roughness: 0.4, emissive: '#fde68a', emissiveIntensity: 0.15 }),
      gold: new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.18, metalness: 0.88, emissive: '#d97706', emissiveIntensity: 0.5 }),
      wingM: new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.88, roughness: 0.25, side: THREE.DoubleSide, emissive: '#10b981', emissiveIntensity: 0.28, depthWrite: false }),
      pearl: new THREE.MeshBasicMaterial({ color: '#fef9c3' }),
      pearlHalo: new THREE.MeshBasicMaterial({ color: '#fde047', transparent: true, opacity: 0.35, depthWrite: false }),
      blush: new THREE.MeshBasicMaterial({ color: '#fb7185', transparent: true, opacity: 0.6, depthWrite: false }),
      nostril: new THREE.MeshBasicMaterial({ color: '#065f46' }),
      eye: makeEyeMats('#b45309', '#fcd34d'),
    };
  });
  const tmp = useRef([0, 0, 0]);
  const spawn = useRef([0, 0, 0]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const ts = reducedRef.current ? 0.6 : t;
    const g = root.current;
    if (g) {
      const c = tmp.current;
      dragonPos(ts, c);
      g.position.set(c[0], c[1], c[2]);
      const nx = Math.cos(ts * D_W + 0.05) * D_RX - c[0];
      const nz = Math.sin(ts * D_W + 0.05) * D_RZ - c[2];
      g.rotation.y = Math.atan2(nx, nz);
      g.rotation.z = -Math.sin(ts * D_W) * 0.2;
      g.rotation.x = Math.cos(ts * 2.8) * 0.1;
      if (shadow.current) {
        shadow.current.position.set(c[0], -0.975, c[2]);
        const h = 0.55 + 0.1 * Math.sin(ts * 2.8);
        shadow.current.scale.set(h, h, h);
      }
    }
    const flap = reducedRef.current ? 0 : Math.sin(t * 12) * 0.4;
    for (let k = 0; k < 2; k++) {
      const w = wings.current[k];
      if (w) w.rotation.z = 0.35 + flap;
    }
    for (let k = 0; k < 3; k++) {
      const s = tailSegs.current[k];
      if (s) s.rotation.y = Math.sin(ts * 5 - k * 0.9) * 0.34;
    }
    // Nhìn về phía nhân vật (tâm quỹ đạo nằm bên phải khi bay) + liếc định kỳ
    const gl = reducedRef.current ? 0 : glanceAmount(t, 0.7);
    look.current = -gl;
    if (head.current) {
      head.current.rotation.y = -0.38 - 0.2 * gl;
      head.current.rotation.x = Math.sin(ts * 2.8) * 0.05;
    }
    if (body.current) body.current.scale.set(1, 0.95 * (1 + 0.03 * Math.sin(ts * 3)), 1.2);
    if (pearl.current) {
      const p = 1 + 0.15 * Math.sin(ts * 4);
      pearl.current.scale.set(p, p, p);
    }
  });

  // Vệt tia lửa vàng + vảy sáng phía sau: vị trí sinh ra tính theo quỹ đạo (analytic) nên bám đúng đường bay.
  const ambient = (i: number, t: number, o: FxOut) => {
    const P = 0.9 + o.s0 * 0.9;
    const u = (t / P + o.s1) % 1;
    const sp = spawn.current;
    dragonPos(t - u * P, sp);
    o.x = sp[0] + (o.s2 - 0.5) * 0.1;
    o.y = sp[1] + (o.s3 - 0.5) * 0.09 + u * 0.1;
    o.z = sp[2] + (o.s0 - 0.5) * 0.08;
    const isScale = i % 2 === 1;
    o.shape = isScale ? 2 : 1;
    o.size = (isScale ? 0.05 : 0.065) * (0.8 + o.s0 * 0.6) * (1 - 0.5 * u);
    o.alpha = (1 - u) * (1 - u) * (0.7 + 0.3 * Math.sin(t * 9 + i));
  };

  return (
    <>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.975, 0]} material={A.shadowM}>
        <planeGeometry args={[0.5, 0.5]} />
      </mesh>
      <group ref={root} scale={[1.6, 1.6, 1.6]}>
        <mesh ref={body} position={[0, -0.01, -0.02]} geometry={A.bodyG} material={A.green} scale={[1, 0.95, 1.2]} />
        <mesh position={[0, -0.035, 0.035]} scale={[0.72, 0.85, 1]} material={A.belly}>
          <sphereGeometry args={[0.062, 18, 14]} />
        </mesh>
        {/* Gai lưng vàng */}
        {[0.02, -0.03, -0.08].map((z, k) => (
          <mesh key={k} geometry={A.spike} material={A.gold} position={[0, 0.07 - k * 0.006, z]} rotation={[-0.35, 0, 0]} scale={[1 - k * 0.12, 1 - k * 0.12, 1]} />
        ))}
        {/* Chân nhỏ */}
        {SIDES.map((s) => (
          <mesh key={`f${s}`} position={[s * 0.04, -0.082, 0.03]} scale={[1, 0.8, 1.2]} material={A.green}>
            <sphereGeometry args={[0.022, 12, 10]} />
          </mesh>
        ))}
        {/* Cánh dơi, xương vàng */}
        {SIDES.map((s, k) => (
          <group key={`w${s}`} position={[s * 0.058, 0.04, -0.03]} scale={[s, 1, 1]} rotation={[0, 0, 0]}>
            <group rotation={[0, 0.45, 0]}>
              <group ref={(el) => { wings.current[k] = el; }}>
                <mesh geometry={A.wing} material={A.wingM} />
                <mesh geometry={A.bone} material={A.gold} />
              </group>
            </group>
          </group>
        ))}
        {/* Đuôi uốn lượn 3 đốt + chóp vàng */}
        <group position={[0, -0.01, -0.095]}>
          <group ref={(el) => { tailSegs.current[0] = el; }}>
            <mesh geometry={A.seg0} material={A.green} />
            <group position={[0, 0.012, -0.07]} ref={(el) => { tailSegs.current[1] = el; }}>
              <mesh geometry={A.seg1} material={A.green} />
              <group position={[0, 0.012, -0.07]} ref={(el) => { tailSegs.current[2] = el; }}>
                <mesh geometry={A.seg2} material={A.green} />
                <mesh position={[0, 0.012, -0.085]} rotation={[0, 0, 0]} scale={[1.1, 0.3, 1.9]} material={A.gold}>
                  <octahedronGeometry args={[0.03, 0]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
        {/* Đầu */}
        <group ref={head} position={[0, 0.045, 0.115]}>
          <mesh geometry={A.headG} material={A.green} scale={[1.1, 0.95, 1]} />
          <mesh position={[0, -0.028, 0.07]} scale={[1, 0.82, 1.1]} material={A.green}>
            <sphereGeometry args={[0.046, 16, 12]} />
          </mesh>
          <mesh position={[0, -0.04, 0.07]} scale={[0.9, 0.55, 1.05]} material={A.belly}>
            <sphereGeometry args={[0.04, 14, 10]} />
          </mesh>
          {SIDES.map((s) => (
            <React.Fragment key={s}>
              <mesh position={[s * 0.016, -0.014, 0.117]} material={A.nostril}>
                <sphereGeometry args={[0.005, 8, 6]} />
              </mesh>
              <group position={[s * 0.042, 0.062, -0.018]} scale={[s, 1, 1]}>
                <mesh geometry={A.horn} material={A.gold} />
              </group>
              <mesh position={[s * 0.07, -0.015, 0.045]} rotation={[0, s * 0.6, 0]} scale={[1, 0.7, 0.3]} material={A.blush}>
                <sphereGeometry args={[0.02, 12, 8]} />
              </mesh>
            </React.Fragment>
          ))}
          <PetEyes y={0.02} z={0.07} dx={0.046} s={0.026} mats={A.eye} lookRef={look} reducedRef={reducedRef} blinkOffset={0.6} />
        </group>
        {/* Ngọc châu linh thiêng bay phía trước */}
        <group ref={pearl} position={[0, 0.02, 0.24]}>
          <mesh material={A.pearl}>
            <sphereGeometry args={[0.02, 14, 12]} />
          </mesh>
          <mesh material={A.pearlHalo}>
            <sphereGeometry args={[0.034, 14, 12]} />
          </mesh>
        </group>
      </group>
      <PetFx
        amb={24}
        burst={12}
        ambient={ambient}
        colors={['#f59e0b', '#10b981', '#fbbf24', '#34d399']}
        reducedRef={reducedRef}
        cfg={{
          center: [0, 0.24, 0],
          centerAt: (t0, c) => dragonPos(t0, c),
          speed: 0.8,
          size: 0.08,
          shapes: [1, 2, 1, 2],
          up: 0.12,
        }}
      />
    </>
  );
}

// ======================= ĐIỂM VÀO =======================
const PET_BASE: [number, number, number] = [0.58, -0.975, 0.3];

export default function Procedural3DPetCompanion({ petType = 'none' }: { petType?: string }) {
  const reducedRef = usePrefersReducedMotion();
  if (!petType || petType === 'none') return null;

  return (
    <group>
      {petType === 'dragon' && <DragonPet key="dragon" reducedRef={reducedRef} />}
      {petType === 'cat' && (
        <group key="cat" position={PET_BASE} rotation={[0, -0.32, 0]} scale={[2, 2, 2]}>
          <CatPet reducedRef={reducedRef} />
        </group>
      )}
      {petType === 'puppy' && (
        <group key="puppy" position={PET_BASE} rotation={[0, -0.32, 0]} scale={[2, 2, 2]}>
          <PuppyPet reducedRef={reducedRef} />
        </group>
      )}
      {petType === 'fox' && (
        <group key="fox" position={PET_BASE} rotation={[0, -0.32, 0]} scale={[2, 2, 2]}>
          <FoxPet reducedRef={reducedRef} />
        </group>
      )}
    </group>
  );
}
